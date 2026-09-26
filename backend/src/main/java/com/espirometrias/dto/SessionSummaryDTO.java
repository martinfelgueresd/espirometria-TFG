package com.espirometrias.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Resumen de una sesión (Pre o Post) sin sus maniobras, para el detalle del paciente.
// Los valores los calcula el backend (SessionService): el frontend solo los muestra.
@Getter
@Setter
@NoArgsConstructor
public class SessionSummaryDTO {

    private String type;
    private String sessionGrade;
    private Integer maneuverCount;
    private Integer acceptableCount;
    private Integer bestManeuverOrder;
    private Double fvc;
    private Double fev1;
    private Double fev1Fvc;
}
