#!/bin/bash

echo "🌍 Checking frontend availability..."
npx wait-on http://localhost:3000

echo "✅ Frontend is up. Running Cypress..."
npx cypress run --config baseUrl=http://localhost:3000
