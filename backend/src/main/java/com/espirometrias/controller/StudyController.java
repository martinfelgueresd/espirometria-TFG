package com.espirometrias.controller;

import com.espirometrias.exception.InvalidXmlException;
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
            throw new InvalidXmlException("El fichero está vacío.");

        studyService.uploadStudy(id, file);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/upload")
    public ResponseEntity<Void> uploadSpirometry(@RequestParam("file") MultipartFile file)
    {
        if(file.isEmpty())
            throw new IllegalArgumentException("El fichero está vacío.");

        studyService.uploadStudy(file);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/upload/create-and-upload")
    public ResponseEntity<Void> createPatientAndUpload(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty())
            throw new InvalidXmlException("El fichero está vacío.");

        studyService.createPatientAndUploadStudy(file);
        return ResponseEntity.noContent().build();
    }
}