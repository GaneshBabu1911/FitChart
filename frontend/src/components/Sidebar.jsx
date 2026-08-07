/**
 * Sidebar.jsx - Navigation sidebar for Seller and Customer views
 */
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  PlusCircle,
  Ruler,
  Users,
  Shirt,
} from "lucide-react";

const NAV_ITEMS = [
  {
    section: "Seller",
    items: [
      { label: "Dashboard", path: "/seller", icon: LayoutDashboard },
      { label: "Add Product", path: "/seller/new", icon: PlusCircle },
      { label: "My Products", path: "/seller/products", icon: ShoppingBag },
    ],
  },
  {
    section: "Customer",
    items: [
      { label: "Fit Assistant", path: "/customer", icon: Ruler },
    ],
  },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 min-h-screen bg-slate-900/80 border-r border-white/10 backdrop-blur-xl flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform">
            <Shirt size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">FitChart</p>
            <p className="text-purple-400 text-xs">Generator</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-6">
        {NAV_ITEMS.map((section) => (
          <div key={section.section}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 px-2">
              {section.section}
            </p>
            <ul className="space-y-1">
              {section.items.map(({ label, path, icon: Icon }) => {
                const isActive = location.pathname === path;
                return (
                  <li key={path}>
                    <Link
                      to={path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? "bg-purple-600/30 text-purple-300 border border-purple-500/30 shadow-sm"
                          : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                      }`}
                    >
                      <Icon size={17} className={isActive ? "text-purple-400" : "text-slate-500"} />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-xs text-slate-600">FitChart Generator v1.0</p>
        <p className="text-xs text-slate-700">AI-Powered Sizing</p>
      </div>
    </aside>
  );
}
