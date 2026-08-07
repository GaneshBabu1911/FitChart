"""
image_analyzer.py - OpenCV-based garment image analysis.
Detects garment outline, dominant color, and estimates clothing category.
Gracefully falls back to None if analysis fails.
"""
import io
import os
from typing import Optional, Dict, Any

try:
    import cv2
    import numpy as np
    OPENCV_AVAILABLE = True
except ImportError:
    OPENCV_AVAILABLE = False
    print("[Image Analyzer] OpenCV not available — image analysis disabled.")


class ImageAnalyzer:
    """
    Analyzes garment images using OpenCV.
    Returns extracted features or None if analysis fails.
    """

    def _load_image_from_path(self, path: str) -> Optional[Any]:
        """Load an image from a file path."""
        if not OPENCV_AVAILABLE:
            return None
        try:
            img = cv2.imread(path)
            return img
        except Exception as e:
            print(f"[Image Analyzer] Failed to load {path}: {e}")
            return None

    def _load_image_from_bytes(self, data: bytes) -> Optional[Any]:
        """Load an image from raw bytes."""
        if not OPENCV_AVAILABLE:
            return None
        try:
            nparr = np.frombuffer(data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            return img
        except Exception as e:
            print(f"[Image Analyzer] Failed to decode image bytes: {e}")
            return None

    def _get_dominant_color(self, img) -> str:
        """Detect the dominant color of the garment using k-means (simplified)."""
        try:
            # Resize for speed
            small = cv2.resize(img, (50, 50))
            # Convert to HSV for better color grouping
            hsv = cv2.cvtColor(small, cv2.COLOR_BGR2HSV)
            # Average hue
            mean_hue = int(np.mean(hsv[:, :, 0]))

            # Map hue to color name
            if mean_hue < 15 or mean_hue > 165:
                return "Red"
            elif mean_hue < 35:
                return "Orange/Yellow"
            elif mean_hue < 75:
                return "Green"
            elif mean_hue < 130:
                return "Blue"
            elif mean_hue < 160:
                return "Purple/Violet"
            else:
                return "Pink"

        except Exception:
            return "Unknown"

    def _estimate_category(self, img) -> str:
        """
        Estimate clothing category from image aspect ratio.
        Wide → shirt/top; Tall → dress/skirt; Very wide → jeans.
        """
        try:
            h, w = img.shape[:2]
            ratio = h / w if w > 0 else 1.0

            if ratio < 0.9:
                return "Top / T-Shirt"
            elif ratio < 1.3:
                return "Shirt / Blouse"
            elif ratio < 1.8:
                return "Dress / Tunic"
            else:
                return "Full-Length Dress / Maxi"

        except Exception:
            return "Unknown"

    def _detect_contour_area(self, img) -> Optional[float]:
        """
        Detect the largest contour in the image (garment outline).
        Returns contour area as percentage of image area.
        """
        try:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            _, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

            if not contours:
                return None

            largest = max(contours, key=cv2.contourArea)
            area = cv2.contourArea(largest)
            total_area = img.shape[0] * img.shape[1]

            return round((area / total_area) * 100, 2)

        except Exception:
            return None

    def _estimate_garment_width_ratio(self, img) -> Optional[float]:
        """Estimate garment width as a fraction of image width."""
        try:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            _, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
            col_sums = np.sum(thresh, axis=0)
            non_empty_cols = np.where(col_sums > 0)[0]

            if len(non_empty_cols) < 2:
                return None

            width_span = non_empty_cols[-1] - non_empty_cols[0]
            return round(width_span / img.shape[1], 3)

        except Exception:
            return None

    def analyze(self, image_path: str) -> Optional[Dict[str, Any]]:
        """
        Full analysis pipeline for a garment image.
        Returns a dict of extracted features, or None on failure.
        """
        if not OPENCV_AVAILABLE:
            return {"error": "OpenCV not installed", "fallback": True}

        img = self._load_image_from_path(image_path)
        if img is None:
            return {"error": "Image could not be loaded", "fallback": True}

        try:
            result = {
                "dimensions": {"width": img.shape[1], "height": img.shape[0]},
                "dominant_color": self._get_dominant_color(img),
                "estimated_category": self._estimate_category(img),
                "contour_area_pct": self._detect_contour_area(img),
                "garment_width_ratio": self._estimate_garment_width_ratio(img),
                "fallback": False,
            }
            return result

        except Exception as e:
            return {"error": str(e), "fallback": True}

    def analyze_bytes(self, data: bytes) -> Optional[Dict[str, Any]]:
        """Analyze image from raw bytes (for upload processing)."""
        if not OPENCV_AVAILABLE:
            return {"error": "OpenCV not installed", "fallback": True}

        img = self._load_image_from_bytes(data)
        if img is None:
            return {"error": "Image bytes could not be decoded", "fallback": True}

        try:
            return {
                "dimensions": {"width": img.shape[1], "height": img.shape[0]},
                "dominant_color": self._get_dominant_color(img),
                "estimated_category": self._estimate_category(img),
                "contour_area_pct": self._detect_contour_area(img),
                "garment_width_ratio": self._estimate_garment_width_ratio(img),
                "fallback": False,
            }
        except Exception as e:
            return {"error": str(e), "fallback": True}


# Singleton
image_analyzer = ImageAnalyzer()
