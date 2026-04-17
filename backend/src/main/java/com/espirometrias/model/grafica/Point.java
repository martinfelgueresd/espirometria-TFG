package com.espirometrias.model.grafica;

import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "points")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Point {
    @Id
    private UUID id = UuidCreator.getTimeOrderedEpoch();
    private Double x, y;

    @ManyToOne
    @JoinColumn(name = "curve_id")
    private Curve curve;
}
