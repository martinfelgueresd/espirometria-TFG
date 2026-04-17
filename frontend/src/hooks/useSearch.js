import { useState, useMemo } from "react";

export function useSearch(items, filterFn) {
    const [search, setSearch] = useState("");

    const filteredItems = useMemo(() =>
            items.filter(item => filterFn(item, search.toLowerCase())),
        [items, search, filterFn]
    );

    return { search, setSearch, filteredItems };
}