const API = "http://localhost:8080/study";

export const uploadSession = async (id, file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API}/upload/${id}`, {
        method: "POST",
        body: formData,
    });

    return response.json();
};