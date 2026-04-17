package com.espirometrias.repository;

import com.espirometrias.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientRepository extends JpaRepository<Patient, UUID> {

    Optional<Patient> findByName(String name);
    Optional<Patient> findByPersonalId(String personalId);
    boolean existsByPersonalId(String personalId);
}