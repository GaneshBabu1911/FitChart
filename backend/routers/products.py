"""
products.py - Router for product upload and listing endpoints.
POST /upload-product  - Create product with images and measurements
GET  /products        - List all products
GET  /products/{id}   - Get a single product
"""
import os
import shutil
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from services.image_analyzer import image_analyzer

router = APIRouter(prefix="/api", tags=["Products"])

# Upload directory — garment images only (not customer images)
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


def _save_upload(file: UploadFile) -> str:
    """Save an uploaded file and return the relative path."""
    ext = os.path.splitext(file.filename or "")[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Read data first to check size
    data = file.file.read()
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum size is 5 MB."
        )

    filename = f"{uuid.uuid4().hex}{ext}"
    save_path = os.path.join(UPLOAD_DIR, filename)
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    with open(save_path, "wb") as f:
        f.write(data)

    return filename  # Return just the filename; full path constructed as needed


@router.post("/upload-product", response_model=schemas.ProductOut, status_code=status.HTTP_201_CREATED)
async def upload_product(
    name: str = Form(...),
    category: str = Form(...),
    brand: Optional[str] = Form(None),
    fabric_composition: Optional[str] = Form(None),
    stretch_percentage: float = Form(0.0),
    gsm: Optional[int] = Form(None),
    description: Optional[str] = Form(None),
    chest: Optional[float] = Form(None),
    waist: Optional[float] = Form(None),
    hip: Optional[float] = Form(None),
    sleeve_length: Optional[float] = Form(None),
    shoulder: Optional[float] = Form(None),
    length: Optional[float] = Form(None),
    image_front: Optional[UploadFile] = File(None),
    image_back: Optional[UploadFile] = File(None),
    image_flat: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """
    Upload a new garment product with images and measurements.
    Validates file types (JPEG/PNG only, max 5MB).
    """
    # Save uploaded images
    front_path = _save_upload(image_front) if image_front and image_front.filename else None
    back_path = _save_upload(image_back) if image_back and image_back.filename else None
    flat_path = _save_upload(image_flat) if image_flat and image_flat.filename else None

    # Create product record
    product = models.Product(
        name=name,
        category=category,
        brand=brand,
        fabric_composition=fabric_composition,
        stretch_percentage=stretch_percentage,
        gsm=gsm,
        description=description,
        image_front=front_path,
        image_back=back_path,
        image_flat=flat_path,
    )
    db.add(product)
    db.flush()  # Get the product ID

    # Create measurement record if any measurements provided
    if any(v is not None for v in [chest, waist, hip, sleeve_length, shoulder, length]):
        measurement = models.Measurement(
            product_id=product.id,
            chest=chest,
            waist=waist,
            hip=hip,
            sleeve_length=sleeve_length,
            shoulder=shoulder,
            length=length,
        )
        db.add(measurement)

    db.commit()
    db.refresh(product)
    return product


@router.get("/products", response_model=List[schemas.ProductOut])
def list_products(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """List all products with their measurements."""
    products = (
        db.query(models.Product)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return products


@router.get("/products/{product_id}", response_model=schemas.ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a single product by ID."""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Delete a product and its associated images."""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Delete associated image files
    for img_field in [product.image_front, product.image_back, product.image_flat]:
        if img_field:
            path = os.path.join(UPLOAD_DIR, img_field)
            if os.path.exists(path):
                os.remove(path)

    db.delete(product)
    db.commit()
