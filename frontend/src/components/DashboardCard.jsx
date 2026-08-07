/**
 * DashboardCard.jsx - Stat card for the seller dashboard
 */
export default function DashboardCard({ title, value, icon: Icon, color = "purple", trend }) {
  const colors = {
    purple: {
      bg: "from-purple-600/20 to-purple-800/10",
      border: "border-purple-500/30",
      icon: "text-purple-400",
      value: "text-purple-300",
    },
    indigo: {
      bg: "from-indigo-600/20 to-indigo-800/10",
      border: "border-indigo-500/30",
      icon: "text-indigo-400",
      value: "text-indigo-300",
    },
    pink: {
      bg: "from-pink-600/20 to-pink-800/10",
      border: "border-pink-500/30",
      icon: "text-pink-400",
      value: "text-pink-300",
    },
    emerald: {
      bg: "from-emerald-600/20 to-emerald-800/10",
      border: "border-emerald-500/30",
      icon: "text-emerald-400",
      value: "text-emerald-300",
    },
  };

  const c = colors[color] || colors.purple;

  return (
    <div
      className={`relative rounded-2xl bg-gradient-to-br ${c.bg} border ${c.border} p-6 backdrop-blur-sm
        hover:scale-[1.02] transition-transform duration-200 cursor-default overflow-hidden`}
    >
      {/* Background glow */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/5 blur-2xl" />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">{title}</p>
          <p className={`text-3xl font-bold ${c.value} mt-1`}>{value}</p>
          {trend && (
            <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
              <span>↑</span> {trend}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl bg-white/5 ${c.icon}`}>
            <Icon size={22} />
          </div>
        )}
      </div>
    </div>
  );
}
