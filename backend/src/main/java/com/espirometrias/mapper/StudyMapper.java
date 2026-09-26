package com.espirometrias.mapper;

import com.espirometrias.dto.StudyDTO;
import com.espirometrias.dto.StudySummaryDTO;
import com.espirometrias.model.Study;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = SessionMapper.class)
public interface StudyMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "patient", ignore = true)
    Study toEntity(StudyDTO dto);

    // Estudio completo, con maniobras, curvas y parámetros (detalle del estudio).
    StudyDTO toDTO(Study study);

    // Estudio resumido, sin maniobras (tabla de estudios del paciente).
    StudySummaryDTO toSummaryDTO(Study study);
}
