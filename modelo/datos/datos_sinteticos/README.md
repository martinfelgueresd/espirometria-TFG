# Datos sintéticos de espirometría

Estos XML **no vienen de la empresa**: están generados para probar la aplicación con varios estudios por
paciente y con todas las situaciones que se pueden dar (maniobras rechazadas por cada motivo, fases sin
maniobras aceptables, estudios sin Post, errores al subir...). Los XML reales están en `../datos` y no se
han modificado.

## Cómo están hechos

`generar_datos_sinteticos.py` parte de un XML real (la *plantilla*) y:

1. Copia su estructura y los datos del paciente (o los cambia por los de un paciente inventado).
2. Crea las maniobras nuevas a partir de las señales de flujo reales, aplicándoles transformaciones:
   | Transformación | Qué simula |
   |---|---|
   | `escalar(k)` | pulmones más grandes o más pequeños (mejora o empeoramiento, respuesta al broncodilatador) |
   | `obstruir(f)` | vaciado más lento: baja el FEV1 y el FEV1/FVC (patrón obstructivo) |
   | `recortar(s)` | la maniobra termina a los pocos segundos, sin meseta |
   | `inicio_lento(L, s)` | arranque lento antes del soplido fuerte: Vext alto |
   | `tos(s)` | el flujo cae casi a cero y hay un golpe de flujo en el primer segundo |
   | `pico_romo(s)` | pico de flujo bajo y tardío (esfuerzo inicial insuficiente) |
   | `sin_respiracion_previa()` | quita la respiración tranquila anterior al soplido (ver *Limitaciones*) |
   | `ruido()` | pequeñas diferencias para que dos repeticiones no sean idénticas |
3. Recalcula los parámetros de cada maniobra a partir de la señal nueva (tiempo cero por retroextrapolación,
   Vext, PEF, FEV0.25-FEV6, FVC, cocientes, MEF75/50/25, MMEF, FET), los valores teóricos y z-scores
   GLI-2012 y los registros de resumen de cada fase. Así cada fichero es coherente consigo mismo.
4. Escribe el XML con el mismo formato que los de Medikro (SpiroXML2, ISO-8859-1, saltos de línea CRLF,
   DOCTYPE, sangría de 4 espacios).

El resultado es siempre el mismo: volver a ejecutar el script genera exactamente los mismos ficheros.

```
pip install pyspiro          # ecuaciones GLI-2012 (además de numpy)
python generar_datos_sinteticos.py
```

## `estudios/`: estudios para cargar en la aplicación

La columna *Modelo* es lo que devuelve el servicio de Python (`/analizar`) para cada fase: el grado de calidad
de la sesión y, entre paréntesis, las maniobras no aceptables con su clase (B = pico no válido, C = poca
duración/no meseta, D = Vext alto/tos/artefactos).

**Alba Zapico Rodriguez** (ya existe en la base de datos): 12 estudios nuevos con todas las situaciones.

