import LineKey from "./LineKey.jsx";
import { getParamValue } from "../../utils/studyUtils.js";
import { hasCurves } from "../../utils/chartUtils.js";

// Parámetros de cada maniobra que se muestran en la tabla, con su unidad.
const PARAM_COLUMNS = [
    { name: "FVC", label: "FVC (L)" },
    { name: "FEV1", label: "FEV1 (L)" },
    { name: "PEF", label: "PEF (L/s)" },
    { name: "VEXT", label: "Vext (L)" },
];

const HEADERS = ["Orden", "Hora", "Aceptable", "Grado", "Motivo", ...PARAM_COLUMNS.map(column => column.label)];

// Tabla de maniobras de una fase. Hace también de leyenda de las gráficas: cada fila lleva la muestra
// de su línea (mismo color y trazo) y, al hacer clic en ella, esa maniobra se resalta en las gráficas.
function ManeuverTable({ series, selectedOrder, onManeuverClick }) {
    if (series.length === 0) {
        return <p className="text-sm text-gray-400">Sin maniobras registradas en esta fase.</p>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    {HEADERS.map(h => (
                        <th key={h} className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {h}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                {series.map(s => {
                    const m = s.maneuver;
                    // Las maniobras sin curva no se pueden resaltar: no hay nada que resaltar en las gráficas.
                    const canSelect = hasCurves(m);
                    const isSelected = m.order === selectedOrder;

                    return (
                        <tr
                            key={s.id}
                            onClick={canSelect ? () => onManeuverClick(m.order) : undefined}
                            className={`${isSelected ? "bg-blue-50" : "hover:bg-gray-50"} ${canSelect ? "cursor-pointer" : ""}`}>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                <div className="flex items-center gap-2">
                                    {canSelect
                                        ? <LineKey color={s.color} dash={s.dash} width={s.width} />
                                        : <span className="text-xs font-normal text-gray-400">sin curva</span>}
                                    {m.order}
                                </div>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">{m.hour}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{m.acceptable ? "Sí" : "No"}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{m.grade ?? "—"}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{m.rejection_reason ?? "—"}</td>
                            {PARAM_COLUMNS.map(column => (
                                <td key={column.name} className="px-4 py-2 text-sm text-gray-500">
                                    {getParamValue(m, column.name) ?? "—"}
                                </td>
                            ))}
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
}

export default ManeuverTable;
