// Criterio ATS/ERS para respuesta broncodilatadora positiva: FEV1 sube >= 12% y >= 0.2 L respecto al basal.
const BRONCHODILATOR_MIN_PCT = 12;
const BRONCHODILATOR_MIN_ABS_L = 0.2;

const paramScore = (maneuver) => {
    const fvc = getParamValue(maneuver, "FVC") ?? 0;
    const fev1 = getParamValue(maneuver, "FEV1") ?? 0;
    return fvc + fev1;
};

// De las maniobras de una sesión, elige la más representativa: la mejor entre las aceptables
// (mayor FVC + FEV1), o si ninguna es aceptable, la mejor de todas.
export const selectBestManeuver = (session) => {
    const maneuvers = session?.spirometries;
    if (!maneuvers || maneuvers.length === 0) return null;

    const acceptable = maneuvers.filter(m => m.acceptable);
    const pool = acceptable.length > 0 ? acceptable : maneuvers;

    return pool.reduce((best, current) =>
        paramScore(current) > paramScore(best) ? current : best
    );
};

export const getParamValue = (maneuver, paramName) =>
    maneuver?.params?.find(p => p.name === paramName)?.test ?? null;

export const getBronchodilatorResponse = (fev1Pre, fev1Post) => {
    if (fev1Pre == null || fev1Post == null) return null;

    const diffAbs = fev1Post - fev1Pre;
    const diffPct = fev1Pre > 0 ? (diffAbs / fev1Pre) * 100 : 0;

    return diffAbs >= BRONCHODILATOR_MIN_ABS_L && diffPct >= BRONCHODILATOR_MIN_PCT;
};

export const formatDate = (isoDate) => {
    if (!isoDate) return "—";
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
};

// Convierte un Study del backend en la fila que necesita la tabla de sesiones del detalle de paciente.
export const buildSessionRow = (study) => {
    const bestPre = selectBestManeuver(study.preSession);
    const bestPost = selectBestManeuver(study.postSession);

    const fev1Pre = getParamValue(bestPre, "FEV1");
    const fev1Post = getParamValue(bestPost, "FEV1");

    return {
        id: study.studyUUID,
        fecha: formatDate(study.date),
        operador: study.operator,
        protocolo: study.protocol,
        fvc_pre: getParamValue(bestPre, "FVC"),
        fvc_post: getParamValue(bestPost, "FVC"),
        fev1_pre: fev1Pre,
        fev1_post: fev1Post,
        fev1_fvc_pre: getParamValue(bestPre, "FEV1_FVC_PCT"),
        fev1_fvc_post: getParamValue(bestPost, "FEV1_FVC_PCT"),
        r_broncodilatadora: bestPost ? getBronchodilatorResponse(fev1Pre, fev1Post) : null,
        grado_pre: bestPre?.grade ?? null,
        grado_post: bestPost?.grade ?? null,
    };
};
