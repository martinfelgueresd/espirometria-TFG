package com.espirometrias.mapper;

import com.espirometrias.dto.PatientDTO;
import com.espirometrias.dto.PatientSummaryDTO;
import com.espirometrias.model.Patient;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {StudyMapper.class})
public interface PatientMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "imc", ignore = true)
    @Mapping(target = "studies", ignore = true)
    Patient toEntity(PatientDTO dto);

    // Detalle del paciente, con sus estudios resumidos.
    PatientDTO toDTO(Patient patient);

    // Fila del listado. El estado (nuevo/activo) lo decide PatientService.
    @Mapping(target = "status", ignore = true)
    PatientSummaryDTO toSummaryDTO(Patient patient);
}
