
FROM python:3.11-slim

# Add necessary dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libc-dev \
    libffi-dev \
    libpq-dev \
    libssl-dev \
    make \
    python3-dev \
    wget \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on \
    PIP_DEFAULT_TIMEOUT=100

# Set working directory
WORKDIR /app

# Copy requirements.txt and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application files
COPY . .

# Expose port and define command to run the application
EXPOSE 8080
CMD ["python", "app.py"]