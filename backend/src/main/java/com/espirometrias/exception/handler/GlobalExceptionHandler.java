package com.espirometrias.exception.handler;

import com.espirometrias.exception.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(PatientXmlMismatchException.class)
    public ResponseEntity<Map<String, String>> handlePatientMismatch(PatientXmlMismatchException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(InvalidXmlException.class)
    public ResponseEntity<Map<String, String>> handleInvalidXml(InvalidXmlException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(PatientNotFoundException.class)
    public ResponseEntity<Map<String, String>> handlePatientNotFound(PatientNotFoundException ex) {
        Map<String, String> body = new HashMap<>();
        body.put("message", ex.getMessage());
        body.put("dni", ex.getDni());
        body.put("firstName", ex.getFirstName());
        body.put("lastName", ex.getLastName());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(DuplicatePatientException.class)
    public ResponseEntity<Map<String, String>> handleDuplicatePatient(DuplicatePatientException ex) {
        return ResponseEntity.badRequest().body(Map.of("personalId", ex.getMessage()));
    }

    @ExceptionHandler(StudyAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handleStudyAlreadyExists(StudyAlreadyExistsException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
        return ResponseEntity.badRequest().body(errors);
    }
}