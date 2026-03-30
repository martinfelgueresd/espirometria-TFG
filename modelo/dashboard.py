# PRUEBA DASHBOARD CON LIBRERÍA DASH PARA VISUALIZACION DE CURVAS DE ESPIROMETRÍA

import os
import sys

import dash
from dash import dcc, html, Input, Output, dash_table
import dash_bootstrap_components as dbc
import base64
import xml.etree.ElementTree as ET
import pandas as pd
import plotly.graph_objects as go
import numpy as np

# ====================================================
#   RUTA BASE — funciona tanto en .py como en .exe
# ====================================================
if getattr(sys, 'frozen', False):
    BASE_DIR = sys._MEIPASS
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

sys.path.insert(0, BASE_DIR)

from modelo_prediccion import predecir_aceptabilidad


def preprocesar_volume_flow_from_mls(spxraw_mls, dt=0.01,
                                     threshold_f=0.01,
                                     k_consecutive=50,
                                     min_length_after_start=5):
    spxraw = np.asarray(spxraw_mls)
    if spxraw.size < 10:
        return None, None

    flow_l = spxraw / 1000.0
    volume = np.cumsum(flow_l * dt)

    start_idx = None
    for i in range(len(flow_l) - k_consecutive):
        ventana = flow_l[i : i + k_consecutive]
        if np.all(ventana > threshold_f):
            start_idx = i
            break

    if start_idx is None:
        return None, None

    last_valid_idx = len(flow_l)
    for i in range(len(flow_l) - 1, -1, -1):
        if flow_l[i] >= threshold_f:
            last_valid_idx = i + 1
            break

    if last_valid_idx - start_idx < min_length_after_start:
        return None, None

    volume_seg = volume[start_idx:last_valid_idx]
    flow_seg = flow_l[start_idx:last_valid_idx]

    return volume_seg, flow_seg


def preprocesar_time_volume_from_mls(
        spxraw_mls,
        dt=0.01,
        threshold_f=0.01,
        k_consecutive=50,
        min_length_after_start=5
):
    spxraw = np.asarray(spxraw_mls)
    if spxraw.size < 10:
        return None, None

    flow_l = spxraw / 1000.0
    time = np.arange(0, len(spxraw)) * dt
    volume = np.cumsum(flow_l * dt)

    start_idx = None
    for i in range(len(flow_l) - k_consecutive):
        ventana = flow_l[i : i + k_consecutive]
        if np.all(ventana > threshold_f):
            start_idx = i
            break

    if start_idx is None:
        return None, None

    last_valid_idx = len(flow_l)
    for i in range(len(flow_l) - 1, -1, -1):
        if flow_l[i] >= threshold_f:
            last_valid_idx = i + 1
            break

    if last_valid_idx - start_idx < min_length_after_start:
        return None, None

    time_seg = time[start_idx:last_valid_idx] - time[start_idx]
    volume_seg = volume[start_idx:last_valid_idx]

    if len(time_seg) < min_length_after_start:
        return None, None

    return time_seg, volume_seg


# ---------------------------
# Parser XML y creación de medidas
# ---------------------------

def procesar_xml(contents):
    content_type, content_string = contents.split(',')
    decoded = base64.b64decode(content_string)
    root = ET.fromstring(decoded)

    person_block = root.find(".//E[@N='Person']")
    signal_block = root.find(".//E[@N='Signal']")

    if person_block is not None:
        first_name_el = person_block.find(".//E[@N='FirstName']")
        last_name_el = person_block.find(".//E[@N='LastName']")
        birth_date_el = person_block.find(".//E[@N='BirthDate']")
        first_name = first_name_el.get('V') if first_name_el is not None else 'Desconocido'
        last_name = last_name_el.get('V') if last_name_el is not None else 'Desconocido'
        birth_date = birth_date_el.get('V') if birth_date_el is not None else 'Desconocido'
    else:
        first_name = last_name = birth_date = "Desconocido"

    if signal_block is None:
        raise ValueError("No se encontró bloque 'Signal' en el XML.")

    blocks = signal_block.findall(".//E[@T='R']")
    if not blocks:
        raise ValueError("No se encontraron bloques de señal.")

    medidas = procesar_medidas_con_parametros(blocks)

    datos = {
        'paciente': {
            'nombre': f"{first_name} {last_name}",
            'nacimiento': birth_date
        },
        'medidas': medidas
    }

    return datos


