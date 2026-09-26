package com.espirometrias.exception;

public class StudyNotFoundException extends RuntimeException {
    public StudyNotFoundException(String studyUUID)
    {
        super("No existe ningún estudio con identificador: " + studyUUID);
    }
}
