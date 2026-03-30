package com.espirometrias.model;

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
public class Param {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private Double teorico;
    private Double prueba;
    private Double pctTeorico;

    @ManyToOne
    @JoinColumn(name = "maniobra_id")
    private Spirometry maniobra;
}
