package com.espirometrias.mapper;

import com.espirometrias.dto.SpirometryDTO;
import com.espirometrias.model.Spirometry;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {CurveMapper.class, ParamMapper.class})
public interface SpirometryMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "session", ignore = true)
    Spirometry toEntity(SpirometryDTO dto);
}