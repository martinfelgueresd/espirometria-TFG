import { useState, useMemo } from "react";

export function useSort(items, initialField = null, initialDir = "asc") {
    const [sortField, setSortField] = useState(initialField);
    const [sortDir, setSortDir] = useState(initialDir);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDir("asc");
        }
    };

    const clearSort = () => {
        setSortField(initialField);
        setSortDir(initialDir);
    };

    const sortedItems = useMemo(() => {
        if (!sortField) return items;
        return [...items].sort((a, b) => {
            const aVal = a[sortField] ?? "";
            const bVal = b[sortField] ?? "";
            if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
            if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
            return 0;
        });
    }, [items, sortField, sortDir]);

    return { sortField, sortDir, sortedItems, handleSort, clearSort };
}