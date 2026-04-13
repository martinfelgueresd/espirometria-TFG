package com.espirometrias.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class SessionDTO {

    private String type;
    private List<SpirometryDTO> spirometries;
}