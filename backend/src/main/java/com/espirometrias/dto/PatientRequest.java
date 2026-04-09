package com.espirometrias.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.Column;
import lombok.*;

import java.time.LocalDate;

@Setter
@Getter
public class PatientRequest {
    @Column(unique = true)
    private String personal_id;
    private String name;
    private String surname;
    private LocalDate birth_date;
    private Integer age;
    private String gender;
    private Double height;
    private Double weight;
    private Double imc;
    private Boolean smoker;
    private String ethnic_group;

    @Override
    public String toString(){
        return name + " --> " + age;
    }
}
