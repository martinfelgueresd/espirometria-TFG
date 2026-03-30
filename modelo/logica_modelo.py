import base64
import xml.etree.ElementTree as ET
import pandas as pd
import numpy as np

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

def procesar_xml(file):
    contenido = file.read()
    root = ET.fromstring(contenido)

    person_block = root.find(".//E[@N='Person']")
    signal_block = root.find(".//E[@N='Signal']")

    if person_block is not None:
        first_name_el = person_block.find(".//E[@N='FirstName']")
        last_name_el = person_block.find(".//E[@N='LastName']")
        birth_date_el = person_block.find(".//E[@N='BirthDate']")
        first_name = first_name_el.get('V') if first_name_el is not None else 'Desconocido'
        last_name = last_name_el.get('V') if last_name_el is not None else 'Desconocido'
        birth_date = birth_date_el.get('V').split(' ')[0] if birth_date_el is not None else 'Desconocido'
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
            'nombre': f"{first_name} {last_name}".title(),
            'fecha_nacimiento': birth_date
        },
        'medidas': medidas
    }

    return datos

def a_numero(val):
    try:
        resultado = float(val)
        return None if np.isnan(resultado) else resultado
    except (ValueError, TypeError):
        return None

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

    # Z-scores necesarios para interpretación diagnóstica
    z_fvc = get_val('Z_FEVC')
    z_fev1 = get_val('Z_FEV1')
    z_fev1_fvc = get_val('Z_FEV1FEVC_PER')

    def pct(val, ref):
        try:
            if val is None or ref is None:
                return None
            resultado = round(100 * float(val) / float(ref), 1)
            return None if np.isnan(resultado) else resultado
        except:
            return None

    df_data = {
        'parametro': ['FVC', 'FEV1', 'FEV1/FVC', 'PEF', 'FEF 25-75', 'PEFT', 'Vext', 'DT90'],
        'teorico': [a_numero(ref_fvc), a_numero(ref_fev1), a_numero(ref_fev1_fvc), a_numero(peflpm), None, None, None, None],
        'prueba': [a_numero(fvc), a_numero(fev1), a_numero(fev1_fvc), a_numero(pef), a_numero(fef), a_numero(peft), a_numero(vext), a_numero(dt90)],
        'pct_teorico': [
            pct(a_numero(fvc), a_numero(ref_fvc)),
            pct(a_numero(fev1), a_numero(ref_fev1)),
            pct(a_numero(fev1_fvc), a_numero(ref_fev1_fvc)),
            pct(a_numero(pef), a_numero(peflpm)),
            None, None, None, None
        ]
    }

    # Devolvemos también los z-scores y predichos por separado para uso interno
    z_scores = {
        'z_fvc': a_numero(z_fvc),
        'z_fev1': a_numero(z_fev1),
        'z_fev1_fvc': a_numero(z_fev1_fvc),
        'ref_fvc': a_numero(ref_fvc),
        'ref_fev1': a_numero(ref_fev1),
        'fvc': a_numero(fvc),
        'fev1': a_numero(fev1)
    }

    return pd.DataFrame(df_data), z_scores

def es_bloque_senal(bloque):
    """
    Determina si un bloque R es un bloque de señal de maniobra individual
    (tiene Info y Data con señal de flujo) o es un bloque resumen de sesión.
    """
    tiene_info = False
    tiene_data = False
    for e in bloque:
        if e.attrib.get('N') == 'Info':
            tiene_info = True
        if e.attrib.get('N') == 'Data' and e.attrib.get('T') == 'C':
            tiene_data = True
    return tiene_info and tiene_data


