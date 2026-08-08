import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDocumentById } from "../services/firebase";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const data = await getDocumentById("marketplace_items", id);
        setProduct(data);
      } catch (err) {
        console.error("Error loading product details:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  if (loading) return <div className="p-8 text-xs text-slate-400">Loading details...</div>;
  if (!product) return <div className="p-8 text-xs text-slate-400">Product not found.</div>;

  return (
    <div className="bg-[#f8fafc] min-h-screen py-10 px-8">
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 shadow-sm grid grid-cols-2 gap-8">
        <img src={product.imageUrl} alt={product.title} className="w-full h-80 object-cover rounded-xl" />
        <div className="space-y-4">
          <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-1 rounded-full">{product.category}</span>
          <h1 className="text-2xl font-extrabold text-slate-900">{product.title}</h1>
          <p className="text-2xl font-extrabold text-indigo-600">${product.price}</p>
          <div className="text-xs space-y-1 text-slate-500">
            <p><strong className="text-slate-700">Condition:</strong> {product.condition}</p>
            <p><strong className="text-slate-700">Pickup Location:</strong> {product.location}</p>
            <p><strong className="text-slate-700">Contact:</strong> {product.contactInfo}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700 mb-1">Description</p>
            <p className="text-xs text-slate-600 leading-relaxed">{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}