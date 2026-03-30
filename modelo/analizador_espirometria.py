"""
Recibe el contenido del XML como string y devuelve el JSON estructurado
con paciente, sesión, maniobras individuales con aceptabilidad, selección
de mejores maniobras y la interpretación clínica final (criterios ATS/ERS).

Interpretación clínica implementada (ATS/ERS 2019/2022):
  - Detección de obstrucción por Z-score FEV1/FVC < -1.645 (LIN GLI-2012)
  - Severidad de la obstrucción por Z-score FEV1 (leve/moderada/grave/muy grave)
  - Patrón sugestivo de restricción (FVC < LIN, sin obstrucción); requiere CPT
  - Patrón mixto (obstrucción + FVC reducida) correctamente alcanzable
  - Patrón normal con FVC reducida (cuarto patrón diferenciado)
  - Evaluación del patrón funcional POST de forma independiente
  - Respuesta broncodilatadora según criterios ATS/ERS 2022
  - Grado de sesión (A/B/C/D) propagado a la conclusión clínica

"""

import xml.etree.ElementTree as ET
import numpy as np
from datetime import datetime
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
    flow_seg = flow_l[start_idx:last_valid_idx]

    return volume_seg, flow_seg

def _preprocesar_time_volume_from_mls(spxraw_mls, dt=0.01,
                                      threshold_f=0.01,
                                      k_consecutive=50,
                                      min_length_after_start=5):
    spxraw = np.asarray(spxraw_mls)
    if spxraw.size < 10:
        return None, None

    flow_l = spxraw / 1000.0
    time = np.arange(0, len(spxraw)) * dt
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

    time_seg = time[start_idx:last_valid_idx] - time[start_idx]
    volume_seg = volume[start_idx:last_valid_idx]

    if len(time_seg) < min_length_after_start:
        return None, None

    return time_seg, volume_seg

# ---------------------------------------------------------------------------
# HELPERS DE PARSEO
# ---------------------------------------------------------------------------

def _get_attr(element, name, default=None):
    """Devuelve el valor V del primer hijo E con N=name, o default."""
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
# PARSEO DEL PACIENTE Y LA SESIÓN
# ---------------------------------------------------------------------------

def _parsear_paciente(root):
    person = root.find(".//E[@N='Person']")
    if person is None:
        return {}

    personal_id = _get_attr(person, 'PersonalID', '')
    first_name  = _get_attr(person, 'FirstName', '')
    last_name   = _get_attr(person, 'LastName', '')
    birth_date  = _get_attr(person, 'BirthDate', '')
    gender_raw  = _get_attr(person, 'Gender', '')       # 0=mujer, 1=hombre (Medikro)
    ethnic_raw  = _get_attr(person, 'EthnicGroupID', '')

    altura = peso = ref_set = None
    for e in person.findall(".//E[@N='Custom']"):
        v = e.get('V', '')
        if v.startswith('Height='):
            altura = _to_float(v.split('=')[1])
        elif v.startswith('Weight='):
            peso = _to_float(v.split('=')[1])
        elif v.startswith('RefSetID='):
            ref_set = v.split('=')[1]

    session_data = root.find(".//E[@N='Data']")
    edad = _to_float(_get_attr(session_data, 'Age')) if session_data else None

    # IMC
    imc = None
    if altura and peso and altura > 0:
        imc = round(peso / ((altura / 100) ** 2), 1)

    # Mapeos
    sexo_map    = {'0': 'F', '1': 'M'}
    etnia_map   = {'1': 'caucasico', '2': 'afroamericano', '3': 'caucasico',
                   '4': 'asiatico_sudeste', '5': 'asiatico_otro', '6': 'otro'}
    refset_map  = {'20123': 'GLI-2012', '20101': 'ECCS-1993'}

    fumador_raw = _get_attr(session_data, 'Smoking') if session_data else None

    return {
        'personal_id':     personal_id,
        'nombre':          f"{first_name} {last_name}".strip(),
        'fecha_nacimiento': birth_date.split(' ')[0] if birth_date else None,
        'edad':            edad,
        'sexo':            sexo_map.get(gender_raw, gender_raw),
        'altura_cm':       altura,
        'peso_kg':         peso,
        'imc':             imc,
        'fumador':         fumador_raw == '1' if fumador_raw else None,
        'grupo_etnico':    etnia_map.get(ethnic_raw, ethnic_raw),
        'ref_set':         refset_map.get(ref_set, ref_set),
    }

