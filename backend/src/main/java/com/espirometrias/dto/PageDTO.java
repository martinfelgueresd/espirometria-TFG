package com.espirometrias.dto;

import org.springframework.data.domain.Page;

import java.util.List;

// Una página de resultados: los elementos de la página y los datos necesarios para paginar.
public record PageDTO<T>(List<T> content, int page, int size, long totalElements, int totalPages) {

    public static <T> PageDTO<T> from(Page<T> page) {
        return new PageDTO<>(page.getContent(), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }
}
