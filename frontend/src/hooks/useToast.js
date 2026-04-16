import { useRef, useState } from "react";

export function useToast(duration = 5000) {
    const [toast, setToast] = useState(null);
    const timerRef = useRef(null);

    const showToast = (message, type) => {
        setToast({ message, type });
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setToast(null), duration);
    };

    const clearToast = () => setToast(null);

    return { toast, showToast, clearToast };
}