package com.espirometrias.dto;

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

    // Nombres y apellidos: letras de cualquier idioma (tildes, ü, ç...), espacios, guiones y apóstrofos,
    // empezando por una letra. Así se admiten nombres como "Argüelles", "María-José" u "O'Connor".
    private static final String NAME_PATTERN = "^\\p{L}[\\p{L} '’-]*$";

    private UUID id;

    @NotBlank(message = "Su identificador es obligatorio")
    @Pattern(regexp = "^[a-zA-Z0-9]+$", message = "El identificador solo puede contener letras y números")
    private String personalId;

    @NotBlank(message = "El nombre es obligatorio")
    @Pattern(regexp = NAME_PATTERN, message = "El nombre solo puede contener letras, espacios, guiones y apóstrofos")
    private String name;

    @NotBlank(message = "Los apellidos son obligatorios")
    @Pattern(regexp = NAME_PATTERN, message = "Los apellidos solo pueden contener letras, espacios, guiones y apóstrofos")
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

    // Estudios resumidos (sin curvas): el detalle completo de cada uno se pide aparte (GET /studies/{studyUUID}).
    private List<StudySummaryDTO> studies;
}