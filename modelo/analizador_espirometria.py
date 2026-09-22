"""
Recibe el contenido del XML como string y devuelve el JSON estructurado
con la sesión lista para ser enviada al backend.

El modelo de IA evalúa la aceptabilidad de cada maniobra (acceptable, grade,
rejection_reason). La interpretación clínica queda delegada al backend.
"""

import xml.etree.ElementTree as ET
import numpy as np
from modelo_prediccion import predecir_aceptabilidad


# ---------------------------------------------------------------------------
# PREPROCESADO DE SEÑAL
# ---------------------------------------------------------------------------

def _preprocesar_volume_flow_from_mls(spxraw_mls, dt=0.01,
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
        ventana = flow_l[i: i + k_consecutive]
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
    flow_seg   = flow_l[start_idx:last_valid_idx]

    return volume_seg, flow_seg


def _preprocesar_time_volume_from_mls(spxraw_mls, dt=0.01,
                                      threshold_f=0.01,
                                      k_consecutive=50,
                                      min_length_after_start=5):
    spxraw = np.asarray(spxraw_mls)
    if spxraw.size < 10:
        return None, None

    flow_l = spxraw / 1000.0
    time   = np.arange(0, len(spxraw)) * dt
    volume = np.cumsum(flow_l * dt)

    start_idx = None
    for i in range(len(flow_l) - k_consecutive):
        ventana = flow_l[i: i + k_consecutive]
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

    time_seg   = time[start_idx:last_valid_idx] - time[start_idx]
    volume_seg = volume[start_idx:last_valid_idx]

    if len(time_seg) < min_length_after_start:
        return None, None

    return time_seg, volume_seg


# ---------------------------------------------------------------------------
# HELPERS DE PARSEO
# ---------------------------------------------------------------------------

def _get_attr(element, name, default=None):
    el = element.find(f".//E[@N='{name}']")
    if el is None:
        return default
    return el.get('V', default)


def _to_float(value, default=None):
    try:
        return round(float(value), 4)
    except (TypeError, ValueError):
        return default


def _to_int(value, default=None):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


# ---------------------------------------------------------------------------
# PARSEO DEL PACIENTE
# ---------------------------------------------------------------------------

def _parsear_paciente(root):
    person = root.find(".//E[@N='Person']")
    if person is None:
        return {}

    personal_id = _get_attr(person, 'PersonalID', '')
    first_name  = _get_attr(person, 'FirstName', '')
    last_name   = _get_attr(person, 'LastName', '')
    birth_date  = _get_attr(person, 'BirthDate', '')
    gender_raw  = _get_attr(person, 'Gender', '')
    ethnic_raw  = _get_attr(person, 'EthnicGroupID', '')

    altura = peso = None
    for e in person.findall(".//E[@N='Custom']"):
        v = e.get('V', '')
        if v.startswith('Height='):
            altura = _to_float(v.split('=')[1])
        elif v.startswith('Weight='):
            peso = _to_float(v.split('=')[1])

    session_data = root.find(".//E[@N='Data']")
    edad = _to_float(_get_attr(session_data, 'Age')) if session_data else None

    imc = None
    if altura and peso and altura > 0:
        imc = round(peso / ((altura / 100) ** 2), 1)

    sexo_map  = {'0': 'F', '1': 'M'}
    etnia_map = {'1': 'caucasian', '2': 'african_american', '3': 'caucasian',
                 '4': 'asian_southeast', '5': 'asian_other', '6': 'other'}

    fumador_raw = _get_attr(session_data, 'Smoking') if session_data else None

    birth_date_clean = birth_date.split(' ')[0] if birth_date else None

    return {
        'personalId':    personal_id,
        'name':          first_name.strip(),
        'surname':       last_name.strip(),
        'birth_date':    birth_date_clean,
        'age':           _to_int(edad),
        'gender':        sexo_map.get(gender_raw, gender_raw),
        'height':        altura,
        'weight':        peso,
        'imc':           imc,
        'smoker':        fumador_raw == '1' if fumador_raw else None,
        'ethnic_group':  etnia_map.get(ethnic_raw, ethnic_raw),
    }


# ---------------------------------------------------------------------------
# PARSEO DE LA SESIÓN (operador, protocolo, fecha)
# ---------------------------------------------------------------------------

def _parsear_sesion(root):
    data      = root.find(".//E[@N='Data']")
    protocolo = _get_attr(data, 'ProtocolName') if data else None

    session      = root.find(".//E[@N='Session']")
    session_time = _get_attr(session, 'SessionTime') if session else None
    fecha        = session_time.split(' ')[0] if session_time else None

    operador = None
    for op in root.findall(".//E[@N='Operation']//E[@T='R']"):
        u = _get_attr(op, 'Username')
        if u:
            operador = u

    session = root.find(".//E[@N='Session']")
    session_row = session.find("E[@T='R']") if session else None
    session_uuid = _get_attr(session_row, 'SessionUUIDKey') if session_row else None

    return {
        'date':         fecha,
        'operator':     operador,
        'protocol':     protocolo,
        'studyUUID':    session_uuid,
    }


# ---------------------------------------------------------------------------
# PARSEO DE SEÑALES (signal blocks)
# ---------------------------------------------------------------------------

def _parsear_signal_blocks(root):
    signals = []

    signal_table = root.find(".//E[@N='Signal']")
    if signal_table is None:
        return signals

    for record in signal_table.findall("E[@T='R']"):
        phase_raw  = _get_attr(record, 'Phase', '')
        order      = _to_int(_get_attr(record, 'Order'))
        start_time = _get_attr(record, 'StartTime')
        info_str   = _get_attr(record, 'Info', '')
        data_str   = _get_attr(record, 'Data', '')

        dt = 0.01
        try:
            for part in info_str.split(':'):
                if 'MeasurementFrequency' in part:
                    freq_hz = int(part.split('=')[1].replace('Hz', ''))
                    dt = 1.0 / freq_hz
                    break
        except Exception:
            pass

        spxraw_mls = None
        if data_str:
            try:
                spxraw_mls = np.array([int(x) for x in data_str.split(':')])
            except Exception:
                spxraw_mls = None

        params = {}
        data_table = record.find("E[@T='T'][@N='Data']")
        if data_table is not None:
            param_record = data_table.find("E[@T='R']")
            if param_record is not None:
                for key in ['FEVC', 'Ref_FEVC',
                            'FEV1', 'Ref_FEV1',
                            'FEV1FEVC_PER', 'Ref_FEV1FEVC_PER',
                            'PEF', 'PEFLPM',
                            'MMEF', 'Ref_MMEF',
                            'PEFT', 'VEXT', 'DT90']:
                    raw = _get_attr(param_record, key)
                    params[key] = _to_float(raw)

        phase = 'PRE' if 'pre' in phase_raw.lower() else 'POST'

        hora = start_time.split(' ')[1] if start_time and ' ' in start_time else start_time

        signals.append({
            'phase':      phase,
            'order':      order,
            'hour':       hora,
            'dt':         dt,
            'spxraw_mls': spxraw_mls,
            'params':     params,
        })

    signals.sort(key=lambda s: (0 if s['phase'] == 'PRE' else 1, s['order'] or 0))
    return signals


# ---------------------------------------------------------------------------
# ACEPTABILIDAD POR MANIOBRA
# ---------------------------------------------------------------------------

def _evaluar_maniobra(signal):
    spxraw_mls = signal['spxraw_mls']
    dt         = signal['dt']
    params     = signal['params']

    if spxraw_mls is None or len(spxraw_mls) < 10:
        return False, 'U', 'sin_datos'

    try:
        label, probas, motivo_pred = predecir_aceptabilidad(spxraw_mls, dt)
    except Exception as e:
        return False, 'U', f'error_modelo: {e}'

    motivo = motivo_pred if motivo_pred else None

    # Filtro determinista VEXT (criterio ATS: VEXT < 0.150 L)
    vext = params.get('VEXT')
    if vext is not None and vext > 0.150:
        label  = 'D'
        motivo = 'vext_alto'

    aceptable = label == 'A'
    return aceptable, label, motivo


# ---------------------------------------------------------------------------
# CONSTRUCCIÓN DE ESPIROMETRÍAS
# ---------------------------------------------------------------------------

def _construir_espirometrias(signals):
    espirometrias = []

    for sig in signals:
        aceptable, grado, motivo = _evaluar_maniobra(sig)

        # Curva flujo-volumen (FLOW_VOLUME)
        curva_fv_points = []
        vol, flow = _preprocesar_volume_flow_from_mls(sig['spxraw_mls'], dt=sig['dt'])
        if vol is not None:
            curva_fv_points = [
                {'x': round(float(x), 4), 'y': round(float(y), 4)}
                for x, y in zip(vol.tolist(), flow.tolist())
            ]

        # Curva tiempo-volumen (TIME_VOLUME)
        curva_tv_points = []
        t, v = _preprocesar_time_volume_from_mls(sig['spxraw_mls'], dt=sig['dt'])
        if t is not None:
            curva_tv_points = [
                {'x': round(float(x), 4), 'y': round(float(y), 4)}
                for x, y in zip(t.tolist(), v.tolist())
            ]

        p = sig['params']

        params_list = []
        param_map = {
            'FVC':          ('FEVC',          'Ref_FEVC'),
            'FEV1':         ('FEV1',          'Ref_FEV1'),
            'FEV1_FVC_PCT': ('FEV1FEVC_PER',  'Ref_FEV1FEVC_PER'),
            'PEF':          ('PEF',           'PEFLPM'),
            'MMEF':         ('MMEF',          'Ref_MMEF'),
            'PEFT':         ('PEFT',          None),
            'VEXT':         ('VEXT',          None),
            'DT90':         ('DT90',          None),
        }

        # PEFLPM viene del XML en L/min y PEF en L/s; se convierte a L/s antes de comparar
        # para no dividir dos valores en unidades distintas (bug presente en dashboard.py).
        PEFLPM_A_LPS = 60

        for name, (test_key, ref_key) in param_map.items():
            test_val = p.get(test_key)
            ref_val  = p.get(ref_key) if ref_key else None

            if name == 'PEF' and ref_val is not None:
                ref_val = ref_val / PEFLPM_A_LPS

            pct_val  = round(test_val / ref_val * 100, 2) if (test_val and ref_val) else None

            if test_val is not None:
                params_list.append({
                    'name':          name,
                    'theoretical':   ref_val,
                    'test':          test_val,
                    'pctTheoretical': pct_val,
                })

        espirometrias.append({
            'order':            sig['order'],
            'hour':             sig['hour'],
            'acceptable':       aceptable,
            'grade':            grado,
            'rejection_reason': motivo,
            'curves': [
                {
                    'curveType': 'FLOW_VOLUME',
                    'points':    curva_fv_points,
                },
                {
                    'curveType': 'TIME_VOLUME',
                    'points':    curva_tv_points,
                },
            ],
            'params': params_list,
        })

    return espirometrias


# ---------------------------------------------------------------------------
# GRADO DE CALIDAD DE LA SESIÓN (criterio de repetibilidad ATS/ERS 2019)
# ---------------------------------------------------------------------------

def _valor_param(maniobra, nombre):
    return next((p['test'] for p in maniobra['params'] if p['name'] == nombre and p['test'] is not None), None)


def _calcular_grado_sesion(maniobras):
    aceptables = [m for m in maniobras if m['acceptable']]
    n_aceptables = len(aceptables)

    if n_aceptables == 0:
        return 'F'
    if n_aceptables == 1:
        return 'E'

    fvcs  = sorted((v for v in (_valor_param(m, 'FVC') for m in aceptables) if v is not None), reverse=True)
    fev1s = sorted((v for v in (_valor_param(m, 'FEV1') for m in aceptables) if v is not None), reverse=True)

    rep_fvc  = abs(fvcs[0] - fvcs[1]) if len(fvcs) >= 2 else None
    rep_fev1 = abs(fev1s[0] - fev1s[1]) if len(fev1s) >= 2 else None

    if rep_fvc is not None and rep_fev1 is not None:
        repetibilidad = max(rep_fvc, rep_fev1)
    else:
        repetibilidad = rep_fvc if rep_fvc is not None else rep_fev1

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


# ---------------------------------------------------------------------------
# FUNCIÓN PRINCIPAL
# ---------------------------------------------------------------------------

def analizar_espirometria(xml_string: str) -> dict:
    """
    Parsea el XML de una sesión de espirometría y devuelve el JSON
    estructurado listo para enviar al backend.

    Parámetros
    ----------
    xml_string : str
        Contenido del fichero XML como cadena de texto.

    Devuelve
    --------
    dict con claves: date, operator, protocol, patient, preSession, postSession.
    """
    try:
        root = ET.fromstring(xml_string)
    except ET.ParseError as e:
        raise ValueError(f"XML no válido: {e}")

    paciente = _parsear_paciente(root)
    sesion   = _parsear_sesion(root)
    signals  = _parsear_signal_blocks(root)
    espiros  = _construir_espirometrias(signals)

    pre_espiros  = [e for e in espiros if next(
        (s['phase'] for s in signals if s['order'] == e['order']), None) == 'PRE']
    post_espiros = [e for e in espiros if next(
        (s['phase'] for s in signals if s['order'] == e['order']), None) == 'POST']

    return {
        'date':       sesion['date'],
        'operator':   sesion['operator'],
        'protocol':   sesion['protocol'],
        'studyUUID': sesion['studyUUID'],
        'patient':    paciente,
        'preSession': {
            'type':          'PRE',
            'sessionGrade':  _calcular_grado_sesion(pre_espiros),
            'spirometries':  pre_espiros,
        },
        'postSession': {
            'type':          'POST',
            'sessionGrade':  _calcular_grado_sesion(post_espiros),
            'spirometries':  post_espiros,
        } if post_espiros else None,
    }