package com.espirometrias.util;

import java.util.Locale;

// Deja el DNI (o el identificador del paciente) siempre en la misma forma: sin espacios ni guiones y en mayúsculas.
// Se usa al guardar y al buscar pacientes, así "10890011-v" y "10890011V" son el mismo paciente y no se duplica.
public final class PersonalIdNormalizer {

    private PersonalIdNormalizer() {
        throw new UnsupportedOperationException("This class should never be instantiated");
    }

    public static String normalize(String personalId) {
        if (personalId == null) return null;
        return personalId.replaceAll("[\\s-]", "").toUpperCase(Locale.ROOT);
    }
}
