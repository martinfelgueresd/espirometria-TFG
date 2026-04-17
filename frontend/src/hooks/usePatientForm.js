import { useState } from "react";

const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]*$/;
const ID_REGEX = /^[a-zA-Z0-9]*$/;
const SHAKE_DURATION = 400;

export function usePatientForm(initialValues) {
    const [form, setForm] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [shaking, setShaking] = useState({});

    const triggerShake = (name) => {
        setShaking(prev => ({ ...prev, [name]: true }));
        setTimeout(() => setShaking(prev => ({ ...prev, [name]: false })), SHAKE_DURATION);
    };

    const isValidField = (name, value) => {
        if ((name === "name" || name === "surname") && !NAME_REGEX.test(value)) return false;
        return !(name === "personalId" && !ID_REGEX.test(value));

    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (!isValidField(name, value)) {
            triggerShake(name);
            return;
        }

        setForm(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const resetForm = () => {
        setForm(initialValues);
        setErrors({});
    };

    return { form, errors, shaking, handleChange, setErrors, resetForm };
}