package com.espirometrias.repository;

import com.espirometrias.model.Spirometry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpirometryRepository extends JpaRepository<Spirometry, UUID> {
}
