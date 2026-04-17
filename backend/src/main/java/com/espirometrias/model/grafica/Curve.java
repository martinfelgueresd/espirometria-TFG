package com.espirometrias.model.grafica;

import com.espirometrias.model.CurveType;
import com.espirometrias.model.Spirometry;
import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "curves")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Curve {
    @Id
    private UUID id = UuidCreator.getTimeOrderedEpoch();
    private CurveType curveType;

    @OneToMany(mappedBy = "curve", cascade = CascadeType.ALL)
    private List<Point> points;

    @ManyToOne
    @JoinColumn(name = "spirometry_id")
    private Spirometry spirometry;
}
