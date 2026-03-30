from fastapi import FastAPI, UploadFile, File, HTTPException
import analizador_espirometria as am

app = FastAPI()

@app.post("/analizar")
def analizar(file: UploadFile = File(...)):
    try:
        contenido = file.file.read().decode("ISO-8859-1")
        resultado = am.analizar_espirometria(contenido)
        return resultado

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))