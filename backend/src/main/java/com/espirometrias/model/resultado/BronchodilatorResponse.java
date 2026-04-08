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
public class BronchodilatorResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Boolean positive;
    private String type;

    @OneToOne
    @JoinColumn(name = "interpretation_id")
    private Interpretation interpretation;
}
