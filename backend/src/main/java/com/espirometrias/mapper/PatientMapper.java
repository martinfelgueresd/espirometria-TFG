package com.espirometrias.mapper;

import com.espirometrias.dto.PatientDTO;
import com.espirometrias.model.Patient;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PatientMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "studies", ignore = true)
    @Mapping(target = "imc", ignore = true)
    Patient toEntity(PatientDTO dto);

    PatientDTO toDTO(Patient patient);
}