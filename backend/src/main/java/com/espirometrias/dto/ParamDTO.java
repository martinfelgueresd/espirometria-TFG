package com.espirometrias.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ParamDTO {

    private String name;
    private Double theoretical;
    private Double test;
    private Double pctTheoretical;
}