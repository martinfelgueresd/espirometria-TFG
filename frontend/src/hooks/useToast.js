import { useCallback, useRef, useState } from "react";

export function useToast(duration = 5000) {
    const [toast, setToast] = useState(null);
    const timerRef = useRef(null);

    // useCallback mantiene la misma función entre renderizados, así se puede usar dentro de un useEffect.
    const showToast = useCallback((message, type) => {
        setToast({ message, type });
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setToast(null), duration);
    }, [duration]);

    const clearToast = useCallback(() => setToast(null), []);

    return { toast, showToast, clearToast };
}
