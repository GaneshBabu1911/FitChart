/**
 * CustomerFitAssistant.jsx - AI-powered size recommendation for customers
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { Ruler, Sparkles, CheckCircle2, Info, RefreshCw } from "lucide-react";
import { recommendSize } from "../api/client";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip
} from "recharts";

const SIZE_COLORS = {
  XS: "#a78bfa",
  S: "#60a5fa",
  M: "#34d399",
  L: "#fbbf24",
  XL: "#fb923c",
  XXL: "#f87171",
};

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

function ConfidenceMeter({ value }) {
  const pct = Math.min(100, Math.max(0, value));
  const color = pct >= 85 ? "#34d399" : pct >= 70 ? "#fbbf24" : "#f87171";

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">Confidence Score</span>
        <span className="font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-xs text-slate-500">
        {pct >= 85 ? "Very confident prediction" : pct >= 70 ? "Good confidence" : "Between sizes — try both"}
      </p>
    </div>
  );
}

function SizeBar({ size, probability, isRecommended }) {
  const pct = Math.round((probability || 0) * 100);
  const color = SIZE_COLORS[size] || "#94a3b8";

  return (
    <div className={`p-3 rounded-xl border transition-all ${isRecommended ? "bg-purple-500/10 border-purple-500/40" : "bg-white/5 border-white/10"}`}>
      <div className="flex justify-between items-center mb-1.5">
        <span className={`text-xs font-bold ${isRecommended ? "text-purple-300" : "text-slate-400"}`}>{size}</span>
        <span className="text-xs text-slate-500">{pct}%</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function CustomerFitAssistant() {
  const [form, setForm] = useState({
    height: "", weight: "", chest: "", waist: "", hip: "", preferred_brand: ""
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hasAny = Object.entries(form)
      .filter(([k]) => k !== "preferred_brand")
      .some(([, v]) => v !== "");

    if (!hasAny) {
      toast.error("Please enter at least one body measurement");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const payload = {};
      Object.entries(form).forEach(([k, v]) => {
        if (v !== "") payload[k] = k === "preferred_brand" ? v : Number(v);
      });

      const { data } = await recommendSize(payload);
      setResult(data);
      toast.success("Size predicted! 🎯");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Prediction failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  // Build radar chart data from all_sizes probabilities
  const radarData = result?.all_sizes
    ? ALL_SIZES.map((s) => ({
        size: s,
        probability: Math.round((result.all_sizes[s] || 0) * 100),
      }))
    : [];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title flex items-center gap-2">
          <Ruler size={24} className="text-purple-400" />
          Fit Assistant
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Enter your body measurements and our AI will recommend your perfect size.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
            <Info size={16} className="text-slate-400" /> Your Measurements
          </h2>

          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 mb-5">
            💡 Fill in as many measurements as you know. All fields are optional but more data = better accuracy.
          </div>

          <form id="fit-assistant-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Height (cm)</label>
                <input id="input-height" type="number" step="0.5" className="form-input" placeholder="e.g. 170"
                  value={form.height} onChange={(e) => update("height", e.target.value)} />
              </div>
              <div>
                <label className="form-label">Weight (kg)</label>
                <input id="input-weight" type="number" step="0.5" className="form-input" placeholder="e.g. 65"
                  value={form.weight} onChange={(e) => update("weight", e.target.value)} />
              </div>
              <div>
                <label className="form-label">Chest (cm)</label>
                <input id="input-chest" type="number" step="0.5" className="form-input" placeholder="e.g. 92"
                  value={form.chest} onChange={(e) => update("chest", e.target.value)} />
              </div>
              <div>
                <label className="form-label">Waist (cm)</label>
                <input id="input-waist" type="number" step="0.5" className="form-input" placeholder="e.g. 76"
                  value={form.waist} onChange={(e) => update("waist", e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="form-label">Hip (cm)</label>
                <input id="input-hip" type="number" step="0.5" className="form-input" placeholder="e.g. 98"
                  value={form.hip} onChange={(e) => update("hip", e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="form-label">Preferred Brand <span className="text-slate-500 normal-case">(optional)</span></label>
                <input id="input-brand" type="text" className="form-input" placeholder="e.g. H&M, Zara..."
                  value={form.preferred_brand} onChange={(e) => update("preferred_brand", e.target.value)} />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button id="find-my-size-btn" type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing...
                  </span>
                ) : (
                  <><Sparkles size={18} /> Find My Size</>
                )}
              </button>
              <button type="button" onClick={() => { setForm({ height: "", weight: "", chest: "", waist: "", hip: "", preferred_brand: "" }); setResult(null); }}
                className="btn-secondary px-4">
                <RefreshCw size={15} />
              </button>
            </div>
          </form>
        </div>

        {/* Result Panel */}
        <div className="space-y-4">
          {loading && (
            <div className="glass-card p-8">
              <LoadingSpinner text="AI is analyzing your measurements..." />
            </div>
          )}

          {!loading && !result && (
            <div className="glass-card p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <Sparkles size={28} className="text-purple-400" />
              </div>
              <p className="text-slate-400 text-sm">Your size recommendation will appear here.</p>
              <p className="text-slate-600 text-xs mt-1">Enter your measurements and click "Find My Size"</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4 animate-slide-up">
              {/* Main Result Card */}
              <div className="glass-card p-6 border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-indigo-900/10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
                      Recommended Size
                    </p>
                    <div className="flex items-center gap-3">
                      <span
                        className="text-6xl font-black"
                        style={{ color: SIZE_COLORS[result.recommended_size] || "#a78bfa" }}
                      >
                        {result.recommended_size}
                      </span>
                      <CheckCircle2 size={28} className="text-emerald-400 mt-2" />
                    </div>
                  </div>
                </div>

                <ConfidenceMeter value={result.confidence_pct} />

                <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs font-semibold text-slate-400 mb-1.5">Why this size?</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{result.reason}</p>
                </div>
              </div>

              {/* All Sizes probabilities */}
              {result.all_sizes && (
                <div className="glass-card p-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Size Probability Distribution
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {ALL_SIZES.map((s) => (
                      <SizeBar
                        key={s}
                        size={s}
                        probability={result.all_sizes[s]}
                        isRecommended={s === result.recommended_size}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Radar Chart */}
              {radarData.length > 0 && (
                <div className="glass-card p-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Size Match Radar
                  </p>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#ffffff15" />
                      <PolarAngleAxis dataKey="size" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                      <Radar
                        name="Probability"
                        dataKey="probability"
                        stroke="#a78bfa"
                        fill="#a78bfa"
                        fillOpacity={0.25}
                        strokeWidth={2}
                      />
                      <Tooltip
                        contentStyle={{ background: "#1e1b4b", border: "1px solid #4c1d95", borderRadius: 8, fontSize: 12 }}
                        formatter={(v) => [`${v}%`, "Match"]}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Size Guide */}
      <div className="glass-card p-6 mt-8">
        <h3 className="text-sm font-semibold text-white mb-4">General Size Reference Guide</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                {["Size", "Chest (cm)", "Waist (cm)", "Hip (cm)", "Height (cm)"].map((h) => (
                  <th key={h} className="pb-2 text-center text-slate-500 font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["XS", "78–82", "60–64", "82–86", "155–158"],
                ["S", "83–87", "65–69", "87–91", "159–163"],
                ["M", "88–92", "70–74", "92–96", "164–168"],
                ["L", "93–97", "75–79", "97–101", "169–173"],
                ["XL", "98–102", "80–84", "102–106", "174–178"],
                ["XXL", "103–108", "85–90", "107–112", "179–184"],
              ].map(([size, ...vals]) => (
                <tr key={size} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-2 text-center">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold border"
                      style={{ borderColor: SIZE_COLORS[size] + "60", color: SIZE_COLORS[size], background: SIZE_COLORS[size] + "15" }}>
                      {size}
                    </span>
                  </td>
                  {vals.map((v, i) => (
                    <td key={i} className="py-2 text-center text-slate-400">{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