def procesar_medidas_con_parametros(blocks):
    medidas = []

    # Filtrar solo los bloques que son señales de maniobras individuales
    # y sus bloques de parámetros asociados (el bloque siguiente)
    i = 0
    while i < len(blocks):
        bloque_actual = blocks[i]

        # Si es un bloque de señal de maniobra individual
        if es_bloque_senal(bloque_actual):
            bloque_senal = bloque_actual
            bloque_parametros = blocks[i + 1] if i + 1 < len(blocks) else None

            info = None
            signal = None
            fase = None

            for e in bloque_senal:
                if e.attrib.get('N') == 'Info':
                    info = e.attrib.get('V')
                if e.attrib.get('N') == 'Data' and e.attrib.get('T') == 'C':
                    signal = e.attrib.get('V')
                if e.attrib.get('N') == 'Phase':
                    phase_raw = e.attrib.get('V', '')
                    if 'Pre' in phase_raw:
                        fase = 'pre'
                    elif 'Post' in phase_raw:
                        fase = 'post'
                    else:
                        fase = None

            if info and signal:
                try:
                    frecuencia = int(info.split('=')[2][:-2])
                    flujo = [int(v) / 1000 for v in signal.split(':')]
                    tiempo = [v / frecuencia for v in range(len(flujo))]
                    volumen_frame = [v / frecuencia for v in flujo]

                    volumen = []
                    for j in range(len(volumen_frame)):
                        volumen.append(sum(volumen_frame[:j + 1]))

                    df_medida = pd.DataFrame({
                        'tiempo': tiempo,
                        'flujo': flujo,
                        'volumen': volumen
                    })

                    if bloque_parametros is not None:
                        df_parametros, z_scores = obtener_parametros(bloque_parametros)
                    else:
                        df_parametros = pd.DataFrame()
                        z_scores = {}

                    medidas.append({
                        'grafica': df_medida.to_dict('records'),
                        'parametros': df_parametros.to_dict('records'),
                        'z_scores': z_scores,
                        'fase': fase
                    })

                    # Saltamos el bloque de parámetros que ya procesamos
                    i += 2
                    continue

                except Exception:
                    pass

        i += 1

    return medidas


# ---------------------------
# Cálculo de grado de calidad
# ---------------------------

def calcular_grado(n_aceptables, repetibilidad):
    """
    Calcula el grado de calidad de una sesión según ATS/ERS 2019.
    - n_aceptables: número de maniobras aceptables
    - repetibilidad: diferencia entre los 2 mayores valores (FVC o FEV1)
    """
    if n_aceptables == 0:
        return 'F'
    if n_aceptables == 1:
        return 'E'
    # A partir de aquí n_aceptables >= 2
    if repetibilidad is None:
        return 'E'
    if n_aceptables >= 3 and repetibilidad < 0.150:
        return 'A'
    if n_aceptables == 2 and repetibilidad < 0.150:
        return 'B'
    if repetibilidad < 0.200:
        return 'C'
    if repetibilidad < 0.250:
        return 'D'
    return 'E'


# ---------------------------
# Interpretación diagnóstica
# ---------------------------

def calcular_severidad(z_score):
    """
    Calcula la severidad a partir de un z-score según ATS/ERS 2022.
    """
    if z_score is None:
        return None
    if z_score > -1.645:
        return 'Normal'
    if z_score > -2.5:
        return 'Leve'
    if z_score > -4.0:
        return 'Moderada'
    return 'Grave'


def calcular_patron_y_severidad(z_fev1_fvc, z_fvc, z_fev1):
    """
    Determina el patrón diagnóstico y la severidad según ATS/ERS 2022.
    Usa z-scores con límite inferior de normalidad en -1.645.
    """
    LIN = -1.645

    if z_fev1_fvc is None or z_fvc is None:
        return None, None

    hay_obstruccion = z_fev1_fvc < LIN
    hay_restriccion = z_fvc < LIN

    if hay_obstruccion and hay_restriccion:
        patron = 'Mixto'
        # En patrón mixto usamos el peor z-score entre FEV1 y FVC
        z_severidad = min(z_fev1 or z_fvc, z_fvc)
        severidad = calcular_severidad(z_severidad)
    elif hay_obstruccion:
        patron = 'Obstrucción'
        severidad = calcular_severidad(z_fev1)
    elif hay_restriccion:
        patron = 'Restricción'
        severidad = calcular_severidad(z_fvc)
    else:
        patron = 'Normal'
        severidad = 'Normal'

    return patron, severidad


# ---------------------------
# Cálculo de sesión (pre o post)
# ---------------------------

