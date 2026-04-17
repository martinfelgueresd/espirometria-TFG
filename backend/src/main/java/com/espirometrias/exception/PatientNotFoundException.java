package com.espirometrias.exception;

import lombok.Getter;

import java.util.UUID;

@Getter
public class PatientNotFoundException extends RuntimeException {

    private final String dni;
    private final String firstName;
    private final String lastName;

    public PatientNotFoundException(String dni, String firstName, String lastName) {
        super("No existe ningún paciente con DNI: " + dni);
        this.dni = dni;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public PatientNotFoundException(UUID id) {
        super("No existe ningún paciente con id: " + id);
        this.dni = null;
        this.firstName = null;
        this.lastName = null;
    }
}
