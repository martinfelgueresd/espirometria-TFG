function Button({ children, type = "button", variant = "primary", className = "", ...props }) {
    const variants = {
        primary: "bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white",
        danger: "bg-red-500 hover:bg-red-600 active:bg-red-700 text-white",
        secondary: "border border-gray-300 text-gray-600 hover:bg-gray-50",
    };

    return (
        <button
            type={type}
            className={`font-medium px-6 py-2.5 rounded-lg transition-colors ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

export default Button;