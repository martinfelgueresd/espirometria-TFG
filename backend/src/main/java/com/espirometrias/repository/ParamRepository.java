package com.espirometrias.repository;

import com.espirometrias.model.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ParamRepository extends JpaRepository<Param, UUID> {
}
