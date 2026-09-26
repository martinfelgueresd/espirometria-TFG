package com.espirometrias.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "studies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Study {
    @Id
    private UUID id = UuidCreator.getTimeOrderedEpoch();

    // Versión del registro (bloqueo optimista). Además, como el id se asigna al crear el objeto, Spring Data no puede
    // saber por el id si el estudio es nuevo; con la versión a null sí lo sabe y hace persist en vez de merge,
    // así Hibernate no consulta la base de datos por cada sesión, maniobra, curva y parámetro antes de insertarlos.
    @Version
    private Long version;

    @Column(unique = true)
    private String studyUUID;

    private LocalDate date;
    private String operator;
    private String protocol;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "pre_session_id")
    private Session preSession;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "post_session_id")
    private Session postSession;
}
