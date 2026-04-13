package com.espirometrias.client;

import com.espirometrias.dto.StudyDTO;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class PythonApiClient {

    private final WebClient webClient;

    public PythonApiClient() {
        this.webClient = WebClient.builder()
                .baseUrl("http://localhost:8000")
                .codecs(configurer -> configurer
                        .defaultCodecs()
                        .maxInMemorySize(10 * 1024 * 1024))
                .build();
    }

    public StudyDTO analizar(MultipartFile xml){
        return webClient.post()
                .uri("/analizar")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData("file", xml.getResource()))
                .retrieve()
                .bodyToMono(StudyDTO.class)
                .block();
    }
}
