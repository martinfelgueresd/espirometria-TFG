package com.espirometrias.model.resultado;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PhaseResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private List<String> signalKeysUsadas;
    private Character gradoSesion;
    private Integer nManiobrasAceptables;
    private Integer nManiobrasTotales;
    private PhaseType tipoFase;
    private String advertencia;

    @ManyToOne
    @JoinColumn(name = "seleccion_id")
    private Selection seleccion;
}
