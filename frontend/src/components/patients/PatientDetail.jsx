import { buildSessionRow } from "../../utils/studyUtils.js";

function PatientDetail({ patient }) {

    const sessions = (patient.studies ?? []).map(buildSessionRow);

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-800 mt-8 mb-6">{patient.name} {patient.surname}</h1>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">DNI</p>
                        <p className="text-sm font-medium text-gray-900">{patient.personalId}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Edad</p>
                        <p className="text-sm font-medium text-gray-900">{patient.age}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Género</p>
                        <p className="text-sm font-medium text-gray-900">{patient.gender === 'M' ? "Masculino" : "Femenino"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Fumador</p>
                        <p className="text-sm font-medium text-gray-900">{patient.smoker ? "Sí" : "No"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Grupo Étnico</p>
                        <p className="text-sm font-medium text-gray-900">{patient.ethnic_group}</p>
                    </div>
                </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        {["Fecha", "Operador", "Protocolo", "FVC pre-post", "FEV1 pre-post", "FEV1/FVC pre-post", "R. Broncodilatadora", "Grado pre-post"].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                {h}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                    {sessions.length === 0 && (
                        <tr>
                            <td colSpan={8} className="px-4 py-6 text-center text-sm text-gray-400">
                                Este paciente todavía no tiene sesiones de espirometría registradas.
                            </td>
                        </tr>
                    )}
                    {sessions.map(session => (
                        <tr key={session.id} className="hover:bg-gray-50 cursor-pointer">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{session.fecha}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{session.operador}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{session.protocolo}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{session.fvc_pre ?? "—"} → {session.fvc_post ?? "—"}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{session.fev1_pre ?? "—"} → {session.fev1_post ?? "—"}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{session.fev1_fvc_pre ? session.fev1_fvc_pre + "%" : "—"} → {session.fev1_fvc_post ? session.fev1_fvc_post + "%" : "—"}</td>
                            <td className="px-4 py-3 text-sm">
                                {session.r_broncodilatadora === null ? (
                                    <span className="text-gray-400">—</span>
                                ) : (
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                        session.r_broncodilatadora
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                    }`}>
                                            {session.r_broncodilatadora ? "Positiva" : "Negativa"}
                                        </span>
                                )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">{session.grado_pre ?? "—"} / {session.grado_post ?? "—"}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default PatientDetail;