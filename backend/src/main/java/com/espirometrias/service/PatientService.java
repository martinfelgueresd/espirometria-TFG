package com.espirometrias.service;

import com.espirometrias.dto.PageDTO;
import com.espirometrias.dto.PatientDTO;
import com.espirometrias.dto.PatientSummaryDTO;
import com.espirometrias.dto.PatientUpdateDTO;
import com.espirometrias.exception.DuplicatePatientException;
import com.espirometrias.exception.PatientNotFoundException;
import com.espirometrias.mapper.PatientMapper;
import com.espirometrias.model.Patient;
import com.espirometrias.model.PatientStatus;
import com.espirometrias.repository.PatientRepository;
import com.espirometrias.util.PersonalIdNormalizer;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PatientService {

    private static final int MAX_PAGE_SIZE = 100;

    // Columnas por las que se puede ordenar el listado y propiedades de Patient que usa cada una.
    // Solo se admiten estas, para no ordenar por cualquier campo que llegue en la petición.
    private static final Map<String, List<String>> SORT_FIELDS = Map.of(
            "personalId", List.of("personalId"),
            "name", List.of("name", "surname"),
            "age", List.of("birthDate"),
            "gender", List.of("gender"),
            "smoker", List.of("smoker"),
            "studyCount", List.of("studyCount"),
            "status", List.of("studyCount"));

    // La edad no está en la base de datos (se calcula al leer): ordenar por edad es ordenar por fecha de nacimiento
    // en sentido contrario, porque más edad es una fecha de nacimiento más antigua.
    private static final Set<String> REVERSED_SORT_FIELDS = Set.of("age");

    private final PatientRepository patientRepository;
    private final PatientMapper patientMapper;

    public PatientDTO create(PatientDTO patient)
    {
        // El DNI se guarda normalizado para que no se pueda repetir con otras mayúsculas, espacios o guiones.
        String personalId = PersonalIdNormalizer.normalize(patient.getPersonalId());
        if(patientRepository.existsByPersonalId(personalId))
            throw new DuplicatePatientException(personalId);
        Patient p = patientMapper.toEntity(patient);
        p.setPersonalId(personalId);
        patientRepository.save(p);
        return patientMapper.toDTO(p);
    }

    public void delete(UUID id)
    {
        patientRepository.delete(findPatient(id));
    }

    public PatientDTO getById(UUID id)
    {
        return patientMapper.toDTO(findPatient(id));
    }

    // Una página del listado de pacientes, filtrada por nombre o DNI y ordenada por la columna pedida.
    public PageDTO<PatientSummaryDTO> getPatients(int page, int size, String sort, String dir, String search)
    {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.clamp(size, 1, MAX_PAGE_SIZE), buildSort(sort, dir));

        Page<Patient> patients = search.isBlank()
                ? patientRepository.findAll(pageable)
                : patientRepository.search(search.trim(), pageable);

        return PageDTO.from(patients.map(this::toSummary));
    }

    public PatientDTO editPatient(UUID id, PatientUpdateDTO patient)
    {
        Patient p = findPatient(id);

        p.setHeight(patient.getHeight());
        p.setWeight(patient.getWeight());
        p.setSmoker(patient.getSmoker());
        p.setEthnicGroup(patient.getEthnicGroup());

        patientRepository.save(p);
        return patientMapper.toDTO(p);
    }

    private Patient findPatient(UUID id)
    {
        return patientRepository.findById(id)
                .orElseThrow(() -> new PatientNotFoundException(id));
    }

    private PatientSummaryDTO toSummary(Patient patient)
    {
        PatientSummaryDTO summary = patientMapper.toSummaryDTO(patient);
        // Un paciente es nuevo mientras no tiene ningún estudio.
        summary.setStatus(patient.getStudyCount() == 0 ? PatientStatus.NEW : PatientStatus.ACTIVE);
        return summary;
    }

    // Ordena por la columna pedida (por nombre si no es una de las permitidas) y después por id,
    // para que el orden sea siempre el mismo y ningún paciente se repita o se salte entre páginas.
    private Sort buildSort(String sort, String dir)
    {
        Sort.Direction direction = Sort.Direction.fromOptionalString(dir).orElse(Sort.Direction.ASC);
        if (REVERSED_SORT_FIELDS.contains(sort)) {
            direction = direction.isAscending() ? Sort.Direction.DESC : Sort.Direction.ASC;
        }
        List<String> properties = SORT_FIELDS.getOrDefault(sort, SORT_FIELDS.get("name"));
        return Sort.by(direction, properties.toArray(String[]::new)).and(Sort.by("id"));
    }
}
