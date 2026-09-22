package com.espirometrias.model;

import com.espirometrias.model.grafica.Curve;
import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "spirometries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Spirometry {
    @Id
    private UUID id = UuidCreator.getTimeOrderedEpoch();

    @Column(name = "spirometry_order")
    private Integer order;
    private LocalTime hour;
    private Boolean acceptable;
    private String grade;
    private String rejectionReason;

    @ManyToOne
    @JoinColumn(name = "session_id")
    private Session session;

    @OneToMany(mappedBy = "spirometry", cascade = CascadeType.ALL)
    private List<Curve> curves;

    @OneToMany(mappedBy = "spirometry", cascade = CascadeType.ALL)
    private List<Param> params;
}
