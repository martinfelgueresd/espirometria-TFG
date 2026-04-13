package com.espirometrias.service;

import com.espirometrias.client.PythonApiClient;
import com.espirometrias.dto.StudyDTO;
import com.espirometrias.mapper.StudyMapper;
import com.espirometrias.model.Patient;
import com.espirometrias.model.Study;
import com.espirometrias.repository.PatientRepository;
import com.espirometrias.repository.StudyRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class StudyService {

    private final StudyRepository studyRepository;
    private final PatientRepository patientRepository;
    private final StudyMapper studyMapper;
    private final PythonApiClient pythonApiClient;

    public StudyService(StudyRepository studyRepository,
                        PatientRepository patientRepository,
                        StudyMapper studyMapper,
                        PythonApiClient pythonApiClient)
    {
        this.studyRepository = studyRepository;
        this.patientRepository = patientRepository;
        this.studyMapper = studyMapper;
        this.pythonApiClient = pythonApiClient;
    }

    public void uploadStudy(Long patientId, MultipartFile file) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        StudyDTO dto = pythonApiClient.analizar(file);
        Study study = studyMapper.toEntity(dto);
        study.setPatient(patient);

        studyRepository.save(study);
    }
}
