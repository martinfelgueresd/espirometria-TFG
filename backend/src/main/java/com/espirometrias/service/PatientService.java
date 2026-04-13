package com.espirometrias.service;

import com.espirometrias.dto.PatientDTO;
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

    public PatientDTO create(PatientDTO patient)
    {
        Patient p = patientMapper.toEntity(patient);
        patientRepository.save(p);
        return patientMapper.toDTO(p);
    }

    public void delete(Long id)
    {
        Patient p = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient no found"));
        patientRepository.delete(p);
    }

    public PatientDTO getById(Long id)
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

    public PatientDTO editPatient(Long id, PatientDTO patient)
    {
        Patient p = patientMapper.toEntity(patient);
        p.setId(id);
        patientRepository.save(p);
        return patientMapper.toDTO(p);
    }
}