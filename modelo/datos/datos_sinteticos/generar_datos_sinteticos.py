"""
Genera estudios sintéticos de espirometría con la misma estructura que los XML reales de Medikro (datos/datos).

Cada estudio parte de un XML real (la "plantilla"): se copia su estructura y su paciente, y se crean maniobras
nuevas a partir de las señales de flujo reales aplicando transformaciones (escalar, obstruir, recortar, inicio
lento, tos, pico romo y un poco de ruido). Después se recalculan los parámetros de cada maniobra a partir de la
señal nueva con los criterios de la ATS/ERS (retroextrapolación, FEV1 a 1 s...) y los valores teóricos y
z-scores con las ecuaciones GLI-2012, así que cada fichero es coherente consigo mismo.

Salida:
  estudios/          estudios para cargar en la aplicación (varios por paciente y todo tipo de sesiones)
  casos_especiales/  ficheros para probar flujos y errores (DNI mal escrito, sin DNI, XML roto...)

Uso:  python generar_datos_sinteticos.py      (necesita numpy y pyspiro:  pip install pyspiro)
"""

import math
import uuid
import zlib
import copy
import datetime as dt
from dataclasses import dataclass, field
from pathlib import Path
from xml.etree import ElementTree as ET

import numpy as np
from pyspiro import GLI_2012

AQUI = Path(__file__).parent
DATOS_REALES = AQUI.parent / "datos"
DT = 0.01  # las señales se registran a 100 Hz

DOCTYPE = ('<!DOCTYPE SpiroXML2 [<!ELEMENT SpiroXML2 (E)*><!ELEMENT E (E)*>'
           '<!ATTLIST E T CDATA #REQUIRED N CDATA #IMPLIED V CDATA #IMPLIED >]>')


# =====================================================================================================
# Valores teóricos GLI-2012
# =====================================================================================================

GLI = GLI_2012()
# Parámetro del XML -> parámetro de GLI-2012 (MEF25 es el flujo con el 75 % de la FVC espirada: FEF75 en GLI)
PARAMETROS_GLI = {
    "FEVC": GLI_2012.Parameters.FVC,
    "FEV1": GLI_2012.Parameters.FEV1,
    "FEV1FEVC_PER": GLI_2012.Parameters.FEV1FVC,
    "MEF25": GLI_2012.Parameters.FEF75,
    "MMEF": GLI_2012.Parameters.FEF25_75,
}
# Modelo de predicción de Medikro -> etnia (comprobado con los XML reales, ver analizador_espirometria.py)
REFSET_ETNIA = {"20123": "caucasian", "201215": "other"}


def lms(sexo, edad, altura, etnia, parametro):
    """Triplete (L, M, S) de GLI-2012. M es el valor teórico."""
    if etnia == "caucasian":
        return GLI.lms(sexo, edad, altura, GLI_2012.Ethnicity.CAUCASIAN.value, parametro.value, 0)
    # Otro/mixto: GLI usa la media de los coeficientes étnicos (cada indicador vale 0,25)
    a = round(edad * 4) / 4
    s_spline, m_spline, l_spline = GLI._get_splines(sexo, a, parametro.value)
    c = GLI._coefficients["%s_%ss" % (parametro.name, GLI.Sex(sexo).name.lower())]
    l = c.loc["q0"] + c.loc["q1"] * math.log(a) + l_spline
    m = math.exp(c.loc["a0"] + c.loc["a1"] * math.log(altura) + c.loc["a2"] * math.log(a)
                 + 0.25 * (c.loc["a3"] + c.loc["a4"] + c.loc["a5"]) + m_spline)
    s = math.exp(c.loc["p0"] + c.loc["p1"] * math.log(a)
                 + 0.25 * (c.loc["p2"] + c.loc["p3"] + c.loc["p4"]) + s_spline)
    return l, m, s


def teorico_y_z(nombre, valor, sexo, edad, altura, etnia):
    """Valor teórico (Ref), relativo (Rel) y z-score de un parámetro."""
    l, m, s = lms(sexo, edad, altura, etnia, PARAMETROS_GLI[nombre])
    if nombre == "FEV1FEVC_PER":           # en el XML el cociente va en %, en GLI en tanto por uno
        m = m * 100
    # Fórmula LMS del z-score. En una maniobra muy recortada el flujo puede quedar en 0: se acota para poder calcularlo.
    z = ((max(valor, 1e-3) / m) ** l - 1) / (l * s)
    return m, valor / m, z


# =====================================================================================================
# Parámetros de una maniobra a partir de su señal de flujo
# =====================================================================================================

def inicio_espiracion(f):
    """Índice donde empieza la espiración forzada: último cruce por cero antes del pico de flujo."""
    s = int(np.argmax(f))
    while s > 0 and f[s - 1] > 0:
        s -= 1
    return s


