import { MANEUVER_COLORS, REJECTED_COLOR, PHASE_COLORS, LINE_WIDTH, DIMMED_OPACITY } from "../constants/chartOptions.js";

// Una "serie" es una línea de las gráficas: la maniobra de la que salen los puntos y cómo se pinta
// (nombre, color, trazo, grosor y opacidad). Las mismas series se usan en la flujo-volumen, en la
// volumen-tiempo y en la tabla de maniobras, así cada maniobra se ve igual en los tres sitios.
// Aquí solo se decide cómo se pinta cada maniobra: qué maniobra es la mejor lo indica el backend.

// Puntos de una curva de la maniobra como { x: [...], y: [...] }, o null si no tiene puntos.
// Las curvas llegan ya preparadas del servicio de análisis (el volumen empieza en 0 L).
export const getCurve = (maneuver, curveType) => {
    const points = maneuver?.curves?.find(curve => curve.curveType === curveType)?.points ?? [];
    if (points.length === 0) return null;

    return {
        x: points.map(point => point.x),
        y: points.map(point => point.y),
    };
};

// Indica si la maniobra tiene alguna curva con puntos (si falla el preprocesado de la señal, llegan vacías).
export const hasCurves = (maneuver) =>
    maneuver?.curves?.some(curve => curve.points?.length > 0) ?? false;

// Maniobra de la sesión con ese orden, o null si no está.
const findManeuver = (session, order) =>
    session?.spirometries?.find(maneuver => maneuver.order === order) ?? null;

// Nombre de la maniobra en los tooltips, p. ej. "Maniobra 2 · mejor" o "Maniobra 3 · no aceptable".
const maneuverName = (maneuver, isBest) => {
    const tags = [];
    if (isBest) tags.push("mejor");
    if (!maneuver.acceptable) tags.push("no aceptable");
    return [`Maniobra ${maneuver.order}`, ...tags].join(" · ");
};

// Series de una fase: una por maniobra, todas superpuestas en las mismas gráficas.
// - Aceptables: cada una con su color y línea continua.
// - No aceptables: gris y línea discontinua.
// - La mejor maniobra de la fase (bestManeuverOrder, calculada en el backend): línea más gruesa.
// - Si hay una maniobra seleccionada en la tabla, el resto se atenúa.
export const buildPhaseSeries = (session, selectedOrder = null) => {
    const maneuvers = session?.spirometries ?? [];
    const acceptable = maneuvers.filter(maneuver => maneuver.acceptable);

    return maneuvers.map(maneuver => {
        const isBest = maneuver.order === session.bestManeuverOrder;
        const isDimmed = selectedOrder !== null && maneuver.order !== selectedOrder;

        return {
            id: maneuver.order,
            name: maneuverName(maneuver, isBest),
            maneuver,
            color: maneuver.acceptable ? MANEUVER_COLORS[acceptable.indexOf(maneuver)] : REJECTED_COLOR,
            dash: maneuver.acceptable ? "solid" : "dash",
            width: isBest ? LINE_WIDTH.best : LINE_WIDTH.normal,
            opacity: isDimmed ? DIMMED_OPACITY : 1,
        };
    });
};

// Series de la comparación Pre vs Post: la mejor maniobra de cada fase (indicada por el backend),
// cada fase con su color.
export const buildComparisonSeries = (preSession, postSession) => {
    const phases = [
        { id: "PRE", label: "Pre", maneuver: findManeuver(preSession, preSession?.bestManeuverOrder) },
        { id: "POST", label: "Post", maneuver: findManeuver(postSession, postSession?.bestManeuverOrder) },
    ];

    return phases
        .filter(phase => phase.maneuver !== null)
        .map(({ id, label, maneuver }) => ({
            id,
            name: `${label} · ${maneuverName(maneuver, false)}`,
            maneuver,
            color: PHASE_COLORS[id],
            dash: "solid",
            width: LINE_WIDTH.normal,
            opacity: 1,
        }));
};
