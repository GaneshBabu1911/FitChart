/**
 * ProductForm.jsx - Multi-step seller form for uploading products and generating fit charts
 */
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Upload, ChevronRight, ChevronLeft, Wand2, Save, Image, Ruler, Info, CheckCircle2
} from "lucide-react";
import { uploadProduct, generateFitChart } from "../api/client";
import FitChartTable from "../components/FitChartTable";
import LoadingSpinner from "../components/LoadingSpinner";

const STEPS = ["Product Info", "Measurements", "Images", "Generate Chart"];

const CATEGORIES = [
  "T-Shirt", "Shirt", "Blouse", "Dress", "Skirt", "Jeans",
  "Trousers", "Jacket", "Coat", "Hoodie", "Sweater", "Top", "Other"
];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all
            ${i < current ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : i === current ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
              : "bg-white/5 text-slate-500 border border-white/10"}`}>
            {i < current ? <CheckCircle2 size={12} /> : <span>{i + 1}</span>}
            {step}
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-8 h-px ${i < current ? "bg-emerald-500/50" : "bg-white/10"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function ImageUploadZone({ label, file, onChange, id }) {
  const inputRef = useRef();

  return (
    <div>
      <label className="form-label">{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
          ${file ? "border-purple-500/50 bg-purple-500/5" : "border-white/10 hover:border-purple-500/40 hover:bg-white/5"}`}
      >
        {file ? (
          <div className="space-y-2">
            <CheckCircle2 size={24} className="text-purple-400 mx-auto" />
            <p className="text-sm text-purple-300 font-medium">{file.name}</p>
            <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(0)} KB</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Image size={24} className="text-slate-500 mx-auto" />
            <p className="text-sm text-slate-400">Click to upload</p>
            <p className="text-xs text-slate-600">JPEG, PNG, WebP · Max 5MB</p>
          </div>
        )}
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => onChange(e.target.files[0] || null)}
        />
      </div>
    </div>
  );
}

