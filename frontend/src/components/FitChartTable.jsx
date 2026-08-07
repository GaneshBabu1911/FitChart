/**
 * FitChartTable.jsx - Professional size chart table display
 */
export default function FitChartTable({ chartData, explanations }) {
  if (!chartData || chartData.length === 0) return null;

  // Determine which columns have data
  const hasSleeve = chartData.some((r) => r.sleeve_length != null);
  const hasShoulder = chartData.some((r) => r.shoulder != null);
  const hasLength = chartData.some((r) => r.length != null);
  const hasChest = chartData.some((r) => r.chest != null);
  const hasWaist = chartData.some((r) => r.waist != null);
  const hasHip = chartData.some((r) => r.hip != null);

  const sizeColors = {
    XS: "bg-violet-500/20 text-violet-300 border-violet-500/40",
    S: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    M: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    L: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    XL: "bg-orange-500/20 text-orange-300 border-orange-500/40",
    XXL: "bg-red-500/20 text-red-300 border-red-500/40",
  };

  return (
    <div className="space-y-6">
      {/* Chart Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Size
              </th>
              {hasChest && (
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Chest (cm)
                </th>
              )}
              {hasWaist && (
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Waist (cm)
                </th>
              )}
              {hasHip && (
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Hip (cm)
                </th>
              )}
              {hasSleeve && (
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Sleeve (cm)
                </th>
              )}
              {hasShoulder && (
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Shoulder (cm)
                </th>
              )}
              {hasLength && (
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Length (cm)
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {chartData.map((row, i) => (
              <tr
                key={row.size}
                className={`border-t border-white/5 transition-colors hover:bg-white/5 ${
                  i % 2 === 0 ? "bg-white/[0.02]" : ""
                }`}
              >
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                      sizeColors[row.size] || "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {row.size}
                  </span>
                </td>
                {hasChest && (
                  <td className="px-4 py-3 text-center text-slate-200 font-medium">
                    {row.chest ?? "—"}
                  </td>
                )}
                {hasWaist && (
                  <td className="px-4 py-3 text-center text-slate-200 font-medium">
                    {row.waist ?? "—"}
                  </td>
                )}
                {hasHip && (
                  <td className="px-4 py-3 text-center text-slate-200 font-medium">
                    {row.hip ?? "—"}
                  </td>
                )}
                {hasSleeve && (
                  <td className="px-4 py-3 text-center text-slate-200 font-medium">
                    {row.sleeve_length ?? "—"}
                  </td>
                )}
                {hasShoulder && (
                  <td className="px-4 py-3 text-center text-slate-200 font-medium">
                    {row.shoulder ?? "—"}
                  </td>
                )}
                {hasLength && (
                  <td className="px-4 py-3 text-center text-slate-200 font-medium">
                    {row.length ?? "—"}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI Explanations */}
      {explanations && explanations.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-br from-purple-900/30 to-indigo-900/20 border border-purple-500/20 p-5">
          <h3 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
            <span>🤖</span> AI Insights & Explanations
          </h3>
          <ul className="space-y-2">
            {explanations.map((exp, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                {exp}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
