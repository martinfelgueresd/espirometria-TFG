package com.espirometrias.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

// Datos del paciente tal y como vienen en el XML. Los lee el servicio de análisis (Python),
// que es el único que abre el XML; el backend los usa para identificar o crear al paciente.
@Getter
@Setter
@NoArgsConstructor
public class XmlPatientDTO {

    private String personalId;
    private String name;
    private String surname;

    @JsonProperty("birth_date")
    private LocalDate birthDate;
    private String gender;
    private Double height;
    private Double weight;
    private Boolean smoker;

    @JsonProperty("ethnic_group")
    private String ethnicGroup;
}
