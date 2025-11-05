FROM python:3.11-slim

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY app.py .
COPY sentimento_pulse_interface.py .
COPY red_code.py .
COPY reflector.py .
COPY tutor_nomination.py .
COPY templates/ templates/

# Create necessary directories
RUN mkdir -p logs

# Expose port
EXPOSE 5000

# Run the application
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
