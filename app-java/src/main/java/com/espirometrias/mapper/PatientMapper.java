package com.espirometrias.mapper;

import com.espirometrias.dto.PatientRequest;
import com.espirometrias.dto.PatientResponse;
import com.espirometrias.model.Patient;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PatientMapper {

    Patient toEntity(PatientRequest request);
    PatientResponse toResponse(Patient paciente);
}