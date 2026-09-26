package com.espirometrias.client;

import com.espirometrias.dto.AnalysisDTO;
import com.espirometrias.exception.AnalysisServiceException;
import com.espirometrias.exception.InvalidXmlException;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;

@Component
public class PythonApiClient {

    // Tiempo máximo de espera al servicio de análisis antes de dar la petición por fallida.
    private static final Duration TIMEOUT = Duration.ofSeconds(60);

    private final WebClient webClient;

    public PythonApiClient() {
        this.webClient = WebClient.builder()
                .baseUrl("http://localhost:8000")
                .codecs(configurer -> configurer
                        .defaultCodecs()
                        .maxInMemorySize(10 * 1024 * 1024))
                .build();
    }

    // Envía el XML al servicio de análisis, que es el único que lo lee.
    // Si el XML no es válido el servicio responde 400 (InvalidXmlException); si falla o no responde,
    // se lanza AnalysisServiceException.
    public AnalysisDTO analizar(MultipartFile xml) {
        try {
            return webClient.post()
                    .uri("/analizar")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData("file", xml.getResource()))
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, response -> response.bodyToMono(String.class)
                            .map(body -> new InvalidXmlException("El fichero XML no es válido o no puede ser leído.")))
                    .bodyToMono(AnalysisDTO.class)
                    .block(TIMEOUT);
        } catch (InvalidXmlException e) {
            throw e;
        } catch (RuntimeException e) {
            throw new AnalysisServiceException(e);
        }
    }
}
