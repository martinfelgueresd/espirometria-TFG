package com.espirometrias.exception;

public class StudyAlreadyExistsException extends RuntimeException {
    public StudyAlreadyExistsException() {
        super("Este estudio ya está asociado a este paciente.");
    }
}
