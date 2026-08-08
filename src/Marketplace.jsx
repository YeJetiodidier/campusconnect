import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDocuments } from "../services/firebase";
import { useFilteredItems } from "../hooks/useFilteredItems";

export default function Marketplace() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, filteredItems } = useFilteredItems(items);
  const categories = ["All", "Textbooks", "Electronics", "Furniture", "Clothing", "Kitchen"];

  useEffect(() => {
    async function fetchItems() {
      try {
        const data = await getDocuments("marketplace_items");
        setItems(data);
      } catch (err) {
        console.error("Error fetching marketplace items:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, []);

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans text-slate-800 pb-16">
      <div className="max-w-7xl mx-auto px-8 pt-8 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-slate-900">Marketplace</h1>
          <Link to="/sell" className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-indigo-700">
            + Sell an Item
          </Link>
        </div>

        {/* Search and Category Filters */}
        <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
          <input
            type="text"
            placeholder="Search items by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs w-72 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
                  selectedCategory === cat ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Live Marketplace Grid */}
        {loading ? (
          <p className="text-xs text-slate-400">Loading marketplace data...</p>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
            No dynamic marketplace items found.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Link key={item.id} to={`/marketplace/${item.id}`} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition">
                <img src={item.imageUrl || "https://via.placeholder.com/300?text=No+Image"} alt={item.title} className="w-full h-48 object-cover" />
                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded">{item.category}</span>
                    <span className="text-xs font-bold text-slate-400">{item.condition}</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 truncate">{item.title}</h3>
                  <p className="text-lg font-extrabold text-indigo-600">${item.price}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}