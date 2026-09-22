package com.espirometrias.mapper;

import com.espirometrias.dto.SpirometryDTO;
import com.espirometrias.model.Spirometry;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = {CurveMapper.class, ParamMapper.class})
public interface SpirometryMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "session", ignore = true)
    Spirometry toEntity(SpirometryDTO dto);

    @AfterMapping
    default void linkChildren(@MappingTarget Spirometry spirometry) {
        if (spirometry.getCurves() != null) {
            spirometry.getCurves().forEach(curve -> curve.setSpirometry(spirometry));
        }
        if (spirometry.getParams() != null) {
            spirometry.getParams().forEach(param -> param.setSpirometry(spirometry));
        }
    }
}