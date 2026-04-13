package com.espirometrias.mapper;

import com.espirometrias.dto.SessionDTO;
import com.espirometrias.model.Session;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = SpirometryMapper.class)
public interface SessionMapper {

    @Mapping(target = "id", ignore = true)
    Session toEntity(SessionDTO dto);
}