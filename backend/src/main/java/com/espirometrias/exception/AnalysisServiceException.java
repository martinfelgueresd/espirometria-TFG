package com.espirometrias.exception;

// El servicio de análisis (Python) no responde, tarda demasiado o ha fallado al analizar el XML.
public class AnalysisServiceException extends RuntimeException {
    public AnalysisServiceException(Throwable cause)
    {
        super("No se ha podido analizar la espirometría: el servicio de análisis no responde o ha fallado.", cause);
    }
}
