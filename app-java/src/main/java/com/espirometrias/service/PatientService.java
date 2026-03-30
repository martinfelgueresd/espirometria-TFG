package com.espirometrias.service;

import com.espirometrias.dto.PatientRequest;
import com.espirometrias.dto.PatientResponse;
import com.espirometrias.mapper.PatientMapper;
import com.espirometrias.model.Patient;
import com.espirometrias.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final PatientMapper patientMapper;

    public PatientService(PatientRepository repository, PatientMapper mapper)
    {
        this.patientRepository = repository;
        this.patientMapper = mapper;
    }

    public PatientResponse create(PatientRequest patient)
    {
        Patient p = patientMapper.toEntity(patient);
        patientRepository.save(p);
        return patientMapper.toResponse(p);
    }

    public void delete(Long id)
    {
        Patient p = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient no found"));
        patientRepository.delete(p);
    }

    public PatientResponse getById(long id)
    {
        Patient p = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient no found"));
        return patientMapper.toResponse(p);
    }

    public List<PatientResponse> getPatients()
    {
        return patientRepository.findAll().stream()
                .map(patientMapper::toResponse).toList();
    }

    public PatientResponse editPatient(PatientRequest patient)
    {
        Patient p = patientMapper.toEntity(patient);
        patientRepository.save(p);
        return patientMapper.toResponse(p);
    }
}