| Fichero | Qué se prueba | Modelo: Pre / Post |
|---|---|---|
| `ZapicoRodriguezAlba_2020-06-03_pico_no_valido` | dos maniobras con pico romo y una buena | E (#0 B, #1 B) / A |
| `ZapicoRodriguezAlba_2020-11-25_repetibilidad_baja` | todas aceptables pero poco repetibles | C / D |
| `ZapicoRodriguezAlba_2021-03-10_respuesta_bd_positiva` | Post un 11-12 % mayor que Pre | A / A |
| `ZapicoRodriguezAlba_2021-09-22_sin_respuesta_bd` | Post igual que Pre | A / A |
| `ZapicoRodriguezAlba_2022-04-05_solo_pre` | protocolo solo Pre, sin sesión Post | A / – |
| `ZapicoRodriguezAlba_2022-10-18_obstruccion_reversible` | obstrucción en Pre que mejora en Post | A / A |
| `ZapicoRodriguezAlba_2023-01-19_maniobras_cortas` | maniobras cortadas a los 2-3 s | F (todas C) / E (#3 C, #4 C) |
| `ZapicoRodriguezAlba_2023-11-02_vext_alto` | inicio lento en varias maniobras | E (#0 D, #2 D) / E (#4 D) |
| `ZapicoRodriguezAlba_2024-04-17_ocho_maniobras` | 8 maniobras en Pre, mezcla de buenas y malas | A (#3 C, #6 D) / A |
| `ZapicoRodriguezAlba_2024-12-05_tos` | tos en el primer segundo | E (#0 D, #2 D) / E (#4 D) |
| `ZapicoRodriguezAlba_2025-06-20_ninguna_aceptable` | ninguna maniobra aceptable en ninguna fase | F (#0 C, #1 B, #2 D) / F (#3 C, #4 D, #5 C) |
| `ZapicoRodriguezAlba_2025-09-10_una_maniobra_por_fase` | una sola maniobra en cada fase | E / E |

**Angel Gonzalez Moran** (ya existe): seguimiento anual con empeoramiento progresivo.

| Fichero | Qué se prueba | Modelo: Pre / Post |
|---|---|---|
| `GonzalezMoranAngel_2020-05-12_seguimiento` | función algo mejor que en el estudio real de 2023 | A / A |
| `GonzalezMoranAngel_2021-05-18_seguimiento` | ligera bajada | A / A |
| `GonzalezMoranAngel_2022-05-20_seguimiento` | ligera bajada | A / A |
| `GonzalezMoranAngel_2024-05-27_seguimiento` | empeora y aparece obstrucción | A / A |
| `GonzalezMoranAngel_2025-05-26_seguimiento` | obstrucción más marcada | A / A |

**Rachid El Kacim** (ya existe; modelo GLI otro/mixto).

| Fichero | Qué se prueba | Modelo: Pre / Post |
|---|---|---|
| `ElKacimRachid_2024-10-07_etnia_otro` | segundo estudio de un paciente con etnia "other" (teóricos GLI otro/mixto) | A / A |

**Pacientes nuevos** (no están en la base de datos: al subir el primer estudio la aplicación ofrece crearlos).

| Fichero | Paciente | Qué se prueba | Modelo: Pre / Post |
|---|---|---|---|
| `PrietoLlanezaLucia_2024-02-14_primer_estudio` | Lucía Prieto Llaneza, `SINT00001`, mujer, 1988 | primer estudio normal | A / A |
| `PrietoLlanezaLucia_2025-02-18_segundo_estudio` | Lucía | segundo estudio, solo Pre | A / – |
| `IglesiasCuervoMarcos_2023-09-12_obstruccion` | Marcos Iglesias Cuervo, `SINT00002`, hombre, 1961 | obstrucción | A / A |
| `IglesiasCuervoMarcos_2024-09-17_obstruccion` | Marcos | un año después, obstrucción algo peor | A / A |

Las señales de los pacientes nuevos se escalan para que su FVC encaje con su sexo, edad y altura según GLI-2012.

## `casos_especiales/`: ficheros para probar flujos y errores

| Fichero | Qué se prueba | Qué debe hacer la aplicación |
|---|---|---|
| `dni_en_minusculas_y_con_guion` | estudio de Alba con el DNI escrito `astu-000044804821` | asociarlo a Alba (el DNI se normaliza), sin crear otro paciente |
| `sin_dni` | XML con el DNI vacío | rechazarlo |
| `xml_mal_formado` | XML cortado por la mitad | decir que el fichero no es válido |
| `estudio_repetido` | mismo identificador de sesión que `ZapicoRodriguezAlba_2021-03-10_respuesta_bd_positiva` | decir que ese estudio ya existe (hay que subir antes el de `estudios/`) |
| `paciente_nuevo_para_crear` | paciente que no existe (Elena Suarez Menendez, `SINT00003`) | ofrecer crearla con los datos del XML |
| `modelo_prediccion_desconocido` | paciente nuevo (Pablo Alonso Fidalgo, `SINT00004`) con un modelo de predicción que no es GLI caucásico ni otro/mixto (RefSetID 20129) | crearlo con etnia "other" |
| `sin_fecha_nacimiento` | paciente nuevo (Sara Vigil Ordiales, `SINT00005`) sin fecha de nacimiento | no dejar crearlo |

## Limitaciones

- Los campos DT90, DT95, RT10-90, METT, AEFV, FEVC/MMEF y MMEF/FEVC se copian de la maniobra de la
  plantilla, no se recalculan (la aplicación no los muestra).
- El MMEF se calcula con la definición estándar (FEF25-75), que puede diferir un poco del de Medikro.
- En el modelo otro/mixto (RefSetID 201215) los teóricos usan la media de los coeficientes étnicos, como define
  GLI-2012. En los modelos desconocidos también se usa esa media.
- Rachid: su XML real tiene una maniobra anómala (FVC 9,6 L, PEF 19 L/s) y es la única que el modelo acepta; las
  demás empiezan con varios segundos de respiración tranquila y el preprocesado del modelo las rechaza por pico no
  válido. Su estudio sintético usa las maniobras normales quitándoles esa respiración previa.
- El código de tabaco (`Smoking`, 0-3) de los pacientes inventados es uno de los que aparecen en los XML reales;
  su significado todavía no está confirmado.