def obtener_parametros(bloque_parametros):
    def get_val(key):
        el = bloque_parametros.find(f".//E[@N='{key}']")
        return el.get('V') if el is not None else '-'

    fvc = get_val('FEVC')
    ref_fvc = get_val('Ref_FEVC')
    fev1 = get_val('FEV1')
    ref_fev1 = get_val('Ref_FEV1')
    fev1_fvc = get_val('FEV1FEVC_PER')
    ref_fev1_fvc = get_val('Ref_FEV1FEVC_PER')
    pef = get_val('PEF')
    peflpm = get_val('PEFLPM')
    peft = get_val('PEFT')
    vext = get_val('VEXT')
    fef = get_val('FET')
    vext_per = get_val('VEXTFEVC_PER')
    dt90 = get_val('DT90')

    def pct(val, ref):
        try:
            return round(100 * float(val) / float(ref), 1)
        except:
            return '-'

    df_data = {
        'Parámetro': ['FVC', 'FEV1', 'FEV1/FVC', 'PEF', 'FEF 25-75', 'PEFT', 'Vext', 'DT90'],
        'Teórico': [ref_fvc, ref_fev1, ref_fev1_fvc, peflpm, '-', '-', '-', '-'],
        'Prueba': [fvc, fev1, fev1_fvc, pef, fef, peft, vext, dt90],
        '%Teórico': [
            pct(fvc, ref_fvc),
            pct(fev1, ref_fev1),
            pct(fev1_fvc, ref_fev1_fvc),
            pct(pef, peflpm),
            '-', '-', '-', '-'
        ]
    }

    return pd.DataFrame(df_data)


def procesar_medidas_con_parametros(blocks):
    medidas = []

    for idx in range(0, len(blocks), 2):
        bloque_senal = blocks[idx]
        bloque_parametros = blocks[idx + 1] if idx + 1 < len(blocks) else None

        info = None
        signal = None

        for e in bloque_senal:
            if e.attrib.get('N') == 'Info':
                info = e.attrib.get('V')
            if e.attrib.get('N') == 'Data' and e.attrib.get('T') == 'C':
                signal = e.attrib.get('V')

        if not info or not signal:
            continue

        try:
            frecuencia = int(info.split('=')[2][:-2])
            flujo = [int(i)/1000 for i in signal.split(':')]
            tiempo = [i/frecuencia for i in range(len(flujo))]
            volumen_frame = [i/frecuencia for i in flujo]

            volumen = []
            for i in range(len(volumen_frame)):
                volumen.append(sum(volumen_frame[:i+1]))

            df_medida = pd.DataFrame({
                'Tiempo': tiempo,
                'Flujo': flujo,
                'Volumen': volumen
            })

            if bloque_parametros is not None:
                df_parametros = obtener_parametros(bloque_parametros)
            else:
                df_parametros = pd.DataFrame()

            medidas.append({
                'grafica': df_medida.to_dict('records'),
                'parametros': df_parametros.to_dict('records')
            })

        except Exception:
            continue

    return medidas

# ---------------------------
# Dash app
# ---------------------------

app = dash.Dash(__name__, external_stylesheets=[dbc.themes.FLATLY])
app.title = "Visualizador de curvas de espirometrías (procesado)"

app.layout = html.Div([
    html.H2("Visualizador de curvas de espirometrías y clasificación de calidad de la maniobra"),
    dcc.Upload(
        id='upload-xml',
        children=html.Button('Subir archivo XML'),
        multiple=False
    ),
    dcc.Store(id='datos-senal', storage_type='memory'),
    html.Div(id='info-paciente'),
    html.Div(id='tabla-calidad-medidas'),
    html.Hr(),
    html.Div(id='graficos-medidas')
], style={'maxWidth': '1100px', 'margin': 'auto', 'padding': '20px'})


