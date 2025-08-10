# Start with a Python 3.12 base image
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file and install dependencies
COPY apps/all_mpnet_base_v2/requirements.txt .

# Install dependencies first 
RUN pip install --no-cache-dir -r requirements.txt

# Then copy the application code
COPY apps/all_mpnet_base_v2/src/ .

# Expose the port the app runs on
EXPOSE 8080

# Run the FastAPI application with uvicorn
CMD ["python", "main.py"] 