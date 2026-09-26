package com.espirometrias.dto;

import com.espirometrias.model.PatientStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

// Paciente para el listado: solo lo que muestra la tabla, sin estudios ni curvas.
@Getter
@Setter
@NoArgsConstructor
public class PatientSummaryDTO {

    private UUID id;
    private String personalId;
    private String name;
    private String surname;
    private Integer age;
    private String gender;
    private Boolean smoker;
    private int studyCount;
    private PatientStatus status;
}
