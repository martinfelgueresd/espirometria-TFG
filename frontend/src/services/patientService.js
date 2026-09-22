const API = "http://localhost:8080/esp-IA-api/v1/patients";

export const getPatients = () =>
    fetch(`${API}`).then(r => r.json());

export const getPatient = (id) =>
    fetch(`${API}/${id}`).then(r => r.json());

export const createPatient = async (patient) => {
    const response = await fetch(`${API}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patient)
    });

    if (!response.ok) {
        throw await response.json();
    }
};

export const editPatient = async (formData, id) => {
    const response = await fetch(`${API}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
    });

    if (!response.ok) {
        throw await response.json();
    }
};

export const deletePatient = async (id) => {
    await fetch(`${API}/${id}`, { method: "DELETE" });
};