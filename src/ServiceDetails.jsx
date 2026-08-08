import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDocumentById } from "../services/firebase";

export default function ServiceDetails() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchService() {
      try {
        const data = await getDocumentById("services", id);
        setService(data);
      } catch (err) {
        console.error("Error fetching service details:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchService();
  }, [id]);

  if (loading) return <div className="p-8 text-xs text-slate-400">Loading service...</div>;
  if (!service) return <div className="p-8 text-xs text-slate-400">Service not found.</div>;

  return (
    <div className="bg-[#f8fafc] min-h-screen py-10 px-8">
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-1 rounded-full">{service.category}</span>
        <h1 className="text-2xl font-extrabold text-slate-900">{service.title}</h1>
        <p className="text-xl font-extrabold text-indigo-600">${service.rate} ({service.pricingModel})</p>
        
        {service.portfolioUrl && (
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <p className="text-[11px] font-bold text-slate-500">Portfolio</p>
            <a href={service.portfolioUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 font-bold hover:underline">
              {service.portfolioUrl}
            </a>
          </div>
        )}

        <div>
          <p className="text-xs font-bold text-slate-700 mb-1">Service Description</p>
          <p className="text-xs text-slate-600 leading-relaxed">{service.description}</p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
          <span className="text-slate-500">Contact: {service.contactMethod}</span>
          <button className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg">Contact Provider</button>
        </div>
      </div>
    </div>
  );
}