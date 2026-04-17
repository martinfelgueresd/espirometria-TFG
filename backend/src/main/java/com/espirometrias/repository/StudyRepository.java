package com.espirometrias.repository;

import com.espirometrias.model.Patient;
import com.espirometrias.model.Study;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface StudyRepository extends JpaRepository<Study, UUID> {

    boolean existsByStudyUUID(String studyUUID);
}
