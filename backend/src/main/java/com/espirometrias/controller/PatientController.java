package com.espirometrias.controller;

import com.espirometrias.dto.PatientDTO;
import com.espirometrias.service.PatientService;
import com.espirometrias.util.ApiConfig;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiConfig.API_BASE_PATH + "/patients")
public class PatientController {

    private final PatientService patientService;

    @PostMapping
    public ResponseEntity<PatientDTO> create(@Valid @RequestBody PatientDTO patient)
    {
        return ResponseEntity.status(HttpStatus.CREATED).body(patientService.create(patient));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id)
    {
        patientService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<PatientDTO> editPatient(@PathVariable UUID id, @RequestBody PatientDTO patient) {
        return ResponseEntity.ok(patientService.editPatient(id, patient));
    }

    @GetMapping
    public ResponseEntity<List<PatientDTO>> getPatients()
    {
        return ResponseEntity.ok(patientService.getPatients());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientDTO> getPatient(@PathVariable UUID id)
    {
        return ResponseEntity.ok(patientService.getById(id));
    }
}