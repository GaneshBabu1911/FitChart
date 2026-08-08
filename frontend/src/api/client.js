/**
 * api/client.js - Axios API client for Fit Chart Generator
 * All requests go to http://localhost:8000
 */
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api`
  : "http://localhost:8000/api";

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds — image uploads may be slow
});

// ── Products ──────────────────────────────────────────────────

/**
 * Upload a product with images and measurements.
 * @param {FormData} formData - Product details + images
 */
export const uploadProduct = (formData) =>
  apiClient.post("/upload-product", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

/**
 * List all products.
 */
export const getProducts = () => apiClient.get("/products");

/**
 * Get a single product by ID.
 */
export const getProduct = (id) => apiClient.get(`/products/${id}`);

/**
 * Delete a product.
 */
export const deleteProduct = (id) => apiClient.delete(`/products/${id}`);

// ── Fit Charts ────────────────────────────────────────────────

/**
 * Generate a fit chart for a product.
 * @param {number} productId
 */
export const generateFitChart = (productId) =>
  apiClient.post("/generate-fit-chart", { product_id: productId });

/**
 * Get a fit chart by ID.
 */
export const getFitChart = (id) => apiClient.get(`/fit-chart/${id}`);

/**
 * Get all fit charts for a product.
 */
export const getFitChartsForProduct = (productId) =>
  apiClient.get(`/fit-charts/product/${productId}`);

// ── Recommendations ───────────────────────────────────────────

/**
 * Get size recommendation for customer body measurements.
 * @param {{ height, weight, chest, waist, hip, preferred_brand }} data
 */
export const recommendSize = (data) =>
  apiClient.post("/recommend-size", data);

// ── Utilities ─────────────────────────────────────────────────

/** Build full image URL from filename stored in DB */
export const getImageUrl = (filename) =>
  filename
    ? `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, "") : "http://localhost:8000"}/uploads/${filename}`
    : null;

export default apiClient;
