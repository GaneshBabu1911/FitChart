"""
fit_chart.py - Router for fit chart generation and retrieval.
POST /generate-fit-chart - Run AI analysis and generate size chart
GET  /fit-chart/{id}     - Retrieve a saved fit chart
"""
import os
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from services.fit_chart_generator import fit_chart_generator
from services.explanation_engine import explanation_engine
from services.image_analyzer import image_analyzer

router = APIRouter(prefix="/api", tags=["Fit Charts"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")


@router.post("/generate-fit-chart", response_model=schemas.FitChartOut, status_code=status.HTTP_201_CREATED)
def generate_fit_chart(
    request: schemas.GenerateFitChartRequest,
    db: Session = Depends(get_db)
):
    """
    Generate a dynamic size chart for a product.
    Steps:
    1. Load product + measurements
    2. Run OpenCV image analysis (if images exist)
    3. Generate size chart rows (XS→XXL) with fabric adjustments
    4. Generate AI explanations
    5. Save and return the fit chart
    """
    # 1. Load product
    product = db.query(models.Product).filter(models.Product.id == request.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail=f"Product {request.product_id} not found")

    measurements = product.measurements

    # 2. OpenCV image analysis (best-effort)
    image_analysis = None
    for img_field in [product.image_front, product.image_flat, product.image_back]:
        if img_field:
            img_path = os.path.join(UPLOAD_DIR, img_field)
            image_analysis = image_analyzer.analyze(img_path)
            if image_analysis and not image_analysis.get("fallback"):
                break

    # 3. Generate size chart
    chart_rows = fit_chart_generator.generate(
        category=product.category or "default",
        base_chest=measurements.chest if measurements else None,
        base_waist=measurements.waist if measurements else None,
        base_hip=measurements.hip if measurements else None,
        base_sleeve=measurements.sleeve_length if measurements else None,
        base_shoulder=measurements.shoulder if measurements else None,
        base_length=measurements.length if measurements else None,
        stretch_percentage=product.stretch_percentage or 0.0,
        gsm=product.gsm,
    )

    # 4. Generate explanations
    explanations = explanation_engine.generate_fit_chart_explanations(
        fabric_composition=product.fabric_composition,
        stretch_percentage=product.stretch_percentage,
        gsm=product.gsm,
        category=product.category,
        base_measurements={
            "chest": measurements.chest if measurements else None,
            "waist": measurements.waist if measurements else None,
        }
    )

    # 5. Save to database
    fit_chart = models.GeneratedFitChart(
        product_id=product.id,
        chart_json=chart_rows,
        explanations_json=explanations,
        image_analysis_json=image_analysis,
    )
    db.add(fit_chart)
    db.commit()
    db.refresh(fit_chart)

    return fit_chart


@router.get("/fit-chart/{chart_id}", response_model=schemas.FitChartOut)
def get_fit_chart(chart_id: int, db: Session = Depends(get_db)):
    """Retrieve a previously generated fit chart by ID."""
    chart = db.query(models.GeneratedFitChart).filter(
        models.GeneratedFitChart.id == chart_id
    ).first()

    if not chart:
        raise HTTPException(status_code=404, detail=f"Fit chart {chart_id} not found")

    return chart


@router.get("/fit-charts/product/{product_id}", response_model=List[schemas.FitChartOut])
def get_fit_charts_for_product(product_id: int, db: Session = Depends(get_db)):
    """Get all fit charts generated for a specific product."""
    charts = db.query(models.GeneratedFitChart).filter(
        models.GeneratedFitChart.product_id == product_id
    ).all()
    return charts
