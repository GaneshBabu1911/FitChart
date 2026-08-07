"""
recommend.py - Router for customer size recommendation.
POST /recommend-size - Predict best size using ML model
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from services.ai_engine import size_predictor
from services.explanation_engine import explanation_engine

router = APIRouter(prefix="/api", tags=["Recommendations"])


@router.post("/recommend-size", response_model=schemas.RecommendSizeResponse)
def recommend_size(
    request: schemas.RecommendSizeRequest,
    db: Session = Depends(get_db)
):
    """
    Predict the best clothing size for a customer.
    Uses KNN model trained on body measurements.
    Stores only measurement data (no images).
    """
    # Run ML prediction
    result = size_predictor.predict(
        height=request.height,
        weight=request.weight,
        chest=request.chest,
        waist=request.waist,
        hip=request.hip,
    )

    recommended_size = result["recommended_size"]
    confidence = result["confidence"]

    # Generate human-readable explanation
    reason = explanation_engine.generate_size_recommendation_reason(
        recommended_size=recommended_size,
        confidence=confidence,
        chest=request.chest,
        waist=request.waist,
        hip=request.hip,
        height=request.height,
        weight=request.weight,
    )

    # Store recommendation (measurements only, no images)
    rec = models.CustomerRecommendation(
        height=request.height,
        weight=request.weight,
        chest=request.chest,
        waist=request.waist,
        hip=request.hip,
        preferred_brand=request.preferred_brand,
        recommended_size=recommended_size,
        confidence=confidence,
        reason=reason,
    )
    db.add(rec)
    db.commit()

    return schemas.RecommendSizeResponse(
        recommended_size=recommended_size,
        confidence=confidence,
        confidence_pct=int(confidence * 100),
        reason=reason,
        all_sizes=result.get("all_sizes"),
    )