def calcular_parametros(flujo_mls):
    """
    Parámetros de la maniobra con los criterios de la ATS/ERS:
    - PEF: flujo máximo de la señal suavizada 60 ms (así coincide con el PEF de Medikro).
    - Tiempo cero por retroextrapolación de la tangente en el PEF; Vext es el volumen espirado antes de él.
    - FEVx: volumen espirado a los x segundos del tiempo cero.
    """
    f = np.asarray(flujo_mls, float) / 1000.0                       # L/s
    f_suave = np.convolve(f, np.ones(6) / 6, mode="same")
    p = int(np.argmax(f_suave))
    pef = float(f_suave[p])
    s = inicio_espiracion(f)
    v = np.concatenate([[0.0], np.cumsum(f[s:] * DT)])               # volumen espirado desde el inicio
    t = np.arange(len(v)) * DT
    tp = (p - s + 0.5) * DT
    t0 = tp - np.interp(tp, t, v) / pef                              # tiempo cero retroextrapolado
    fvc = float(v.max())
    v_mono = np.maximum.accumulate(v)

    def fev(segundos):
        return float(np.interp(t0 + segundos, t, v))

    def flujo_con_espirado(fraccion):                                # flujo cuando se ha espirado esa fracción de la FVC
        i = int(np.searchsorted(v_mono, fraccion * fvc))
        return float(f_suave[min(s + max(i - 1, 0), len(f_suave) - 1)])

    t25, t75 = np.interp(0.25 * fvc, v_mono, t), np.interp(0.75 * fvc, v_mono, t)
    fin = s + int(np.nonzero(f[s:] >= 0.025)[0][-1]) if np.any(f[s:] >= 0.025) else s
    r = {
        "FEVC": fvc, "PEF": pef, "PEFLPM": pef * 60, "PEFT": (tp - t0) * 1000,
        "VEXT": max(float(np.interp(t0, t, v)), 0.0), "FET": (fin - s) * DT - t0,
        "MEF75": flujo_con_espirado(0.25), "MEF50": flujo_con_espirado(0.50), "MEF25": flujo_con_espirado(0.75),
        "MMEF": 0.5 * fvc / (t75 - t25),
    }
    for x in ("0.25", "0.5", "0.75", "1", "2", "3", "4", "5", "6"):
        r[f"FEV{x}"] = fev(float(x))
    for x in ("0.25", "0.5", "0.75", "1", "2", "3", "4", "5"):
        r[f"FEV{x}FEVC_PER"] = r[f"FEV{x}"] / fvc * 100
        r[f"FEV{x}FEV6_PER"] = r[f"FEV{x}"] / r["FEV6"] * 100
    r["FEV1/PEF"] = r["FEV1"] * 1000 / r["PEFLPM"]
    r["VEXTFEVC_PER"] = r["VEXT"] / fvc * 100
    return r


# =====================================================================================================
# Transformaciones de la señal (flujo en mL/s). Cada una devuelve una función f(señal, rng) -> señal nueva.
# =====================================================================================================

def escalar(k):
    """Multiplica el flujo: cambia el tamaño pulmonar (k > 1 mejora, k < 1 empeora). FEV1/FVC no cambia."""
    return lambda f, rng: f * k


def obstruir(factor):
    """Alarga la parte descendente de la curva conservando el volumen: baja el FEV1 y el FEV1/FVC (obstrucción)."""
    def aplicar(f, rng):
        p = int(np.argmax(f))
        cola = f[p:]
        n = int(round(len(cola) * factor))
        cola_nueva = np.interp(np.linspace(0, len(cola) - 1, n), np.arange(len(cola)), cola) / factor
        return np.concatenate([f[:p], cola_nueva])
    return aplicar


def recortar(segundos):
    """Corta la espiración a los pocos segundos: maniobra corta y sin meseta.

    La señal termina ahí (se quitan las muestras). Si se rellenara con ceros, el volumen quedaría plano y el
    modelo lo vería como una meseta correcta.
    """
    def aplicar(f, rng):
        return f[:inicio_espiracion(f) + int(segundos / DT)].copy()
    return aplicar


def inicio_lento(litros, segundos):
    """Antes del soplido fuerte añade una espiración lenta: el volumen extrapolado (Vext) sube."""
    def aplicar(f, rng):
        s = inicio_espiracion(f)
        lento = np.full(int(segundos / DT), litros / segundos * 1000)
        return np.concatenate([f[:s], lento, f[s:]])
    return aplicar


def tos(en_segundos, profundidad=1.0, duracion=0.15, rebote=0.3):
    """Tos en el primer segundo: el flujo cae casi a cero y justo después hay un golpe de flujo (el tosido).

    `profundidad` es la fracción de flujo que se pierde en la caída y `rebote` la altura del golpe como
    fracción del pico de flujo.
    """
    def aplicar(f, rng):
        centro = inicio_espiracion(f) + int(en_segundos / DT)
        idx = np.arange(len(f))
        ancho = duracion / DT
        caida = np.exp(-0.5 * ((idx - centro) / (ancho / 2)) ** 2)
        golpe = np.exp(-0.5 * ((idx - centro - ancho) / (ancho / 3)) ** 2)
        return f * (1 - profundidad * caida) + rebote * np.max(f) * golpe
    return aplicar


