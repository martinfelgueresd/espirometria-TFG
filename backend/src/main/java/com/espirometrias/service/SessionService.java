package com.espirometrias.service;

import com.espirometrias.model.Param;
import com.espirometrias.model.Session;
import com.espirometrias.model.Spirometry;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
public class SessionService {

    private static final String FVC = "FVC";
    private static final String FEV1 = "FEV1";
    private static final String FEV1_FVC = "FEV1_FVC_PCT";

    // Calcula el resumen de una sesión a partir de sus maniobras, según el apartado "Valores a usar" del documento ERS:
    // - FVC y FEV1: el mayor de cada uno entre las maniobras aceptables (pueden venir de maniobras distintas).
    // - FEV1/FVC: el de la mejor maniobra, que es la aceptable con mayor FVC + FEV1.
    // Si ninguna maniobra es aceptable, la sesión no tiene resultados válidos (grado F): no hay mejor maniobra
    // ni valores, que quedan vacíos para que no se interpreten datos que no cumplen la norma.
    public void calculateSummary(Session session) {
        if (session == null) return;

        List<Spirometry> maneuvers = session.getSpirometries() != null ? session.getSpirometries() : List.of();
        List<Spirometry> acceptable = maneuvers.stream()
                .filter(maneuver -> Boolean.TRUE.equals(maneuver.getAcceptable()))
                .toList();
        Spirometry best = selectBestManeuver(acceptable);

        session.setManeuverCount(maneuvers.size());
        session.setAcceptableCount(acceptable.size());
        session.setBestManeuverOrder(best != null ? best.getOrder() : null);
        session.setFvc(maxParamValue(acceptable, FVC));
        session.setFev1(maxParamValue(acceptable, FEV1));
        session.setFev1Fvc(best != null ? paramValue(best, FEV1_FVC) : null);
    }

    // La mejor maniobra es la aceptable de mayor FVC + FEV1 (si hay empate, la primera); null si no hay ninguna.
    private Spirometry selectBestManeuver(List<Spirometry> candidates) {
        return candidates.stream()
                .max(Comparator.comparingDouble(maneuver -> valueOrZero(maneuver, FVC) + valueOrZero(maneuver, FEV1)))
                .orElse(null);
    }

    // Mayor valor de un parámetro entre varias maniobras, o null si ninguna lo tiene.
    private Double maxParamValue(List<Spirometry> maneuvers, String paramName) {
        return maneuvers.stream()
                .map(maneuver -> paramValue(maneuver, paramName))
                .filter(Objects::nonNull)
                .max(Double::compare)
                .orElse(null);
    }

    // Valor medido de un parámetro de la maniobra, o null si no lo tiene.
    private Double paramValue(Spirometry maneuver, String paramName) {
        if (maneuver.getParams() == null) return null;
        return maneuver.getParams().stream()
                .filter(param -> paramName.equals(param.getName()))
                .findFirst()
                .map(Param::getTest)
                .orElse(null);
    }

    private double valueOrZero(Spirometry maneuver, String paramName) {
        Double value = paramValue(maneuver, paramName);
        return value != null ? value : 0;
    }
}
