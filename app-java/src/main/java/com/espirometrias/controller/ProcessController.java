package com.espirometrias.controller;

import com.espirometrias.dto.SpirometryResponse;
import com.espirometrias.service.ProcessService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/procesar")
public class ProcessController {

    private final ProcessService processService;

    public ProcessController(ProcessService processService) {
        this.processService = processService;
    }

    @PostMapping
    public List<SpirometryResponse> procesar(
            @RequestParam Long usuarioId,
            @RequestParam MultipartFile file) {

        return processService.procesar(usuarioId, file);
    }
}
