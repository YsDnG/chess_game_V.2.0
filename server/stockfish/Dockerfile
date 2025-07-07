FROM python:3.9.16-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_DEFAULT_TIMEOUT=100

# Install Python dependencies
COPY requirements.txt .

# Install pip and setuptools first
RUN python -m pip install --no-cache-dir --upgrade pip==23.0.1 setuptools==65.5.0 wheel

# Install numpy with specific flags
RUN pip install --no-cache-dir numpy==1.24.3 --only-binary=:all:

# Install other requirements
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Verify the installation
RUN python -c "import numpy; print(f'numpy version: {numpy.__version__}')"

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["python", "stockfish_server.py"]
