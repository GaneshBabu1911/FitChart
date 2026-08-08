FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /app

# Install system build tools and libraries required to build some Python packages
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       build-essential \
       gcc \
       g++ \
       libatlas-base-dev \
       libopenblas-dev \
       libgomp1 \
       pkg-config \
       meson \
       ninja-build \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip and install numpy/pandas wheels first to avoid long source builds
RUN pip install --upgrade pip setuptools wheel

COPY backend/requirements.txt /app/requirements.txt

# Install numpy and pandas wheels explicitly, then the remaining requirements without re-installing deps
RUN pip install numpy==1.26.4 pandas==2.2.2 && \
    pip install -r requirements.txt --no-deps

# Copy application source
COPY backend /app

ENV PORT=8000

# Use Render's $PORT if provided
CMD ["/bin/sh", "-lc", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
