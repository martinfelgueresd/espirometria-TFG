package com.espirometrias.model.resultado;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PhaseResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ElementCollection
    private List<String> usedSignalKeys;
    private Character sessionGrade;
    private Integer acceptableSpirometries;
    private Integer totalSpirometries;
    private PhaseType phaseType;
    private String advertence;

    @ManyToOne
    @JoinColumn(name = "selection_id")
    private Selection selection;
}
