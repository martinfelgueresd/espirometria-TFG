function Pagination({ currentPage, totalPages, from, to, total, onPrev, onNext }) {
    return (
        <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">
                Mostrando {from} - {to} de {total} pacientes
            </p>
            <div className="flex gap-2">
                <button
                    onClick={onPrev}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-50">
                    Anterior
                </button>
                <button
                    onClick={onNext}
                    disabled={currentPage >= totalPages}
                    className="px-3 py-1 text-sm border border-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-50">
                    Siguiente
                </button>
            </div>
        </div>
    );
}

export default Pagination;