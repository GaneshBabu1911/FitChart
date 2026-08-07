"""
explanation_engine.py - Rule-based explanation generator for fit chart AI decisions.
Produces human-readable sentences explaining why measurements were adjusted
and what fabric properties mean for the customer.
"""
from typing import List, Optional, Dict, Any


class ExplanationEngine:
    """
    Generates AI-style explanations based on:
    - Fabric composition
    - Stretch percentage
    - GSM (weight)
    - Measurement deltas
    - Category-specific rules
    """

    # Fabric-specific explanation templates
    FABRIC_RULES = {
        "cotton": [
            "Cotton fabric may shrink by up to 5% after the first wash — consider sizing up.",
            "Natural cotton fibers absorb moisture, which can affect fit over time.",
        ],
        "polyester": [
            "Polyester is moisture-resistant and retains its shape well after washing.",
            "Polyester blends maintain consistent sizing across washes.",
        ],
        "spandex": [
            "Spandex provides excellent stretch — the garment will conform to your body shape.",
            "High spandex content means the size range is forgiving.",
        ],
        "elastane": [
            "Elastane ensures a flexible, comfortable fit with good recovery.",
        ],
        "nylon": [
            "Nylon is durable and has minimal shrinkage after washing.",
        ],
        "wool": [
            "Wool may shrink if machine-washed — always follow care label instructions.",
            "Wool garments feel snugger when new and relax slightly with wear.",
        ],
        "linen": [
            "Linen fabric softens with washing but may shrink slightly the first time.",
            "Linen has low stretch — a precise fit is important.",
        ],
        "rayon": [
            "Rayon/viscose is delicate and may shrink if not hand-washed.",
        ],
    }

    # Stretch percentage explanations
    def _stretch_explanation(self, stretch_pct: float, measurement: str = "chest") -> List[str]:
        explanations = []

        if stretch_pct < 5:
            explanations.append(
                f"{measurement.capitalize()} measurement kept as-is — fabric has very low stretch (< 5%)."
            )
            explanations.append(
                "Consider sizing up if you prefer a relaxed fit with this non-stretch fabric."
            )
        elif stretch_pct < 15:
            explanations.append(
                f"{measurement.capitalize()} increased by 1 cm because fabric has low stretch ({stretch_pct:.0f}%)."
            )
        elif stretch_pct < 30:
            explanations.append(
                f"Moderate stretch ({stretch_pct:.0f}%) allows slight ease — measurements include standard tolerance."
            )
        else:
            explanations.append(
                f"High stretch ({stretch_pct:.0f}%) fabric — the size chart shows relaxed measurements; the garment will fit closely."
            )

        return explanations

    # GSM-based explanations
    def _gsm_explanation(self, gsm: int) -> List[str]:
        if gsm < 150:
            return ["Lightweight fabric (< 150 GSM) — suitable for warm weather, may be slightly sheer."]
        elif gsm < 250:
            return ["Medium-weight fabric (150–250 GSM) — suitable for all-day wear."]
        elif gsm < 400:
            return ["Heavy-weight fabric (250–400 GSM) — structured, ideal for outerwear."]
        else:
            return ["Very heavy fabric (> 400 GSM) — may restrict movement; ensure chest and shoulder measurements fit."]

    # Category-specific explanations
    def _category_explanation(self, category: str) -> List[str]:
        category_lower = category.lower()
        if "dress" in category_lower:
            return ["Dress sizing prioritizes waist and hip measurements for a flattering silhouette."]
        elif "jeans" in category_lower or "pants" in category_lower or "trouser" in category_lower:
            return ["Bottom sizing is primarily driven by waist and hip measurements."]
        elif "shirt" in category_lower or "top" in category_lower or "t-shirt" in category_lower:
            return ["Top sizing focuses on chest and shoulder width."]
        elif "jacket" in category_lower or "coat" in category_lower:
            return ["Outerwear is sized with extra room — consider a layered fit underneath."]
        return []

    def generate_fit_chart_explanations(
        self,
        fabric_composition: Optional[str],
        stretch_percentage: Optional[float],
        gsm: Optional[int],
        category: Optional[str],
        base_measurements: Optional[Dict[str, Any]] = None,
    ) -> List[str]:
        """
        Generate a list of explanation strings for the fit chart.
        """
        explanations = []

        # Fabric-based explanations
        if fabric_composition:
            fabric_lower = fabric_composition.lower()
            for fabric, rules in self.FABRIC_RULES.items():
                if fabric in fabric_lower:
                    explanations.extend(rules[:1])  # One key rule per fabric type

        # Stretch explanations
        if stretch_percentage is not None:
            explanations.extend(self._stretch_explanation(stretch_percentage, "waist"))

        # GSM explanations
        if gsm:
            explanations.extend(self._gsm_explanation(gsm))

        # Category explanations
        if category:
            explanations.extend(self._category_explanation(category))

        # General sizing advice
        explanations.append("All measurements are in centimeters and represent flat garment measurements.")
        explanations.append("Model measurements: Height 170 cm, Weight 65 kg. Size shown is M.")

        return explanations

    def generate_size_recommendation_reason(
        self,
        recommended_size: str,
        confidence: float,
        chest: Optional[float],
        waist: Optional[float],
        hip: Optional[float],
        height: Optional[float],
        weight: Optional[float],
    ) -> str:
        """
        Generate a human-readable reason for the size recommendation.
        """
        parts = []

        # Primary reason
        parts.append(
            f"Customers with similar body measurements (height, weight, chest, waist, hip) preferred size {recommended_size}."
        )

        # Confidence-based qualifier
        if confidence >= 0.90:
            parts.append("This is a very confident prediction based on a strong match in the training data.")
        elif confidence >= 0.75:
            parts.append("This prediction is based on a close match with similar body profiles.")
        else:
            parts.append("You may be between sizes — consider trying both this size and one size up.")

        # Measurement-based specifics
        if chest and chest < 85:
            parts.append("Your chest measurement aligns well with the smaller size range.")
        elif chest and chest > 105:
            parts.append("Your chest measurement is a primary factor for selecting a larger size.")

        if waist and waist > 90:
            parts.append("Waist measurement was a key factor in this recommendation.")

        return " ".join(parts)


# Singleton
explanation_engine = ExplanationEngine()
