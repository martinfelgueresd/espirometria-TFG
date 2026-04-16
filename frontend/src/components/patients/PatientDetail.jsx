function PatientDetail({ patient }) {

    const sessions = [
        { id: 1, fecha: "10/05/2023", operador: "Cristina", protocolo: "Pre/Post", fvc_pre: 2.91, fvc_post: 3.13, fev1_pre: 2.13, fev1_post: 2.39, fev1_fvc_pre: 73.1, fev1_fvc_post: 76.3, r_broncodilatadora: false, grado_pre: "A", grado_post: "A" },
        { id: 2, fecha: "15/09/2023", operador: "Marcos", protocolo: "Pre/Post", fvc_pre: 2.75, fvc_post: 2.98, fev1_pre: 1.89, fev1_post: 2.21, fev1_fvc_pre: 68.7, fev1_fvc_post: 74.2, r_broncodilatadora: true, grado_pre: "B", grado_post: "A" },
        { id: 3, fecha: "02/02/2024", operador: "Cristina", protocolo: "Solo Pre", fvc_pre: 3.02, fvc_post: null, fev1_pre: 2.25, fev1_post: null, fev1_fvc_pre: 74.5, fev1_fvc_post: null, r_broncodilatadora: null, grado_pre: "A", grado_post: null },
    ];

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
                    {sessions.map(session => (
                        <tr key={session.id} className="hover:bg-gray-50 cursor-pointer">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{session.fecha}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{session.operador}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{session.protocolo}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{session.fvc_pre} → {session.fvc_post ?? "—"}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{session.fev1_pre} → {session.fev1_post ?? "—"}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{session.fev1_fvc_pre}% → {session.fev1_fvc_post ? session.fev1_fvc_post + "%" : "—"}</td>
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
                            <td className="px-4 py-3 text-sm text-gray-500">{session.grado_pre} / {session.grado_post ?? "—"}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default PatientDetail;