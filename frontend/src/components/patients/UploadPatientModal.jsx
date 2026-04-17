import Modal from "../common/Modal.jsx";

function UploadPatientModal({ data, type, onCancel, onConfirm, loading }) {
    if (!data) return null;

    const config = {
        NOT_FOUND: {
            title: "Paciente no encontrado",
            confirmText: "Crear paciente",
            loadingText: "Creando...",
            message: "No existe el paciente",
            question: "¿Deseas crearlo automáticamente?"
        },
        EXISTS: {
            title: "Paciente ya registrado",
            confirmText: "Asociar espirometría",
            loadingText: "Asociando...",
            message: "Ya existe el paciente",
            question: "¿Deseas asociarle esta espirometría?"
        }
    };

    const { title, confirmText, loadingText, message, question } = config[type];

    return (
        <Modal
            title={title}
            onCancel={onCancel}
            onConfirm={onConfirm}
            confirmText={confirmText}
            loadingText={loadingText}
            confirmStyle="primary"
            loading={loading}>
            {message}{" "}
            <strong className="whitespace-nowrap">
                {data.firstName} {data.lastName} (DNI: {data.dni})
            </strong>. {question}
        </Modal>
    );
}

export default UploadPatientModal;