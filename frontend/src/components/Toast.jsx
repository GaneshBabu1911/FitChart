/**
 * Toast.jsx - Success/Error notification component using react-hot-toast
 */
import { Toaster } from "react-hot-toast";

export default function Toast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#1e1b4b",
          color: "#e2e8f0",
          border: "1px solid #4c1d95",
          borderRadius: "12px",
          fontSize: "14px",
        },
        success: {
          iconTheme: { primary: "#a78bfa", secondary: "#1e1b4b" },
        },
        error: {
          iconTheme: { primary: "#f87171", secondary: "#1e1b4b" },
        },
      }}
    />
  );
}
