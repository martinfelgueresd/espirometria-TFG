package com.espirometrias.mapper;

import com.espirometrias.dto.SessionDTO;
import com.espirometrias.model.Session;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = SpirometryMapper.class)
public interface SessionMapper {

    @Mapping(target = "id", ignore = true)
    Session toEntity(SessionDTO dto);

    @AfterMapping
    default void linkSpirometries(@MappingTarget Session session) {
        if (session.getSpirometries() != null) {
            session.getSpirometries().forEach(spirometry -> spirometry.setSession(session));
        }
    }
}