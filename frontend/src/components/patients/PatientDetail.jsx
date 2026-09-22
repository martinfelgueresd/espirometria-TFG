import { Pencil, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { buildSessionRow, formatDate} from "../../utils/studyUtils.js";
import Toast from "../common/Toast.jsx";
import Modal from "../common/Modal.jsx";
import { useToast } from "../../hooks/useToast.js";
import { useFilePicker } from "../../hooks/useFilePicker.js";
import { useSort } from "../../hooks/useSort.js";

const sessionGradeClasses = (grade) => {
    if (grade === "A" || grade === "B") return "bg-green-100 text-green-700";
    if (grade === "C") return "bg-yellow-100 text-yellow-700";
    if (grade === "D" || grade === "E" || grade === "F") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-500";
};

function PatientDetail({ patient, onEditClicked, onUploadClicked, onDeleteStudyClicked }) {

    const sessions = (patient.studies ?? []).map(buildSessionRow);
    const { sortField, sortDir, sortedItems: sortedSessions, handleSort } = useSort(sessions, "date", "desc");
    const { toast, showToast, clearToast } = useToast();
    const { pickFile } = useFilePicker(".xml");
    const [studyToDelete, setStudyToDelete] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleUploadClick = async () => {
        const file = await pickFile();
        if (!file) return;
        try {
            setIsUploading(true);
            await onUploadClicked(patient.id, file);
            showToast("Espirometría subida correctamente.", "success");
        } catch (error) {
            showToast(error.message, "error");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            setIsDeleting(true);
            await onDeleteStudyClicked(studyToDelete.id);
            showToast("Estudio eliminado correctamente.", "success");
        } catch (error) {
            showToast(error.message, "error");
        } finally {
            setIsDeleting(false);
        }
        setStudyToDelete(null);
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <Toast message={toast?.message} type={toast?.type} onClose={clearToast} />

            <div className="flex justify-between items-center mt-8 mb-6">
                <h1 className="text-3xl font-bold text-gray-800">{patient.name} {patient.surname}</h1>
                <div className="flex gap-3">
                    <button
                        onClick={handleUploadClick}
                        disabled={isUploading}
                        className="inline-flex items-center gap-2 rounded-md border border-green-600 px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 disabled:opacity-50">
                        {isUploading ? (
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                            </svg>
                        ) : (
                            <Upload size={16} />
                        )}
                        {isUploading ? "Subiendo..." : "Subir espirometría"}
                    </button>
                    <button
                        onClick={() => onEditClicked(patient)}
                        className="inline-flex items-center gap-2 rounded-md border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50">
                        <Pencil size={16} />
                        Editar paciente
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="grid grid-cols-4 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">DNI</p>
                        <p className="text-sm font-medium text-gray-900">{patient.personalId}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Edad</p>
                        <p className="text-sm font-medium text-gray-900">{patient.age}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(patient.birth_date)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Género</p>
                        <p className="text-sm font-medium text-gray-900">{patient.gender === 'M' ? "Masculino" : "Femenino"}</p>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-4">Datos clínicos</p>
                    <div className="grid grid-cols-5 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Altura</p>
                            <p className="text-sm font-medium text-gray-900">{patient.height} cm</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Peso</p>
                            <p className="text-sm font-medium text-gray-900">{patient.weight} kg</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">IMC</p>
                            <p className="text-sm font-medium text-gray-900">{patient.imc}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Fumador</p>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                patient.smoker
                                    ? "bg-red-100 text-red-700"
                                    : "bg-green-100 text-green-700"
                            }`}>
                                {patient.smoker ? "Sí" : "No"}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Grupo Étnico</p>
                            <p className="text-sm font-medium text-gray-900">{patient.ethnic_group}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th
                            onClick={() => handleSort("date")}
                            className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 cursor-pointer hover:text-gray-800 select-none">
                            <div className="flex items-center gap-1">
                                Fecha
                                {sortField === "date" && <span>{sortDir === "asc" ? "↑" : "↓"}</span>}
                            </div>
                        </th>
                        {["Protocolo", "FVC pre-post", "FEV1 pre-post", "FEV1/FVC pre-post", "Grado calidad sesión pre-post", ""].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                {h}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                    {sessions.length === 0 && (
                        <tr>
                            <td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-400">
                                Este paciente todavía no tiene sesiones de espirometría registradas.
                            </td>
                        </tr>
                    )}
                    {sortedSessions.map(session => (
                        <tr key={session.id} className="hover:bg-gray-50 cursor-pointer">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{session.fecha}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{session.protocolo}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{session.fvc_pre ?? "—"} → {session.fvc_post ?? "—"}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{session.fev1_pre ?? "—"} → {session.fev1_post ?? "—"}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{session.fev1_fvc_pre ? session.fev1_fvc_pre + "%" : "—"} → {session.fev1_fvc_post ? session.fev1_fvc_post + "%" : "—"}</td>
                            <td className="px-4 py-3 text-sm">
                                <div className="flex items-center gap-1.5">
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${sessionGradeClasses(session.grado_sesion_pre)}`}>
                                        {session.grado_sesion_pre ?? "—"}
                                    </span>
                                    <span className="text-gray-400">/</span>
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${sessionGradeClasses(session.grado_sesion_post)}`}>
                                        {session.grado_sesion_post ?? "—"}
                                    </span>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setStudyToDelete(session); }}
                                    className="border border-red-600 text-red-600 hover:bg-red-50 rounded-md px-3 py-1.5 text-xs font-medium">
                                    <Trash2 size={14} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {studyToDelete && (
                <Modal
                    title="¿Eliminar estudio?"
                    onCancel={() => setStudyToDelete(null)}
                    onConfirm={handleDeleteConfirm}
                    confirmText="Eliminar"
                    loadingText="Eliminando..."
                    loading={isDeleting}
                    confirmStyle="danger">
                    Esta acción no se puede deshacer. ¿Seguro que quieres eliminar el estudio del{" "}
                    <strong className="whitespace-nowrap">{studyToDelete.fecha}</strong>?
                </Modal>
            )}
        </div>
    );
}

export default PatientDetail;