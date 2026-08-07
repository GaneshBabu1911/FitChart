"""
ai_engine.py - KNN-based size prediction model
Trains on the bundled sample dataset and predicts clothing sizes.
"""
import os
import numpy as np
import pandas as pd
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from typing import Dict, Optional

# Path to training CSV (relative to backend directory)
DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "training_data.csv")

SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"]


class SizePredictionEngine:
    """
    KNN-based size recommender.
    Features: height, weight, chest, waist, hip
    Target: size label (XS, S, M, L, XL, XXL)
    """

    def __init__(self):
        self.pipeline: Optional[Pipeline] = None
        self.classes_ = None
        self._train()

    def _train(self):
        """Load training data and fit the KNN pipeline."""
        try:
            df = pd.read_csv(DATA_PATH)
            features = ["height", "weight", "chest", "waist", "hip"]

            # Drop rows with missing feature values
            df = df.dropna(subset=features)

            X = df[features].values
            y = df["size"].values

            # Pipeline: StandardScaler → KNN(k=7)
            self.pipeline = Pipeline([
                ("scaler", StandardScaler()),
                ("knn", KNeighborsClassifier(
                    n_neighbors=7,
                    weights="distance",   # Closer neighbors have more influence
                    metric="euclidean"
                ))
            ])

            self.pipeline.fit(X, y)
            self.classes_ = self.pipeline.classes_
            print(f"[AI Engine] Model trained on {len(X)} samples. Classes: {self.classes_}")

        except Exception as e:
            print(f"[AI Engine] Training failed: {e}")
            self.pipeline = None

    def predict(
        self,
        height: Optional[float] = None,
        weight: Optional[float] = None,
        chest: Optional[float] = None,
        waist: Optional[float] = None,
        hip: Optional[float] = None,
    ) -> Dict:
        """
        Predict size and return confidence scores.
        Returns recommended size, confidence, and probability per size.
        """
        # Impute missing values with dataset medians
        defaults = {
            "height": 170.0,
            "weight": 65.0,
            "chest": 92.0,
            "waist": 75.0,
            "hip": 98.0,
        }

        features = np.array([[
            height  if height  is not None else defaults["height"],
            weight  if weight  is not None else defaults["weight"],
            chest   if chest   is not None else defaults["chest"],
            waist   if waist   is not None else defaults["waist"],
            hip     if hip     is not None else defaults["hip"],
        ]])

        if self.pipeline is None:
            # Fallback: rule-based prediction if model failed to load
            return self._rule_based_fallback(chest, waist, hip)

        try:
            pred = self.pipeline.predict(features)[0]
            proba = self.pipeline.predict_proba(features)[0]
            class_proba = dict(zip(self.classes_, proba.tolist()))

            # Confidence = probability of the predicted class
            confidence = float(max(proba))

            return {
                "recommended_size": pred,
                "confidence": round(confidence, 4),
                "all_sizes": class_proba,
            }

        except Exception as e:
            print(f"[AI Engine] Prediction error: {e}")
            return self._rule_based_fallback(chest, waist, hip)

    def _rule_based_fallback(
        self,
        chest: Optional[float],
        waist: Optional[float],
        hip: Optional[float]
    ) -> Dict:
        """Simple rule-based fallback when ML model is unavailable."""
        # Use chest as primary discriminator
        c = chest or 92.0

        if c < 82:
            size = "XS"
        elif c < 88:
            size = "S"
        elif c < 96:
            size = "M"
        elif c < 104:
            size = "L"
        elif c < 112:
            size = "XL"
        else:
            size = "XXL"

        return {
            "recommended_size": size,
            "confidence": 0.75,
            "all_sizes": {s: 0.05 for s in SIZE_ORDER},
        }


# Singleton instance — loaded once at startup
size_predictor = SizePredictionEngine()
