package com.espirometrias.service;

import com.espirometrias.client.PythonApiClient;
import com.espirometrias.dto.StudyDTO;
import com.espirometrias.exception.InvalidXmlException;
import com.espirometrias.exception.PatientNotFoundException;
import com.espirometrias.exception.PatientXmlMismatchException;
import com.espirometrias.exception.StudyAlreadyExistsException;
import com.espirometrias.mapper.StudyMapper;
import com.espirometrias.model.Patient;
import com.espirometrias.model.Study;
import com.espirometrias.repository.PatientRepository;
import com.espirometrias.repository.StudyRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.text.WordUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.w3c.dom.Document;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathFactory;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudyService {

    private final StudyRepository studyRepository;
    private final PatientRepository patientRepository;
    private final StudyMapper studyMapper;
    private final PythonApiClient pythonApiClient;

    public void deleteStudy(String studyUUID) {
        Study study = studyRepository.findByStudyUUID(studyUUID)
                .orElseThrow(() -> new RuntimeException("Study not found"));
        studyRepository.delete(study);
    }

    public void uploadStudy(UUID patientId, MultipartFile file) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));

        validateXmlBelongsToPatient(file, patient);

        String sessionUUID = extractFieldFromXml(file, "SessionUUIDKey");
        if (studyRepository.existsByStudyUUID(sessionUUID)) {
            throw new StudyAlreadyExistsException();
        }

        StudyDTO dto = pythonApiClient.analizar(file);
        Study study = studyMapper.toEntity(dto);
        study.setPatient(patient);
        studyRepository.save(study);
    }

    public void uploadStudy(MultipartFile file) {
        String dni        = extractFieldFromXml(file, "PersonalID");
        String lastName   = WordUtils.capitalizeFully(extractFieldFromXml(file, "LastName"));
        String firstName  = WordUtils.capitalizeFully(extractFieldFromXml(file, "FirstName"));
        String sessionUUID = extractFieldFromXml(file, "SessionUUIDKey");

        if (dni.isBlank()) {
            throw new InvalidXmlException(
                    "El XML no contiene un DNI identificativo del paciente y no puede ser procesado."
            );
        }

        Optional<Patient> existingPatient = patientRepository.findByPersonalId(dni);

        if (existingPatient.isEmpty()) {
            throw new PatientNotFoundException(dni, firstName, lastName);
        }

        if (studyRepository.existsByStudyUUID(sessionUUID)) {
            throw new StudyAlreadyExistsException();
        }

        StudyDTO dto = pythonApiClient.analizar(file);
        Study study = studyMapper.toEntity(dto);
        study.setPatient(existingPatient.get());
        studyRepository.save(study);
    }

    public void createPatientAndUploadStudy(MultipartFile file) {
        String dni        = extractFieldFromXml(file, "PersonalID");
        String lastName   = WordUtils.capitalizeFully(extractFieldFromXml(file, "LastName"));
        String firstName  = WordUtils.capitalizeFully(extractFieldFromXml(file, "FirstName"));
        String birthDate  = extractFieldFromXml(file, "BirthDate");
        String genderRaw      = extractFieldFromXml(file, "Gender");
        String heightRaw      = extractFieldFromXml(file, "Height");
        String weightRaw      = extractFieldFromXml(file, "Weight");
        String smokingRaw     = extractFieldFromXml(file, "Smoking");
        String ethnicGroupRaw = extractFieldFromXml(file, "EthnicGroupID");
        String sessionUUID    = extractFieldFromXml(file, "SessionUUIDKey");

        if (studyRepository.existsByStudyUUID(sessionUUID)) {
            throw new StudyAlreadyExistsException();
        }

        Patient patient = patientRepository.findByPersonalId(dni).orElseGet(() -> {
            Patient newPatient = new Patient();
            newPatient.setPersonalId(dni);
            newPatient.setSurname(lastName);
            newPatient.setName(firstName);
            newPatient.setBirthDate(LocalDate.parse(birthDate.substring(0, 10)));
            newPatient.setGender("0".equals(genderRaw) ? "F" : "M");
            newPatient.setHeight(Double.parseDouble(heightRaw));
            newPatient.setWeight(Double.parseDouble(weightRaw));
            newPatient.setSmoker("1".equals(smokingRaw));
            newPatient.setEthnicGroup(mapEthnicGroup(ethnicGroupRaw));
            return patientRepository.save(newPatient);
        });

        StudyDTO dto = pythonApiClient.analizar(file);
        System.out.println("StudyUUID recibido: " + dto.getStudyUUID());
        Study study = studyMapper.toEntity(dto);
        study.setPatient(patient);
        studyRepository.save(study);
    }

    private String mapEthnicGroup(String ethnicGroupId) {
        return switch (ethnicGroupId) {
            case "1" -> "caucasian";
            case "2" -> "african_american";
            case "3" -> "asian";
            case "4" -> "hispanic";
            default  -> "other";
        };
    }

    private void validateXmlBelongsToPatient(MultipartFile file, Patient patient) {
        String dni       = WordUtils.capitalizeFully(extractFieldFromXml(file, "PersonalID"));
        String lastName  = WordUtils.capitalizeFully(extractFieldFromXml(file, "LastName"));
        String firstName = WordUtils.capitalizeFully(extractFieldFromXml(file, "FirstName"));

        if (dni.isBlank()) {
            throw new InvalidXmlException(
                    "El XML no contiene un DNI identificativo del paciente y no puede ser procesado."
            );
        }

        if (!dni.equalsIgnoreCase(patient.getPersonalId()))
            throw new PatientXmlMismatchException(lastName, firstName, dni);
    }

    private String extractFieldFromXml(MultipartFile file, String fieldName) {
        try {
            Document doc = DocumentBuilderFactory.newInstance()
                    .newDocumentBuilder()
                    .parse(file.getInputStream());

            XPath xpath = XPathFactory.newInstance().newXPath();
            return xpath.evaluate("//E[@N='" + fieldName + "']/@V", doc);

        } catch (Exception e) {
            throw new InvalidXmlException("El fichero XML no es válido o no puede ser leído.");
        }
    }
}