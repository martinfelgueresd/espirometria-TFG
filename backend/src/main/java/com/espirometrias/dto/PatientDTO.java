package com.espirometrias.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class PatientDTO {
    private UUID id;

    @NotBlank(message = "Su identificador es obligatorio")
    @Pattern(regexp = "^[a-zA-Z0-9]+$", message = "El identificador solo puede contener letras y números")
    private String personalId;

    @NotBlank
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$", message = "El nombre solo puede contener letras")
    private String name;

    @NotBlank
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$", message = "Los apellidos solo pueden contener letras")
    private String surname;

    @NotNull(message = "La fecha es obligatoria")
    @Past(message = "La fecha de nacimiento debe ser en el pasado")
    @JsonProperty("birth_date")
    private LocalDate birthDate;

    private Integer age;

    @NotBlank(message = "El genero es obligatoria")
    private String gender;

    @NotNull(message = "La altura es obligatoria")
    @Min(value = 50, message = "La altura mínima es 50 cm")
    @Max(value = 250, message = "La altura máxima es 250 cm")
    private Double height;

    @NotNull(message = "El peso es obligatoria")
    @Min(value = 10, message = "El peso mínimo es 10 kg")
    @Max(value = 300, message = "El peso máximo es 300 kg")
    private Double weight;

    private Double imc;

    @NotNull(message = "Debe indicar si es fumador o no")
    private Boolean smoker;

    @JsonProperty("ethnic_group")
    private String ethnicGroup;

    private List<StudyDTO> studies;
}