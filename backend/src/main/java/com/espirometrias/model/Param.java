package com.espirometrias.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "params")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Param {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private Double theoretical;
    private Double test;
    private Double pctTheoretical;

    @ManyToOne
    @JoinColumn(name = "spirometry_id")
    private Spirometry spirometry;
}
