import { request, requestJson } from "./apiClient.js";

const API = "http://localhost:8080/esp-IA-api/v1/studies";

// Todas las funciones lanzan un ApiError con un mensaje listo para mostrar si la petición falla.

// Estudio completo (maniobras, curvas y parámetros) para el detalle del estudio.
export const getStudy = (studyUUID) =>
    requestJson(`${API}/${studyUUID}`);

export const deleteStudy = (studyUUID) =>
    request(`${API}/${studyUUID}`, { method: "DELETE" });

// Envía el XML como formulario multipart en el campo "file".
const uploadXml = (url, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return request(url, { method: "POST", body: formData });
};

// Sube el XML a un paciente concreto.
export const uploadSession = (patientId, file) =>
    uploadXml(`${API}/upload/${patientId}`, file);

// Sube el XML buscando al paciente por su DNI. Si no está registrado, el ApiError trae
// code "PATIENT_NOT_FOUND" y sus datos (dni, firstName, lastName) en details.
export const uploadGlobalSession = (file) =>
    uploadXml(`${API}/upload`, file);

// Sube el XML y crea el paciente con los datos del XML si todavía no existe.
export const createPatientAndUpload = (file) =>
    uploadXml(`${API}/upload/create-and-upload`, file);
