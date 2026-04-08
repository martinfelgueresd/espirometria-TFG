package com.espirometrias.model.resultado;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Pattern {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String diagnostic;
    private Boolean obstruction;
    private Boolean fvc_low;
    private String severity;
    private String description;

    @OneToOne
    @JoinColumn(name = "interpretation_id")
    private Interpretation interpretation;
}
