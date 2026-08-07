/**
 * LoadingSpinner.jsx - Reusable animated loading indicator
 */
export default function LoadingSpinner({ size = "md", text = "Processing..." }) {
  const sizes = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div
        className={`${sizes[size]} border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin`}
      />
      {text && (
        <p className="text-sm text-slate-400 animate-pulse">{text}</p>
      )}
    </div>
  );
}
