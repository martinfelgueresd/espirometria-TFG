package com.espirometrias.mapper;

import com.espirometrias.dto.StudyDTO;
import com.espirometrias.model.Study;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface StudyMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "patient", ignore = true)
    Study toEntity(StudyDTO dto);
}
