import Button from "./Button.jsx";

function Modal({ title, children, onCancel, onConfirm, confirmText, loadingText = "Cargando...", confirmStyle = "primary", loading = false }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 shadow-xl w-96">
                <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                <div className="text-sm text-gray-500 mt-2">{children}</div>
                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="secondary" onClick={onCancel} disabled={loading} className="!px-4 !py-2 !text-sm disabled:opacity-50">
                        Cancelar
                    </Button>
                    <Button variant={confirmStyle} onClick={onConfirm} disabled={loading} className="!px-4 !py-2 !text-sm flex items-center gap-2 disabled:opacity-50">
                        {loading && (
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                            </svg>
                        )}
                        {loading ? loadingText : confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default Modal;