def pico_romo(ventana_s=0.3):
    """Suaviza el arranque: el pico de flujo sale más bajo y tardío (esfuerzo inicial insuficiente)."""
    def aplicar(f, rng):
        s = inicio_espiracion(f)
        n = int(ventana_s / DT)
        g = f.copy()
        tramo = slice(s, min(s + int(1.5 / DT), len(f)))
        g[tramo] = np.convolve(f, np.ones(n) / n, mode="same")[tramo]
        return g
    return aplicar


def sin_respiracion_previa(margen_s=0.1):
    """Quita la respiración tranquila anterior al soplido (deja `margen_s` segundos antes).

    Algunas señales reales empiezan con varios segundos de respiración normal; el preprocesado del modelo toma
    esa respiración como inicio de la maniobra y la rechaza por pico no válido.
    """
    def aplicar(f, rng):
        return f[max(inicio_espiracion(f) - int(margen_s / DT), 0):].copy()
    return aplicar


def ruido(sigma_mls=25):
    """Ruido pequeño (suavizado) para que las repeticiones de una maniobra no sean idénticas."""
    def aplicar(f, rng):
        r = np.convolve(rng.normal(0, sigma_mls, len(f)), np.ones(3) / 3, mode="same")
        s = inicio_espiracion(f)
        r[:s] = 0                                  # antes de la maniobra la señal se deja intacta
        return f + r
    return aplicar


# =====================================================================================================
# Descripción de los estudios
# =====================================================================================================

@dataclass
class Maniobra:
    base: int                        # Order de la maniobra real de la plantilla que se usa como base
    cambios: tuple = ()              # transformaciones que se aplican a su señal, en orden


def M(base, *cambios):
    return Maniobra(base, cambios)


@dataclass
class Estudio:
    fichero: str                     # nombre del XML que se genera
    plantilla: str                   # XML real del que se copian la estructura y el paciente
    fecha: str                       # "AAAA-MM-DD HH:MM" de la primera maniobra
    descripcion: str
    pre: list
    post: list = field(default_factory=list)
    paciente: dict = None            # datos de un paciente nuevo; None = el de la plantilla
    peso: float = None               # peso en esa sesión (None = el de la plantilla)
    carpeta: str = "estudios"
    retoque: callable = None         # cambio final sobre el XML (para los casos especiales)
    romper: bool = False             # escribir el XML incompleto (caso de XML mal formado)
    uuid_de: str = None              # reutilizar el identificador de sesión de otro fichero (estudio repetido)


ALBA = "ZapicoRodriguezAlba.xml"          # maniobras aceptables: Pre 0 y 2, Post 3, 5 y 6
ANGEL = "GonzalezMoranAngel.xml"          # maniobras aceptables: Pre 0, Post 3
RACHID = "ELKACIMRACHID.xml"              # modelo GLI otro/mixto; la maniobra 2 es anómala (FVC 9,6 L), no se usa

# Pacientes inventados. `fumador` es el código Smoking de Medikro (0-3); su significado aún no está confirmado,
# así que solo se usan códigos que aparecen en los XML reales.
LUCIA = dict(dni="SINT00001", nombre="LUCIA", apellidos="PRIETO LLANEZA", nacimiento="1988-04-12",
             sexo=0, altura=162.0, peso=58.0, fumador="3", refset="20123")
MARCOS = dict(dni="SINT00002", nombre="MARCOS", apellidos="IGLESIAS CUERVO", nacimiento="1961-11-03",
              sexo=1, altura=172.0, peso=84.0, fumador="1", refset="20123")
ELENA = dict(dni="SINT00003", nombre="ELENA", apellidos="SUAREZ MENENDEZ", nacimiento="1979-07-21",
             sexo=0, altura=158.0, peso=61.0, fumador="0", refset="20123")
PABLO = dict(dni="SINT00004", nombre="PABLO", apellidos="ALONSO FIDALGO", nacimiento="1990-01-30",
             sexo=1, altura=181.0, peso=77.0, fumador="3", refset="20129")
SARA = dict(dni="SINT00005", nombre="SARA", apellidos="VIGIL ORDIALES", nacimiento="1985-05-05",
            sexo=0, altura=165.0, peso=60.0, fumador="0", refset="20123")

R = ruido  # abreviaturas
SP = sin_respiracion_previa

