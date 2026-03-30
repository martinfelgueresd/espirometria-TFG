package com.espirometrias.model.resultado;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Pattern {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String diagnostico;
    private Boolean obstruccion;
    private Boolean fvc_baja;
    private String severidad;
    private String descripcion;

    @OneToOne
    @JoinColumn(name = "interpretacion_id")
    private Interpretation interpretacion;
}
