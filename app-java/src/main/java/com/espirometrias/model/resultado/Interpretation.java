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
    @JoinColumn(name = "resultadoEspirometria_id")
    private SpirometryResult resultadoEspirometria;

    @OneToMany(mappedBy = "interpretacion", cascade = CascadeType.ALL)
    private List<Pattern> patron;

    @OneToOne(mappedBy = "interpretacion")
    private BronchodilatorResponse rBroncodilatador;

    //VIENE DADO YA DE PYTHON O CALCULAMOS AQUÍ CON LÓGICA
    private String conclusion;
    private List<String> advertencias;
}
