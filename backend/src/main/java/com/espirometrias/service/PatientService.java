package com.espirometrias.service;

import com.espirometrias.dto.PatientDTO;
import com.espirometrias.exception.DuplicatePatientException;
import com.espirometrias.mapper.PatientMapper;
import com.espirometrias.model.Patient;
import com.espirometrias.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final PatientMapper patientMapper;

    public PatientDTO create(PatientDTO patient)
    {
        if(patientRepository.existsByPersonalId(patient.getPersonalId()))
            throw new DuplicatePatientException(patient.getPersonalId());
        Patient p = patientMapper.toEntity(patient);
        patientRepository.save(p);
        return patientMapper.toDTO(p);
    }

    public void delete(UUID id)
    {
        Patient p = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient no found"));
        patientRepository.delete(p);
    }

    public PatientDTO getById(UUID id)
    {
        Patient p = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient no found"));
        return patientMapper.toDTO(p);
    }

    public List<PatientDTO> getPatients()
    {
        return patientRepository.findAll().stream()
                .map(patientMapper::toDTO).toList();
    }

    public PatientDTO editPatient(UUID id, PatientDTO patient)
    {
        Patient p = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        p.setHeight(patient.getHeight());
        p.setWeight(patient.getWeight());
        p.setSmoker(patient.getSmoker());
        p.setEthnicGroup(patient.getEthnicGroup());

        patientRepository.save(p);
        return patientMapper.toDTO(p);
    }
}