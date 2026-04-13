package com.espirometrias.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class SpirometryDTO {

    private Integer order;

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime hour;

    private Boolean acceptable;
    private String grade;

    @JsonProperty("rejection_reason")
    private String rejectionReason;

    private List<CurveDTO> curves;
    private List<ParamDTO> params;
}