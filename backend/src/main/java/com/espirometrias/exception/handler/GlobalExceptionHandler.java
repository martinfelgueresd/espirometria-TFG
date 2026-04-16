package com.espirometrias.exception.handler;

import com.espirometrias.exception.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(PatientXmlMismatchException.class)
    public ResponseEntity<String> handlePatientMismatch(PatientXmlMismatchException ex)
    {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }

    @ExceptionHandler(InvalidXmlException.class)
    public ResponseEntity<String> handleInvalidXml(InvalidXmlException ex)
    {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }

    @ExceptionHandler(PatientNotFoundException.class)
    public ResponseEntity<Map<String, String>> handlePatientNotFound(PatientNotFoundException ex)
    {
        Map<String, String> body = new HashMap<>();
        body.put("message", ex.getMessage());
        body.put("dni", ex.getDni());
        body.put("firstName", ex.getFirstName());
        body.put("lastName", ex.getLastName());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(DuplicatePatientException.class)
    public ResponseEntity<String> handleDuplicatePatient(DuplicatePatientException ex)
    {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }

    @ExceptionHandler(StudyAlreadyExistsException.class)
    public ResponseEntity<String> handleStudyAlreadyExists(StudyAlreadyExistsException ex)
    {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }
}
