package com.espirometrias.model;

import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
    private Integer age;
    private String gender;
    private Double height;
    private Double weight;
    private Double imc;
    private Boolean smoker;

    @Column(name = "ethnic_group")
    private String ethnicGroup;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    private List<Study> studies = new ArrayList<>();

    @PrePersist
    public void calculateImcAndAge()
    {
        if (height != null && weight != null && height > 0) {
            double resultado = weight / Math.pow(height / 100.0, 2);
            this.imc = Math.round(resultado * 100.0) / 100.0;
        }
        this.age = Period.between(birthDate, LocalDate.now()).getYears();
    }
}