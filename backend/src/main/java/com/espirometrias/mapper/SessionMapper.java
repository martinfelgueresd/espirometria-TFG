package com.espirometrias.mapper;

import com.espirometrias.dto.SessionDTO;
import com.espirometrias.dto.SessionSummaryDTO;
import com.espirometrias.model.Session;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = SpirometryMapper.class)
public interface SessionMapper {

    // El resumen no se copia del DTO: lo calcula SessionService a partir de las maniobras.
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "maneuverCount", ignore = true)
    @Mapping(target = "acceptableCount", ignore = true)
    @Mapping(target = "bestManeuverOrder", ignore = true)
    @Mapping(target = "fvc", ignore = true)
    @Mapping(target = "fev1", ignore = true)
    @Mapping(target = "fev1Fvc", ignore = true)
    Session toEntity(SessionDTO dto);

    SessionDTO toDTO(Session session);

    SessionSummaryDTO toSummaryDTO(Session session);

    @AfterMapping
    default void linkSpirometries(@MappingTarget Session session) {
        if (session.getSpirometries() != null) {
            session.getSpirometries().forEach(spirometry -> spirometry.setSession(session));
        }
    }
}
