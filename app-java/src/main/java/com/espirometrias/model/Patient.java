package com.espirometrias.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private LocalDate fecha_nacimiento;
    private Integer edad;
    private String sexo;
    private Double altura;
    private Double peso;
    private Double imc;
    private Boolean fumador;
    private String grupoEtnico;

    @OneToMany(mappedBy = "paciente")
    private List<Session> sesiones;
}
