package com.espirometrias.model;

import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Session {
    @Id
    private UUID id = UuidCreator.getTimeOrderedEpoch();
    private String type;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL)
    private List<Spirometry> spirometries;
}
