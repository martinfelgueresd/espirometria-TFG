function Toast({ message, type, onClose, size = "md" }) {
    if (!message) return null;

    const styles = {
        success: "bg-green-50 border-green-200 text-green-700",
        error: "bg-red-50 border-red-200 text-red-700",
    };

    const icons = {
        success: "✅",
        error: "⚠️",
    };

    const sizes = {
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
    };

    return (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full ${sizes[size]} border rounded-lg shadow-lg p-4 flex items-center gap-3 ${styles[type]}`}>
            <span className="text-lg">{icons[type]}</span>
            <p className="text-sm flex-1">{message}</p>
            <button onClick={onClose} className="font-bold opacity-50 hover:opacity-100">✕</button>
        </div>
    );
}

export default Toast;