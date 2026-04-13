package com.espirometrias.model.grafica;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "points")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Point {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double x, y;

    @ManyToOne
    @JoinColumn(name = "curve_id")
    private Curve curve;
}