def _parsear_sesion(root):
    session = root.find(".//E[@N='Session']")
    if session is None:
        return {}

    session_uuid = _get_attr(session, 'SessionUUIDKey')
    session_time = _get_attr(session, 'SessionTime')

    data = root.find(".//E[@N='Data']")
    temp     = _to_float(_get_attr(data, 'Temperature'))   if data else None
    presion  = _to_float(_get_attr(data, 'Pressure'))      if data else None
    humedad  = _to_float(_get_attr(data, 'Humidity'))      if data else None
    protocolo = _get_attr(data, 'ProtocolName')            if data else None

    # Asumimos que el operador principal es el último (suele ser el mismo para todas)
    operador = None
    for op in root.findall(".//E[@N='Operation']//E[@T='R']"):
        u = _get_attr(op, 'Username')
        if u:
            operador = u

    return {
        'id':          session_uuid,
        # Luego parsea directo a LocalDateTime en Java
        'fecha':       session_time.replace(' ', 'T') if session_time else None,
        'protocolo':   protocolo,
        'operador':    operador,
        'temperatura': temp,
        'presion':     presion,
        'humedad':     humedad,
    }


# ---------------------------------------------------------------------------
# PARSEO DE MANIOBRAS INDIVIDUALES
# ---------------------------------------------------------------------------

def _parsear_signal_blocks(root):
    """
    Devuelve una lista de dicts con los datos crudos de cada Signal.
    Usa SignalKey para vincular el bloque de señal con su bloque de parámetros
    (tabla Data anidada dentro de cada Signal > R).
    """
    signals = []

    # Todos los bloques E[@T='R'] directos dentro de Signal
    signal_table = root.find(".//E[@N='Signal']")
    if signal_table is None:
        return signals

    for record in signal_table.findall("E[@T='R']"):
        signal_key  = _get_attr(record, 'SignalKey')
        phase_raw   = _get_attr(record, 'Phase', '')
        order       = _to_int(_get_attr(record, 'Order'))
        start_time  = _get_attr(record, 'StartTime')
        info_str    = _get_attr(record, 'Info', '')
        data_str    = _get_attr(record, 'Data', '')

        # Frecuencia de muestreo desde Info
        dt = 0.01
        try:
            # Formato: "Unit=ml/s:MeasurementFrequency=100Hz"
            for part in info_str.split(':'):
                if 'MeasurementFrequency' in part:
                    freq_hz = int(part.split('=')[1].replace('Hz', ''))
                    dt = 1.0 / freq_hz
                    break
        except Exception:
            pass

        # Señal de flujo en ml/s
        spxraw_mls = None
        if data_str:
            try:
                spxraw_mls = np.array([int(x) for x in data_str.split(':')])
            except Exception:
                spxraw_mls = None

        # Parámetros calculados por el espirómetro (bloque Data anidado).
        # Dentro del mismo record hay dos E con N='Data':
        #   - T="C"  → string de flujo (la señal)
        #   - T="T"  → tabla con los parámetros calculados (FVC, FEV1, etc.)
        # Hay que filtrar por T="T" para no coger el string de la señal.
        params = {}
        data_table = record.find("E[@T='T'][@N='Data']")
        if data_table is not None:
            param_record = data_table.find("E[@T='R']")
            if param_record is not None:
                for key in ['FEVC', 'Ref_FEVC', 'Z_FEVC',
                            'FEV1', 'Ref_FEV1', 'Z_FEV1',
                            'FEV1FEVC_PER', 'Ref_FEV1FEVC_PER', 'Z_FEV1FEVC_PER',
                            'PEF', 'PEFLPM', 'PEFT',
                            'MMEF', 'Ref_MMEF', 'Z_MMEF',
                            'MEF25', 'Ref_MEF25', 'Z_MEF25',
                            'MEF50', 'MEF75',
                            'VEXT', 'VEXTFEVC_PER',
                            'FET', 'DT90',
                            'FEVCDIFF', 'Rel_FEVCDIFF',
                            'FEV1DIFF', 'Rel_FEV1DIFF']:
                    raw = _get_attr(param_record, key)
                    params[key] = _to_float(raw)

        # Normalizar phase
        phase = 'pre' if 'pre' in phase_raw.lower() else 'post'

        signals.append({
            'signal_key': signal_key,
            'phase':      phase,
            'order':      order,
            'hora':       start_time.replace(' ', 'T') if start_time else None,
            'dt':         dt,
            'spxraw_mls': spxraw_mls,
            'params':     params,
        })

    # Ordenar por fase y luego por order
    signals.sort(key=lambda s: (0 if s['phase'] == 'pre' else 1, s['order'] or 0))
    return signals

