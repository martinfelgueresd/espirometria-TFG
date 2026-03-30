package com.espirometrias.client;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class PythonApiClient {

    private final WebClient webClient;

    public PythonApiClient(WebClient webClient){
        this.webClient = webClient;
    }

    public ManiobraResponse analizar(MultipartFile xml){
        return webClient.post()
                .uri("/analizar")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData("file", xml.getResource()))
                .retrieve()
                .bodyToMono(ManiobraResponse.class)
                .block();
    }
}
