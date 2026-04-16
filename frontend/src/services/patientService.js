const API = "http://localhost:8080/patients";

export const getPatients = () =>
    fetch(`${API}`).then(r => r.json());

export const createPatient = async (patient) => {
    const response = await fetch(`${API}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patient)
    });

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
    }
}

export const editPatient = (patient, id) =>
    fetch(`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patient)
    }).then(r => r.json());

export const deletePatient = async (id) => {
    await fetch(`${API}/${id}`, { method: "DELETE" });
};