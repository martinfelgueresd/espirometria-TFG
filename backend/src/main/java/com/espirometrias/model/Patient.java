package com.espirometrias.model;

import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Formula;

import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "patients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Patient {
    @Id
    private UUID id = UuidCreator.getTimeOrderedEpoch();

    @Column(unique = true)
    private String personalId;
    private String name;
    private String surname;

    @Column(name = "birth_date")
    private LocalDate birthDate;
    private String gender;
    private Double height;
    private Double weight;
    private Double imc;
    private Boolean smoker;

    @Column(name = "ethnic_group")
    private String ethnicGroup;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    @OrderBy("date DESC")
    private List<Study> studies = new ArrayList<>();

    // Número de estudios del paciente. Lo calcula la base de datos al cargar el paciente (no es una columna),
    // así el listado no necesita cargar los estudios solo para contarlos.
    @Formula("(select count(*) from studies s where s.patient_id = id)")
    @Setter(AccessLevel.NONE)
    private int studyCount;

    // La edad no se guarda: se calcula a partir de la fecha de nacimiento cada vez que se lee, así siempre está al día.
    public Integer getAge()
    {
        return birthDate != null ? Period.between(birthDate, LocalDate.now()).getYears() : null;
    }

    @PrePersist
    @PreUpdate
    public void calculateImc()
    {
        if (height != null && weight != null && height > 0) {
            double resultado = weight / Math.pow(height / 100.0, 2);
            this.imc = Math.round(resultado * 100.0) / 100.0;
        }
    }
}