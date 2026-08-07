"""
fit_chart_generator.py - Dynamic size chart generation service.
Takes product base measurements and fabric info, then generates
a professional XS→XXL size chart with grading increments.
"""
from typing import Dict, List, Optional, Any


# Standard grading increments (cm per step) by category
CATEGORY_GRADING = {
    "default": {
        "chest": 4.0,
        "waist": 4.0,
        "hip": 4.0,
        "sleeve_length": 1.5,
        "shoulder": 1.0,
        "length": 1.5,
    },
    "dress": {
        "chest": 4.0,
        "waist": 3.5,
        "hip": 4.0,
        "sleeve_length": 1.0,
        "shoulder": 1.0,
        "length": 2.0,
    },
    "jeans": {
        "chest": 0.0,   # Jeans don't measure chest
        "waist": 4.0,
        "hip": 4.0,
        "sleeve_length": 0.0,
        "shoulder": 0.0,
        "length": 2.0,
    },
}

SIZES = ["XS", "S", "M", "L", "XL", "XXL"]

# M is the baseline (index 2), steps below/above M
SIZE_STEPS = {
    "XS": -2,
    "S": -1,
    "M": 0,
    "L": 1,
    "XL": 2,
    "XXL": 3,
}


class FitChartGenerator:
    """
    Generates dynamic size charts from product base measurements.
    Applies grading increments adjusted for fabric stretch and GSM.
    """

    def _get_grading(self, category: str) -> Dict[str, float]:
        """Return grading increments for the given category."""
        category_lower = category.lower() if category else ""
        if "dress" in category_lower or "skirt" in category_lower:
            return CATEGORY_GRADING["dress"]
        elif "jeans" in category_lower or "trouser" in category_lower or "pant" in category_lower:
            return CATEGORY_GRADING["jeans"]
        return CATEGORY_GRADING["default"]

    def _stretch_adjustment(self, stretch_pct: float, base_increment: float) -> float:
        """
        Reduce grading increment for high-stretch fabrics.
        High-stretch garments cover more body variation per size.
        """
        if stretch_pct >= 30:
            return base_increment * 0.75  # Compressed grading for stretch fabrics
        elif stretch_pct >= 15:
            return base_increment * 0.90
        return base_increment  # No adjustment for low-stretch

    def _gsm_adjustment(self, gsm: Optional[int], measurement: str) -> float:
        """
        Heavier fabrics (high GSM) may add slight ease to measurements.
        """
        if not gsm:
            return 0.0
        if gsm > 300 and measurement in ("chest", "shoulder"):
            return 0.5  # Extra 0.5cm ease for heavy fabrics
        return 0.0

    def generate(
        self,
        category: str,
        base_chest: Optional[float],
        base_waist: Optional[float],
        base_hip: Optional[float],
        base_sleeve: Optional[float],
        base_shoulder: Optional[float],
        base_length: Optional[float],
        stretch_percentage: float = 0.0,
        gsm: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """
        Generate a size chart with rows for XS, S, M, L, XL, XXL.
        The input measurements are treated as the M (medium) baseline.
        """
        grading = self._get_grading(category)
        chart_rows = []

        for size in SIZES:
            step = SIZE_STEPS[size]  # Negative = smaller than M, positive = larger

            row: Dict[str, Any] = {"size": size}

            # ── Chest ──────────────────────────────
            if base_chest is not None:
                inc = self._stretch_adjustment(stretch_percentage, grading["chest"])
                adj = self._gsm_adjustment(gsm, "chest")
                row["chest"] = round(base_chest + step * inc + adj, 1)
            else:
                row["chest"] = None

            # ── Waist ──────────────────────────────
            if base_waist is not None:
                stretch_boost = 1.0 if stretch_percentage < 10 else 0.0
                inc = self._stretch_adjustment(stretch_percentage, grading["waist"])
                row["waist"] = round(base_waist + step * inc + stretch_boost, 1)
            else:
                row["waist"] = None

            # ── Hip ────────────────────────────────
            if base_hip is not None:
                inc = self._stretch_adjustment(stretch_percentage, grading["hip"])
                row["hip"] = round(base_hip + step * inc, 1)
            else:
                row["hip"] = None

            # ── Sleeve Length ──────────────────────
            if base_sleeve is not None:
                inc = grading["sleeve_length"]
                row["sleeve_length"] = round(base_sleeve + step * inc, 1)
            else:
                row["sleeve_length"] = None

            # ── Shoulder ───────────────────────────
            if base_shoulder is not None:
                adj = self._gsm_adjustment(gsm, "shoulder")
                inc = grading["shoulder"]
                row["shoulder"] = round(base_shoulder + step * inc + adj, 1)
            else:
                row["shoulder"] = None

            # ── Length ─────────────────────────────
            if base_length is not None:
                inc = grading["length"]
                row["length"] = round(base_length + step * inc, 1)
            else:
                row["length"] = None

            chart_rows.append(row)

        return chart_rows


# Singleton
fit_chart_generator = FitChartGenerator()
