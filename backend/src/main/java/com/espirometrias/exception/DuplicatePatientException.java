package com.espirometrias.exception;

public class DuplicatePatientException extends RuntimeException {
    public DuplicatePatientException(String personalId)
    {
        super("Ya existe un paciente con DNI: " + personalId);
    }
}