# ---------------------------------------------------------------------------
# ACEPTABILIDAD POR MANIOBRA
# ---------------------------------------------------------------------------

def _evaluar_maniobra(signal):
    """
    Llama al modelo y aplica el filtro determinista de VEXT.
    Devuelve: (aceptable: bool, grado: str, motivo: str | None)
    """
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
# CONSTRUCCIÓN DEL BLOQUE DE MANIOBRAS
# ---------------------------------------------------------------------------

def _construir_maniobras(signals):
    """
    Para cada signal: evalúa aceptabilidad, preprocesa curvas y
    devuelve la lista de dicts lista para el JSON final.
    """
    maniobras = []

    for sig in signals:
        aceptable, grado, motivo = _evaluar_maniobra(sig)

        # Curvas preprocesadas
        curva_tv = curva_fv = None
        if sig['spxraw_mls'] is not None:
            t, v = _preprocesar_time_volume_from_mls(sig['spxraw_mls'], dt=sig['dt'])
            if t is not None:
                curva_tv = list(zip(
                    [round(x, 4) for x in t.tolist()],
                    [round(x, 4) for x in v.tolist()]
                ))

            vol, flow = _preprocesar_volume_flow_from_mls(sig['spxraw_mls'], dt=sig['dt'])
            if vol is not None:
                curva_fv = list(zip(
                    [round(x, 4) for x in vol.tolist()],
                    [round(x, 4) for x in flow.tolist()]
                ))

        p = sig['params']

        maniobras.append({
            'signal_key':     sig['signal_key'],
            'phase':          sig['phase'],
            'order':          sig['order'],
            'hora':           sig['hora'],
            'aceptable':      aceptable,
            'grado':          grado,
            'motivo_rechazo': motivo,
            'parametros': {
                'fvc':          p.get('FEVC'),
                'fev1':         p.get('FEV1'),
                'fev1_fvc_pct': p.get('FEV1FEVC_PER'),
                'pef':          p.get('PEF'),
                'pef_lpm':      p.get('PEFLPM'),
                'peft_ms':      p.get('PEFT'),
                'mmef':         p.get('MMEF'),
                'mef25':        p.get('MEF25'),
                'mef50':        p.get('MEF50'),
                'mef75':        p.get('MEF75'),
                'vext':         p.get('VEXT'),
                'vext_fvc_pct': p.get('VEXTFEVC_PER'),
                'fet':          p.get('FET'),
                'dt90':         p.get('DT90'),
            },
            'referencias': {
                'ref_fvc':      p.get('Ref_FEVC'),
                'ref_fev1':     p.get('Ref_FEV1'),
                'ref_fev1_fvc': p.get('Ref_FEV1FEVC_PER'),
                'z_fvc':        p.get('Z_FEVC'),
                'z_fev1':       p.get('Z_FEV1'),
                'z_fev1_fvc':   p.get('Z_FEV1FEVC_PER'),
                'ref_mmef':     p.get('Ref_MMEF'),
                'z_mmef':       p.get('Z_MMEF'),
            },
            'curva': {
                'tiempo_volumen': curva_tv,
                'flujo_volumen':  curva_fv,
            },
        })

    return maniobras

