package com.espirometrias.model.grafica;

import com.espirometrias.model.CurveType;
import com.espirometrias.model.Spirometry;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "curves")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Curve {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private CurveType curveType;

    @OneToMany(mappedBy = "curve", cascade = CascadeType.ALL)
    private List<Point> points;

    @ManyToOne
    @JoinColumn(name = "spirometry_id")
    private Spirometry spirometry;
}
