function FieldWrapper({ field, errors, children }) {
    return (
        <div className="relative">
            {children}
            {errors[field] && (
                <div className="group absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer">
                    <span className="text-red-500 text-sm">⚠</span>
                    <div className="absolute bottom-full right-0 mb-1 hidden group-hover:block z-10">
                        <div className="bg-red-600 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap shadow-lg">
                            {errors[field]}
                            <div className="absolute top-full right-2 border-4 border-transparent border-t-red-600"/>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FieldWrapper;