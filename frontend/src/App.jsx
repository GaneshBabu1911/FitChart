/**
 * App.jsx - Main application router
 * Routes:
 *   /             → Landing Page
 *   /seller       → Seller Dashboard
 *   /seller/new   → Add Product (multi-step form)
 *   /seller/products → Product List
 *   /customer     → Customer Fit Assistant
 */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Toast from "./components/Toast";
import Sidebar from "./components/Sidebar";
import LandingPage from "./pages/LandingPage";
import SellerDashboard from "./pages/SellerDashboard";
import ProductForm from "./pages/ProductForm";
import ProductList from "./pages/ProductList";
import CustomerFitAssistant from "./pages/CustomerFitAssistant";

/** Wraps pages that use the sidebar layout */
function AppLayout({ children }) {
  return (
    <div className="page-with-sidebar">
      <Sidebar />
      <main className="page-content">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toast />
      <Routes>
        {/* Landing */}
        <Route path="/" element={<LandingPage />} />

        {/* Seller */}
        <Route path="/seller" element={<AppLayout><SellerDashboard /></AppLayout>} />
        <Route path="/seller/new" element={<AppLayout><ProductForm /></AppLayout>} />
        <Route path="/seller/products" element={<AppLayout><ProductList /></AppLayout>} />

        {/* Customer */}
        <Route path="/customer" element={<AppLayout><CustomerFitAssistant /></AppLayout>} />

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
