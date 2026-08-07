/**
 * ProductList.jsx - Full product listing with fit chart generation
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ShoppingBag, PlusCircle, Trash2, Wand2, ChevronDown, ChevronUp, Shirt, Search
} from "lucide-react";
import { getProducts, generateFitChart, deleteProduct } from "../api/client";
import FitChartTable from "../components/FitChartTable";
import LoadingSpinner from "../components/LoadingSpinner";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [fitCharts, setFitCharts] = useState({});
  const [generatingId, setGeneratingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadProducts = () => {
    getProducts()
      .then(({ data }) => setProducts(data))
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProducts(); }, []);

  const handleGenerate = async (productId) => {
    setGeneratingId(productId);
    try {
      const { data } = await generateFitChart(productId);
      setFitCharts((prev) => ({ ...prev, [productId]: data }));
      setExpandedId(productId);
      toast.success("Fit chart generated! 🎉");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Generation failed");
    } finally {
      setGeneratingId(null);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <LoadingSpinner text="Loading products..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">My Products</h1>
          <p className="text-sm text-slate-400 mt-1">{products.length} product{products.length !== 1 ? "s" : ""} saved</p>
        </div>
        <Link to="/seller/new" className="btn-primary">
          <PlusCircle size={16} /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          id="search-products"
          type="text"
          className="form-input pl-9"
          placeholder="Search products by name, category, or brand..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <ShoppingBag size={48} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-sm mb-4">
            {searchQuery ? "No products match your search." : "No products yet."}
          </p>
          {!searchQuery && (
            <Link to="/seller/new" className="btn-primary inline-flex">
              <PlusCircle size={16} /> Add Your First Product
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((product) => {
            const isExpanded = expandedId === product.id;
            const chartForProduct = fitCharts[product.id];

            return (
              <div key={product.id} className="glass-card overflow-hidden">
                {/* Product row */}
                <div className="p-5 flex items-center gap-4">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/30 to-indigo-600/30 flex items-center justify-center flex-shrink-0">
                    <Shirt size={20} className="text-purple-400" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-semibold text-white truncate">{product.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {product.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                      {product.brand && <span>Brand: {product.brand}</span>}
                      {product.fabric_composition && <span>Fabric: {product.fabric_composition}</span>}
                      {product.stretch_percentage > 0 && <span>Stretch: {product.stretch_percentage}%</span>}
                      {product.gsm && <span>GSM: {product.gsm}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      id={`generate-chart-${product.id}`}
                      onClick={() => handleGenerate(product.id)}
                      disabled={generatingId === product.id}
                      className="btn-primary text-xs px-3 py-2"
                    >
                      {generatingId === product.id ? (
                        <span className="flex items-center gap-1"><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</span>
                      ) : (
                        <><Wand2 size={13} /> Generate Chart</>
                      )}
                    </button>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : product.id)}
                      className="btn-secondary text-xs px-3 py-2"
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <button
                      id={`delete-product-${product.id}`}
                      onClick={() => handleDelete(product.id)}
                      className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Expanded: Measurements + Fit Chart */}
                {isExpanded && (
                  <div className="border-t border-white/10 p-5 bg-white/[0.02] space-y-5">
                    {/* Measurements */}
                    {product.measurements && (
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Base Measurements (M size)</p>
                        <div className="flex flex-wrap gap-3">
                          {Object.entries(product.measurements)
                            .filter(([k, v]) => !["id", "product_id"].includes(k) && v != null)
                            .map(([k, v]) => (
                              <div key={k} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs">
                                <span className="text-slate-500 capitalize">{k.replace(/_/g, " ")}: </span>
                                <span className="text-slate-200 font-medium">{v} cm</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Fit chart */}
                    {chartForProduct ? (
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Generated Fit Chart</p>
                        <FitChartTable
                          chartData={chartForProduct.chart_json}
                          explanations={chartForProduct.explanations_json}
                        />
                      </div>
                    ) : (
                      <div className="text-center py-4 text-sm text-slate-500">
                        Click <strong className="text-purple-400">Generate Chart</strong> to create an AI fit chart for this product.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