def calcular_sesion(medidas_fase):
    """
    Calcula el grado, patrón y severidad de una sesión (pre o post).
    Recibe la lista de maniobras de una fase ya con realizacion y z_scores.
    """
    # Filtrar aceptables
    aceptables = [m for m in medidas_fase if m.get('realizacion') == 'aceptable']
    n_aceptables = len(aceptables)

    # Si no hay ninguna aceptable -> sesión inválida
    if n_aceptables == 0:
        return {
            'grado': 'F',
            'patron': 'Sesión inválida',
            'severidad': 'Sesión inválida'
        }

    # Calcular repetibilidad con los 2 mayores FVC y FEV1 aceptables
    fvcs = sorted(
        [m['z_scores']['fvc'] for m in aceptables if m['z_scores'].get('fvc') is not None],
        reverse=True
    )
    fev1s = sorted(
        [m['z_scores']['fev1'] for m in aceptables if m['z_scores'].get('fev1') is not None],
        reverse=True
    )

    rep_fvc = abs(fvcs[0] - fvcs[1]) if len(fvcs) >= 2 else None
    rep_fev1 = abs(fev1s[0] - fev1s[1]) if len(fev1s) >= 2 else None

    # El grado se basa en la peor repetibilidad entre FVC y FEV1
    if rep_fvc is not None and rep_fev1 is not None:
        rep = max(rep_fvc, rep_fev1)
    else:
        rep = rep_fvc or rep_fev1

    grado = calcular_grado(n_aceptables, rep)

    # Seleccionar valores representativos para interpretación
    # FVC -> mayor de las aceptables
    # FEV1 -> mayor de las aceptables
    # Z-scores -> de la maniobra con mayor FVC (más representativa)
    mejor_fvc_medida = max(
        [m for m in aceptables if m['z_scores'].get('fvc') is not None],
        key=lambda m: m['z_scores']['fvc'],
        default=None
    )

    if mejor_fvc_medida is None:
        return {
            'grado': grado,
            'patron': None,
            'severidad': None
        }

    z_scores = mejor_fvc_medida['z_scores']
    patron, severidad = calcular_patron_y_severidad(
        z_scores.get('z_fev1_fvc'),
        z_scores.get('z_fvc'),
        z_scores.get('z_fev1')
    )

    return {
        'grado': grado,
        'patron': patron,
        'severidad': severidad
    }


# ---------------------------
# Cálculo de respuesta broncodilatadora
# ---------------------------

def calcular_broncodilatador(medidas_pre, medidas_post):
    """
    Calcula la respuesta broncodilatadora comparando sesión pre y post.
    Criterio ATS/ERS 2022: cambio > 10% del valor predicho en FEV1 o FVC.
    """
    aceptables_pre = [m for m in medidas_pre if m.get('realizacion') == 'aceptable']
    aceptables_post = [m for m in medidas_post if m.get('realizacion') == 'aceptable']

    # Si alguna sesión no tiene aceptables no se puede calcular
    if not aceptables_pre or not aceptables_post:
        return {'respuesta': None}

    # Valores representativos: mayor FVC y FEV1 de cada sesión
    fvc_pre = max(
        [m['z_scores']['fvc'] for m in aceptables_pre if m['z_scores'].get('fvc') is not None],
        default=None
    )
    fvc_post = max(
        [m['z_scores']['fvc'] for m in aceptables_post if m['z_scores'].get('fvc') is not None],
        default=None
    )
    fev1_pre = max(
        [m['z_scores']['fev1'] for m in aceptables_pre if m['z_scores'].get('fev1') is not None],
        default=None
    )
    fev1_post = max(
        [m['z_scores']['fev1'] for m in aceptables_post if m['z_scores'].get('fev1') is not None],
        default=None
    )

    # Predichos (ref) -> tomamos de la primera maniobra aceptable pre
    ref_fvc = aceptables_pre[0]['z_scores'].get('ref_fvc')
    ref_fev1 = aceptables_pre[0]['z_scores'].get('ref_fev1')

    if None in [fvc_pre, fvc_post, fev1_pre, fev1_post, ref_fvc, ref_fev1]:
        return {'respuesta': None}

    # Cambio como % del predicho
    cambio_fev1 = abs(fev1_post - fev1_pre) / ref_fev1 * 100
    cambio_fvc = abs(fvc_post - fvc_pre) / ref_fvc * 100

    respuesta = 'Positiva' if cambio_fev1 > 10 or cambio_fvc > 10 else 'Negativa'

    return {'respuesta': respuesta}


# ---------------------------
# Procesado principal
# ---------------------------

