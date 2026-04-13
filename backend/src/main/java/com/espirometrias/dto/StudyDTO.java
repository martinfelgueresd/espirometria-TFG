package com.espirometrias.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class StudyDTO {

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;
    private String operator;
    private String protocol;
    private PatientDTO patient;
    private SessionDTO preSession;
    private SessionDTO postSession;
}
