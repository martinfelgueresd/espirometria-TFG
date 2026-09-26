import { useEffect, useState } from "react";
import { getPatients } from "../../services/patientService.js";
import { UserPlus, Upload } from "lucide-react";
import Toast from "../common/Toast.jsx";
import Modal from "../common/Modal.jsx";
import PatientTable from "./PatientTable.jsx";
import Pagination from "./Pagination.jsx";
import UploadPatientModal from "./UploadPatientModal.jsx";
import { useToast } from "../../hooks/useToast.js";
import { useDebounce } from "../../hooks/useDebounce.js";
import { useFilePicker } from "../../hooks/useFilePicker.js";
import { createPatientAndUpload } from "../../services/studyService.js";

const PAGE_SIZE = 10;
const DEFAULT_SORT = { field: "name", dir: "asc" };
const EMPTY_PAGE = { content: [], page: 0, totalElements: 0, totalPages: 0 };

function PatientList({ successMessage, onSuccessMessageShown, onNewPatientClicked, onPatientClicked, onUploadClicked, onUploadGlobalClicked, onDeleteClicked, onEditClicked }) {

    const [patientsPage, setPatientsPage] = useState(EMPTY_PAGE);
    const [page, setPage] = useState(0);
    const [sort, setSort] = useState(DEFAULT_SORT);
    const [search, setSearch] = useState("");
    const [reloadKey, setReloadKey] = useState(0);
    const debouncedSearch = useDebounce(search);

    const [patientToDelete, setPatientToDelete] = useState(null);
    const [patientToCreate, setPatientToCreate] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [uploadingId, setUploadingId] = useState(null);
    const { toast, showToast, clearToast } = useToast();
    const { pickFile } = useFilePicker(".xml");

    // Pide la página al backend cada vez que cambia la página, el orden, la búsqueda o se fuerza una recarga.
    useEffect(() => {
        let ignore = false; // si el usuario ya ha pedido otra página, la respuesta antigua se descarta

        getPatients({ page, size: PAGE_SIZE, sort: sort.field, dir: sort.dir, search: debouncedSearch })
            .then(data => {
                if (ignore) return;
                // Si se ha borrado el último paciente de una página, se vuelve a la anterior.
                if (data.content.length === 0 && data.page > 0) setPage(data.page - 1);
                else setPatientsPage(data);
            })
            .catch(error => {
                if (!ignore) showToast(error.message, "error");
            });

        return () => { ignore = true; };
    }, [page, sort, debouncedSearch, reloadKey, showToast]);

    useEffect(() => {
        if (successMessage) {
            showToast(successMessage, "success");
            onSuccessMessageShown();
        }
    }, [successMessage]);

    const reload = () => setReloadKey(key => key + 1);

    const handleSearchChange = (value) => {
        setSearch(value);
        setPage(0);
    };

    const handleSort = (field) => {
        setSort(current => current.field === field
            ? { field, dir: current.dir === "asc" ? "desc" : "asc" }
            : { field, dir: "asc" });
        setPage(0);
    };

    const clearSort = () => {
        setSort(DEFAULT_SORT);
        setPage(0);
    };

    // Abrir o editar un paciente pide su detalle al backend: si falla, se avisa aquí.
    const handlePatientClick = async (patient) => {
        try {
            await onPatientClicked(patient);
        } catch (error) {
            showToast(error.message, "error");
        }
    };

    const handleEditClick = async (patient) => {
        try {
            await onEditClicked(patient);
        } catch (error) {
            showToast(error.message, "error");
        }
    };

    const handleUploadClick = async (id) => {
        const file = await pickFile();
        if (!file) return;
        try {
            setUploadingId(id);
            await onUploadClicked(id, file);
            reload();
            showToast("Espirometría subida correctamente.", "success");
        } catch (error) {
            showToast(error.message, "error");
        } finally {
            setUploadingId(null);
        }
    };

    const handleGlobalUpload = async () => {
        const file = await pickFile();
        if (!file) return;
        try {
            await onUploadGlobalClicked(file);
            reload();
            showToast("Espirometría subida correctamente.", "success");
        } catch (error) {
            // Si el paciente del XML no está registrado, se ofrece crearlo con los datos del XML.
            if (error.code === "PATIENT_NOT_FOUND") {
                const { dni, firstName, lastName } = error.details;
                setPatientToCreate({ dni, firstName, lastName, file });
            } else {
                showToast(error.message, "error");
            }
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            await onDeleteClicked(patientToDelete.id);
            reload();
            showToast("Paciente eliminado correctamente.", "success");
        } catch (error) {
            showToast(error.message, "error");
        }
        setPatientToDelete(null);
    };

    const handleCreateConfirm = async () => {
        try {
            setIsCreating(true);
            await createPatientAndUpload(patientToCreate.file);
            reload();
            showToast("Paciente creado y espirometría asociada correctamente.", "success");
        } catch (error) {
            showToast(error.message, "error");
        } finally {
            setIsCreating(false);
            setPatientToCreate(null);
        }
    };

    const { content: patients, totalElements, totalPages } = patientsPage;
    const firstIndex = patientsPage.page * PAGE_SIZE;

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
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-80 border border-gray-200 rounded-lg px-3 h-9 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    {(sort.field !== DEFAULT_SORT.field || sort.dir !== DEFAULT_SORT.dir) && (
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
                    patients={patients}
                    sortField={sort.field}
                    sortDir={sort.dir}
                    onSort={handleSort}
                    onPatientClick={handlePatientClick}
                    onUpload={handleUploadClick}
                    onEdit={handleEditClick}
                    onDelete={setPatientToDelete}
                    uploadingId={uploadingId}
                />
                <Pagination
                    currentPage={patientsPage.page + 1}
                    totalPages={totalPages}
                    from={totalElements === 0 ? 0 : firstIndex + 1}
                    to={firstIndex + patients.length}
                    total={totalElements}
                    onPrev={() => setPage(p => p - 1)}
                    onNext={() => setPage(p => p + 1)}
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
                onCancel={() => setPatientToCreate(null)}
                onConfirm={handleCreateConfirm}
                loading={isCreating}
            />

        </div>
    );
}

export default PatientList;