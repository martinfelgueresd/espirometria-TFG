package com.espirometrias.dto;

import lombok.*;

import java.time.LocalDate;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PatientResponse {

    private String nombre;
    private LocalDate fecha_nacimiento;
    private Integer edad;
    private String sexo;
    private Double altura;
    private Double peso;
    private Boolean fumador;
    private String grupoEtnico;
}
