package com.espirometrias.model.resultado;

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
public class Selection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "spirometryResult_id")
    private SpirometryResult spirometryResult;

    @OneToMany(mappedBy = "selection")
    private List<PhaseResult> phaseResults;
}
