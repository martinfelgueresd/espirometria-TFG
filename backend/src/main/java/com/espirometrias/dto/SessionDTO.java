package com.espirometrias.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

// Sesión completa (resumen + maniobras con sus curvas y parámetros), para el detalle del estudio.
// También se usa para recibir la sesión del servicio de análisis: en ese caso los campos del resumen
// llegan vacíos, porque los calcula el backend.
@Getter
@Setter
@NoArgsConstructor
public class SessionDTO {

    private String type;
    private String sessionGrade;
    private Integer maneuverCount;
    private Integer acceptableCount;
    private Integer bestManeuverOrder;
    private Double fvc;
    private Double fev1;
    private Double fev1Fvc;
    private List<SpirometryDTO> spirometries;
}
