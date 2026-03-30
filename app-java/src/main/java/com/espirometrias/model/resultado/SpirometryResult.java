package com.espirometrias.model.resultado;

import com.espirometrias.model.Session;
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
public class SpirometryResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "sesion_id")
    private Session sesion;

    @OneToOne(mappedBy = "interpretacion")
    private Interpretation interpretacion;

    @OneToOne(mappedBy = "seleccion")
    private Selection seleccion;
}