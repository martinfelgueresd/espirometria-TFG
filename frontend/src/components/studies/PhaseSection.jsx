import { useState } from "react";
import CurvePairChart from "./CurvePairChart.jsx";
import ManeuverTable from "./ManeuverTable.jsx";
import { buildPhaseSeries } from "../../utils/chartUtils.js";

// Sección de una fase (Pre o Post): las dos gráficas con todas sus maniobras superpuestas y la tabla de maniobras.
// Al hacer clic en una fila, esa maniobra se resalta en las gráficas; con un segundo clic se deselecciona.
function PhaseSection({ title, session }) {
    const [selectedOrder, setSelectedOrder] = useState(null);
    const series = buildPhaseSeries(session, selectedOrder);

    const handleManeuverClick = (order) => {
        setSelectedOrder(current => (current === order ? null : order));
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>

            {series.length > 0 && (
                <>
                    <div className="mb-6">
                        <CurvePairChart series={series} />
                    </div>
                    <p className="text-xs text-gray-400 mb-2">Haz clic en una maniobra para resaltarla en las gráficas.</p>
                </>
            )}

            <ManeuverTable series={series} selectedOrder={selectedOrder} onManeuverClick={handleManeuverClick} />
        </div>
    );
}

export default PhaseSection;
