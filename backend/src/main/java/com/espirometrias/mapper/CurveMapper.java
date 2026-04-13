package com.espirometrias.mapper;

import com.espirometrias.dto.CurveDTO;
import com.espirometrias.model.grafica.Curve;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = PointMapper.class)
public interface CurveMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "spirometry", ignore = true)
    Curve toEntity(CurveDTO dto);
}