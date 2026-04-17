import { useEffect, useState } from "react";
import { getPatients } from "../../services/patientService.js";
import { UserPlus, Upload } from "lucide-react";
import Toast from "../common/Toast.jsx";
import Modal from "../common/Modal.jsx";
import PatientTable from "./PatientTable.jsx";
import Pagination from "./Pagination.jsx";
import UploadPatientModal from "./UploadPatientModal.jsx";
import { useToast } from "../../hooks/useToast.js";
import { useSort } from "../../hooks/useSort.js";
import { usePagination } from "../../hooks/usePagination.js";
import { useSearch } from "../../hooks/useSearch.js";
import { useFilePicker } from "../../hooks/useFilePicker.js";
import { createPatientAndUpload } from "../../services/studyService.js";

const filterPatient = (patient, search) =>
    (patient.name + " " + patient.surname).toLowerCase().includes(search) ||
    patient.personalId.toLowerCase().includes(search);

function PatientList({ successMessage, onSuccessMessageShown, onNewPatientClicked, onPatientClicked, onUploadClicked, onUploadGlobalClicked, onDeleteClicked, onEditClicked }) {

    const [patients, setPatients] = useState([]);
    const [patientToDelete, setPatientToDelete] = useState(null);
    const [patientToCreate, setPatientToCreate] = useState(null);
    const [patientExists, setPatientExists] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const { toast, showToast, clearToast } = useToast();
    const { pickFile } = useFilePicker(".xml");

    const patientsWithCount = patients.map(p => ({
        ...p,
        studyCount: p.studies?.length ?? 0,
        status: (p.studies?.length ?? 0) === 0 ? "Nuevo" : "Activo"
    }));

    const { search, setSearch, filteredItems } = useSearch(patientsWithCount, filterPatient);
    const { sortField, sortDir, sortedItems, handleSort, clearSort } = useSort(filteredItems);
    const { currentPage, totalPages, paginatedItems, from, to, nextPage, prevPage } = usePagination(sortedItems);

    useEffect(() => {
        getPatients().then(setPatients);
    }, []);

    useEffect(() => {
        if (successMessage) {
            showToast(successMessage, "success");
            onSuccessMessageShown();
        }
    }, [successMessage]);

    const handleUploadClick = async (id) => {
        const file = await pickFile();
        if (!file) return;
        try {
            await onUploadClicked(id, file);
            showToast("Espirometría subida correctamente.", "success");
        } catch (error) {
            showToast(error.message, "error");
        }
    };

    const handleGlobalUpload = async () => {
        const file = await pickFile();
        if (!file) return;
        try {
            await onUploadGlobalClicked(file);
            showToast("Espirometría subida correctamente.", "success");
        } catch (error) {
            if (error.type === "PATIENT_NOT_FOUND") {
                setPatientToCreate({ dni: error.dni, firstName: error.firstName, lastName: error.lastName, file });
            } else if (error.type === "PATIENT_EXISTS") {
                setPatientExists({ dni: error.dni, firstName: error.firstName, lastName: error.lastName, file });
            } else {
                showToast(error.message, "error");
            }
        }
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

    const handleUploadConfirm = async (patientData, successMessage) => {
        try {
            setIsCreating(true);
            await createPatientAndUpload(patientData.file);
            const updatedPatients = await getPatients();
            setPatients(updatedPatients);
            showToast(successMessage, "success");
        } catch (error) {
            showToast(error.message, "error");
        } finally {
            setIsCreating(false);
            setPatientToCreate(null);
            setPatientExists(null);
        }
    };

    return (
        <div className="p-4">

            <Toast message={toast?.message} type={toast?.type} onClose={clearToast} />

            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold text-gray-900">Listado de Pacientes</h1>
            </div>

            <div className="mb-4 flex justify-between items-center">
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
                            onClick={clearSort}
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
                <PatientTable
                    patients={paginatedItems}
                    sortField={sortField}
                    sortDir={sortDir}
                    onSort={handleSort}
                    onPatientClick={onPatientClicked}
                    onUpload={handleUploadClick}
                    onEdit={onEditClicked}
                    onDelete={setPatientToDelete}
                />
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    from={from}
                    to={to}
                    total={sortedItems.length}
                    onPrev={prevPage}
                    onNext={nextPage}
                />
            </div>

            {patientToDelete && (
                <Modal
                    title="¿Eliminar paciente?"
                    onCancel={() => setPatientToDelete(null)}
                    onConfirm={handleDeleteConfirm}
                    confirmText="Eliminar"
                    confirmStyle="danger">
                    Esta acción no se puede deshacer. ¿Seguro que quieres eliminar a{" "}
                    <strong className="whitespace-nowrap">
                        {patientToDelete.name} {patientToDelete.surname} ({patientToDelete.personalId})
                    </strong>?
                </Modal>
            )}

            <UploadPatientModal
                data={patientToCreate}
                type="NOT_FOUND"
                onCancel={() => setPatientToCreate(null)}
                onConfirm={() => handleUploadConfirm(patientToCreate, "Paciente creado y espirometría asociada correctamente.")}
                loading={isCreating}
            />

            <UploadPatientModal
                data={patientExists}
                type="EXISTS"
                onCancel={() => setPatientExists(null)}
                onConfirm={() => handleUploadConfirm(patientExists, "Espirometría asociada correctamente.")}
                loading={isCreating}
            />

        </div>
    );
}

export default PatientList;