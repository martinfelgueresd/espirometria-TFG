// Muestra corta de una línea (color, trazo y grosor) para leyendas y tablas.
// Sirve para identificar una serie sin depender solo del color.
function LineKey({ color, dash = "solid", width = 2 }) {
    return (
        <svg width="24" height="10" aria-hidden="true" className="shrink-0">
            <line
                x1="2" y1="5" x2="22" y2="5"
                stroke={color}
                strokeWidth={width}
                strokeDasharray={dash === "dash" ? "5 3" : undefined}
            />
        </svg>
    );
}

export default LineKey;