ESTUDIOS = [
    # ---- Alba Zapico Rodriguez: muchas sesiones con todo tipo de situaciones ----
    Estudio("ZapicoRodriguezAlba_2020-06-03_pico_no_valido.xml", ALBA, "2020-06-03 09:40",
            "Pre con dos maniobras de pico romo (esfuerzo inicial insuficiente) y una buena",
            pre=[M(2, pico_romo(0.35), R()), M(0, pico_romo(0.45), R()), M(2, R())],
            post=[M(6, R()), M(5, R()), M(3, R())]),
    Estudio("ZapicoRodriguezAlba_2020-11-25_repetibilidad_baja.xml", ALBA, "2020-11-25 10:30",
            "Maniobras aceptables pero poco repetibles: grado C en Pre y grado D en Post",
            pre=[M(2, R()), M(2, escalar(0.95), R()), M(2, escalar(0.90), R())],
            post=[M(6, R()), M(6, escalar(0.94), R()), M(6, escalar(0.88), R())]),
    Estudio("ZapicoRodriguezAlba_2021-03-10_respuesta_bd_positiva.xml", ALBA, "2021-03-10 10:12",
            "Buena calidad y respuesta broncodilatadora positiva (Post un 12 % mayor)",
            pre=[M(2, R()), M(0, R()), M(2, escalar(0.98), R())],
            post=[M(6, escalar(1.12), R()), M(5, escalar(1.11), R()), M(6, escalar(1.10), R())]),
    Estudio("ZapicoRodriguezAlba_2021-09-22_sin_respuesta_bd.xml", ALBA, "2021-09-22 12:05",
            "Buena calidad y sin respuesta broncodilatadora (Post igual que Pre)",
            pre=[M(2, R()), M(0, R()), M(2, escalar(1.01), R())],
            post=[M(6, escalar(0.99), R()), M(5, R()), M(3, R())]),
    Estudio("ZapicoRodriguezAlba_2022-04-05_solo_pre.xml", ALBA, "2022-04-05 11:30",
            "Protocolo solo Pre: no hay sesión Post",
            pre=[M(0, R()), M(2, R()), M(2, escalar(0.99), R())]),
    Estudio("ZapicoRodriguezAlba_2022-10-18_obstruccion_reversible.xml", ALBA, "2022-10-18 10:45",
            "Patrón obstructivo en Pre que mejora claramente en Post",
            pre=[M(2, obstruir(1.35), R()), M(0, obstruir(1.30), R()), M(2, obstruir(1.32), escalar(0.98), R())],
            post=[M(6, obstruir(1.10), R()), M(5, obstruir(1.12), R()), M(6, obstruir(1.08), R())]),
    Estudio("ZapicoRodriguezAlba_2023-01-19_maniobras_cortas.xml", ALBA, "2023-01-19 09:20",
            "Maniobras cortadas antes de tiempo (sin meseta); en Post queda una buena",
            pre=[M(2, recortar(2.4), R()), M(0, recortar(2.8), R()), M(2, recortar(2.0), R())],
            post=[M(6, recortar(2.6), R()), M(5, recortar(2.2), R()), M(3, R())]),
    Estudio("ZapicoRodriguezAlba_2023-11-02_vext_alto.xml", ALBA, "2023-11-02 13:10",
            "Varias maniobras con inicio lento: Vext por encima del límite ATS/ERS",
            pre=[M(2, inicio_lento(0.35, 0.5), R()), M(0, R()), M(2, inicio_lento(0.40, 0.6), R())],
            post=[M(6, R()), M(5, inicio_lento(0.30, 0.45), R()), M(3, R())]),
    Estudio("ZapicoRodriguezAlba_2024-04-17_ocho_maniobras.xml", ALBA, "2024-04-17 10:00",
            "Pre con 8 maniobras (el máximo práctico), mezcla de buenas y malas",
            pre=[M(2, R()), M(0, R()), M(2, escalar(0.97), R()), M(0, recortar(2.5), R()),
                 M(2, escalar(1.02), R()), M(0, escalar(0.99), R()), M(2, tos(0.4), R()), M(2, escalar(0.995), R())],
            post=[M(6, R()), M(5, R()), M(3, R())]),
    Estudio("ZapicoRodriguezAlba_2024-12-05_tos.xml", ALBA, "2024-12-05 12:40",
            "Maniobras con tos o cierre de glotis en el primer segundo",
            pre=[M(2, tos(0.35), R()), M(0, R()), M(2, tos(0.5, rebote=0.4), R())],
            post=[M(6, R()), M(5, tos(0.4), R()), M(3, R())]),
    Estudio("ZapicoRodriguezAlba_2025-06-20_ninguna_aceptable.xml", ALBA, "2025-06-20 09:55",
            "Ninguna maniobra aceptable en ninguna fase: cortas, con tos o con pico no válido (sesiones sin resultados)",
            pre=[M(2, recortar(2.0), R()), M(0, pico_romo(0.45), R()), M(2, tos(0.3), R())],
            post=[M(6, recortar(1.8), R()), M(5, tos(0.35), R()), M(3, recortar(2.2), R())]),
    Estudio("ZapicoRodriguezAlba_2025-09-10_una_maniobra_por_fase.xml", ALBA, "2025-09-10 11:15",
            "Solo una maniobra en cada fase",
            pre=[M(2, R())], post=[M(6, escalar(1.03), R())]),

    # ---- Angel Gonzalez Moran: seguimiento anual con empeoramiento progresivo ----
    Estudio("GonzalezMoranAngel_2020-05-12_seguimiento.xml", ANGEL, "2020-05-12 09:30",
            "Seguimiento anual (1/5): función algo mejor que en 2023",
            pre=[M(0, escalar(1.07), R()), M(0, escalar(1.05), R()), M(0, escalar(1.06), R())],
            post=[M(3, escalar(1.07), R()), M(3, escalar(1.06), R()), M(3, escalar(1.08), R())], peso=69),
    Estudio("GonzalezMoranAngel_2021-05-18_seguimiento.xml", ANGEL, "2021-05-18 09:45",
            "Seguimiento anual (2/5)",
            pre=[M(0, escalar(1.05), R()), M(0, escalar(1.04), R()), M(0, escalar(1.03), R())],
            post=[M(3, escalar(1.05), R()), M(3, escalar(1.04), R()), M(3, escalar(1.06), R())], peso=70),
    Estudio("GonzalezMoranAngel_2022-05-20_seguimiento.xml", ANGEL, "2022-05-20 10:05",
            "Seguimiento anual (3/5)",
            pre=[M(0, escalar(1.02), R()), M(0, escalar(1.01), R()), M(0, R())],
            post=[M(3, escalar(1.02), R()), M(3, R()), M(3, escalar(1.03), R())], peso=70),
    Estudio("GonzalezMoranAngel_2024-05-27_seguimiento.xml", ANGEL, "2024-05-27 09:35",
            "Seguimiento anual (4/5): empeora y aparece obstrucción",
            pre=[M(0, obstruir(1.15), escalar(0.96), R()), M(0, obstruir(1.12), escalar(0.95), R()), M(0, obstruir(1.14), escalar(0.97), R())],
            post=[M(3, obstruir(1.10), escalar(0.97), R()), M(3, obstruir(1.08), escalar(0.96), R()), M(3, obstruir(1.10), escalar(0.98), R())], peso=73),
    Estudio("GonzalezMoranAngel_2025-05-26_seguimiento.xml", ANGEL, "2025-05-26 09:50",
            "Seguimiento anual (5/5): obstrucción más marcada",
            pre=[M(0, obstruir(1.25), escalar(0.93), R()), M(0, obstruir(1.22), escalar(0.92), R()), M(0, obstruir(1.24), escalar(0.94), R())],
            post=[M(3, obstruir(1.18), escalar(0.95), R()), M(3, obstruir(1.16), escalar(0.94), R()), M(3, obstruir(1.20), escalar(0.95), R())], peso=74),

    # ---- Rachid El Kacim: modelo de predicción GLI otro/mixto ----
    Estudio("ElKacimRachid_2024-10-07_etnia_otro.xml", RACHID, "2024-10-07 16:20",
            "Segundo estudio de un paciente con modelo GLI otro/mixto",
            pre=[M(6, SP(), R()), M(6, SP(), escalar(0.98), R()), M(5, SP(), R())],
            post=[M(6, SP(), escalar(1.04), R()), M(6, SP(), escalar(1.02), R()), M(1, SP(), escalar(1.03), R())]),

    # ---- Pacientes nuevos (no están en la base de datos: se crean al subir el primer estudio) ----
    Estudio("PrietoLlanezaLucia_2024-02-14_primer_estudio.xml", ALBA, "2024-02-14 10:20",
            "Paciente nueva (mujer, 35 años): primer estudio normal", paciente=LUCIA,
            pre=[M(2, R()), M(0, R()), M(2, escalar(0.98), R())],
            post=[M(6, R()), M(5, R()), M(3, R())]),
    Estudio("PrietoLlanezaLucia_2025-02-18_segundo_estudio.xml", ALBA, "2025-02-18 10:35",
            "Paciente nueva: segundo estudio, solo Pre", paciente=LUCIA,
            pre=[M(2, escalar(1.01), R()), M(0, R()), M(2, R())]),
    Estudio("IglesiasCuervoMarcos_2023-09-12_obstruccion.xml", ANGEL, "2023-09-12 09:15",
            "Paciente nuevo (hombre, 61 años) con obstrucción", paciente=MARCOS,
            pre=[M(0, obstruir(1.40), R()), M(0, obstruir(1.38), R()), M(0, obstruir(1.42), R())],
            post=[M(3, obstruir(1.35), R()), M(3, obstruir(1.33), R()), M(3, obstruir(1.36), R())]),
    Estudio("IglesiasCuervoMarcos_2024-09-17_obstruccion.xml", ANGEL, "2024-09-17 09:25",
            "Paciente nuevo: un año después, obstrucción algo peor", paciente=MARCOS,
            pre=[M(0, obstruir(1.48), escalar(0.97), R()), M(0, obstruir(1.45), escalar(0.96), R()), M(0, obstruir(1.50), escalar(0.97), R())],
            post=[M(3, obstruir(1.42), escalar(0.97), R()), M(3, obstruir(1.40), escalar(0.98), R()), M(3, obstruir(1.44), escalar(0.97), R())]),
]