# ---------------------------------------------------------------------------
# SELECCIÓN DE MEJORES MANIOBRAS (criterio ATS)
# ---------------------------------------------------------------------------

def _seleccionar_mejores(maniobras, phase):
    """
    De las maniobras aceptables de una fase, selecciona las dos mejores
    por mayor FEV1 + FVC combinado (criterio ATS/ERS).
    Calcula reproducibilidad entre las dos mejores.
    """
    candidatas = [m for m in maniobras
                  if m['phase'] == phase and m['aceptable']]

    totales = len([m for m in maniobras if m['phase'] == phase])

    if not candidatas:
        return {
            'signal_keys_usadas':      [],
            'fvc':                     None,
            'fev1':                    None,
            'fev1_fvc_pct':            None,
            'reproducibilidad_fvc':    None,
            'reproducibilidad_fev1':   None,
            'reproducible':            False,
            'grado_sesion':            'U',
            'n_maniobras_aceptables':  0,
            'n_maniobras_totales':     totales,
            'advertencia':             'Sin maniobras aceptables en esta fase',
        }

    # Ordenar por FEV1 + FVC descendente
    def score(m):
        fev1 = m['parametros']['fev1'] or 0
        fvc  = m['parametros']['fvc']  or 0
        return fev1 + fvc

    candidatas_ord = sorted(candidatas, key=score, reverse=True)

    # El mayor FEV1 y la mayor FVC pueden ser de maniobras distintas (criterio ATS)
    mejor_fev1 = max((m['parametros']['fev1'] or 0) for m in candidatas)
    mejor_fvc  = max((m['parametros']['fvc']  or 0) for m in candidatas)

    # Para el ratio usamos la maniobra con mayor FEV1+FVC (misma maniobra)
    mejor = candidatas_ord[0]
    fev1_fvc_pct = mejor['parametros']['fev1_fvc_pct']

    # Reproducibilidad: diferencia entre las dos mejores
    reprod_fev1 = reprod_fvc = None
    reproducible = False
    if len(candidatas_ord) >= 2:
        segunda = candidatas_ord[1]
        reprod_fev1 = round(abs(
            (candidatas_ord[0]['parametros']['fev1'] or 0) -
            (segunda['parametros']['fev1'] or 0)
        ), 4)
        reprod_fvc = round(abs(
            (candidatas_ord[0]['parametros']['fvc'] or 0) -
            (segunda['parametros']['fvc'] or 0)
        ), 4)

        # Grado de sesión ATS basado en reproducibilidad FEV1
        max_diff = max(reprod_fev1, reprod_fvc)
        if max_diff < 0.100:
            grado_sesion = 'A'
        elif max_diff < 0.150:
            grado_sesion = 'B'
        elif max_diff < 0.200:
            grado_sesion = 'C'
        else:
            grado_sesion = 'D'

        reproducible = max_diff <= 0.150
    else:
        grado_sesion = 'C'  # Solo 1 maniobra aceptable → calidad limitada

    keys_usadas = [m['signal_key'] for m in candidatas_ord[:2]]

    return {
        'signal_keys_usadas':     keys_usadas,
        'fvc':                    round(mejor_fvc, 4),
        'fev1':                   round(mejor_fev1, 4),
        'fev1_fvc_pct':           fev1_fvc_pct,
        'reproducibilidad_fvc':   reprod_fvc,
        'reproducibilidad_fev1':  reprod_fev1,
        'reproducible':           reproducible,
        'grado_sesion':           grado_sesion,
        'n_maniobras_aceptables': len(candidatas),
        'n_maniobras_totales':    totales,
        'advertencia':            None,
    }


# ---------------------------------------------------------------------------
# HELPERS DE INTERPRETACIÓN
# ---------------------------------------------------------------------------

def _severidad_obstruccion(z_fev1):
    """
    Clasifica la severidad de la obstrucción a partir del Z-score
    de FEV1, según los umbrales ATS/ERS 2019 (GLI-2012).

    Umbrales:
        Z ≥ -1.645           → leve   (FEV1 dentro del LIN)
        -2.5  ≤ Z < -1.645   → leve
        -4.0  ≤ Z < -2.5     → moderada
              Z < -4.0       → grave
    """
    if z_fev1 is None:
        return 'no_evaluable'
    if z_fev1 >= -1.645:
        return 'leve'
    if z_fev1 >= -2.500:
        return 'leve'
    if z_fev1 >= -4.000:
        return 'moderada'
    return 'grave'


