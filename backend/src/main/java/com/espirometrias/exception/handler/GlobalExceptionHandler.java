package com.espirometrias.exception.handler;

import com.espirometrias.dto.ApiErrorDTO;
import com.espirometrias.exception.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.TypeMismatchException;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

import java.util.HashMap;
import java.util.Map;

// Convierte cualquier error en una respuesta con el mismo formato (ApiErrorDTO) y un mensaje en español
// listo para mostrar. Así el frontend nunca recibe el JSON de error por defecto de Spring ni textos técnicos.
@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {

    // ---------- Errores del dominio ----------

    @ExceptionHandler(PatientXmlMismatchException.class)
    public ResponseEntity<ApiErrorDTO> handlePatientMismatch(PatientXmlMismatchException ex) {
        return error(HttpStatus.BAD_REQUEST, "PATIENT_XML_MISMATCH", ex.getMessage());
    }

    @ExceptionHandler(InvalidXmlException.class)
    public ResponseEntity<ApiErrorDTO> handleInvalidXml(InvalidXmlException ex) {
        return error(HttpStatus.BAD_REQUEST, "INVALID_XML", ex.getMessage());
    }

    @ExceptionHandler(PatientNotFoundException.class)
    public ResponseEntity<ApiErrorDTO> handlePatientNotFound(PatientNotFoundException ex) {
        // Si viene de subir un XML, se devuelven los datos del paciente para ofrecer crearlo.
        Map<String, String> details = null;
        if (ex.getDni() != null) {
            details = new HashMap<>();
            details.put("dni", ex.getDni());
            details.put("firstName", ex.getFirstName());
            details.put("lastName", ex.getLastName());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiErrorDTO("PATIENT_NOT_FOUND", ex.getMessage(), null, details));
    }

    @ExceptionHandler(StudyNotFoundException.class)
    public ResponseEntity<ApiErrorDTO> handleStudyNotFound(StudyNotFoundException ex) {
        return error(HttpStatus.NOT_FOUND, "STUDY_NOT_FOUND", ex.getMessage());
    }

    @ExceptionHandler(AnalysisServiceException.class)
    public ResponseEntity<ApiErrorDTO> handleAnalysisService(AnalysisServiceException ex) {
        log.error("Fallo del servicio de análisis", ex);
        return error(HttpStatus.BAD_GATEWAY, "ANALYSIS_SERVICE_ERROR", ex.getMessage());
    }

    @ExceptionHandler(DuplicatePatientException.class)
    public ResponseEntity<ApiErrorDTO> handleDuplicatePatient(DuplicatePatientException ex) {
        // Además del mensaje, se marca el campo del DNI en el formulario.
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ApiErrorDTO("DUPLICATE_PATIENT", ex.getMessage(), Map.of("personalId", ex.getMessage()), null));
    }

    @ExceptionHandler(StudyAlreadyExistsException.class)
    public ResponseEntity<ApiErrorDTO> handleStudyAlreadyExists(StudyAlreadyExistsException ex) {
        return error(HttpStatus.CONFLICT, "STUDY_ALREADY_EXISTS", ex.getMessage());
    }

    // ---------- Errores de la petición ----------

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorDTO> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(fieldError -> fieldErrors.put(fieldError.getField(), fieldError.getDefaultMessage()));
        return ResponseEntity.badRequest()
                .body(new ApiErrorDTO("VALIDATION_ERROR", "Hay datos que no son válidos: revisa los campos marcados.", fieldErrors, null));
    }

    // Cuerpo JSON mal formado o con un valor del tipo equivocado (p. ej. texto en un campo numérico).
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorDTO> handleUnreadableBody(HttpMessageNotReadableException ex) {
        return error(HttpStatus.BAD_REQUEST, "INVALID_REQUEST", "Los datos enviados no tienen un formato válido.");
    }

    // Parámetro de la URL con un formato incorrecto (p. ej. un identificador de paciente que no es un UUID).
    @ExceptionHandler(TypeMismatchException.class)
    public ResponseEntity<ApiErrorDTO> handleTypeMismatch(TypeMismatchException ex) {
        return error(HttpStatus.BAD_REQUEST, "INVALID_REQUEST", "Algún dato de la petición no tiene un formato válido.");
    }

    @ExceptionHandler(MissingServletRequestPartException.class)
    public ResponseEntity<ApiErrorDTO> handleMissingFile(MissingServletRequestPartException ex) {
        return error(HttpStatus.BAD_REQUEST, "MISSING_FILE", "No se ha enviado ningún fichero.");
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiErrorDTO> handleFileTooLarge(MaxUploadSizeExceededException ex) {
        return error(HttpStatus.CONTENT_TOO_LARGE, "FILE_TOO_LARGE", "El fichero supera el tamaño máximo permitido.");
    }

    // ---------- Cualquier otro error ----------

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorDTO> handleUnexpected(Exception ex) {
        // Errores estándar de Spring (ruta que no existe, método no permitido...): ya traen su código HTTP.
        if (ex instanceof ErrorResponse springError) {
            HttpStatusCode status = springError.getStatusCode();
            return error(status, "REQUEST_ERROR", requestErrorMessage(status));
        }
        // Error no previsto: se guarda en el log para poder investigarlo, pero al usuario no se le enseñan detalles técnicos.
        log.error("Error inesperado", ex);
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "UNEXPECTED_ERROR",
                "Ha ocurrido un error inesperado en el servidor. Inténtalo de nuevo más tarde.");
    }

    private String requestErrorMessage(HttpStatusCode status) {
        return switch (status.value()) {
            case 404 -> "El recurso solicitado no existe.";
            case 405 -> "Esta operación no está permitida.";
            case 413 -> "El fichero supera el tamaño máximo permitido.";
            default -> status.is4xxClientError()
                    ? "La petición no es válida."
                    : "No se ha podido completar la operación. Inténtalo de nuevo más tarde.";
        };
    }

    private ResponseEntity<ApiErrorDTO> error(HttpStatusCode status, String code, String message) {
        return ResponseEntity.status(status).body(ApiErrorDTO.of(code, message));
    }
}