def procesar_espirometria(contents):
    if contents is None:
        return None, None

    try:
        datos = procesar_xml(contents)
        paciente = datos['paciente']
        nombre = datos['paciente']['nombre']

        for i, medida in enumerate(datos['medidas']):
            realizacion = "no aceptable"
            motivo = "sin datos"

            try:
                df = pd.DataFrame(medida['grafica'])
                if not df.empty:
                    dt_est = df['tiempo'].diff().median()
                    dt = float(dt_est) if dt_est and not np.isnan(dt_est) else 0.01
                    spxraw_mls = df['flujo'].astype(float).values * 1000.0

                    label, probas, motivo_pred = predecir_aceptabilidad(spxraw_mls, dt)

                    # ------------------------------------
                    # FILTRO FINAL POR VEXT DEL XML
                    # ------------------------------------
                    try:
                        df_param = pd.DataFrame(medida['parametros'])
                        fila_vext = df_param[df_param['parametro'] == 'Vext']
                        if not fila_vext.empty:
                            vext_val = float(fila_vext['prueba'].values[0])

                        if vext_val > 0.150:
                            label = "D"
                            motivo_pred = "Vext alto/tos/otros artefactos"
                    except Exception:
                        pass
                    # ------------------------------------

                    if label is not None:
                        realizacion = "aceptable" if label == "A" else "no aceptable"
                        motivo = motivo_pred if motivo_pred != "" else None
                    else:
                        realizacion = "no aceptable"
                        motivo = "preprocesado no válido"
                else:
                    realizacion = "no aceptable"
                    motivo = "sin datos"
            except Exception as e:
                realizacion = "no aceptable"
                motivo = f"error: {e}"

            medida["medida"] = i + 1
            medida["realizacion"] = realizacion
            medida["motivo"] = motivo
            medida["parametros"] = medida.get("parametros", [])

        return datos

    except Exception as e:
        raise Exception(f"Error al procesar el archivo: {e}")

def limpiar_array(arr):
    return [None if (isinstance(x, float) and np.isnan(x)) else x for x in arr.tolist()]

def limpiar_dict(d):
    return {
        k: None if (isinstance(v, float) and np.isnan(v)) else v
        for k, v in d.items()
    }

def procesar_curvas_espirometria(datos):
    if not datos:
        return None

    nuevas_medidas = []

    for i, medida in enumerate(datos['medidas']):

        df_grafica = pd.DataFrame(medida['grafica'])

        medida_out = {
            "medida": medida.get("medida"),
            "fase": medida.get("fase"),
            "realizacion": medida.get("realizacion"),
            "motivo": medida.get("motivo"),
            "graficas": None,
            "parametros": [limpiar_dict(p) for p in medida.get("parametros", [])],
            "z_scores": medida.get("z_scores", {})
        }

        if df_grafica.empty:
            medida_out["error"] = "sin datos de señal"
            nuevas_medidas.append(medida_out)
            continue

        dt_est = df_grafica['tiempo'].diff().median()
        try:
            dt = float(dt_est) if not np.isnan(dt_est) and dt_est is not None else 0.01
            if dt <= 0:
                dt = 0.01
        except Exception:
            dt = 0.01

        spxraw_mls = df_grafica['flujo'].astype(float).values * 1000.0

        vol_proc, flow_proc = preprocesar_volume_flow_from_mls(spxraw_mls, dt=dt)
        time_proc, vol_time_proc = preprocesar_time_volume_from_mls(spxraw_mls, dt=dt)

        if vol_proc is None or flow_proc is None:
            vol_proc = df_grafica['volumen'].values
            flow_proc = df_grafica['flujo'].values

        if time_proc is None or vol_time_proc is None:
            time_proc = df_grafica['tiempo'].values
            vol_time_proc = df_grafica['volumen'].values

        medida_out["graficas"] = {
            "volumen": limpiar_array(vol_proc),
            "flujo": limpiar_array(flow_proc),
            "tiempo": limpiar_array(time_proc)
        }

        nuevas_medidas.append(medida_out)

    datos["medidas"] = nuevas_medidas

    return datos


def pipeline_espirometria(contents):
    datos = procesar_espirometria(contents)
    datos = procesar_curvas_espirometria(datos)

    # Separar medidas por fase
    medidas_pre = [m for m in datos['medidas'] if m.get('fase') == 'pre']
    medidas_post = [m for m in datos['medidas'] if m.get('fase') == 'post']

    # Calcular sesión pre
    sesion_pre = calcular_sesion(medidas_pre) if medidas_pre else {
        'grado': None,
        'patron': None,
        'severidad': None
    }

    # Calcular sesión post
    sesion_post = calcular_sesion(medidas_post) if medidas_post else {
        'grado': None,
        'patron': None,
        'severidad': None
    }

    # Calcular respuesta broncodilatadora
    broncodilatador = calcular_broncodilatador(medidas_pre, medidas_post) if medidas_pre and medidas_post else {
        'respuesta': None
    }

    # Eliminar z_scores del output final (son datos internos)
    for medida in datos['medidas']:
        medida.pop('z_scores', None)

    return datos, sesion_pre, sesion_post, broncodilatador