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
@Table(name = "spirometries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Spirometry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "spirometry_order")
    private Integer order;
    private LocalTime hour;
    private Boolean acceptable;

    @ManyToOne
    @JoinColumn(name = "session_id")
    private Session session;

    @OneToMany(mappedBy = "spirometry", cascade = CascadeType.ALL)
    private List<Curve> curves;

    @OneToMany(mappedBy = "spirometry", cascade = CascadeType.ALL)
    private List<Param> params;
}
