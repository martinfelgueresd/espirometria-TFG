package com.espirometrias.controller;

import com.espirometrias.dto.PatientDTO;
import com.espirometrias.service.PatientService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @PostMapping
    public ResponseEntity<PatientDTO> create(@RequestBody PatientDTO patient) {
        return ResponseEntity.status(HttpStatus.CREATED).body(patientService.create(patient));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        patientService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<PatientDTO> editPatient(@PathVariable Long id, @RequestBody PatientDTO patient) {
        return ResponseEntity.ok(patientService.editPatient(id, patient));
    }

    @GetMapping
    public ResponseEntity<List<PatientDTO>> getPatients() {
        return ResponseEntity.ok(patientService.getPatients());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientDTO> getPatient(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.getById(id));
    }
}