def _patron_funcional(z_ratio, z_fvc):
    """
    Determina el patrón espirométrico a partir de los Z-scores,
    diferenciando los cuatro patrones posibles según ATS/ERS 2019.

    Patrones:
        normal           → ratio y FVC dentro del LIN
        obstructivo      → ratio < LIN, FVC dentro del LIN
        fvc_reducida     → ratio dentro del LIN, FVC < LIN
                           (sugestivo de restricción; requiere CPT para confirmar)
        mixto            → ratio < LIN Y FVC < LIN

    Parámetros
    ----------
    z_ratio : float | None  — Z-score de FEV1/FVC
    z_fvc   : float | None  — Z-score de FVC

    Devuelve
    --------
    tuple (patron: str, obstruccion: bool, fvc_baja: bool)
    """
    LIN = -1.645

    obstruccion = (z_ratio is not None) and (z_ratio < LIN)
    fvc_baja    = (z_fvc   is not None) and (z_fvc   < LIN)

    if obstruccion and fvc_baja:
        patron = 'mixto'
    elif obstruccion:
        patron = 'obstructivo'
    elif fvc_baja:
        patron = 'fvc_reducida'
    else:
        patron = 'normal'

    return patron, obstruccion, fvc_baja

# ---------------------------------------------------------------------------
# INTERPRETACIÓN CLÍNICA (ATS/ERS 2019 / 2022)
# ---------------------------------------------------------------------------

