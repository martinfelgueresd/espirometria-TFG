import { selectBestManeuver, getParamValue, formatDate } from "../../utils/studyUtils.js";

const sessionGradeClasses = (grade) => {
    if (grade === "A" || grade === "B") return "bg-green-100 text-green-700";
    if (grade === "C") return "bg-yellow-100 text-yellow-700";
    if (grade === "D" || grade === "E" || grade === "F") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-500";
};

const GraphPlaceholder = ({ text }) => (
    <div className="h-48 flex items-center justify-center rounded-lg border border-dashed border-gray-300 text-sm text-gray-400">
        {text}
    </div>
);

function SessionSummaryCard({ title, session }) {
    const maneuvers = session?.spirometries ?? [];
    const acceptedCount = maneuvers.filter(m => m.acceptable).length;
    const best = selectBestManeuver(session);

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${sessionGradeClasses(session?.sessionGrade)}`}>
                    {session?.sessionGrade ?? "—"}
                </span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
                {maneuvers.length === 0
                    ? "Sin maniobras registradas"
                    : `${acceptedCount} de ${maneuvers.length} maniobras aceptables`}
            </p>
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <p className="text-sm text-gray-500">FVC</p>
                    <p className="text-sm font-medium text-gray-900">{getParamValue(best, "FVC") ?? "—"}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">FEV1</p>
                    <p className="text-sm font-medium text-gray-900">{getParamValue(best, "FEV1") ?? "—"}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">FEV1/FVC</p>
                    <p className="text-sm font-medium text-gray-900">
                        {getParamValue(best, "FEV1_FVC_PCT") ? getParamValue(best, "FEV1_FVC_PCT") + "%" : "—"}
                    </p>
                </div>
            </div>
        </div>
    );
}

function ManeuverTable({ maneuvers }) {
    if (!maneuvers || maneuvers.length === 0) {
        return <p className="text-sm text-gray-400">Sin maniobras registradas en esta fase.</p>;
    }

    return (
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
            <tr>
                {["Orden", "Hora", "Aceptable", "Grado", "Motivo"].map(h => (
                    <th key={h} className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {h}
                    </th>
                ))}
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
            {maneuvers.map(m => (
                <tr key={m.order} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{m.order}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{m.hour}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{m.acceptable ? "Sí" : "No"}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{m.grade ?? "—"}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{m.rejection_reason ?? "—"}</td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}

function PhaseSection({ title, session }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
            <div className="mb-6">
                <GraphPlaceholder text="Aquí irá la gráfica Flujo-Volumen con las maniobras de esta fase superpuestas" />
            </div>
            <ManeuverTable maneuvers={session?.spirometries} />
        </div>
    );
}

function StudyDetail({ study, onBackClicked }) {
    return (
        <div className="max-w-6xl mx-auto p-6">
            <button
                onClick={onBackClicked}
                className="text-sm text-blue-600 hover:underline mt-8 mb-6 inline-block">
                ← Volver al paciente
            </button>

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Estudio del {formatDate(study.date)}</h1>
                <p className="text-sm text-gray-500 mt-1">Operador: {study.operator} · Protocolo: {study.protocol}</p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
                <SessionSummaryCard title="Pre" session={study.preSession} />
                <SessionSummaryCard title="Post" session={study.postSession} />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Comparación Pre vs Post</h2>
                <GraphPlaceholder text="Aquí irá la gráfica comparando la mejor maniobra de pre y de post" />
            </div>

            <div className="flex flex-col gap-6">
                <PhaseSection title="Fase Pre" session={study.preSession} />
                <PhaseSection title="Fase Post" session={study.postSession} />
            </div>
        </div>
    );
}

export default StudyDetail;
