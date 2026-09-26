// Funciones de presentación para estudios. Las reglas del dominio (mejor maniobra, valores de cada sesión...)
// las aplica el backend: aquí solo se leen y se formatean los datos que llegan.

// Valor medido de un parámetro de la maniobra (p. ej. "FVC"), o null si no lo tiene.
export const getParamValue = (maneuver, paramName) =>
    maneuver?.params?.find(p => p.name === paramName)?.test ?? null;

// "2023-05-15" -> "15/05/2023"
export const formatDate = (isoDate) => {
    if (!isoDate) return "—";
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
};
