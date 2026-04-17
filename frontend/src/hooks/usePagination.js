import { useState, useEffect, useMemo } from "react";

export function usePagination(items, itemsPerPage = 10) {
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [items.length]);

    const totalPages = Math.ceil(items.length / itemsPerPage);

    const paginatedItems = useMemo(() =>
            items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
        [items, currentPage, itemsPerPage]
    );

    const from = (currentPage - 1) * itemsPerPage + 1;
    const to = Math.min(currentPage * itemsPerPage, items.length);

    const nextPage = () => setCurrentPage(p => p + 1);
    const prevPage = () => setCurrentPage(p => p - 1);

    return { currentPage, totalPages, paginatedItems, from, to, nextPage, prevPage };
}