# PROCESADO Y GENERACION INPUT DEL MODELO

# matrices_preproc.py
# Funciones para generar matrices pxl x pxl (float32, 1=blanco, 0=negro)
# a partir de señal cruda de flujo (spxraw en mL/s) aplicando
# el mismo preprocesado robusto (inicio = k muestras consecutivas > threshold)
# que usas en el dashboard.
#
# Cada función devuelve:
#   - np.ndarray shape (pxl, pxl) dtype float32 con 1.0 fondo blanco y 0.0 la curva
#   - o None si la señal no es válida / no cumple condiciones.

# matrices_preproc.py
# Procesado de imágenes IDENTICO al usado en entrenamiento.


import numpy as np


# ================================================================
# =                    VOLUME – FLOW IMAGE                      =
# ================================================================
def matrix_from_volume_flow_preprocessed(
        spxraw_mls,
        pxl=32,
        dt=0.01,
        V_start_threshold_l=0.02,      # igual que entrenamiento
        min_length_after_start=5,
        invert_y=True
):
    """
    Genera matriz pxl x pxl de la curva Volumen–Flujo aplicando
    EXACTAMENTE el mismo preprocesado que se usó para el dataset de entrenamiento:

    1. Inicio = primer punto donde volumen acum. > V_start_threshold_l
    2. Fin = último punto con flujo >= 0 (se eliminan negativos solo al final)
    3. Recorte [start_idx : last_valid_idx]
    4. Escalado lineal a píxeles

    Devuelve matriz float32 (1 = blanco, 0 = curva) o None si señal inválida.
    """

    spxraw = np.asarray(spxraw_mls)
    if spxraw.size < 10:
        return None

    # Convertir a L/s
    flow_l = spxraw / 1000.0

    # Calcular volumen acumulado
    volume = np.cumsum(flow_l * dt)

    # -----------------------------
    # Detectar inicio por volumen
    # -----------------------------
    start_idx = 0
    for i in range(1, len(volume)):
        if (volume[i] - volume[0]) > V_start_threshold_l:
            start_idx = i
            break

    # -----------------------------
    # Eliminar trailing negativos
    # -----------------------------
    last_valid_idx = len(flow_l)
    for i in range(len(flow_l) - 1, -1, -1):
        if flow_l[i] >= 0:
            last_valid_idx = i + 1
            break

    if last_valid_idx - start_idx < min_length_after_start:
        return None

    # Recortar señal
    volume_seg = volume[start_idx:last_valid_idx]
    flow_seg = flow_l[start_idx:last_valid_idx]

    if len(volume_seg) < min_length_after_start:
        return None

    # -----------------------------
    # Escalado lineal a píxeles
    # -----------------------------
    vol_min = np.min(volume_seg)
    vol_max = np.max(volume_seg)
    flow_min = np.min(flow_seg)
    flow_max = np.max(flow_seg)

    vol_range = vol_max - vol_min
    flow_range = flow_max - flow_min

    if vol_range == 0 or flow_range == 0:
        return None

    I_pxl = np.round(((pxl - 1) / vol_range) * (volume_seg - vol_min)).astype(int)
    J_pxl = np.round(((pxl - 1) / flow_range) * (flow_seg - flow_min)).astype(int)

    if invert_y:
        J_pxl = (pxl - 1) - J_pxl

    valid = (I_pxl >= 0) & (I_pxl < pxl) & (J_pxl >= 0) & (J_pxl < pxl)
    I_pxl = I_pxl[valid]
    J_pxl = J_pxl[valid]

    mat = np.ones((pxl, pxl), dtype=np.float32)
    mat[J_pxl, I_pxl] = 0.0

    return mat



# ================================================================
# =                     TIME – VOLUME IMAGE                     =
# ================================================================
def matrix_from_time_volume_preprocessed(
        spxraw_mls,
        pxl=32,
        dt=0.01,
        V_start_threshold_l=0.02,
        min_length_after_start=5,
        invert_y=True
):
    """
    Genera matriz pxl x pxl de la curva Tiempo–Volumen aplicando
    EXACTAMENTE el preprocesado del dataset de entrenamiento.

    (idéntico a la función generar_imagen_from_raw_time_volume
    usada para crear tus imágenes reales/NHANES)
    """

    spxraw = np.asarray(spxraw_mls)
    if spxraw.size < 10:
        return None

    flow_l = spxraw / 1000.0
    time = np.arange(0, len(spxraw)) * dt
    volume = np.cumsum(flow_l * dt)

    # Detectar inicio por volumen
    start_idx = 0
    for i in range(1, len(volume)):
        if (volume[i] - volume[0]) > V_start_threshold_l:
            start_idx = i
            break

    # Eliminar trailing negativos
    last_valid_idx = len(flow_l)
    for i in range(len(flow_l) - 1, -1, -1):
        if flow_l[i] >= 0:
            last_valid_idx = i + 1
            break

    if last_valid_idx - start_idx < min_length_after_start:
        return None

    # Recortar secciones
    time_seg = time[start_idx:last_valid_idx] - time[start_idx]
    volume_seg = volume[start_idx:last_valid_idx]

    if len(time_seg) < min_length_after_start:
        return None

    # Escalado lineal
    time_min = np.min(time_seg)
    time_max = np.max(time_seg)
    vol_min = np.min(volume_seg)
    vol_max = np.max(volume_seg)

    time_range = time_max - time_min
    vol_range = vol_max - vol_min

    if time_range == 0 or vol_range == 0:
        return None

    I_pxl = np.round(((pxl - 1) / time_range) * (time_seg - time_min)).astype(int)
    J_pxl = np.round(((pxl - 1) / vol_range) * (volume_seg - vol_min)).astype(int)

    if invert_y:
        J_pxl = (pxl - 1) - J_pxl

    valid = (I_pxl >= 0) & (I_pxl < pxl) & (J_pxl >= 0) & (J_pxl < pxl)
    I_pxl = I_pxl[valid]
    J_pxl = J_pxl[valid]

    mat = np.ones((pxl, pxl), dtype=np.float32)
    mat[J_pxl, I_pxl] = 0.0

    return mat



