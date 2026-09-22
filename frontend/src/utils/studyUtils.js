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

export const formatDate = (isoDate) => {
    if (!isoDate) return "—";
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
};

// Convierte un Study del backend en la fila que necesita la tabla de sesiones del detalle de paciente.
export const buildSessionRow = (study) => {
    const bestPre = selectBestManeuver(study.preSession);
    const bestPost = selectBestManeuver(study.postSession);

    return {
        id: study.studyUUID,
        date: study.date,
        fecha: formatDate(study.date),
        operador: study.operator,
        protocolo: study.protocol,
        fvc_pre: getParamValue(bestPre, "FVC"),
        fvc_post: getParamValue(bestPost, "FVC"),
        fev1_pre: getParamValue(bestPre, "FEV1"),
        fev1_post: getParamValue(bestPost, "FEV1"),
        fev1_fvc_pre: getParamValue(bestPre, "FEV1_FVC_PCT"),
        fev1_fvc_post: getParamValue(bestPost, "FEV1_FVC_PCT"),
        grado_pre: bestPre?.grade ?? null,
        grado_post: bestPost?.grade ?? null,
        grado_sesion_pre: study.preSession?.sessionGrade ?? null,
        grado_sesion_post: study.postSession?.sessionGrade ?? null,
    };
};
