import { useState, useMemo } from "react";

export function useFilteredItems(items) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredItems = useMemo(() => {
    if (!items) return [];
    return items.filter((item) => {
      const titleMatch = item.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const categoryMatch = selectedCategory === "All" || item.category === selectedCategory;
      return titleMatch && categoryMatch;
    });
  }, [items, searchQuery, selectedCategory]);

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filteredItems
  };
}