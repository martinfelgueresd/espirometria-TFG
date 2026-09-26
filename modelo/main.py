from fastapi import FastAPI, UploadFile, File, HTTPException
import analizador_espirometria as am

app = FastAPI()

@app.post("/analizar")
def analizar(file: UploadFile = File(...)):
    contenido = file.file.read().decode("ISO-8859-1")
    try:
        return am.analizar_espirometria(contenido)

    # XML mal formado: es un error del fichero enviado (400), no del servicio.
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
