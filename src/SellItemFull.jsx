import React, { useState } from "react";
import { uploadImage, createDocument } from "../services/firebase";

export default function SellItemFull() {
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "Textbooks",
    description: "",
    condition: "Good",
    price: "",
    location: "North Campus",
    contactInfo: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Upload a product picture.");

    try {
      setSubmitting(true);
      const imageUrl = await uploadImage(file, "marketplace");
      await createDocument("marketplace_items", {
        ...formData,
        price: parseFloat(formData.price) || 0,
        imageUrl
      });
      alert("Product published!");
      setFormData({ title: "", category: "Textbooks", description: "", condition: "Good", price: "", location: "North Campus", contactInfo: "" });
      setFile(null);
    } catch (err) {
      console.error(err);
      alert("Error publishing item.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen py-10 px-8 font-sans">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h1 className="text-xl font-extrabold text-slate-900">Post New Marketplace Item</h1>
        
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Item Photo</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} required className="w-full text-xs text-slate-500 border border-slate-200 rounded-lg p-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Product Title</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs">
              <option>Textbooks</option>
              <option>Electronics</option>
              <option>Furniture</option>
              <option>Clothing</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Price ($)</label>
            <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Condition</label>
            <select value={formData.condition} onChange={(e) => setFormData({ ...formData, condition: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs">
              <option>Brand New</option>
              <option>Like New</option>
              <option>Good</option>
              <option>Fair</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
          <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs h-20" />
        </div>

        <button type="submit" disabled={submitting} className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-indigo-700">
          {submitting ? "Uploading..." : "Publish Item"}
        </button>
      </form>
    </div>
  );
}