function Navbar({ view, setView }) {
    return (
        <nav className="border-b border-gray-200 px-6 py-3 flex gap-6">
            <button
                onClick={() => setView("list")}
                className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                    view === "list"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
                Listado de Pacientes
            </button>
            <button
                onClick={() => setView("form")}
                className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                    view === "form"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
                Nuevo Paciente
            </button>
        </nav>
    );
}

export default Navbar;