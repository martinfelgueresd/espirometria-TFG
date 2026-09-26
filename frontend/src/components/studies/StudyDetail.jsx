import { useEffect, useState } from "react";
import { formatDate } from "../../utils/studyUtils.js";
import { buildComparisonSeries } from "../../utils/chartUtils.js";
import { getStudy } from "../../services/studyService.js";
import CurvePairChart from "./CurvePairChart.jsx";
import PhaseSection from "./PhaseSection.jsx";

const sessionGradeClasses = (grade) => {
    if (grade === "A" || grade === "B") return "bg-green-100 text-green-700";
    if (grade === "C") return "bg-yellow-100 text-yellow-700";
    if (grade === "D" || grade === "E" || grade === "F") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-500";
};

// Resumen de una sesión. Todos los valores llegan calculados del backend: aquí solo se muestran.
function SessionSummaryCard({ title, session }) {
    const maneuverCount = session?.maneuverCount ?? 0;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${sessionGradeClasses(session?.sessionGrade)}`}>
                    {session?.sessionGrade ?? "—"}
                </span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
                {maneuverCount === 0
                    ? "Sin maniobras registradas"
                    : `${session.acceptableCount} de ${maneuverCount} maniobras aceptables`}
            </p>
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <p className="text-sm text-gray-500">FVC</p>
                    <p className="text-sm font-medium text-gray-900">{session?.fvc ?? "—"}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">FEV1</p>
                    <p className="text-sm font-medium text-gray-900">{session?.fev1 ?? "—"}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">FEV1/FVC</p>
                    <p className="text-sm font-medium text-gray-900">
                        {session?.fev1Fvc ? session.fev1Fvc + "%" : "—"}
                    </p>
                </div>
            </div>
        </div>
    );
}

// Comparación de la mejor maniobra de cada fase. Solo tiene sentido si las dos fases tienen alguna maniobra
// aceptable: si una no la tiene, el backend no le asigna mejor maniobra y se explica por qué no se compara.
function ComparisonSection({ preSession, postSession }) {
    const phasesWithoutBest = [["Pre", preSession], ["Post", postSession]]
        .filter(([, session]) => session?.bestManeuverOrder == null)
        .map(([label]) => label);

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Comparación Pre vs Post</h2>
            <p className="text-sm text-gray-500 mb-4">Mejor maniobra de cada fase</p>

            {phasesWithoutBest.length === 0 && (
                <CurvePairChart series={buildComparisonSeries(preSession, postSession)} showLegend />
            )}
            {phasesWithoutBest.length === 1 && (
                <p className="text-sm text-gray-400">
                    No se puede comparar: la fase {phasesWithoutBest[0]} no tiene ninguna maniobra aceptable.
                </p>
            )}
            {phasesWithoutBest.length === 2 && (
                <p className="text-sm text-gray-400">
                    No se puede comparar: ninguna de las dos fases tiene maniobras aceptables.
                </p>
            )}
        </div>
    );
}

function StudyContent({ study }) {
    // Hay estudios sin sesión Post: entonces no se muestran ni la comparación ni la sección de esa fase.
    const hasPostSession = (study.postSession?.maneuverCount ?? 0) > 0;

    return (
        <>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Estudio del {formatDate(study.date)}</h1>
                <p className="text-sm text-gray-500 mt-1">Operador: {study.operator} · Protocolo: {study.protocol}</p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
                <SessionSummaryCard title="Pre" session={study.preSession} />
                <SessionSummaryCard title="Post" session={study.postSession} />
            </div>

            {hasPostSession && <ComparisonSection preSession={study.preSession} postSession={study.postSession} />}

            <div className="flex flex-col gap-6">
                <PhaseSection title="Fase Pre" session={study.preSession} />
                {hasPostSession && <PhaseSection title="Fase Post" session={study.postSession} />}
            </div>
        </>
    );
}

// Detalle de un estudio: pide al backend el estudio completo (resumen de las sesiones, maniobras,
// curvas y parámetros) y lo muestra.
function StudyDetail({ studyUUID, onBackClicked }) {
    const [study, setStudy] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let ignore = false; // si se cambia de estudio antes de que llegue la respuesta, se descarta

        getStudy(studyUUID)
            .then(data => { if (!ignore) setStudy(data); })
            .catch(e => { if (!ignore) setError(e.message); });

        return () => { ignore = true; };
    }, [studyUUID]);

    return (
        <div className="max-w-6xl mx-auto p-6">
            <button
                onClick={onBackClicked}
                className="text-sm text-blue-600 hover:underline mt-8 mb-6 inline-block">
                ← Volver al paciente
            </button>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {!error && !study && <p className="text-sm text-gray-400">Cargando estudio…</p>}
            {study && <StudyContent study={study} />}
        </div>
    );
}

export default StudyDetail;
