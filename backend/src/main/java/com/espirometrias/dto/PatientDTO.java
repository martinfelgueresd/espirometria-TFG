package com.espirometrias.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class PatientDTO {
    private Long id;
    private String personalId;
    private String name;
    private String surname;

    @JsonProperty("birth_date")
    private LocalDate birthDate;
    private Integer age;
    private String gender;
    private Double height;
    private Double weight;
    private Double imc;
    private Boolean smoker;

    @JsonProperty("ethnic_group")
    private String ethnicGroup;

    private List<StudyDTO> studies;
}