# Callback para procesar XML y crear tabla de aceptabilidad de maniobra
@app.callback(
    Output('datos-senal', 'data'),
    Output('info-paciente', 'children'),
    Output('tabla-calidad-medidas', 'children'),
    Input('upload-xml', 'contents')
)
def manejar_archivo(contents):
    if contents is None:
        return dash.no_update, "", dash.no_update

    try:
        datos = procesar_xml(contents)
        paciente = datos['paciente']
        nombre = 'PACIENTE ANONIMO'
        info = html.Div([
            html.H4("Información del paciente:"),
            html.P(f"Nombre: {nombre}"),
            html.P(f"Fecha de nacimiento: {paciente['nacimiento']}")
        ])

        calidad_data = []
        for i, medida in enumerate(datos['medidas']):
            realizacion = "no aceptable"
            motivo = "sin datos"

            try:
                df = pd.DataFrame(medida['grafica'])
                if not df.empty:
                    dt_est = df['Tiempo'].diff().median()
                    dt = float(dt_est) if dt_est and not np.isnan(dt_est) else 0.01
                    spxraw_mls = df['Flujo'].astype(float).values * 1000.0

                    label, probas, motivo_pred = predecir_aceptabilidad(spxraw_mls, dt)

                    # ------------------------------------
                    # FILTRO FINAL POR VEXT DEL XML
                    # ------------------------------------
                    try:
                        df_param = pd.DataFrame(medida['parametros'])
                        fila_vext = df_param[df_param['Parámetro'] == 'Vext']
                        if not fila_vext.empty:
                            vext_val = float(fila_vext['Prueba'].values[0])

                        if vext_val > 0.150:
                            label = "D"
                            motivo_pred = "Vext alto/tos/otros artefactos"
                    except Exception:
                        pass
                    # ------------------------------------

                    if label is not None:
                        realizacion = "aceptable" if label == "A" else "no aceptable"
                        motivo = motivo_pred if motivo_pred != "" else "ninguno"
                    else:
                        realizacion = "no aceptable"
                        motivo = "preprocesado no válido"
                else:
                    realizacion = "no aceptable"
                    motivo = "sin datos"
            except Exception as e:
                realizacion = "no aceptable"
                motivo = f"error: {e}"

            calidad_data.append({
                'Paciente': nombre,
                'Medida': i + 1,
                'Realización': realizacion,
                'Motivo': motivo
            })

        tabla = dash_table.DataTable(
            id='tabla-calidad',
            columns=[
                {'name': 'Paciente', 'id': 'Paciente'},
                {'name': 'Medida', 'id': 'Medida'},
                {'name': 'Realización', 'id': 'Realización', 'presentation': 'dropdown'},
                {'name': 'Motivo', 'id': 'Motivo', 'presentation': 'dropdown'}
            ],
            data=calidad_data,
            editable=True,
            dropdown={
                'Realización': {
                    'clearable': False,
                    'options': [{'label': i, 'value': i} for i in ['aceptable', 'no aceptable']]
                },
                'Motivo': {
                    'clearable': False,
                    'options': [
                        {'label': i, 'value': i}
                        for i in ['ninguno', 'pico no válido/no reproducible', 'poca duración/no meseta', 'Vext alto/tos/otros artefactos', 'sin datos', 'preprocesado no válido']
                    ]
                }
            },
            style_table={'overflowX': 'auto'},
            style_cell={'textAlign': 'center'},
            style_header={'backgroundColor': 'lightgray', 'fontWeight': 'bold'}
        )

        return datos, info, tabla

    except Exception as e:
        return dash.no_update, f"Error al procesar el archivo: {e}", dash.no_update


