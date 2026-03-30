const API = "http://localhost:8080/patients";

export const getPatients = () =>
    fetch(`${API}/list`).then(r => r.json());

export const createPatient = (patient) =>
    fetch(`${API}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patient)
    }).then(r => r.json());

export const deletePatient = (id) =>
    fetch(`${API}/delete/${id}`, { method: "DELETE" });