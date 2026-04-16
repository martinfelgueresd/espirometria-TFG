package com.espirometrias.exception;

public class PatientXmlMismatchException extends RuntimeException {

    public PatientXmlMismatchException(String xmlLastName, String xmlFirstName, String xmlDni)
    {
        super(String.format(
                "El XML pertenece a %s, %s (DNI: %s).",
                xmlLastName, xmlFirstName, xmlDni.toUpperCase()
        ));
    }
}
