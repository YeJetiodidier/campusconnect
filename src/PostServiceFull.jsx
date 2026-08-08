import React, { useState } from "react";
import { uploadImage, createDocument } from "../services/firebase";

export default function PostServiceFull() {
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "Programming",
    pricingModel: "Hourly",
    rate: "",
    contactMethod: "",
    description: "",
    portfolioUrl: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      let imageUrl = "";
      if (file) {
        imageUrl = await uploadImage(file, "services");
      }
      await createDocument("services", {
        ...formData,
        rate: parseFloat(formData.rate) || 0,
        imageUrl
      });
      alert("Service published successfully!");
      setFormData({ title: "", category: "Programming", pricingModel: "Hourly", rate: "", contactMethod: "", description: "", portfolioUrl: "" });
      setFile(null);
    } catch (err) {
      console.error(err);
      alert("Error creating service.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen py-10 px-8 font-sans">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h1 className="text-xl font-extrabold text-slate-900">Post a New Student Service</h1>
        
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Service Image (Optional)</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="w-full text-xs text-slate-500 border border-slate-200 rounded-lg p-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Service Title</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs">
              <option>Programming</option>
              <option>Tutoring</option>
              <option>Design</option>
              <option>Writing</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Pricing Model</label>
            <select value={formData.pricingModel} onChange={(e) => setFormData({ ...formData, pricingModel: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs">
              <option>Hourly</option>
              <option>Fixed Rate</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Rate ($)</label>
            <input type="number" value={formData.rate} onChange={(e) => setFormData({ ...formData, rate: e.target.value })} required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Portfolio Link</label>
          <input type="text" placeholder="https://..." value={formData.portfolioUrl} onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
          <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs h-20" />
        </div>

        <button type="submit" disabled={submitting} className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-indigo-700">
          {submitting ? "Publishing..." : "Publish Service"}
        </button>
      </form>
    </div>
  );
}