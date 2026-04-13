#!/bin/bash

# Deployment script for acrapath-frontend-admin
# This script builds and deploys the admin frontend to the EC2 instance

set -e

echo "=== Acrapath Admin Frontend Deployment ==="

# Pull latest changes
echo "Pulling latest changes..."
git pull origin main

# Build and start the container
echo "Building and starting the container..."
docker compose down || true
docker compose build --no-cache
docker compose up -d

echo "=== Deployment Complete ==="
echo "Admin frontend is running on port 3001"
echo "Access it at: http://$(curl -s ifconfig.me):3001"
docker compose ps
