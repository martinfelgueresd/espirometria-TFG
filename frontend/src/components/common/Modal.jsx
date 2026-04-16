function Modal({ title, children, onCancel, onConfirm, confirmText, confirmStyle = "blue", loading = false }) {
    const confirmStyles = {
        blue: "bg-blue-600 hover:bg-blue-700 text-white",
        red: "bg-red-600 hover:bg-red-700 text-white",
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 shadow-xl w-96">
                <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                <div className="text-sm text-gray-500 mt-2">{children}</div>
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-md px-4 py-2 text-sm disabled:opacity-50">
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`rounded-md px-4 py-2 text-sm font-medium flex items-center gap-2 disabled:opacity-50 ${confirmStyles[confirmStyle]}`}>
                        {loading && (
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                            </svg>
                        )}
                        {loading ? "Creando..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Modal;