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
