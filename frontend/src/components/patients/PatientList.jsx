import {useEffect, useState} from "react";
import {getPatients} from "../../services/patientService.js";

function PatientList({ onPatientClicked, onUploadClicked, onDeleteClicked, onEditClicked}) {

    const [patients, setPatients] = useState([]);
    const [patientToDelete, setPatientToDelete] = useState(null);

    useEffect(() => {
        getPatients().then(setPatients);
    }, []);

    const handleUploadClick = (id) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".xml";
        input.onchange = (e) => {
            const file = e.target.files[0];
            onUploadClicked(id, file); // avisa hacia arriba con el archivo
        };
        input.click();
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900">Listado de Pacientes</h1>
            <p className="mt-1 text-sm text-gray-500">Gestiona y revisa todos los pacientes registrados</p>

            <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        {["Nombre", "DNI", "Edad", "Género", "IMC", "Fumador", "Sesiones", "Estado"].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                {h}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                    {patients.map(patient => {
                        return (
                            <tr onClick={() => onPatientClicked(patient)} key={patient.id} className="hover:bg-gray-50 cursor-pointer">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{patient.name}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{patient.personalId}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{patient.age}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{patient.gender}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{patient.imc}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{patient.smoker ? "Yes" : "No"}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{patient.sessions?.length ?? 0}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                        (patient.sessions?.length ?? 0) === 0
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-green-100 text-green-700"
                                    }`}>
                                        {(patient.sessions?.length ?? 0) === 0 ? "Nuevo" : "Activo"}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUploadClick(patient.id);
                                        }}
                                        className="inline-flex items-center rounded-md border border-green-600 px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-blue-50">
                                        Subir
                                    </button>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEditClicked(patient);
                                        }}
                                        className="inline-flex items-center rounded-md border border-blue-600 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50">
                                        Editar
                                    </button>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    <button className="border border-red-600 text-red-600 hover:bg-red-50 rounded-md px-3 py-1.5 text-xs font-medium"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPatientToDelete(patient.id);}
                                    }>
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>

            {patientToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 shadow-xl w-80">
                        <h2 className="text-lg font-semibold text-gray-800">¿Eliminar paciente?</h2>
                        <p className="text-sm text-gray-500 mt-2">
                            Esta acción no se puede deshacer. ¿Seguro que quieres eliminar a <strong>{patientToDelete}</strong>?
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setPatientToDelete(null)}
                                className="border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-md px-4 py-2 text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => { onDeleteClicked(patientToDelete); setPatientToDelete(null); }}
                                className="bg-red-600 hover:bg-red-700 text-white rounded-md px-4 py-2 text-sm font-medium"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default PatientList;