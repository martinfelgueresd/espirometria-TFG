package com.espirometrias.controller;

import com.espirometrias.dto.PatientRequest;
import com.espirometrias.dto.PatientResponse;
import com.espirometrias.service.PatientService;
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

    @PostMapping("/create")
    public PatientResponse create(@RequestBody PatientRequest patient)
    {
        System.out.println(patient);
        return patientService.create(patient);
    }

    @DeleteMapping("/delete/{id}")
    public void delete(@PathVariable Long id)
    {
        patientService.delete(id);
    }

    @PostMapping("/edit/{id}")
    public PatientResponse editPatient(@RequestBody PatientRequest patient)
    {
        return patientService.editPatient(patient);
    }

    @GetMapping("/list")
    public List<PatientResponse> getPatients()
    {
        return patientService.getPatients();
    }

    @GetMapping("/get/{id}")
    public PatientResponse getPatient(@PathVariable Long id)
    {
        return patientService.getById(id);
    }
}
