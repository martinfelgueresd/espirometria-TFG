package com.espirometrias.model;

import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "params")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Param {
    @Id
    private UUID id = UuidCreator.getTimeOrderedEpoch();
    private String name;
    private Double theoretical;
    private Double test;
    private Double pctTheoretical;

    @ManyToOne
    @JoinColumn(name = "spirometry_id")
    private Spirometry spirometry;
}