def _poner_dni(dni):
    def retocar(raiz):
        _persona(raiz).find("E[@N='PersonalID']").set("V", dni)
    return retocar


def _quitar_fecha_nacimiento(raiz):
    _persona(raiz).find("E[@N='BirthDate']").set("V", "")


CASOS_ESPECIALES = [
    Estudio("dni_en_minusculas_y_con_guion.xml", ALBA, "2025-10-01 10:00",
            "Estudio de Alba con el DNI escrito 'astu-000044804821': debe asociarse a Alba, no crear otro paciente",
            pre=[M(2, R()), M(0, R())], carpeta="casos_especiales", retoque=_poner_dni("astu-000044804821")),
    Estudio("sin_dni.xml", ALBA, "2025-10-02 10:00",
            "XML sin DNI: la aplicación debe rechazarlo",
            pre=[M(2, R()), M(0, R())], carpeta="casos_especiales", retoque=_poner_dni("")),
    Estudio("xml_mal_formado.xml", ALBA, "2025-10-03 10:00",
            "XML cortado a la mitad: la aplicación debe decir que el fichero no es válido",
            pre=[M(2, R()), M(0, R())], carpeta="casos_especiales", romper=True),
    Estudio("estudio_repetido.xml", ALBA, "2021-03-10 10:12",
            "Mismo identificador de sesión que ZapicoRodriguezAlba_2021-03-10: la aplicación debe decir que ya existe",
            pre=[M(2, R()), M(0, R()), M(2, escalar(0.98), R())],
            post=[M(6, escalar(1.12), R()), M(5, escalar(1.11), R()), M(6, escalar(1.10), R())],
            carpeta="casos_especiales", uuid_de="ZapicoRodriguezAlba_2021-03-10_respuesta_bd_positiva.xml"),
    Estudio("paciente_nuevo_para_crear.xml", ALBA, "2025-03-11 09:40",
            "Paciente que no existe (Elena Suarez Menendez): al subirlo, la aplicación debe ofrecer crearla",
            pre=[M(2, R()), M(0, R()), M(2, escalar(0.99), R())], post=[M(6, R()), M(5, R())],
            paciente=ELENA, carpeta="casos_especiales"),
    Estudio("modelo_prediccion_desconocido.xml", ANGEL, "2025-04-08 11:00",
            "Paciente nuevo con un modelo de predicción (RefSetID 20129) que no es de los conocidos: etnia 'other'",
            pre=[M(0, R()), M(0, escalar(0.98), R())], paciente=PABLO, carpeta="casos_especiales"),
    Estudio("sin_fecha_nacimiento.xml", ALBA, "2025-05-06 12:00",
            "Paciente nuevo sin fecha de nacimiento: al crearlo, la aplicación debe rechazarlo",
            pre=[M(2, R()), M(0, R())], paciente=SARA, carpeta="casos_especiales", retoque=_quitar_fecha_nacimiento),
]


