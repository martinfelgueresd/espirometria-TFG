package com.espirometrias.service;

import com.espirometrias.dto.SpirometryResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class ProcessService {

    public List<SpirometryResponse> procesar(Long usuarioId, MultipartFile file) {
        return null;
    }
}
