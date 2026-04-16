package com.espirometrias.repository;

import com.espirometrias.model.Patient;
import com.espirometrias.model.Study;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudyRepository extends JpaRepository<Study, Long> {

    boolean existsByStudyUUID(String studyUUID);
}
