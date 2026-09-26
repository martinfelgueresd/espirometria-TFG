package com.espirometrias.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Respuesta del servicio de análisis (Python) para un XML: el paciente leído del XML y el estudio analizado.
@Getter
@Setter
@NoArgsConstructor
public class AnalysisDTO {

    private XmlPatientDTO patient;
    private StudyDTO study;
}
