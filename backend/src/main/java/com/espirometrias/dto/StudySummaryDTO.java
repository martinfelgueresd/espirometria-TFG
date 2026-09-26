package com.espirometrias.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

// Resumen de un estudio para la tabla del detalle del paciente: sin maniobras ni curvas.
@Getter
@Setter
@NoArgsConstructor
public class StudySummaryDTO {

    private String studyUUID;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;
    private String operator;
    private String protocol;
    private SessionSummaryDTO preSession;
    private SessionSummaryDTO postSession;
}
