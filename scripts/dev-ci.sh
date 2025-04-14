#!/bin/bash

echo "Starting backend"
cd src/my-app/src/backend || exit
source venv/bin/activate
python3 app.py &
BACK_PID=$!
cd ../../..

if [ -n "$CI" ]; then
  echo "Starting frontend in background for CI"
  cd src/my-app || exit
  npm ci
  npm start & # background
  FRONT_PID=$!
  cd ../..
else
  echo "Starting frontend in a new Terminal tab"
  osascript <<EOF
tell application "Terminal"
  do script "cd \"$(pwd)/src/my-app\" && npm ci && npm start"
end tell
EOF
  FRONT_PID=$! # just a dummy value so kill doesn't break later
fi

echo "Waiting for frontend and backend to be ready"
npx wait-on http://localhost:3000/login http://localhost:5000/ping

echo "🚀 Running Cypress tests..."
npx cypress run --config baseUrl=http://localhost:3000

echo "Killing backend server"
kill $BACK_PID

# Only kill frontend if we're in CI (not local tab)
if [ -n "$CI" ]; then
  echo "Killing frontend server"
  kill $FRONT_PID
fi
