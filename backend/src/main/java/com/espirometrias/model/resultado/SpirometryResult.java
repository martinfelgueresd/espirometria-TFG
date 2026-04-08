package com.espirometrias.model.resultado;

import com.espirometrias.model.Session;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SpirometryResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "session_id")
    private Session session;

    @OneToOne(mappedBy = "spirometryResult")
    private Interpretation interpretation;

    @OneToOne(mappedBy = "spirometryResult")
    private Selection selection;
}