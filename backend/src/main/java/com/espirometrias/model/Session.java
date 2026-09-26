package com.espirometrias.model;

import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Session {
    @Id
    private UUID id = UuidCreator.getTimeOrderedEpoch();
    private String type;
    private String sessionGrade;

    // Resumen de la sesión. Lo calcula SessionService al guardar el estudio; como las maniobras de un estudio
    // no cambian, se guarda para no tener que cargar todas las maniobras cada vez que se muestra.
    private Integer maneuverCount;
    private Integer acceptableCount;
    private Integer bestManeuverOrder;
    private Double fvc;
    private Double fev1;
    private Double fev1Fvc;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL)
    private List<Spirometry> spirometries;
}
