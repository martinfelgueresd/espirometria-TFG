// Opciones visuales de las gráficas de espirometría.

// Colores de las maniobras aceptables, en orden fijo: la primera aceptable de la fase usa el primer color,
// la segunda el segundo, etc. Es una paleta validada para que los colores se distingan también con daltonismo.
// Son 8 porque la ATS/ERS pone 8 intentos como límite práctico en una fase.
export const MANEUVER_COLORS = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#4a3aa7", "#e34948"];

// Las maniobras no aceptables van en gris (y con línea discontinua) para que queden en segundo plano.
export const REJECTED_COLOR = "#898781";

// Colores de la comparación Pre vs Post (los dos primeros de la paleta).
export const PHASE_COLORS = { PRE: "#2a78d6", POST: "#eb6834" };

// Grosor de las líneas en píxeles: la mejor maniobra de la fase se pinta más gruesa.
export const LINE_WIDTH = { normal: 2, best: 3.5 };

// Opacidad del resto de maniobras cuando se selecciona una en la tabla.
export const DIMMED_OPACITY = 0.2;

// Grises para textos, ejes y rejilla: suaves para que no compitan con las curvas.
export const CHART_INK = {
    text: "#52514e",
    muted: "#898781",
    grid: "#e1e0d9",
    axis: "#c3c2b7",
};

// Título, ejes y unidades de cada tipo de curva.
export const CURVE_CHARTS = {
    FLOW_VOLUME: { title: "Flujo-volumen", xTitle: "Volumen (L)", yTitle: "Flujo (L/s)", xUnit: "L", yUnit: "L/s" },
    TIME_VOLUME: { title: "Volumen-tiempo", xTitle: "Tiempo (s)", yTitle: "Volumen (L)", xUnit: "s", yUnit: "L" },
};
