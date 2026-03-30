# EJECUCIÓN DEL MODELO PARA PREDICCION DE CURVAS

# modelo_predictor.py

import os
import sys
import numpy as np
import joblib
from tensorflow.keras.models import load_model

from procesado_dash import (
    matrix_from_volume_flow_preprocessed,
    matrix_from_time_volume_preprocessed,
    generar_features_desde_spxraw
)

pxl = 32

TABULAR_COLS = [
    "exhalation_time",
    "total_duration",
    "has_plateau",
    "SPXPTS",
    "Vext",
    "time_to_peak_flow",
    "has_valid_peak"
]

LABEL_MAP = {0: "A", 1: "B", 2: "C", 3: "D"}


# ====================================================
#   RUTA BASE — funciona tanto en .py como en .exe
# ====================================================
if getattr(sys, 'frozen', False):
    BASE_DIR = sys._MEIPASS
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def load_scaler_and_model(
        model_name="final_model_multiclase_ajustado.keras",
        scaler_name="scaler_tabular.save"):
    """
    Carga el scaler y el modelo usando rutas relativas al directorio actual.
    """
    scaler_path = os.path.join(BASE_DIR, scaler_name)
    model_path = os.path.join(BASE_DIR, model_name)

    if not os.path.exists(scaler_path):
        raise FileNotFoundError(f"No se encuentra el scaler: {scaler_path}")

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"No se encuentra el modelo .keras: {model_path}")

    scaler = joblib.load(scaler_path)
    model = load_model(model_path)
   
    return scaler, model

SCALER, MODEL = load_scaler_and_model()


# ====================================================
#   GENERACIÓN DE MATRICES Y FEATURES
# ====================================================

def generar_inputs_modelo(spxraw_mls, dt):
    # --- Matriz canal 1: Flow-Volume ---
    m1 = matrix_from_volume_flow_preprocessed(spxraw_mls, dt=dt)
    if m1 is None:
        return None

    # --- Matriz canal 2: Time-Volume ---
    m2 = matrix_from_time_volume_preprocessed(spxraw_mls, dt=dt)
    if m2 is None:
        return None

    # Añadir canal
    m1 = m1.reshape(pxl, pxl, 1)
    m2 = m2.reshape(pxl, pxl, 1)
    X_img = np.concatenate([m1, m2], axis=-1)  # (32,32,2)

    # --- Features tabulares ---
    feats = generar_features_desde_spxraw(spxraw_mls, dt=dt)
    if feats is None:
        return None

    tab_vals = np.array([feats[col] for col in TABULAR_COLS], dtype=np.float32)
    tab_scaled = SCALER.transform([tab_vals])[0]

    return X_img, tab_scaled


# ====================================================
#   PREDICCIÓN + MOTIVO
# ====================================================


def _motivo_desde_etiqueta(label):
    """
    Traductor de etiqueta → motivo clínico.
    """
    if label == "A":
        return ""  # sin motivo, aceptable
    elif label == "B":
        return "pico no válido/no reproducible"
    elif label == "C":
        return "poca duración/no meseta"
    elif label == "D":
        return "Vext alto/tos/otros artefactos"
    else:
        return "motivo desconocido"


def predecir_aceptabilidad(spxraw_mls, dt):
    """
    Entrada:
        - spxraw_mls: lista mL/s
        - dt: paso temporal
    Salida:
        - etiqueta A/B/C/D
        - probas
        - motivo (según tabla)
    """
    inp = generar_inputs_modelo(spxraw_mls, dt)
    if inp is None:
        return None, None, "No se puede preprocesar la señal"

    X_img, X_tab = inp
    X_img = np.expand_dims(X_img, axis=0)
    X_tab = np.expand_dims(X_tab, axis=0)

    probas = MODEL.predict([X_img, X_tab], verbose=0)[0]
    pred_class = int(np.argmax(probas))
    label = LABEL_MAP[pred_class]

    motivo = _motivo_desde_etiqueta(label)

    return label, probas, motivo
