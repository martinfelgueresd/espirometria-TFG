export const GENDER_OPTIONS = [
    { value: "M", label: "Masculino" },
    { value: "F", label: "Femenino" }
];

export const ETHNIC_GROUP_OPTIONS = [
    { value: "caucasian", label: "Caucásico" },
    { value: "african_american", label: "Afroamericano" },
    { value: "asian", label: "Asiático" },
    { value: "hispanic", label: "Hispano" },
    { value: "other", label: "Otro" }
];

export const SMOKER_OPTIONS = [
    { value: "true", label: "Sí" },
    { value: "false", label: "No" }
];

// Texto de cada estado del paciente. El estado lo decide el backend (NEW si no tiene estudios, ACTIVE si tiene alguno).
export const PATIENT_STATUS_LABELS = {
    NEW: "Nuevo",
    ACTIVE: "Activo"
};