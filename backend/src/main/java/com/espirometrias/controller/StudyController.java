package com.espirometrias.controller;

import com.espirometrias.service.SessionService;
import com.espirometrias.service.StudyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/study")
public class StudyController {

    private final StudyService studyService;

    public StudyController(StudyService studyService)
    {
        this.studyService = studyService;
    }

    @PostMapping("/upload/{id}")
    public ResponseEntity<Void> uploadSpirometry(@PathVariable Long id, @RequestParam("file") MultipartFile file)
    {
        if(file.isEmpty())
            throw new IllegalArgumentException("The file is empty");

        studyService.uploadStudy(id, file);
        return ResponseEntity.noContent().build();
    }
}
