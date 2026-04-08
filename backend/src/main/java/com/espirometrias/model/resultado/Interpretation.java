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
public class Interpretation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //ESTO??
    @OneToOne
    @JoinColumn(name = "spirometryResult_id")
    private SpirometryResult spirometryResult;

    @OneToOne(mappedBy = "interpretation")
    private Pattern pattern;

    @OneToOne(mappedBy = "interpretation")
    private BronchodilatorResponse bronchodilatorResponse;

    //VIENE DADO YA DE PYTHON O CALCULAMOS AQUÍ CON LÓGICA
    private String conclusion;

    @ElementCollection
    private List<String> advertences;
}
