import createPlotlyComponent from "react-plotly.js/factory";
// Versión "basic" de Plotly (líneas, barras y sectores): pesa ~1,2 MB frente a los ~4,8 MB de la completa.
import Plotly from "plotly.js/dist/plotly-basic.min";
import LineKey from "./LineKey.jsx";
import { getCurve, hasCurves } from "../../utils/chartUtils.js";
import { CHART_INK, CURVE_CHARTS } from "../../constants/chartOptions.js";

const Plot = createPlotlyComponent(Plotly);

const CHART_HEIGHT = 400;

// Estilo común de los ejes: rejilla fina y gris para que no compita con las curvas.
const AXIS_STYLE = {
    rangemode: "tozero",
    zeroline: false,
    showline: true,
    linecolor: CHART_INK.axis,
    gridcolor: CHART_INK.grid,
    tickfont: { color: CHART_INK.muted },
    hoverformat: ".2f",
};

// Barra de herramientas de Plotly sin el logo ni las herramientas de selección, que aquí no se usan.
const PLOT_CONFIG = {
    displaylogo: false,
    modeBarButtonsToRemove: ["select2d", "lasso2d"],
};

// Convierte una serie en una línea de Plotly, o devuelve null si la maniobra no tiene esta curva.
const toTrace = (series, curveType) => {
    const curve = getCurve(series.maneuver, curveType);
    if (!curve) return null;

    return {
        type: "scatter",
        mode: "lines",
        name: series.name,
        x: curve.x,
        y: curve.y,
        line: { color: series.color, width: series.width, dash: series.dash },
        opacity: series.opacity,
        // En el tooltip va primero el valor, en negrita, y después el nombre de la maniobra.
        hovertemplate: `<b>%{y:.2f} ${CURVE_CHARTS[curveType].yUnit}</b> ${series.name}<extra></extra>`,
    };
};

const buildLayout = (curveType) => {
    const chart = CURVE_CHARTS[curveType];

    return {
        autosize: true,
        height: CHART_HEIGHT,
        margin: { t: 10, r: 10, b: 50, l: 60 },
        font: { family: "Poppins, sans-serif", size: 12, color: CHART_INK.text },
        showlegend: false,
        // Una línea vertical sigue al ratón y el tooltip muestra el valor de todas las maniobras en ese punto.
        hovermode: "x unified",
        // Conserva el zoom cuando cambia la maniobra seleccionada en la tabla.
        uirevision: curveType,
        xaxis: {
            ...AXIS_STYLE,
            title: { text: chart.xTitle },
            unifiedhovertitle: { text: `%{x:.2f} ${chart.xUnit}` },
            spikecolor: CHART_INK.muted,
            spikethickness: 1,
            spikedash: "solid",
            constraintoward: "left",
        },
        yaxis: {
            ...AXIS_STYLE,
            title: { text: chart.yTitle },
            constraintoward: "bottom",
            // La ATS/ERS pide que en la flujo-volumen 2 L/s ocupen lo mismo que 1 L (proporción 2:1).
            ...(curveType === "FLOW_VOLUME" && { scaleanchor: "x", scaleratio: 0.5 }),
        },
    };
};

// Una gráfica (flujo-volumen o volumen-tiempo) con todas las series.
function CurveChart({ curveType, series, className = "" }) {
    const traces = series
        .map(s => toTrace(s, curveType))
        .filter(trace => trace !== null);

    return (
        <div className={className}>
            <h3 className="text-sm font-medium text-gray-700 mb-2">{CURVE_CHARTS[curveType].title}</h3>
            <Plot
                data={traces}
                layout={buildLayout(curveType)}
                config={PLOT_CONFIG}
                useResizeHandler
                style={{ width: "100%" }}
            />
        </div>
    );
}

// Gráficas flujo-volumen y volumen-tiempo, una al lado de la otra, con las mismas series.
// Con showLegend se añade debajo una leyenda común a las dos.
function CurvePairChart({ series, showLegend = false }) {
    const seriesWithCurves = series.filter(s => hasCurves(s.maneuver));

    if (seriesWithCurves.length === 0) {
        return <p className="text-sm text-gray-400">No hay curvas que mostrar.</p>;
    }

    return (
        <div>
            {/* La flujo-volumen ocupa 2/5 del ancho: con la proporción 2:1 su forma es casi cuadrada.
                La volumen-tiempo ocupa 3/5 porque el tiempo llega hasta 10-15 s. */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <CurveChart curveType="FLOW_VOLUME" series={seriesWithCurves} className="lg:col-span-2" />
                <CurveChart curveType="TIME_VOLUME" series={seriesWithCurves} className="lg:col-span-3" />
            </div>

            {showLegend && (
                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
                    {seriesWithCurves.map(s => (
                        <span key={s.id} className="inline-flex items-center gap-2 text-sm text-gray-600">
                            <LineKey color={s.color} dash={s.dash} width={s.width} />
                            {s.name}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CurvePairChart;