# =====================================================================================================
# Construcción del XML
# =====================================================================================================

def _persona(raiz):
    return raiz.find("E[@T='D']/E[@N='Person']/E[@T='R']")


def _hijo(el, nombre):
    return el.find(f"E[@N='{nombre}']")


def _poner(el, nombre, valor):
    hijo = _hijo(el, nombre)
    if hijo is not None:
        hijo.set("V", valor)


def num(v, cifras=8):
    """Número con 8 cifras significativas, como en los XML de Medikro (p. ej. 3.2996000)."""
    return np.format_float_positional(float(v), precision=cifras, unique=False, fractional=False, trim="k")


def excel(fecha_utc):
    """Fecha en formato serie de Excel (días desde 1899-12-30), como el campo TIME."""
    return (fecha_utc - dt.datetime(1899, 12, 30)).total_seconds() / 86400


def horas_utc(fecha):
    """Diferencia con UTC en España (aproximación del horario de verano: abril a octubre)."""
    return 2 if 4 <= fecha.month <= 10 else 1


def texto_fecha(fecha):
    return fecha.strftime("%Y-%m-%d %H:%M:%S")


def maniobras_plantilla(raiz):
    """Maniobras reales de la plantilla por su Order: (señal en mL/s, registro XML)."""
    senales = _persona(raiz).find("E[@N='Session']/E[@T='R']/E[@N='Signal']")
    resultado = {}
    for registro in senales.findall("E[@T='R']"):
        orden = int(_hijo(registro, "Order").get("V"))
        datos = registro.find("E[@N='Data'][@T='C']").get("V")
        resultado[orden] = (np.array([int(x) for x in datos.split(":")], float), registro)
    return resultado


def rellenar_parametros(registro, p, sexo, edad, altura, etnia):
    """Escribe en un registro de parámetros los valores calculados, sus teóricos GLI y los z-scores."""
    for nombre, valor in p.items():
        _poner(registro, nombre, num(valor))
    for nombre in PARAMETROS_GLI:
        ref, rel, z = teorico_y_z(nombre, p[nombre], sexo, edad, altura, etnia)
        _poner(registro, f"Ref_{nombre}", num(ref))
        _poner(registro, f"Rel_{nombre}", num(rel))
        _poner(registro, f"Z_{nombre}", f"{z:.2f}")


def poner_diferencias(registro, p, referencia):
    """Campos *DIFF: diferencia de la maniobra con la de referencia (la mejor de la fase)."""
    for nombre in ("FEVC", "FEV1", "PEF", "PEFLPM"):
        dif = p[nombre] - referencia[nombre]
        _poner(registro, f"{nombre}DIFF", num(dif))
        _poner(registro, f"Rel_{nombre}DIFF", num(dif / referencia[nombre]))


