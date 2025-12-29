# Deploying with Docker

This project is containerized using Docker and Nginx for a robust production-ready setup.

## Prerequisites
- Docker installed
- Docker Compose installed
- A `.env` file in the root directory (see `.env.example` or previous configuration)

## Running the App

1. **Build and Run:**
   Run the following command in the terminal to build the image and start the container:
   ```bash
   docker-compose up --build -d
   ```

2. **Access the App:**
   Open your browser and go to: http://localhost:8080

3. **Stop the App:**
   ```bash
   docker-compose down
   ```

## Architecture
- **Build Stage:** Uses `node:18-alpine` to install dependencies and compile the React code via Vite.
- **Production Stage:** Uses `nginx:alpine` to serve the static files.
- **Configuration:** Custom `nginx.conf` ensures client-side routing (React Router) works correctly by redirecting 404s to `index.html`.
