const API = "http://localhost:8080/esp-IA-api/v1/studies";

export const deleteStudy = async (id) => {
    await fetch(`${API}/${id}`, { method: "DELETE" });
};

export const uploadSession = async (id, file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API}/upload/${id}`, {
        method: "POST",
        body: formData,
    });

    if (response.status === 409) {
        const message = await response.text();
        throw new Error(message);
    }

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
    }
};

export const uploadGlobalSession = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API}/upload`, {
        method: "POST",
        body: formData,
    });

    if (response.status === 404) {
        const data = await response.json();
        throw { type: "PATIENT_NOT_FOUND", ...data };
    }

    if (response.status === 409) {
        const data = await response.text();
        throw { type: "PATIENT_EXISTS", ...data };
    }

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
    }
};

export const createPatientAndUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API}/upload/create-and-upload`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
    }
};