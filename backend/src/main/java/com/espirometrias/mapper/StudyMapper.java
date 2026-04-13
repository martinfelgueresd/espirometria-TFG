package com.espirometrias.mapper;

import com.espirometrias.dto.StudyDTO;
import com.espirometrias.model.Study;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {PatientMapper.class, SessionMapper.class})
public interface StudyMapper {

    @Mapping(target = "id", ignore = true)
    Study toEntity(StudyDTO dto);
}
