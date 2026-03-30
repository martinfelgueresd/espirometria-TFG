package com.espirometrias.model;

import com.espirometrias.model.grafica.Curve;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Spirometry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String phase;
    private Integer order;
    private LocalTime hora;
    private Boolean aceptable;
    private Character grado;
    private String motivoRechazo;

    @ManyToOne
    @JoinColumn(name = "sesion_id")
    private Session sesion;

    @OneToMany(mappedBy = "maniobra", cascade = CascadeType.ALL)
    private List<Curve> curvas;

    @OneToMany(mappedBy = "maniobra", cascade = CascadeType.ALL)
    private List<Param> parametros;
}