def generar(estudio):
    raiz = ET.parse(DATOS_REALES / estudio.plantilla).getroot()
    rng = np.random.default_rng(zlib.crc32(estudio.fichero.encode()))
    persona = _persona(raiz)
    sesion = persona.find("E[@N='Session']/E[@T='R']")
    datos_sesion = sesion.find("E[@N='Data']")
    registro_principal, *registros_fase = datos_sesion.findall("E[@T='R']")
    plantilla = maniobras_plantilla(raiz)

    # ---- Paciente ----
    custom = {e.get("V").split("=")[0]: e for e in persona.findall("E[@N='Custom']")}
    if estudio.paciente:
        pac = estudio.paciente
        _poner(persona, "PersonalID", pac["dni"])
        _poner(persona, "PersonUUIDKey", str(uuid.uuid5(uuid.NAMESPACE_OID, pac["dni"])))
        _poner(persona, "PatientCode", str(zlib.crc32(pac["dni"].encode()) % 900000 + 100000))
        _poner(persona, "FirstName", pac["nombre"])
        _poner(persona, "LastName", pac["apellidos"])
        _poner(persona, "BirthDate", pac["nacimiento"] + " 00:00:00")
        _poner(persona, "Gender", str(pac["sexo"]))
        custom["RefSetID"].set("V", "RefSetID=" + pac["refset"])
        nacimiento, sexo, altura = dt.date.fromisoformat(pac["nacimiento"]), pac["sexo"], pac["altura"]
        peso, fumador, refset = pac["peso"], pac["fumador"], pac["refset"]
    else:
        nacimiento = dt.date.fromisoformat(_hijo(persona, "BirthDate").get("V")[:10])
        sexo = int(_hijo(persona, "Gender").get("V"))
        altura = float(custom["Height"].get("V").split("=")[1])
        peso = float(custom["Weight"].get("V").split("=")[1])
        fumador = _hijo(registro_principal, "Smoking").get("V")
        refset = _hijo(registro_principal, "RefSetID").get("V")
    peso = estudio.peso or peso
    etnia = REFSET_ETNIA.get(refset, "other")
    custom["Height"].set("V", f"Height={altura:.6f}")
    custom["Weight"].set("V", f"Weight={peso:.6f}")

    # ---- Fechas e identificadores de la sesión ----
    inicio = dt.datetime.strptime(estudio.fecha, "%Y-%m-%d %H:%M")
    edad = (inicio.date() - nacimiento).days / 365.25
    uuid_sesion = str(uuid.uuid5(uuid.NAMESPACE_URL, estudio.uuid_de or estudio.fichero))
    for e in raiz.iter("E"):
        if e.get("N") == "SessionUUIDKey":
            e.set("V", uuid_sesion)

    # Las señales se escalan al tamaño del paciente nuevo (su FVC teórica frente a la del paciente de la plantilla)
    escala = 1.0
    if estudio.paciente:
        _, m_nuevo, _ = lms(sexo, edad, altura, etnia, GLI_2012.Parameters.FVC)
        pac_plantilla = _persona(ET.parse(DATOS_REALES / estudio.plantilla).getroot())
        edad_pl = float(_hijo(registro_principal, "Age").get("V"))
        altura_pl = float(_hijo(registro_principal, "Height").get("V"))
        sexo_pl = int(_hijo(pac_plantilla, "Gender").get("V"))
        _, m_plantilla, _ = lms(sexo_pl, edad_pl, altura_pl, "caucasian", GLI_2012.Parameters.FVC)
        escala = m_nuevo / m_plantilla

    # ---- Maniobras nuevas ----
    tabla_senales = sesion.find("E[@N='Signal']")
    modelo_registro = copy.deepcopy(tabla_senales.find("E[@T='R']"))
    for r in tabla_senales.findall("E[@T='R']"):
        tabla_senales.remove(r)

    maniobras = []   # (fase, fecha, señal, parámetros, registro de la plantilla)
    fases = [("Pre Phase", estudio.pre, inicio), ("Post Phase", estudio.post, inicio + dt.timedelta(minutes=35))]
    for fase, lista, inicio_fase in fases:
        for i, man in enumerate(lista):
            senal, registro_base = plantilla[man.base]
            senal = senal * escala
            for cambio in man.cambios:
                senal = cambio(senal, rng)
            senal = np.round(senal).astype(int)
            fecha = inicio_fase + dt.timedelta(seconds=75 * i + int(rng.integers(0, 20)))
            maniobras.append((fase, fecha, senal, calcular_parametros(senal), registro_base))

    mejores = {}
    for fase in ("Pre Phase", "Post Phase"):
        de_la_fase = [m for m in maniobras if m[0] == fase]
        if de_la_fase:
            ordenadas = sorted(de_la_fase, key=lambda m: m[3]["FEVC"] + m[3]["FEV1"], reverse=True)
            mejores[fase] = ordenadas

    for orden, (fase, fecha, senal, p, registro_base) in enumerate(maniobras):
        registro = copy.deepcopy(modelo_registro)
        utc = fecha - dt.timedelta(hours=horas_utc(fecha))
        clave = str(zlib.crc32(f"{estudio.fichero}-{orden}".encode()) % 900000000 + 100000000)
        _poner(registro, "SignalKey", clave)
        _poner(registro, "StartTime", texto_fecha(fecha))
        _poner(registro, "Phase", fase)
        _poner(registro, "Order", str(orden))
        _poner(registro, "TZPlusDST", f"{horas_utc(fecha) / 24:.16f}")
        registro.find("E[@N='Data'][@T='C']").set("V", ":".join(str(x) for x in senal))
        parametros = registro.find("E[@T='T'][@N='Data']").find("E[@T='R']")
        # Los campos que no se recalculan (RT10-90, DT90, METT...) se toman de la maniobra real de la que sale
        base = registro_base.find("E[@T='T'][@N='Data']").find("E[@T='R']")
        for e in base:
            _poner(parametros, e.get("N"), e.get("V"))
        _poner(parametros, "SignalKey", clave)
        _poner(parametros, "TIME", f"{excel(utc):.3f}")
        _poner(parametros, "SessionUUIDKey", uuid_sesion)
        _poner(parametros, "Weight", f"{peso:.6f}")
        _poner(parametros, "Height", f"{altura:.6f}")
        rellenar_parametros(parametros, p, sexo, edad, altura, etnia)
        poner_diferencias(parametros, p, mejores[fase][0][3])
        tabla_senales.append(registro)

    # ---- Resumen de cada fase (mejor maniobra; los *DIFF comparan la mejor con la segunda) ----
    modelo_fase = copy.deepcopy(registros_fase[0])
    for r in registros_fase:
        datos_sesion.remove(r)
    for fase, ordenadas in mejores.items():
        registro = copy.deepcopy(modelo_fase)
        mejor = ordenadas[0]
        utc = mejor[1] - dt.timedelta(hours=horas_utc(mejor[1]))
        _poner(registro, "Phase", fase)
        _poner(registro, "TIME", f"{excel(utc):.3f}")
        rellenar_parametros(registro, mejor[3], sexo, edad, altura, etnia)
        poner_diferencias(registro, mejor[3], (ordenadas[1] if len(ordenadas) > 1 else mejor)[3])
        datos_sesion.append(registro)

    # ---- Datos generales de la sesión ----
    ultima = maniobras[-1][1]
    ultima_utc = ultima - dt.timedelta(hours=horas_utc(ultima))
    _poner(sesion, "SessionTime", texto_fecha(ultima))
    _poner(sesion, "SessionTimeUTC", texto_fecha(ultima_utc))
    for nombre, valor in (("Age", f"{edad:.6f}"), ("Height", f"{altura:.6f}"), ("Weight", f"{peso:.6f}"),
                          ("Gender", str(sexo)), ("RefSetID", refset), ("Smoking", fumador),
                          ("BMI", f"{peso / (altura / 100) ** 2:.2f}"), ("SessionTime", texto_fecha(ultima)),
                          ("ProtocolName", "Pre/Post" if estudio.post else "Pre")):
        _poner(registro_principal, nombre, valor)

    # ---- Operaciones (quién y cuándo): nuevos identificadores y horas coherentes ----
    operaciones = sesion.find("E[@N='Operation']").findall("E[@T='R']")
    for i, op in enumerate(operaciones):
        momento = inicio - dt.timedelta(minutes=2) if i == 0 else ultima + dt.timedelta(seconds=10)
        _poner(op, "OperationUUIDKey", str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{estudio.fichero}-op{i}")))
        _poner(op, "OperationTime", texto_fecha(momento))
        _poner(op, "OperationTimeUTC", texto_fecha(momento - dt.timedelta(hours=horas_utc(momento))))

    if estudio.retoque:
        estudio.retoque(raiz)
    return raiz


def escribir(raiz, ruta, romper=False):
    """Escribe el XML con el mismo formato que Medikro: sangría de 4 espacios, CRLF e ISO-8859-1."""
    def atributos(e):
        esc = lambda v: v.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")
        return " ".join(f'{k}="{esc(v)}"' for k, v in e.attrib.items())

    lineas = ['<?xml version="1.0" encoding="ISO-8859-1"?>', DOCTYPE, "<SpiroXML2>"]

    def volcar(e, nivel):
        sangria = "    " * nivel
        hijos = list(e)
        if hijos:
            lineas.append(f"{sangria}<E {atributos(e)}>")
            for h in hijos:
                volcar(h, nivel + 1)
            lineas.append(f"{sangria}</E>")
        else:
            lineas.append(f"{sangria}<E {atributos(e)}/>")

    for e in raiz:
        volcar(e, 1)
    lineas.append("</SpiroXML2>")
    if romper:
        lineas = lineas[: len(lineas) // 2]
    ruta.parent.mkdir(parents=True, exist_ok=True)
    with open(ruta, "w", encoding="iso-8859-1", newline="\r\n") as fichero:
        fichero.write("\n".join(lineas) + "\n")


def main():
    for estudio in ESTUDIOS + CASOS_ESPECIALES:
        ruta = AQUI / estudio.carpeta / estudio.fichero
        escribir(generar(estudio), ruta, romper=estudio.romper)
        print(f"{estudio.carpeta}/{estudio.fichero}: {estudio.descripcion}")


if __name__ == "__main__":
    main()
