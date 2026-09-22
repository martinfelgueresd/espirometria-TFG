package com.espirometrias.mapper;

import com.espirometrias.dto.CurveDTO;
import com.espirometrias.model.grafica.Curve;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = PointMapper.class)
public interface CurveMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "spirometry", ignore = true)
    Curve toEntity(CurveDTO dto);

    @AfterMapping
    default void linkPoints(@MappingTarget Curve curve) {
        if (curve.getPoints() != null) {
            curve.getPoints().forEach(point -> point.setCurve(curve));
        }
    }
}