def _interpretar(seleccion, maniobras):
    """
    Aplica los criterios ATS/ERS para determinar:
      - Patrón funcional PRE (con severidad y cuatro patrones diferenciados)
      - Patrón funcional POST (evaluación independiente tras broncodilatador)
      - Respuesta broncodilatadora (criterios 2022)
      - Grado de sesión propagado a la conclusión clínica
    """
    advertencias = []
    pre  = seleccion.get('pre', {})
    post = seleccion.get('post', {})

    # ---- Referencia (primera maniobra pre aceptable) ----------------------
    ref_fvc = ref_fev1 = ref_ratio = z_ratio = z_fev1 = z_fvc = None
    for m in maniobras:
        if m['phase'] == 'pre' and m['aceptable']:
            ref_fvc   = m['referencias']['ref_fvc']
            ref_fev1  = m['referencias']['ref_fev1']
            ref_ratio = m['referencias']['ref_fev1_fvc']
            z_ratio   = m['referencias']['z_fev1_fvc']
            z_fev1    = m['referencias']['z_fev1']
            z_fvc     = m['referencias']['z_fvc']
            break

    fev1_pre  = pre.get('fev1')
    fvc_pre   = pre.get('fvc')
    ratio_pre = pre.get('fev1_fvc_pct')

    # ---- Patrón PRE -------------------------------------------------------
    # [FIX 1 + FIX 2 + FIX 3 + FIX 4]
    # Se delega en _patron_funcional() para corregir el bug de la rama mixto
    # inalcanzable y distinguir los cuatro patrones correctamente.
    # Se añade severidad de obstrucción y precisión terminológica en restricción.

    if fev1_pre is not None and fvc_pre is not None and ratio_pre is not None:
        patron, obstruccion, fvc_baja = _patron_funcional(z_ratio, z_fvc)
    else:
        patron, obstruccion, fvc_baja = 'no_evaluable', False, False

    # [FIX 1] Severidad de la obstrucción por Z-score de FEV1
    severidad = _severidad_obstruccion(z_fev1) if obstruccion else None

    # Descripción clínica ajustada al patrón
    # [FIX 3] 'fvc_reducida' en lugar de 'restrictivo': la restricción no
    #          puede confirmarse con espirometría sola; requiere CPT.
    descripciones = {
        'normal':       'FEV1/FVC y FVC dentro del límite inferior de la normalidad.',
        'obstructivo':  'FEV1/FVC por debajo del LIN (Z < −1.645). '
                        f'Severidad: {severidad}.',
        # [FIX 4] Cuarto patrón: ratio normal con FVC reducida sin obstrucción.
        #          Puede ser restricción, atrapamiento aéreo o esfuerzo subóptimo.
        'fvc_reducida': 'FVC por debajo del LIN con ratio conservado. '
                        'Sugestivo de restricción; se recomienda pletismografía '
                        '(CPT) para confirmación.',
        'mixto':        'FEV1/FVC y FVC por debajo del LIN. Patrón mixto '
                        '(obstructivo + FVC reducida). Considerar CPT para '
                        'descartar hiperinsuflación.',
        'no_evaluable': 'Datos insuficientes para interpretación.',
    }
    descripcion = descripciones.get(patron, 'Patrón no clasificable.')

    # Advertencia de reproducibilidad PRE
    if pre.get('reproducible') is False and pre.get('n_maniobras_aceptables', 0) >= 2:
        df_fev1 = pre.get('reproducibilidad_fev1', 0)
        df_fvc  = pre.get('reproducibilidad_fvc', 0)
        advertencias.append(
            f"Reproducibilidad PRE no cumple criterio ATS "
            f"(ΔFEV1: {df_fev1:.3f} L, ΔFVC: {df_fvc:.3f} L). "
            f"Interpretar con cautela."
        )

    # [FIX 6] Grado de sesión PRE propagado al bloque de interpretación
    grado_sesion_pre = pre.get('grado_sesion', 'U')
    if grado_sesion_pre in ('C', 'D', 'U'):
        advertencias.append(
            f"Calidad de sesión PRE: grado {grado_sesion_pre}. "
            f"La interpretación puede verse afectada por la baja reproducibilidad "
            f"o el escaso número de maniobras aceptables."
        )

    patron_pre = {
        'diagnostico':       patron,
        'obstruccion':       obstruccion,
        'fvc_baja':          fvc_baja,        # renombrado: antes 'restriccion'
        'severidad_obs':     severidad,        # [NUEVO] leve/moderada/grave o None
        'ref_fvc':           ref_fvc,
        'ref_fev1':          ref_fev1,
        'ref_fev1_fvc':      ref_ratio,
        'z_fev1':            z_fev1,
        'z_fvc':             z_fvc,
        'z_fev1_fvc':        z_ratio,
        'descripcion':       descripcion,
        'grado_sesion':      grado_sesion_pre, # [NUEVO] propagado desde seleccion
    }

    # ---- Patrón POST (evaluación independiente) ---------------------------
    # [FIX 5] La versión anterior no evaluaba el patrón funcional tras el
    #          broncodilatador. Ahora se evalúa igual que el PRE para detectar
    #          cambios de patrón (p.ej.: obstructivo → normal tras BD).
    patron_post = None
    if post.get('fev1') is not None:
        # Z-scores POST: tomamos de la primera maniobra post aceptable
        z_ratio_post = z_fvc_post = z_fev1_post = None
        ref_fev1_post = ref_fvc_post = ref_ratio_post = None
        for m in maniobras:
            if m['phase'] == 'post' and m['aceptable']:
                z_ratio_post   = m['referencias']['z_fev1_fvc']
                z_fvc_post     = m['referencias']['z_fvc']
                z_fev1_post    = m['referencias']['z_fev1']
                ref_fev1_post  = m['referencias']['ref_fev1']
                ref_fvc_post   = m['referencias']['ref_fvc']
                ref_ratio_post = m['referencias']['ref_fev1_fvc']
                break

        patron_p, obstr_p, fvcb_p = _patron_funcional(z_ratio_post, z_fvc_post)
        severidad_p = _severidad_obstruccion(z_fev1_post) if obstr_p else None

        descripcion_p = descripciones.get(patron_p, 'Patrón no clasificable.')
        if patron_p == 'obstructivo':
            descripcion_p = (
                'FEV1/FVC por debajo del LIN (Z < −1.645) tras broncodilatador. '
                f'Severidad: {severidad_p}.'
            )

        grado_sesion_post = post.get('grado_sesion', 'U')
        if grado_sesion_post in ('C', 'D', 'U'):
            advertencias.append(
                f"Calidad de sesión POST: grado {grado_sesion_post}. "
                f"Interpretar la respuesta broncodilatadora con cautela."
            )

        patron_post = {
            'diagnostico':   patron_p,
            'obstruccion':   obstr_p,
            'fvc_baja':      fvcb_p,
            'severidad_obs': severidad_p,
            'ref_fvc':       ref_fvc_post,
            'ref_fev1':      ref_fev1_post,
            'ref_fev1_fvc':  ref_ratio_post,
            'z_fev1':        z_fev1_post,
            'z_fvc':         z_fvc_post,
            'z_fev1_fvc':    z_ratio_post,
            'descripcion':   descripcion_p,
            'grado_sesion':  grado_sesion_post,
        }

    # ---- Respuesta broncodilatadora (ATS/ERS 2022) ------------------------
    resp_bd = None
    if post.get('fev1') is not None and fev1_pre is not None:
        fev1_post = post['fev1']
        fvc_post  = post.get('fvc')

        delta_fev1_abs = round(fev1_post - fev1_pre, 4)
        delta_fvc_abs  = round((fvc_post - fvc_pre), 4) if fvc_post and fvc_pre else None

        # % sobre el valor de referencia teórico (criterio 2022, NO sobre el basal)
        delta_fev1_pct_ref = round(
            100 * delta_fev1_abs / ref_fev1, 2
        ) if ref_fev1 else None

        delta_fvc_pct_ref = round(
            100 * delta_fvc_abs / ref_fvc, 2
        ) if (delta_fvc_abs is not None and ref_fvc) else None

        # Criterio positivo: ≥ 0.10 L Y ≥ 10% del teórico
        crit_fev1 = (
            delta_fev1_abs >= 0.10 and
            delta_fev1_pct_ref is not None and
            delta_fev1_pct_ref >= 10.0
        )
        crit_fvc = (
            delta_fvc_abs is not None and
            delta_fvc_abs >= 0.10 and
            delta_fvc_pct_ref is not None and
            delta_fvc_pct_ref >= 10.0
        )

        positiva = crit_fev1 or crit_fvc

        if crit_fev1 and crit_fvc:
            tipo = 'fev1_y_fvc'
        elif crit_fev1:
            tipo = 'solo_fev1'
        elif crit_fvc:
            tipo = 'solo_fvc'
        else:
            tipo = 'ninguno'

        # Advertencia de reproducibilidad POST
        if post.get('reproducible') is False and post.get('n_maniobras_aceptables', 0) >= 2:
            df_fev1_post = post.get('reproducibilidad_fev1', 0)
            df_fvc_post  = post.get('reproducibilidad_fvc', 0)
            advertencias.append(
                f"Reproducibilidad POST no cumple criterio ATS "
                f"(ΔFEV1: {df_fev1_post:.3f} L, ΔFVC: {df_fvc_post:.3f} L). "
                f"Interpretar respuesta broncodilatadora con cautela."
            )

        # Detectar valores MMEF fisiológicamente inverosímiles en POST
        mmef_post_vals = [
            m['parametros']['mmef']
            for m in maniobras
            if m['phase'] == 'post' and m['aceptable'] and m['parametros']['mmef']
        ]
        mmef_ref = next(
            (m['referencias']['ref_mmef']
             for m in maniobras if m['phase'] == 'pre' and m['referencias'].get('ref_mmef')),
            None
        )
        if mmef_ref and mmef_post_vals:
            for val in mmef_post_vals:
                if val > mmef_ref * 3:
                    advertencias.append(
                        f"MMEF POST ({val:.2f} L/s) excede 3× el valor de referencia "
                        f"({mmef_ref:.2f} L/s). Posible artefacto en esa maniobra."
                    )
                    break

        resp_bd = {
            'positiva':               positiva,
            'delta_fev1_abs':         delta_fev1_abs,
            'delta_fev1_pct_ref':     delta_fev1_pct_ref,
            'delta_fvc_abs':          delta_fvc_abs,
            'delta_fvc_pct_ref':      delta_fvc_pct_ref,
            'criterio_fev1_cumple':   crit_fev1,
            'criterio_fvc_cumple':    crit_fvc,
            'tipo':                   tipo,
        }

    # ---- Conclusión textual -----------------------------------------------
    # [FIX 6] Se incluye el grado de sesión y la severidad en la conclusión.
    partes = []

    # Calidad de la sesión PRE
    if grado_sesion_pre not in ('U',):
        partes.append(f"[Grado de sesión PRE: {grado_sesion_pre}]")

    # Patrón basal
    if patron == 'normal':
        partes.append("Espirometría basal normal.")
    elif patron == 'obstructivo':
        partes.append(
            f"Patrón obstructivo {severidad} en la espirometría basal "
            f"(FEV1/FVC Z={z_ratio}, FEV1 Z={z_fev1})."
        )
    elif patron == 'fvc_reducida':
        # [FIX 3] Terminología corregida: no se llama 'restrictivo'
        partes.append(
            "FVC reducida con ratio conservado en la espirometría basal. "
            "Patrón sugestivo de restricción; se recomienda CPT para confirmación."
        )
    elif patron == 'mixto':
        partes.append(
            f"Patrón mixto (obstructivo {severidad} + FVC reducida) "
            "en la espirometría basal."
        )

    # [FIX 5] Patrón POST
    if patron_post:
        if patron_post['diagnostico'] != patron:
            partes.append(
                f"Tras broncodilatador el patrón cambia a: "
                f"{patron_post['diagnostico'].replace('_', ' ')}."
            )
        else:
            partes.append(
                f"El patrón {patron_post['diagnostico'].replace('_', ' ')} "
                f"se mantiene tras broncodilatador."
            )

    # Respuesta broncodilatadora
    if resp_bd:
        if resp_bd['positiva']:
            partes.append(
                f"Respuesta broncodilatadora positiva "
                f"(ΔFEV1 {resp_bd['delta_fev1_abs']:+.3f} L, "
                f"{resp_bd['delta_fev1_pct_ref']:+.1f}% del teórico). "
                f"Compatible con componente broncoespástico significativo."
            )
        else:
            partes.append("Sin respuesta broncodilatadora significativa.")

    conclusion = ' '.join(partes) if partes else 'Interpretación no disponible.'

    return {
        'patron_pre':                 patron_pre,
        'patron_post':                patron_post,     # [NUEVO]
        'respuesta_broncodilatadora': resp_bd,
        'conclusion':                 conclusion,
        'advertencias':               advertencias,
    }


