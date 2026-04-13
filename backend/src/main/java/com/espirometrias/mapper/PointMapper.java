package com.espirometrias.mapper;

import com.espirometrias.dto.PointDTO;
import com.espirometrias.model.grafica.Point;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PointMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "curve", ignore = true)
    Point toEntity(PointDTO dto);
}