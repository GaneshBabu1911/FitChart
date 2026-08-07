/**
 * SellerDashboard.jsx - Main seller dashboard with stats and recent products
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, PlusCircle, BarChart3, TrendingUp, Eye, Shirt } from "lucide-react";
import { getProducts } from "../api/client";
import DashboardCard from "../components/DashboardCard";
import LoadingSpinner from "../components/LoadingSpinner";

const SAMPLE_STATS = [
  { title: "Total Products", value: 0, icon: ShoppingBag, color: "purple" },
  { title: "Charts Generated", value: 0, icon: BarChart3, color: "indigo" },
  { title: "Recommendations", value: 247, icon: TrendingUp, color: "emerald", trend: "+12% this week" },
  { title: "Avg Confidence", value: "91%", icon: Eye, color: "pink" },
];

export default function SellerDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then(({ data }) => setProducts(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = SAMPLE_STATS.map((s, i) => {
    if (i === 0) return { ...s, value: products.length };
    if (i === 1) return { ...s, value: products.filter((p) => p.fit_charts?.length > 0).length };
    return s;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Seller Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your products and generate AI-powered fit charts.</p>
        </div>
        <Link to="/seller/new" id="add-product-cta" className="btn-primary">
          <PlusCircle size={16} /> Add Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <DashboardCard key={s.title} {...s} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-6">
        <h2 className="text-base font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link to="/seller/new" className="flex items-center gap-3 p-4 rounded-xl bg-purple-600/10 border border-purple-500/20 hover:bg-purple-600/20 transition-all group">
            <PlusCircle size={20} className="text-purple-400 group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-sm font-semibold text-white">Add Product</p>
              <p className="text-xs text-slate-400">Upload garment & generate chart</p>
            </div>
          </Link>
          <Link to="/seller/products" className="flex items-center gap-3 p-4 rounded-xl bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600/20 transition-all group">
            <ShoppingBag size={20} className="text-indigo-400 group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-sm font-semibold text-white">View Products</p>
              <p className="text-xs text-slate-400">Browse all saved products</p>
            </div>
          </Link>
          <Link to="/customer" className="flex items-center gap-3 p-4 rounded-xl bg-pink-600/10 border border-pink-500/20 hover:bg-pink-600/20 transition-all group">
            <Shirt size={20} className="text-pink-400 group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-sm font-semibold text-white">Fit Assistant</p>
              <p className="text-xs text-slate-400">Try customer size finder</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Products */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Recent Products</h2>
          <Link to="/seller/products" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
            View all →
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner size="sm" text="Loading products..." />
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag size={40} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No products yet.</p>
            <Link to="/seller/new" className="btn-primary mt-4 inline-flex">
              <PlusCircle size={16} /> Add Your First Product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                  <th className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Brand</th>
                  <th className="pb-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="pb-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 5).map((p) => (
                  <tr key={p.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600/30 to-indigo-600/30 flex items-center justify-center flex-shrink-0">
                          <Shirt size={14} className="text-purple-400" />
                        </div>
                        <div>
                          <p className="text-slate-200 font-medium">{p.name}</p>
                          <p className="text-xs text-slate-500">#{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-slate-400">{p.category}</td>
                    <td className="py-3 pr-4 text-slate-400">{p.brand || "—"}</td>
                    <td className="py-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Saved
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link to={`/seller/products`}
                        className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                        Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
