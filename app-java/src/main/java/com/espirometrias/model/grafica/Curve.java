package com.espirometrias.model.grafica;

import com.espirometrias.model.CurveType;
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
public class Curve {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private CurveType tipoCurva;

    @OneToMany(mappedBy = "curva_id", cascade = CascadeType.ALL)
    private List<Point> puntos;

}
