package com.espirometrias.repository;

import com.espirometrias.model.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientRepository extends JpaRepository<Patient, UUID> {

    Optional<Patient> findByName(String name);
    Optional<Patient> findByPersonalId(String personalId);
    boolean existsByPersonalId(String personalId);

    // Pacientes cuyo nombre completo o DNI contienen el texto buscado, sin distinguir mayúsculas.
    @Query("""
            select p from Patient p
            where lower(concat(p.name, ' ', p.surname)) like lower(concat('%', :search, '%'))
               or lower(p.personalId) like lower(concat('%', :search, '%'))
            """)
    Page<Patient> search(@Param("search") String search, Pageable pageable);
}
