package com.espirometrias.repository;

import com.espirometrias.model.Spirometry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpirometryRepository extends JpaRepository<Spirometry, Long> {
}
