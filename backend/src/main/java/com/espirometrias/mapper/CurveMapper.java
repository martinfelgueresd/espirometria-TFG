package com.espirometrias.mapper;

import com.espirometrias.dto.CurveDTO;
import com.espirometrias.dto.PointDTO;
import com.espirometrias.model.CurveType;
import com.espirometrias.model.grafica.Curve;
import org.mapstruct.Mapper;

import java.util.List;
import java.util.stream.IntStream;

// La API (servicio de análisis y frontend) sigue usando una lista de puntos {x, y};
// en la base de datos la curva guarda los puntos como dos arrays, x e y (ver Curve).
// Estas conversiones se escriben a mano porque MapStruct no las puede deducir.
@Mapper(componentModel = "spring")
public interface CurveMapper {

    default Curve toEntity(CurveDTO dto) {
        if (dto == null) return null;
        List<PointDTO> points = dto.getPoints() != null ? dto.getPoints() : List.of();

        Curve curve = new Curve();
        curve.setCurveType(CurveType.valueOf(dto.getCurveType()));
        curve.setX(points.stream().mapToDouble(PointDTO::getX).toArray());
        curve.setY(points.stream().mapToDouble(PointDTO::getY).toArray());
        return curve;
    }

    default CurveDTO toDTO(Curve curve) {
        if (curve == null) return null;
        double[] x = curve.getX() != null ? curve.getX() : new double[0];
        double[] y = curve.getY() != null ? curve.getY() : new double[0];

        CurveDTO dto = new CurveDTO();
        dto.setCurveType(curve.getCurveType().name());
        dto.setPoints(IntStream.range(0, x.length)
                .mapToObj(i -> new PointDTO(x[i], y[i]))
                .toList());
        return dto;
    }
}
