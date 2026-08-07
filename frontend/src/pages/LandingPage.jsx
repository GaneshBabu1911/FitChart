/**
 * LandingPage.jsx - Hero landing page with role selection
 */
import { Link } from "react-router-dom";
import { Shirt, Ruler, Sparkles, BarChart3, Shield, Zap, ChevronRight, Star } from "lucide-react";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI-Powered Fit Charts",
    desc: "Scikit-learn KNN model generates accurate size predictions from real body measurement data.",
    color: "from-purple-500 to-indigo-500",
  },
  {
    icon: Ruler,
    title: "Dynamic Size Grading",
    desc: "Automatically grades XS→XXL with fabric stretch and GSM adjustments baked in.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: BarChart3,
    title: "Confidence Scores",
    desc: "Every recommendation comes with a confidence percentage and human-readable explanation.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Shield,
    title: "Privacy First",
    desc: "Customer images are never stored. Only measurements are saved for analysis.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Zap,
    title: "OpenCV Image Analysis",
    desc: "Upload garment photos and our vision system detects outline, color, and category automatically.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Shirt,
    title: "Multi-Category Support",
    desc: "T-Shirts, Dresses, Jeans, Jackets — category-aware grading rules for every garment type.",
    color: "from-violet-500 to-purple-500",
  },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const SIZE_DEMO = [88, 92, 96, 100, 104, 108];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Shirt size={18} className="text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-base leading-none block">FitChart</span>
              <span className="text-purple-400 text-xs">Generator</span>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <Link to="/seller" className="btn-secondary text-xs px-4 py-2">
              Seller Portal
            </Link>
            <Link to="/customer" className="btn-primary text-xs px-4 py-2">
              Find My Size
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-24 max-w-7xl mx-auto">
        {/* Background blobs */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl -z-10" />

        <div className="text-center space-y-6 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-medium">
            <Sparkles size={12} />
            AI-Powered Apparel Sizing
            <Sparkles size={12} />
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tight">
            <span className="text-white">Generate Perfect</span>
            <br />
            <span className="text-gradient">Size Charts</span>
            <br />
            <span className="text-white">Instantly</span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Built for apparel sellers. Powered by machine learning. Customers get their
            perfect size recommendation in seconds — with AI-generated explanations.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Link to="/seller" className="btn-primary px-8 py-3 text-base">
              <Shirt size={18} />
              Seller Dashboard
              <ChevronRight size={16} />
            </Link>
            <Link to="/customer" className="btn-secondary px-8 py-3 text-base">
              <Ruler size={18} />
              Try Fit Assistant
            </Link>
          </div>
        </div>

        {/* Size chart preview */}
        <div className="mt-20 max-w-3xl mx-auto glass-card p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Sample Generated Fit Chart
            </h3>
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              ✓ AI Generated
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase">Size</th>
                  <th className="pb-3 text-center text-xs font-semibold text-slate-500 uppercase">Chest</th>
                  <th className="pb-3 text-center text-xs font-semibold text-slate-500 uppercase">Waist</th>
                  <th className="pb-3 text-center text-xs font-semibold text-slate-500 uppercase">Hip</th>
                </tr>
              </thead>
              <tbody>
                {SIZES.map((s, i) => (
                  <tr key={s} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-2.5">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border
                        ${i === 2 ? "bg-purple-500/20 text-purple-300 border-purple-500/40" : "bg-white/5 text-slate-400 border-white/10"}`}>
                        {s}
                      </span>
                    </td>
                    <td className="py-2.5 text-center text-slate-300 font-medium">{SIZE_DEMO[i]}</td>
                    <td className="py-2.5 text-center text-slate-300 font-medium">{SIZE_DEMO[i] - 10}</td>
                    <td className="py-2.5 text-center text-slate-300 font-medium">{SIZE_DEMO[i] + 6}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-3 rounded-xl bg-purple-900/20 border border-purple-500/20">
            <p className="text-xs text-purple-300">
              🤖 <strong>AI Insight:</strong> Waist increased by 1 cm because fabric has low stretch (8%). Cotton fabric may shrink after washing — consider sizing up.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Everything You Need</h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            A complete AI sizing platform from garment upload to personalized customer recommendations.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="glass-card p-6 hover:border-white/20 transition-all duration-200 group">
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon size={20} className="text-white" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Role Cards */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Seller */}
          <Link to="/seller" className="group glass-card p-8 hover:border-purple-500/40 hover:glow-purple transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-purple-500/30 group-hover:scale-110 transition-transform">
                <Shirt size={26} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Seller Portal</h2>
                <p className="text-purple-400 text-sm">Generate & Manage Fit Charts</p>
              </div>
            </div>
            <ul className="space-y-2.5 mb-6 text-sm text-slate-400">
              {["Upload garment images (front, back, flat)", "Enter fabric & measurement details", "Generate AI-powered size charts", "View AI explanations & insights", "Save and manage products"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Star size={12} className="text-purple-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="btn-primary w-full justify-center group-hover:shadow-xl">
              Open Seller Dashboard <ChevronRight size={16} />
            </div>
          </Link>

          {/* Customer */}
          <Link to="/customer" className="group glass-card p-8 hover:border-pink-500/40 transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-xl shadow-pink-500/30 group-hover:scale-110 transition-transform">
                <Ruler size={26} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Fit Assistant</h2>
                <p className="text-pink-400 text-sm">Find Your Perfect Size</p>
              </div>
            </div>
            <ul className="space-y-2.5 mb-6 text-sm text-slate-400">
              {["Enter height, weight & measurements", "Instant AI size prediction", "Confidence score for each recommendation", "Human-readable explanation", "Works across all brands and categories"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Star size={12} className="text-pink-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="btn-secondary w-full justify-center border-pink-500/30 hover:bg-pink-500/10 hover:text-pink-300">
              Try Fit Assistant <ChevronRight size={16} />
            </div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <Shirt size={14} className="text-white" />
          </div>
          <span className="text-slate-400 text-sm font-medium">FitChart Generator</span>
        </div>
        <p className="text-slate-600 text-xs">AI-Powered Apparel Sizing Platform • Built with FastAPI + React</p>
      </footer>
    </div>
  );
}