export default function ProductForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form state
  const [info, setInfo] = useState({
    name: "", category: "T-Shirt", brand: "", fabric_composition: "",
    stretch_percentage: 0, gsm: "", description: ""
  });
  const [measurements, setMeasurements] = useState({
    chest: "", waist: "", hip: "", sleeve_length: "", shoulder: "", length: ""
  });
  const [images, setImages] = useState({ front: null, back: null, flat: null });
  const [savedProduct, setSavedProduct] = useState(null);
  const [fitChart, setFitChart] = useState(null);

  const updateInfo = (k, v) => setInfo((p) => ({ ...p, [k]: v }));
  const updateMeasurements = (k, v) => setMeasurements((p) => ({ ...p, [k]: v }));

  const handleSaveProduct = async () => {
    if (!info.name.trim()) { toast.error("Product name is required"); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(info).forEach(([k, v]) => { if (v !== "" && v !== null) fd.append(k, v); });
      Object.entries(measurements).forEach(([k, v]) => { if (v !== "") fd.append(k, v); });
      if (images.front) fd.append("image_front", images.front);
      if (images.back) fd.append("image_back", images.back);
      if (images.flat) fd.append("image_flat", images.flat);

      const { data } = await uploadProduct(fd);
      setSavedProduct(data);
      toast.success("Product saved successfully!");
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateChart = async () => {
    if (!savedProduct) return;
    setLoading(true);
    try {
      const { data } = await generateFitChart(savedProduct.id);
      setFitChart(data);
      toast.success("Fit chart generated! 🎉");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to generate fit chart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="section-title mb-1">Add New Product</h1>
        <p className="text-sm text-slate-400">Fill in product details to generate an AI-powered size chart.</p>
      </div>

      <StepIndicator current={step} />

      <div className="glass-card p-8">
        {/* ── Step 0: Product Info ───────────────────────── */}
        {step === 0 && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Info size={16} className="text-purple-400" /> Product Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Product Name *</label>
                <input id="product-name" className="form-input" placeholder="e.g., Classic Cotton Tee"
                  value={info.name} onChange={(e) => updateInfo("name", e.target.value)} />
              </div>
              <div>
                <label className="form-label">Category *</label>
                <select id="product-category" className="form-input" value={info.category}
                  onChange={(e) => updateInfo("category", e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Brand</label>
                <input id="product-brand" className="form-input" placeholder="e.g., H&M"
                  value={info.brand} onChange={(e) => updateInfo("brand", e.target.value)} />
              </div>
              <div>
                <label className="form-label">Fabric Composition</label>
                <input id="fabric-composition" className="form-input" placeholder="e.g., 60% Cotton, 40% Polyester"
                  value={info.fabric_composition} onChange={(e) => updateInfo("fabric_composition", e.target.value)} />
              </div>
              <div>
                <label className="form-label">Stretch % <span className="text-slate-500 normal-case">(0–100)</span></label>
                <input id="stretch-percentage" type="number" min="0" max="100" className="form-input"
                  placeholder="e.g., 15"
                  value={info.stretch_percentage} onChange={(e) => updateInfo("stretch_percentage", +e.target.value)} />
              </div>
              <div>
                <label className="form-label">GSM <span className="text-slate-500 normal-case">(g/m²)</span></label>
                <input id="product-gsm" type="number" className="form-input" placeholder="e.g., 180"
                  value={info.gsm} onChange={(e) => updateInfo("gsm", e.target.value)} />
              </div>
            </div>
            <div>
              <label className="form-label">Product Description</label>
              <textarea id="product-description" className="form-input min-h-[80px] resize-none" rows={3}
                placeholder="Brief description of the garment..."
                value={info.description} onChange={(e) => updateInfo("description", e.target.value)} />
            </div>
          </div>
        )}

        {/* ── Step 1: Measurements ──────────────────────── */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Ruler size={16} className="text-purple-400" /> Base Measurements (M size, in cm)
            </h2>
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 mb-4">
              💡 Enter the measurements for size <strong>M</strong>. The AI will automatically grade all sizes from XS to XXL.
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { key: "chest", label: "Chest" },
                { key: "waist", label: "Waist" },
                { key: "hip", label: "Hip" },
                { key: "sleeve_length", label: "Sleeve Length" },
                { key: "shoulder", label: "Shoulder" },
                { key: "length", label: "Garment Length" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="form-label">{label}</label>
                  <input
                    id={`measurement-${key}`}
                    type="number"
                    step="0.5"
                    className="form-input"
                    placeholder="cm"
                    value={measurements[key]}
                    onChange={(e) => updateMeasurements(key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Images ────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Upload size={16} className="text-purple-400" /> Garment Images
            </h2>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 mb-4">
              📸 OpenCV will analyze images for color, garment category, and outline. All fields optional.
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ImageUploadZone id="image-front" label="Front View" file={images.front}
                onChange={(f) => setImages((p) => ({ ...p, front: f }))} />
              <ImageUploadZone id="image-back" label="Back View" file={images.back}
                onChange={(f) => setImages((p) => ({ ...p, back: f }))} />
              <ImageUploadZone id="image-flat" label="Flat Lay" file={images.flat}
                onChange={(f) => setImages((p) => ({ ...p, flat: f }))} />
            </div>
          </div>
        )}

        {/* ── Step 3: Generate Chart ────────────────────── */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Wand2 size={16} className="text-purple-400" /> Generate Fit Chart
            </h2>

            {savedProduct && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-sm text-emerald-400 font-medium flex items-center gap-2">
                  <CheckCircle2 size={16} /> Product saved: <strong>{savedProduct.name}</strong>
                </p>
                <p className="text-xs text-slate-400 mt-1">ID: #{savedProduct.id} · Category: {savedProduct.category}</p>
              </div>
            )}

            {!fitChart && !loading && (
              <button id="generate-fit-chart-btn" onClick={handleGenerateChart} className="btn-primary w-full justify-center py-3">
                <Wand2 size={18} />
                Generate Fit Chart with AI
              </button>
            )}

            {loading && <LoadingSpinner text="AI is analyzing your product..." />}

            {fitChart && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 size={16} />
                  <span className="text-sm font-semibold">Fit chart generated successfully!</span>
                </div>

                {/* Image analysis */}
                {fitChart.image_analysis_json && !fitChart.image_analysis_json.fallback && (
                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <p className="text-xs font-semibold text-indigo-300 mb-2 uppercase tracking-wider">
                      🔬 OpenCV Image Analysis
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                      <span>Estimated Category: <strong className="text-slate-200">{fitChart.image_analysis_json.estimated_category}</strong></span>
                      <span>Dominant Color: <strong className="text-slate-200">{fitChart.image_analysis_json.dominant_color}</strong></span>
                      <span>Contour Area: <strong className="text-slate-200">{fitChart.image_analysis_json.contour_area_pct}%</strong></span>
                    </div>
                  </div>
                )}

                <FitChartTable
                  chartData={fitChart.chart_json}
                  explanations={fitChart.explanations_json}
                />

                <div className="flex gap-3 pt-2">
                  <button onClick={() => navigate("/seller/products")} className="btn-primary flex-1 justify-center">
                    <Save size={16} /> View All Products
                  </button>
                  <button onClick={() => { setFitChart(null); setSavedProduct(null); setStep(0); setInfo({ name: "", category: "T-Shirt", brand: "", fabric_composition: "", stretch_percentage: 0, gsm: "", description: "" }); setMeasurements({ chest: "", waist: "", hip: "", sleeve_length: "", shoulder: "", length: "" }); setImages({ front: null, back: null, flat: null }); }}
                    className="btn-secondary">
                    Add Another
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        {step < 3 && (
          <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="btn-secondary disabled:opacity-30"
            >
              <ChevronLeft size={16} /> Back
            </button>
            {step < 2 ? (
              <button id={`next-step-${step}`} onClick={() => setStep((s) => s + 1)} className="btn-primary">
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button id="save-product-btn" onClick={handleSaveProduct} disabled={loading} className="btn-primary">
                {loading ? "Saving..." : <><Save size={16} /> Save Product</>}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
