package com.espirometrias.controller;

import com.espirometrias.dto.SpirometryResponse;
import com.espirometrias.service.SessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/spirometries")
public class SessionController {

    private final SessionService sessionService;

    public SessionController(SessionService sessionService)
    {
        this.sessionService = sessionService;
    }

    @PostMapping("/upload/{id}")
    public ResponseEntity<Void> uploadSpirometry(@PathVariable Long id, @RequestParam("file") MultipartFile file)
    {
        if(file.isEmpty())
            throw new IllegalArgumentException("The file is empty");

        sessionService.uploadSpirometry(file);
        return ResponseEntity.noContent().build();
    }
}
