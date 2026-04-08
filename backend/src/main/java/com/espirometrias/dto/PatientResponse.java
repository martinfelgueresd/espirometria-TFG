package com.espirometrias.dto;

import jakarta.persistence.Column;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PatientResponse {
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
    private String ethnic_group;
}
