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
@Table(name = "sessions")
public class Session {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDate date;
    private Double temperature;
    private Double pression;
    private Double humidity;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL)
    private List<Spirometry> spirometries;

    @OneToOne
    @JoinColumn(name = "resultadoEspirometria_id")
    private SpirometryResult resultadoEspirometria;
}
