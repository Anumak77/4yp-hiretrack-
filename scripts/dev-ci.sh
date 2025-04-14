#!/bin/bash

echo "Starting backend"
cd src/my-app/src/backend || exit
source venv/bin/activate
python3 app.py &
BACK_PID=$!
cd ../../..

echo "Starting frontend"

if [ -n "$CI" ]; then
  echo "Detected CI environment: starting frontend in background"
  cd src/my-app || exit
  npm ci
  npm start & # run in background for CI
  FRONT_PID=$!
  cd ../..
else
  echo "Local run: opening frontend in new Terminal tab"
  osascript -e 'tell application "Terminal" to do script "cd ~/Desktop/4yp/2025-csc1097-Hiretrack/src/my-app && npm start"'
fi


echo "Waiting for frontend and backend to be ready"
npx wait-on http://localhost:3000/login http://localhost:5000/ping

echo "Running Cypress tests"
npx cypress run --config baseUrl=http://localhost:3000

echo "Killing backend server"
kill $BACK_PID

# Only kill frontend if we're in CI (not local tab)
if [ -n "$CI" ]; then
  echo "Killing frontend server"
  kill $FRONT_PID
fi
