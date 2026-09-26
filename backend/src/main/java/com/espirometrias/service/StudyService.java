package com.espirometrias.service;

import com.espirometrias.client.PythonApiClient;
import com.espirometrias.dto.AnalysisDTO;
import com.espirometrias.dto.StudyDTO;
import com.espirometrias.dto.XmlPatientDTO;
import com.espirometrias.exception.InvalidXmlException;
import com.espirometrias.exception.PatientNotFoundException;
import com.espirometrias.exception.PatientXmlMismatchException;
import com.espirometrias.exception.StudyAlreadyExistsException;
import com.espirometrias.exception.StudyNotFoundException;
import com.espirometrias.mapper.StudyMapper;
import com.espirometrias.model.Patient;
import com.espirometrias.model.Study;
import com.espirometrias.repository.PatientRepository;
import com.espirometrias.repository.StudyRepository;
import com.espirometrias.util.PersonalIdNormalizer;
import lombok.RequiredArgsConstructor;
import org.apache.commons.text.WordUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

// El XML solo lo lee el servicio de análisis (Python). Este servicio recibe el resultado del análisis
// y aplica las reglas del dominio: comprobar el paciente, evitar estudios duplicados y guardar.
@Service
@RequiredArgsConstructor
public class StudyService {

    private final StudyRepository studyRepository;
    private final PatientRepository patientRepository;
    private final StudyMapper studyMapper;
    private final SessionService sessionService;
    private final PythonApiClient pythonApiClient;

    // Estudio completo (maniobras, curvas y parámetros) para el detalle del estudio.
    public StudyDTO getStudy(String studyUUID) {
        return studyMapper.toDTO(findStudy(studyUUID));
    }

    public void deleteStudy(String studyUUID) {
        studyRepository.delete(findStudy(studyUUID));
    }

    // Sube un estudio a un paciente concreto: el XML tiene que ser de ese paciente.
    public void uploadStudy(UUID patientId, MultipartFile file) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));

        AnalysisDTO analysis = pythonApiClient.analizar(file);
        XmlPatientDTO xmlPatient = analysis.getPatient();
        String dni = requireDni(xmlPatient);

        if (!dni.equals(PersonalIdNormalizer.normalize(patient.getPersonalId())))
            throw new PatientXmlMismatchException(capitalize(xmlPatient.getSurname()), capitalize(xmlPatient.getName()), dni);

        checkStudyIsNew(analysis.getStudy());
        saveStudy(analysis.getStudy(), patient);
    }

    // Sube un estudio buscando al paciente por el DNI del XML. Si no existe, lanza PatientNotFoundException
    // con sus datos para que el usuario pueda decidir crearlo.
    public void uploadStudy(MultipartFile file) {
        AnalysisDTO analysis = pythonApiClient.analizar(file);
        XmlPatientDTO xmlPatient = analysis.getPatient();
        String dni = requireDni(xmlPatient);

        Patient patient = patientRepository.findByPersonalId(dni)
                .orElseThrow(() -> new PatientNotFoundException(dni, capitalize(xmlPatient.getName()), capitalize(xmlPatient.getSurname())));

        checkStudyIsNew(analysis.getStudy());
        saveStudy(analysis.getStudy(), patient);
    }

    // Sube un estudio y, si el paciente del XML no existe, lo crea con los datos del XML.
    // Primero se analiza el XML y después se guardan paciente y estudio en la misma transacción:
    // si algo falla, no queda un paciente creado sin su estudio.
    @Transactional
    public void createPatientAndUploadStudy(MultipartFile file) {
        AnalysisDTO analysis = pythonApiClient.analizar(file);
        XmlPatientDTO xmlPatient = analysis.getPatient();
        String dni = requireDni(xmlPatient);

        checkStudyIsNew(analysis.getStudy());

        Patient patient = patientRepository.findByPersonalId(dni)
                .orElseGet(() -> patientRepository.save(toNewPatient(dni, xmlPatient)));
        saveStudy(analysis.getStudy(), patient);
    }

    // Guarda el estudio analizado con el resumen de cada sesión ya calculado.
    private void saveStudy(StudyDTO studyDTO, Patient patient) {
        Study study = studyMapper.toEntity(studyDTO);
        study.setPatient(patient);
        sessionService.calculateSummary(study.getPreSession());
        sessionService.calculateSummary(study.getPostSession());
        studyRepository.save(study);
    }

    private Study findStudy(String studyUUID) {
        return studyRepository.findByStudyUUID(studyUUID)
                .orElseThrow(() -> new StudyNotFoundException(studyUUID));
    }

    private void checkStudyIsNew(StudyDTO study) {
        if (study == null || study.getStudyUUID() == null || study.getStudyUUID().isBlank())
            throw new InvalidXmlException("El XML no contiene el identificador de la sesión y no puede ser procesado.");

        if (studyRepository.existsByStudyUUID(study.getStudyUUID()))
            throw new StudyAlreadyExistsException();
    }

    // DNI del XML ya normalizado (sin espacios ni guiones y en mayúsculas), igual que se guarda en la base de datos.
    private String requireDni(XmlPatientDTO xmlPatient) {
        String dni = xmlPatient != null ? PersonalIdNormalizer.normalize(xmlPatient.getPersonalId()) : null;
        if (dni == null || dni.isBlank())
            throw new InvalidXmlException("El XML no contiene un DNI identificativo del paciente y no puede ser procesado.");
        return dni;
    }

    // Paciente nuevo con los datos que el servicio de análisis ha leído del XML.
    private Patient toNewPatient(String dni, XmlPatientDTO xmlPatient) {
        if (xmlPatient.getBirthDate() == null)
            throw new InvalidXmlException("El XML no contiene la fecha de nacimiento del paciente y no puede ser procesado.");

        Patient patient = new Patient();
        patient.setPersonalId(dni);
        patient.setName(capitalize(xmlPatient.getName()));
        patient.setSurname(capitalize(xmlPatient.getSurname()));
        patient.setBirthDate(xmlPatient.getBirthDate());
        patient.setGender(xmlPatient.getGender());
        patient.setHeight(xmlPatient.getHeight());
        patient.setWeight(xmlPatient.getWeight());
        patient.setSmoker(Boolean.TRUE.equals(xmlPatient.getSmoker()));
        patient.setEthnicGroup(xmlPatient.getEthnicGroup());
        return patient;
    }

    // Los XML traen los nombres en mayúsculas o minúsculas según el equipo: se guardan como "Nombre Apellido".
    private String capitalize(String text) {
        return WordUtils.capitalizeFully(text);
    }
}
