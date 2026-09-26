package com.espirometrias.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Datos que se pueden editar de un paciente, con las mismas validaciones que al crearlo.
// El backend valida siempre: la validación del formulario del frontend es solo una ayuda para el usuario.
@Getter
@Setter
@NoArgsConstructor
public class PatientUpdateDTO {

    @NotNull(message = "La altura es obligatoria")
    @Min(value = 50, message = "La altura mínima es 50 cm")
    @Max(value = 250, message = "La altura máxima es 250 cm")
    private Double height;

    @NotNull(message = "El peso es obligatorio")
    @Min(value = 10, message = "El peso mínimo es 10 kg")
    @Max(value = 300, message = "El peso máximo es 300 kg")
    private Double weight;

    @NotNull(message = "Debe indicar si es fumador o no")
    private Boolean smoker;

    @NotBlank(message = "El grupo étnico es obligatorio")
    @JsonProperty("ethnic_group")
    private String ethnicGroup;
}
