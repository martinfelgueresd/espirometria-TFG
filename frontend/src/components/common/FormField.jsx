function FormField({ label, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">{label}</label>
            {children}
        </div>
    );
}

export default FormField;