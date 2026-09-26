import Modal from "../common/Modal.jsx";

// Se muestra al subir un XML de un paciente que no está registrado: ofrece crearlo con los datos del XML.
function UploadPatientModal({ data, onCancel, onConfirm, loading }) {
    if (!data) return null;

    return (
        <Modal
            title="Paciente no encontrado"
            onCancel={onCancel}
            onConfirm={onConfirm}
            confirmText="Crear paciente"
            loadingText="Creando..."
            confirmStyle="primary"
            loading={loading}>
            No existe el paciente{" "}
            <strong className="whitespace-nowrap">
                {data.firstName} {data.lastName} (DNI: {data.dni})
            </strong>. ¿Deseas crearlo automáticamente?
        </Modal>
    );
}

export default UploadPatientModal;
