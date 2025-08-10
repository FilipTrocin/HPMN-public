# Embedding service

This directory should contain a containerised embedding service compatible with `sentence-transformers/all-mpnet-base-v2` (or equivalent). The public repo does not include production deployment specifics; use this README as guidance for what to place here.

## What should be here

- `Dockerfile` for building the service
- `src/` with a minimal API (e.g., FastAPI) exposing endpoints:
  - `GET /` health check
  - `POST /embed` that accepts `{ "text": string }` and returns `{ "embedding": number[] }`
- `requirements.txt` (or equivalent) for dependencies

## API 

### Generate Embeddings
```
POST /embed
```
- Request:
  ```json
  { "text": "Your text to embed" }
  ```
- Response:
  ```json
  { "embedding": [0.1, 0.2, ...] }
  ```

## Deployment

```bash
# Build image
docker build -t embedding-service:latest .

# Run locally
docker run -p 8080:8080 -e EMBEDDING_SERVICE_TOKEN=your_token embedding-service:latest
```