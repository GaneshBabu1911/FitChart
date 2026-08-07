"""
models.py - SQLAlchemy ORM models for Fit Chart Generator
Tables: sellers, products, measurements, generated_fit_charts, customer_recommendations
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from database import Base


class Seller(Base):
    """Seller accounts table."""
    __tablename__ = "sellers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(200), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    products = relationship("Product", back_populates="seller")


class Product(Base):
    """Garment products created by sellers."""
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("sellers.id"), nullable=True)
    name = Column(String(200), nullable=False)
    category = Column(String(100), nullable=False)  # T-shirt, Dress, Jeans, etc.
    brand = Column(String(100), nullable=True)
    fabric_composition = Column(String(200), nullable=True)  # e.g., "60% Cotton, 40% Polyester"
    stretch_percentage = Column(Float, default=0.0)  # 0–100
    gsm = Column(Integer, nullable=True)  # Grams per square meter
    description = Column(Text, nullable=True)
    image_front = Column(String(300), nullable=True)  # File path
    image_back = Column(String(300), nullable=True)
    image_flat = Column(String(300), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    seller = relationship("Seller", back_populates="products")
    measurements = relationship("Measurement", back_populates="product", uselist=False)
    fit_charts = relationship("GeneratedFitChart", back_populates="product")


class Measurement(Base):
    """Product base measurements (in cm)."""
    __tablename__ = "measurements"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), unique=True)
    chest = Column(Float, nullable=True)       # in cm
    waist = Column(Float, nullable=True)
    hip = Column(Float, nullable=True)
    sleeve_length = Column(Float, nullable=True)
    shoulder = Column(Float, nullable=True)
    length = Column(Float, nullable=True)

    # Relationship
    product = relationship("Product", back_populates="measurements")


class GeneratedFitChart(Base):
    """AI-generated size charts for products."""
    __tablename__ = "generated_fit_charts"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    chart_json = Column(JSON, nullable=False)          # Size chart rows as JSON
    explanations_json = Column(JSON, nullable=True)    # AI explanations list
    image_analysis_json = Column(JSON, nullable=True)  # OpenCV analysis results
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    product = relationship("Product", back_populates="fit_charts")


class CustomerRecommendation(Base):
    """Size recommendations made for customers (no personal images stored)."""
    __tablename__ = "customer_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    height = Column(Float, nullable=True)       # cm
    weight = Column(Float, nullable=True)       # kg
    chest = Column(Float, nullable=True)
    waist = Column(Float, nullable=True)
    hip = Column(Float, nullable=True)
    preferred_brand = Column(String(100), nullable=True)
    recommended_size = Column(String(10), nullable=False)
    confidence = Column(Float, nullable=False)  # 0–1
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