# Callback para mostrar gráficas usando los datos PREPROCESADOS
@app.callback(
    Output('graficos-medidas', 'children'),
    Input('datos-senal', 'data')
)
def mostrar_todo(data):
    if not data:
        raise dash.exceptions.PreventUpdate

    secciones = []

    for i, medida in enumerate(data['medidas']):
        df_grafica = pd.DataFrame(medida['grafica'])
        df_parametros = pd.DataFrame(medida['parametros'])

        if df_grafica.empty:
            secciones.extend([
                html.Hr(),
                html.H4(f'Medida {i+1}'),
                html.P("No hay datos de señal para esta medida.")
            ])
            continue

        dt_est = df_grafica['Tiempo'].diff().median()
        try:
            dt = float(dt_est) if not np.isnan(dt_est) and dt_est is not None else 0.01
            if dt <= 0:
                dt = 0.01
        except Exception:
            dt = 0.01

        spxraw_mls = df_grafica['Flujo'].astype(float).values * 1000.0

        vol_proc, flow_proc = preprocesar_volume_flow_from_mls(spxraw_mls, dt=dt)
        time_proc, vol_time_proc = preprocesar_time_volume_from_mls(spxraw_mls, dt=dt)

        nota_preproc = None
        if vol_proc is None or flow_proc is None:
            vol_proc = df_grafica['Volumen'].values
            flow_proc = df_grafica['Flujo'].values
            nota_preproc = "Preprocesado (volume-flow) no aplicable: se muestra señal original."
        if time_proc is None or vol_time_proc is None:
            time_proc = df_grafica['Tiempo'].values
            vol_time_proc = df_grafica['Volumen'].values
            nota_preproc = "Preprocesado (time-volume) no aplicable: se muestra señal original." if nota_preproc is None else nota_preproc

        fig_vol_tiempo = go.Figure()
        fig_vol_tiempo.add_trace(go.Scatter(x=time_proc, y=vol_time_proc, mode='lines', name='Volumen vs Tiempo (proc)'))
        fig_vol_tiempo.update_layout(
            title=f'Medida {i+1}: Volumen vs Tiempo (procesado)',
            xaxis_title='Tiempo (s)',
            yaxis_title='Volumen (L)',
            margin={'t': 40, 'b': 40, 'l': 60, 'r': 10}
        )

        fig_flujo_vol = go.Figure()
        fig_flujo_vol.add_trace(go.Scatter(x=vol_proc, y=flow_proc, mode='lines', name='Flujo vs Volumen (proc)'))
        fig_flujo_vol.update_layout(
            title=f'Medida {i+1}: Flujo vs Volumen (procesado)',
            xaxis_title='Volumen (L)',
            yaxis_title='Flujo (L/s)',
            margin={'t': 40, 'b': 40, 'l': 60, 'r': 10}
        )

        tabla_parametros = html.Div()
        if not df_parametros.empty:
            tabla_parametros = html.Div([
                html.H5(f'Parámetros para Medida {i+1}'),
                dash_table.DataTable(
                    columns=[{'name': c, 'id': c} for c in df_parametros.columns],
                    data=df_parametros.to_dict('records'),
                    style_table={'overflowX': 'auto'},
                    style_cell={'textAlign': 'center'},
                    style_header={'backgroundColor': 'lightgrey', 'fontWeight': 'bold'}
                )
            ])

        children = [
            html.Hr(),
            html.H4(f'Medida {i+1}')
        ]

        if nota_preproc is not None:
            children.append(html.P(nota_preproc, style={'color': 'darkred'}))

        children.extend([
            dbc.Row([
                dbc.Col([dcc.Graph(figure=fig_vol_tiempo)], width=6),
                dbc.Col([dcc.Graph(figure=fig_flujo_vol)], width=6)
            ]),
            tabla_parametros
        ])

        secciones.extend(children)

    return secciones


if __name__ == '__main__':
    import threading
    import webbrowser

    def abrir_navegador():
        webbrowser.open("http://127.0.0.1:8050")

    threading.Timer(2.5, abrir_navegador).start()
    app.run(debug=False)
