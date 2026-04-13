const API = "http://localhost:8080/patients";

export const getPatients = () =>
    fetch(`${API}`).then(r => r.json());

export const createPatient = (patient) =>
    fetch(`${API}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patient)
    }).then(r => r.json());

export const editPatient = (patient, id) =>
    fetch(`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patient)
    }).then(r => r.json());

export const deletePatient = (id) =>
    fetch(`${API}/${id}`, { method: "DELETE" });