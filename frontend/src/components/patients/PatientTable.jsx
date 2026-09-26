import { Upload, Pencil, Trash2 } from "lucide-react";
import { PATIENT_STATUS_LABELS } from "../../constants/patientOptions.js";

const COLUMNS = [
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

function TableHeader({ sortField, sortDir, onSort }) {
    return (
        <thead className="bg-gray-50">
        <tr>
            {COLUMNS.map(({ label, field }, i) => (
                <th
                    key={i}
                    onClick={() => field && onSort(field)}
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
    );
}

function PatientRow({ patient, onClick, onUpload, onEdit, onDelete, isUploading }) {
    const stop = (e, fn) => { e.stopPropagation(); fn(); };

    return (
        <tr onClick={onClick} className="hover:bg-gray-50 cursor-pointer">
            <td className="px-4 py-3 text-sm text-gray-500">{patient.personalId}</td>
            <td className="px-4 py-3 text-sm font-medium text-gray-900">{patient.name + " " + patient.surname}</td>
            <td className="px-4 py-3 text-sm text-gray-500">{patient.age}</td>
            <td className="px-4 py-3 text-sm text-gray-500">{patient.gender === 'M' ? "Masculino" : "Femenino"}</td>
            <td className="px-4 py-3 text-sm text-gray-500">{patient.smoker ? "Sí" : "No"}</td>
            <td className="px-4 py-3 text-sm text-gray-500">{patient.studyCount}</td>
            <td className="px-4 py-3 text-sm text-gray-500">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    patient.status === "NEW" ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-700"
                }`}>
                    {PATIENT_STATUS_LABELS[patient.status]}
                </span>
            </td>
            <td className="px-4 py-3 text-sm text-gray-500">
                <button
                    onClick={(e) => stop(e, onUpload)}
                    disabled={isUploading}
                    className="inline-flex items-center rounded-md border border-green-600 px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 disabled:opacity-50">
                    {isUploading ? (
                        <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                    ) : (
                        <Upload size={14} />
                    )}
                </button>
            </td>
            <td className="px-4 py-3 text-sm text-gray-500">
                <button onClick={(e) => stop(e, onEdit)} className="inline-flex items-center rounded-md border border-blue-600 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50">
                    <Pencil size={14} />
                </button>
            </td>
            <td className="px-4 py-3 text-sm text-gray-500">
                <button onClick={(e) => stop(e, onDelete)} className="border border-red-600 text-red-600 hover:bg-red-50 rounded-md px-3 py-1.5 text-xs font-medium">
                    <Trash2 size={14} />
                </button>
            </td>
        </tr>
    );
}

function PatientTable({ patients, sortField, sortDir, onSort, onPatientClick, onUpload, onEdit, onDelete, uploadingId }) {
    return (
        <table className="min-w-full divide-y divide-gray-200">
            <TableHeader sortField={sortField} sortDir={sortDir} onSort={onSort} />
            <tbody className="divide-y divide-gray-100 bg-white">
            {patients.map(patient => (
                <PatientRow
                    key={patient.id}
                    patient={patient}
                    onClick={() => onPatientClick(patient)}
                    onUpload={() => onUpload(patient.id)}
                    onEdit={() => onEdit(patient)}
                    onDelete={() => onDelete(patient)}
                    isUploading={uploadingId === patient.id}
                />
            ))}
            </tbody>
        </table>
    );
}

export default PatientTable;