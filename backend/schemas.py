"""
schemas.py - Pydantic schemas for request/response validation
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


# ─────────────────────────────────────────
# Measurement schemas
# ─────────────────────────────────────────

class MeasurementBase(BaseModel):
    chest: Optional[float] = Field(None, ge=30, le=200, description="Chest in cm")
    waist: Optional[float] = Field(None, ge=30, le=200, description="Waist in cm")
    hip: Optional[float] = Field(None, ge=30, le=200, description="Hip in cm")
    sleeve_length: Optional[float] = Field(None, ge=0, le=100)
    shoulder: Optional[float] = Field(None, ge=0, le=80)
    length: Optional[float] = Field(None, ge=0, le=200)


class MeasurementCreate(MeasurementBase):
    pass


class MeasurementOut(MeasurementBase):
    id: int
    product_id: int

    class Config:
        from_attributes = True


# ─────────────────────────────────────────
# Product schemas
# ─────────────────────────────────────────

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    category: str = Field(..., min_length=1, max_length=100)
    brand: Optional[str] = Field(None, max_length=100)
    fabric_composition: Optional[str] = Field(None, max_length=200)
    stretch_percentage: Optional[float] = Field(0.0, ge=0, le=100)
    gsm: Optional[int] = Field(None, ge=50, le=1000)
    description: Optional[str] = None


class ProductCreate(ProductBase):
    measurements: Optional[MeasurementCreate] = None


class ProductOut(ProductBase):
    id: int
    seller_id: Optional[int]
    image_front: Optional[str]
    image_back: Optional[str]
    image_flat: Optional[str]
    created_at: datetime
    measurements: Optional[MeasurementOut] = None

    class Config:
        from_attributes = True


# ─────────────────────────────────────────
# Fit Chart schemas
# ─────────────────────────────────────────

class FitChartRow(BaseModel):
    size: str
    chest: float
    waist: float
    hip: float
    sleeve_length: Optional[float]
    shoulder: Optional[float]
    length: Optional[float]


class GenerateFitChartRequest(BaseModel):
    product_id: int


class FitChartOut(BaseModel):
    id: int
    product_id: int
    chart_json: List[Dict[str, Any]]
    explanations_json: Optional[List[str]]
    image_analysis_json: Optional[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True


# ─────────────────────────────────────────
# Customer Recommendation schemas
# ─────────────────────────────────────────

class RecommendSizeRequest(BaseModel):
    height: Optional[float] = Field(None, ge=100, le=250, description="Height in cm")
    weight: Optional[float] = Field(None, ge=20, le=300, description="Weight in kg")
    chest: Optional[float] = Field(None, ge=50, le=200)
    waist: Optional[float] = Field(None, ge=40, le=200)
    hip: Optional[float] = Field(None, ge=50, le=200)
    preferred_brand: Optional[str] = None


class RecommendSizeResponse(BaseModel):
    recommended_size: str
    confidence: float          # 0.0 – 1.0
    confidence_pct: int        # 0 – 100
    reason: str
    all_sizes: Optional[Dict[str, float]] = None  # All size probabilities


# ─────────────────────────────────────────
# Seller schemas
# ─────────────────────────────────────────

class SellerCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr


class SellerOut(SellerCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
