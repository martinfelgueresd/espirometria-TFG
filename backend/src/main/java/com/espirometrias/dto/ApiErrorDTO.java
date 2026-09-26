package com.espirometrias.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.Map;

// Formato único de todas las respuestas de error de la API:
// - code: identificador del tipo de error, para que el frontend decida qué hacer (p. ej. PATIENT_NOT_FOUND).
// - message: mensaje en español listo para mostrar al usuario.
// - fieldErrors: errores de validación por campo (solo en formularios).
// - details: datos extra de algunos errores (p. ej. el DNI y el nombre del paciente que no existe).
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiErrorDTO(String code, String message, Map<String, String> fieldErrors, Map<String, String> details) {

    public static ApiErrorDTO of(String code, String message) {
        return new ApiErrorDTO(code, message, null, null);
    }
}
