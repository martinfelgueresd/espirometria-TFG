package com.espirometrias.model.grafica;

import com.espirometrias.model.CurveType;
import com.espirometrias.model.Spirometry;
import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

@Entity
@Table(name = "curves")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Curve {
    @Id
    private UUID id = UuidCreator.getTimeOrderedEpoch();
    private CurveType curveType;

    // Coordenadas de los puntos: el punto i es (x[i], y[i]). Se guardan como dos arrays de PostgreSQL en la
    // propia fila de la curva, en lugar de una fila por punto: un estudio pasa de ~11.000 filas a unas decenas.
    @JdbcTypeCode(SqlTypes.ARRAY)
    private double[] x;

    @JdbcTypeCode(SqlTypes.ARRAY)
    private double[] y;

    @ManyToOne
    @JoinColumn(name = "spirometry_id")
    private Spirometry spirometry;
}
