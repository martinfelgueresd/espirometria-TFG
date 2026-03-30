package com.espirometrias.service;

import com.espirometrias.dto.SpirometryResponse;
import com.espirometrias.model.*;
import com.espirometrias.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class SpirometryService {

    private final SpirometryRepository spirometryRepository;
    private final PatientRepository patientRepository;

    public SpirometryService(SpirometryRepository spirometryRepository,
                             PatientRepository patientRepository){

        this.spirometryRepository = spirometryRepository;
        this.patientRepository = patientRepository;
    }

    public SpirometryResponse uploadSpirometry(MultipartFile file)
    {
        return null;
    }

    /*
    public List<> getByPaciente(Long pacienteId){
        Patient paciente = pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));

        return paciente.getSesiones();
    }

    public List<Spirometry> getManiobras(){
        return maniobraRepository.findAll();
    }
     */

    /*
    @Transactional
    public EspirometriaResponse procesar(MultipartFile xml) {

        // 1. Llama a FastAPI a través del PythonApiClient
        EspirometriaResponse response;

        try {
            response = pythonApiClient.analizar(xml);
        } catch (Exception e) {
            throw new RuntimeException("Error llamando al modelo de IA", e);
        }

        System.out.println(response.getDatos().getMedidas().get(0).getGraficas().getFlujo().get(0));

        // 2. Busca o crea el paciente
        Paciente paciente = pacienteService.buscarOCrear(response.getDatos().getPaciente());

        // 3. Crea y guarda el SesionAnalisis pre
        SesionAnalisis sesionPre = new SesionAnalisis();
        sesionPre.setGrado(response.getSesion_pre().getGrado());
        sesionPre.setPatron(response.getSesion_pre().getPatron());
        sesionPre.setSeveridad(response.getSesion_pre().getSeveridad());
        sesionAnalisisRepository.save(sesionPre);

        // 4. Crea y guarda el SesionAnalisis post
        SesionAnalisis sesionPost = new SesionAnalisis();

        sesionPost.setGrado(response.getSesion_post().getGrado());
        sesionPost.setPatron(response.getSesion_post().getPatron());
        sesionPost.setSeveridad(response.getSesion_post().getSeveridad());
        sesionAnalisisRepository.save(sesionPost);

        // 5. Crea y guarda la Sesion
        Sesion sesion = new Sesion();
        sesion.setPaciente(paciente);
        sesion.setFecha(LocalDateTime.now());
        sesion.setSesionPre(sesionPre);
        sesion.setSesionPost(sesionPost);
        sesion.setRespuestaBroncodilatadora(response.getBroncodilatador().getRespuesta());
        sesionRepository.save(sesion);

        // 6. Crea y guarda las maniobras y sus parámetros
        for (MedidaResponse medida : response.getDatos().getMedidas()) {
            Maniobra maniobra = new Maniobra();
            maniobra.setNumero(medida.getMedida());
            maniobra.setFase(medida.getFase());
            maniobra.setRealizacion(medida.getRealizacion());
            maniobra.setMotivo(medida.getMotivo());
            maniobra.setSesion(sesion);
            maniobraRepository.save(maniobra);

            for (ParametroResponse param : medida.getParametros()) {
                Parametro parametro = new Parametro();
                parametro.setNombre(param.getParametro());
                parametro.setTeorico(param.getTeorico());
                parametro.setPrueba(param.getPrueba());
                parametro.setPctTeorico(param.getPct_teorico());
                parametro.setManiobra(maniobra);
                parametroRepository.save(parametro);
            }
        }

        // 7. Devuelve el DTO al controller
        return response;
    }
     */
}