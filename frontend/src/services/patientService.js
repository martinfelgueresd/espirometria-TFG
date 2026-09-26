import { request, requestJson } from "./apiClient.js";

const API = "http://localhost:8080/esp-IA-api/v1/patients";
const JSON_HEADERS = { "Content-Type": "application/json" };

export const getPatients = ({ page, size, sort, dir, search }) =>
    requestJson(`${API}?${new URLSearchParams({ page, size, sort, dir, search })}`);

export const getPatient = (id) =>
    requestJson(`${API}/${id}`);

export const createPatient = (patient) =>
    request(API, { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(patient)});

export const editPatient = (formData, id) =>
    request(`${API}/${id}`, { method: "PATCH", headers: JSON_HEADERS, body: JSON.stringify(formData)});

export const deletePatient = (id) =>
    request(`${API}/${id}`, { method: "DELETE" });
