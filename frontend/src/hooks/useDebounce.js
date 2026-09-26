import { useEffect, useState } from "react";

// Devuelve el valor con retraso: solo cambia cuando lleva `delay` ms sin cambiar.
// Sirve para no pedir la búsqueda al backend en cada tecla, sino cuando el usuario deja de escribir.
export function useDebounce(value, delay = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}
