package com.espirometrias.controller;

import com.espirometrias.dto.PatientRequest;
import com.espirometrias.dto.PatientResponse;
import com.espirometrias.service.PatientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService)
    {
        this.patientService = patientService;
    }

    @PostMapping("/")
    public ResponseEntity<PatientResponse> create(@RequestBody PatientRequest patient) {
        return ResponseEntity.status(201).body(patientService.create(patient));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        patientService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<PatientResponse> editPatient(@PathVariable Long id, @RequestBody PatientRequest patient) {
        return ResponseEntity.ok(patientService.editPatient(id, patient));
    }

    @GetMapping("/")
    public ResponseEntity<List<PatientResponse>> getPatients() {
        return ResponseEntity.ok(patientService.getPatients());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientResponse> getPatient(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.getById(id));
    }
}