# Preprocesado tabular IDENTICO al usado en entrenamiento (CSV NHANES / datos reales)

import numpy as np
from scipy.signal import find_peaks


# ----------------------------------------------------------------------
# 1) PREPROCESADO EXACTO USADO EN ENTRENAMIENTO
# ----------------------------------------------------------------------

def procesar_senal_equivalente_nhanes(spxraw, dt=0.01, V_start_threshold_l=0.02):
    """
    Aplica el mismo preprocesado que usaste para generar el CSV
    de entrenamiento (NHANES/real).

    Devuelve (time_seg, flow_seg, volume_seg) o None si la señal es inválida.
    """
    flow_l = np.array(spxraw) / 1000.0  # L/s
    volume = np.cumsum(flow_l * dt)
    time = np.arange(0, len(flow_l)) * dt

    # --- 1) Detectar INICIO por volumen ---
    start_idx = 0
    for i in range(1, len(volume)):
        if (volume[i] - volume[0]) > V_start_threshold_l:
            start_idx = i
            break

    # --- 2) Detectar FIN eliminando flujo negativo al final ---
    last_valid_idx = len(flow_l)
    for i in range(len(flow_l) - 1, -1, -1):
        if flow_l[i] >= 0:
            last_valid_idx = i + 1
            break

    # señal mínima
    if last_valid_idx - start_idx < 5:
        return None

    # --- 3) Recorte definitivo ---
    time_seg = time[start_idx:last_valid_idx] - time[start_idx]
    flow_seg = flow_l[start_idx:last_valid_idx]
    volume_seg = volume[start_idx:last_valid_idx]

    return time_seg, flow_seg, volume_seg



# ----------------------------------------------------------------------
# 2) CÁLCULO DE FEATURES TABULARES EXACTAS (MISMOS UMBRALES)
# ----------------------------------------------------------------------

def calcular_features_tabulares(time, flow, volume, dt=0.01):
    """
    Calcula las variables EXACTAS usadas en el CSV de entrenamiento.
    """

    SPXPTS = len(flow)

    # ------------------------------
    # Fin de exhalación
    # ------------------------------
    FLOW_END_THRESHOLD = 0.025
    DURATION_BELOW_THRESHOLD = 1.0
    WINDOW_END = int(DURATION_BELOW_THRESHOLD / dt)

    end_idx = len(flow) - 1
    for i in range(len(flow) - WINDOW_END, 0, -1):
        window = flow[i:i + WINDOW_END]
        if len(window) < WINDOW_END:
            continue
        below_thresh = np.sum(np.abs(window) < FLOW_END_THRESHOLD) / len(window)
        if below_thresh >= 0.9:
            end_idx = i + WINDOW_END - 1
            break

    exhalation_time = float(time[end_idx] - time[0])
    total_duration = float(time[-1] - time[0])

    # ------------------------------
    # Vext
    # ------------------------------
    N = 5
    if N <= len(volume):
        t_fit = time[:N] - time[0]
        v_fit = volume[:N]
        slope, intercept = np.polyfit(t_fit, v_fit, 1)
        Vext = float(abs(intercept))
    else:
        Vext = None

    # ------------------------------
    # Pico de flujo válido
    # ------------------------------
    peaks, _ = find_peaks(flow)
    has_valid_peak = 0
    if len(peaks) > 0:
        max_peak_idx = peaks[np.argmax(flow[peaks])]
        max_peak_height = flow[max_peak_idx]
        has_valid_peak = int(max_peak_height >= 0.01)

    # ------------------------------
    # time_to_peak_flow
    # ------------------------------
    time_to_peak_flow = float(time[np.argmax(flow)] - time[0])

    # ------------------------------
    # Meseta
    # ------------------------------
    cond_plateau = False
    umbral_vol = 0.025
    duracion_meseta = 1.0

    max_flow_idx = np.argmax(flow)
    for i in range(max_flow_idx, len(time)):
        end_i = i
        while end_i < len(time) and (time[end_i] - time[i]) < duracion_meseta:
            end_i += 1
        if end_i == len(time):
            break
        vol_change = abs(volume[end_i - 1] - volume[i])
        if vol_change < umbral_vol:
            cond_plateau = True
            break

    has_plateau = int(cond_plateau)

    return {
        "exhalation_time": round(exhalation_time, 2),
        "total_duration": round(total_duration, 2),
        "has_plateau": has_plateau,
        "SPXPTS": SPXPTS,
        "Vext": None if Vext is None else round(Vext, 4),
        "time_to_peak_flow": round(time_to_peak_flow, 2),
        "has_valid_peak": has_valid_peak
    }



# ----------------------------------------------------------------------
# 3) FUNCIÓN FINAL PARA EL DASHBOARD
# ----------------------------------------------------------------------

def generar_features_desde_spxraw(spxraw_mls, dt=0.01):
    """
    Wrapper final:
    Produce exactamente las MISMAS features que tu CSV de entrenamiento.
    """
    procesado = procesar_senal_equivalente_nhanes(spxraw_mls, dt=dt)

    if procesado is None:
        return None

    time, flow, volume = procesado
    return calcular_features_tabulares(time, flow, volume, dt=dt)