# ---------------------------------------------------------------------------
# FUNCIÓN PRINCIPAL
# ---------------------------------------------------------------------------

def analizar_espirometria(xml_string: str) -> dict:
    """
    Parsea el XML de una sesión de espirometría, evalúa la aceptabilidad
    de cada maniobra con el modelo, selecciona las mejores por fase y
    genera la interpretación clínica según criterios ATS/ERS.

    Parámetros
    ----------
    xml_string : str
        Contenido del fichero XML como cadena de texto.

    Devuelve
    --------
    dict
        Estructura JSON-serializable con claves:
        paciente, sesion, maniobras, seleccion, interpretacion.
    """
    try:
        root = ET.fromstring(xml_string)
    except ET.ParseError as e:
        raise ValueError(f"XML no válido: {e}")

    # 1. Datos estáticos
    paciente = _parsear_paciente(root)
    sesion   = _parsear_sesion(root)

    # 2. Señales individuales
    signals   = _parsear_signal_blocks(root)
    maniobras = _construir_maniobras(signals)

    # 3. Selección de mejores por fase
    seleccion = {
        'pre':  _seleccionar_mejores(maniobras, 'pre'),
        'post': _seleccionar_mejores(maniobras, 'post'),
    }

    # 4. Interpretación clínica
    interpretacion = _interpretar(seleccion, maniobras)

    return {
        'paciente':       paciente,
        'sesion':         sesion,
        'maniobras':      maniobras,
        'seleccion':      seleccion,
        'interpretacion': interpretacion,
    }