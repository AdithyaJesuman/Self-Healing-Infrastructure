# services/api-gateway/Dockerfile
FROM python:3.11-slim AS runtime
WORKDIR /app

# Copy Python requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy API gateway source including prebuilt static assets
COPY . .

# Expose port 8000 (container) – host maps to 8001
EXPOSE 8000

# Run uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

