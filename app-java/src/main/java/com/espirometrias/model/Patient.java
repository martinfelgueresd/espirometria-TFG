package com.espirometrias.model;

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
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true)
    private String personal_id;
    private String name;
    private LocalDate birth_date;
    private Integer age;
    private String gender;
    private Double height;
    private Double weight;
    private Double imc;
    private Boolean smoker;
    private String ethnicGroup;

    @OneToMany(mappedBy = "patient")
    private List<Session> sessions;

    @Override
    public String toString(){
        return name + " --> " + age;
    }
}
