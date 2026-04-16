import { useEffect, useState } from "react";
import { getPatients } from "../../services/patientService.js";
import { UserPlus, Upload, Pencil, Trash2 } from "lucide-react";
import Toast from "../common/Toast.jsx";
import Modal from "../common/Modal.jsx";
import { useToast } from "../../hooks/useToast.js";
import { createPatientAndUpload } from "../../services/studyService.js";

function PatientList({ successMessage, onSuccessMessageShown, onNewPatientClicked, onPatientClicked, onUploadClicked, onUploadGlobalClicked, onDeleteClicked, onEditClicked }) {

    const [patients, setPatients] = useState([]);
    const [patientToDelete, setPatientToDelete] = useState(null);
    const [patientToCreate, setPatientToCreate] = useState(null);
    const { toast, showToast, clearToast } = useToast();
    const [isCreating, setIsCreating] = useState(false);
    const [patientExists, setPatientExists] = useState(null);
    const [search, setSearch] = useState("");
    const [sortField, setSortField] = useState(null);
    const [sortDir, setSortDir] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const patientsPerPage = 10;

    useEffect(() => {
        getPatients().then(setPatients);
    }, []);

    useEffect(() => {
        if (successMessage) {
            showToast(successMessage, "success");
            onSuccessMessageShown();
        }
    }, [successMessage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, sortField]);

    const handleUploadClick = (id) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".xml";
        input.onchange = async (e) => {
            const file = e.target.files[0];
            try {
                await onUploadClicked(id, file);
                showToast("Espirometría subida correctamente.", "success");
            } catch (error) {
                showToast(error.message, "error");
            }
        };
        input.click();
    };

    const handleGlobalUpload = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".xml";
        input.onchange = async (e) => {
            const file = e.target.files[0];
            try {
                await onUploadGlobalClicked(file);
                showToast("Espirometría subida correctamente.", "success");
            } catch (error) {
                if (error.type === "PATIENT_NOT_FOUND") {
                    setPatientToCreate({ dni: error.dni, firstName: error.firstName, lastName: error.lastName, file: file });
                } else if (error.type === "PATIENT_EXISTS") {
                    setPatientExists({ dni: error.dni, firstName: error.firstName, lastName: error.lastName, file: file });
                } else {
                    showToast(error.message, "error");
                }
            }
        };
        input.click();
    };

    const handleDeleteConfirm = async () => {
        try {
            await onDeleteClicked(patientToDelete.id);
            setPatients(patients.filter(p => p.id !== patientToDelete.id));
            showToast("Paciente eliminado correctamente.", "success");
        } catch (error) {
            showToast(error.message, "error");
        }
        setPatientToDelete(null);
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDir("asc");
        }
    };

    const patientsWithCount = patients.map(p => ({
        ...p,
        studyCount: p.studies?.length ?? 0,
        status: (p.studies?.length ?? 0) === 0 ? "Nuevo" : "Activo"
    }));

    const filteredPatients = patientsWithCount.filter(p =>
        (p.name + " " + p.surname).toLowerCase().includes(search.toLowerCase()) ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.surname.toLowerCase().includes(search.toLowerCase()) ||
        p.personalId.toLowerCase().includes(search.toLowerCase())
    );

    const sortedPatients = [...filteredPatients].sort((a, b) => {
        if (!sortField) return 0;
        const aVal = a[sortField] ?? "";
        const bVal = b[sortField] ?? "";
        if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
        return 0;
    });

    const columns = [
        { label: "DNI", field: "personalId" },
        { label: "Nombre", field: "name" },
        { label: "Edad", field: "age" },
        { label: "Género", field: "gender" },
        { label: "Fumador", field: "smoker" },
        { label: "Sesiones", field: "studyCount" },
        { label: "Estado", field: "status" },
        { label: "", field: null },
        { label: "", field: null },
        { label: "", field: null },
    ];

    const totalPages = Math.ceil(sortedPatients.length / patientsPerPage);

    const paginatedPatients = sortedPatients.slice(
        (currentPage - 1) * patientsPerPage,
        currentPage * patientsPerPage
    );

    return (
        <div className="p-6">

            <Toast message={toast?.message} type={toast?.type} onClose={clearToast} />

            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold text-gray-900">Listado de Pacientes</h1>
            </div>

            <div className="mb-2 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        placeholder="Buscar por nombre o DNI..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-80 border border-gray-200 rounded-lg px-3 h-9 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    {sortField && (
                        <button
                            onClick={() => { setSortField(null); setSortDir("asc"); }}
                            className="text-xs text-gray-400 hover:text-gray-600 underline">
                            Quitar orden
                        </button>
                    )}
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onNewPatientClicked}
                        className="inline-flex items-center gap-2 rounded-md border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50">
                        <UserPlus size={16} />
                        Nuevo paciente
                    </button>
                    <button
                        onClick={handleGlobalUpload}
                        className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                        <Upload size={16} />
                        Subir sesión
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        {columns.map(({ label, field }, i) => (
                            <th
                                key={i}
                                onClick={() => field && handleSort(field)}
                                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 ${field ? "cursor-pointer hover:text-gray-800 select-none" : ""}`}>
                                <div className="flex items-center gap-1">
                                    {label}
                                    {field && sortField === field && (
                                        <span>{sortDir === "asc" ? "↑" : "↓"}</span>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                    {paginatedPatients.map(patient => (
                        <tr onClick={() => onPatientClicked(patient)} key={patient.id} className="hover:bg-gray-50 cursor-pointer">
                            <td className="px-4 py-3 text-sm text-gray-500">{patient.personalId}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{patient.name + " " + patient.surname}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{patient.age}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{patient.gender === 'M' ? "Masculino" : "Femenino"}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{patient.smoker ? "Sí" : "No"}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{patient.studyCount}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    patient.status === "Nuevo"
                                        ? "bg-gray-100 text-gray-600"
                                        : "bg-green-100 text-green-700"
                                }`}>
                                    {patient.status}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleUploadClick(patient.id); }}
                                    className="inline-flex items-center rounded-md border border-green-600 px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50">
                                    <Upload size={14} />
                                </button>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEditClicked(patient); }}
                                    className="inline-flex items-center rounded-md border border-blue-600 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50">
                                    <Pencil size={14} />
                                </button>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setPatientToDelete(patient); }}
                                    className="border border-red-600 text-red-600 hover:bg-red-50 rounded-md px-3 py-1.5 text-xs font-medium">
                                    <Trash2 size={14} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        Mostrando {(currentPage - 1) * patientsPerPage + 1} - {Math.min(currentPage * patientsPerPage, sortedPatients.length)} de {sortedPatients.length} pacientes
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(p => p - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-sm border border-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-50">
                            Anterior
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => p + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 text-sm border border-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-50">
                            Siguiente
                        </button>
                    </div>
                </div>

            </div>

            {patientToDelete && (
                <Modal
                    title="¿Eliminar paciente?"
                    onCancel={() => setPatientToDelete(null)}
                    onConfirm={handleDeleteConfirm}
                    confirmText="Eliminar"
                    confirmStyle="red">
                    Esta acción no se puede deshacer. ¿Seguro que quieres eliminar a{" "}
                    <strong className="whitespace-nowrap">
                        {patientToDelete.name} {patientToDelete.surname} ({patientToDelete.personalId})
                    </strong>?
                </Modal>
            )}

            {patientToCreate && (
                <Modal
                    title="Paciente no encontrado"
                    onCancel={() => setPatientToCreate(null)}
                    onConfirm={async () => {
                        try {
                            setIsCreating(true);
                            await createPatientAndUpload(patientToCreate.file);
                            const updatedPatients = await getPatients();
                            setPatients(updatedPatients);
                            showToast("Paciente creado y espirometría asociada correctamente.", "success");
                        } catch (error) {
                            showToast(error.message, "error");
                        } finally {
                            setIsCreating(false);
                            setPatientToCreate(null);
                        }
                    }}
                    confirmText="Crear paciente"
                    confirmStyle="blue"
                    loading={isCreating}>
                    No existe el paciente{" "}
                    <strong className="whitespace-nowrap">
                        {patientToCreate.firstName} {patientToCreate.lastName} (DNI: {patientToCreate.dni})
                    </strong>.
                    ¿Deseas crearlo automáticamente?
                </Modal>
            )}

            {patientExists && (
                <Modal
                    title="Paciente ya registrado"
                    onCancel={() => setPatientExists(null)}
                    onConfirm={async () => {
                        try {
                            setIsCreating(true);
                            await createPatientAndUpload(patientExists.file);
                            const updatedPatients = await getPatients();
                            setPatients(updatedPatients);
                            showToast("Espirometría asociada correctamente.", "success");
                        } catch (error) {
                            showToast(error.message, "error");
                        } finally {
                            setIsCreating(false);
                            setPatientExists(null);
                        }
                    }}
                    confirmText="Asociar espirometría"
                    confirmStyle="blue"
                    loading={isCreating}>
                    Ya existe el paciente{" "}
                    <strong className="whitespace-nowrap">
                        {patientExists.firstName} {patientExists.lastName} (DNI: {patientExists.dni})
                    </strong>.
                    ¿Deseas asociarle esta espirometría?
                </Modal>
            )}

        </div>
    );
}

export default PatientList;