package com.espirometrias.model;

import com.espirometrias.model.resultado.SpirometryResult;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Session {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDate fecha;
    private Double temperatura;
    private Double presion;
    private Double humedad;

    @ManyToOne
    @JoinColumn(name = "paciente_id")
    private Patient paciente;

    @OneToMany(mappedBy = "sesion", cascade = CascadeType.ALL)
    private List<Spirometry> maniobras;

    @OneToOne
    @JoinColumn(name = "resultadoEspirometria_id")
    private SpirometryResult resultadoEspirometria;
}
