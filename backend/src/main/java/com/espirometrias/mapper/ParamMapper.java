package com.espirometrias.mapper;

import com.espirometrias.dto.ParamDTO;
import com.espirometrias.model.Param;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ParamMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "spirometry", ignore = true)
    Param toEntity(ParamDTO dto);
}