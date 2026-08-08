import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDocuments } from "../services/firebase";
import { useFilteredItems } from "../hooks/useFilteredItems";

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, filteredItems } = useFilteredItems(services);
  const categories = ["All", "Programming", "Tutoring", "Design", "Writing"];

  useEffect(() => {
    async function fetchServices() {
      try {
        const data = await getDocuments("services");
        setServices(data);
      } catch (err) {
        console.error("Error loading services:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans text-slate-800 pb-16">
      <div className="max-w-7xl mx-auto px-8 pt-8 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-slate-900">Student Services</h1>
          <Link to="/post-service" className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-indigo-700">
            + Post Service
          </Link>
        </div>

        <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs w-72"
          />
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
                  selectedCategory === cat ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-xs text-slate-400">Loading services...</p>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
            No dynamic services posted yet.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {filteredItems.map((svc) => (
              <Link key={svc.id} to={`/services/${svc.id}`} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 hover:shadow-md transition">
                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded">{svc.category}</span>
                <h3 className="font-bold text-sm text-slate-900 truncate">{svc.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{svc.description}</p>
                <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-sm font-extrabold text-indigo-600">${svc.rate} / hr</span>
                  <span className="text-[10px] text-slate-400">{svc.pricingModel}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}