package com.espirometrias.controller;

import com.espirometrias.dto.SpirometryResponse;
import com.espirometrias.service.SpirometryService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/spirometries")
public class SpirometryController {

    private final SpirometryService spirometryService;

    public SpirometryController(SpirometryService spirometryService)
    {
        this.spirometryService = spirometryService;
    }

    @PostMapping("/upload/{id}")
    public SpirometryResponse uploadSpirometry(@PathVariable long id, @RequestParam("file") MultipartFile file)
    {
        if(file.isEmpty())
            throw new IllegalArgumentException("The file is empty");
        return spirometryService.uploadSpirometry(file);
    }
}
