#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "═══════════════════════════════════════════════════"
echo "  Starting Backend & Running Smoke Test"
echo "═══════════════════════════════════════════════════"

# Check if backend is already running
if lsof -Pi :5005 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠ Backend already running on port 5005${NC}"
    echo "Proceeding with smoke test..."
else
    echo "Starting backend server..."
    # Start backend in background
    npm start > /tmp/backend.log 2>&1 &
    BACKEND_PID=$!
    echo "Backend PID: $BACKEND_PID"
    
    # Wait for backend to be ready
    echo "Waiting for backend to start..."
    for i in {1..30}; do
        if curl -s http://localhost:5005/api/health > /dev/null 2>&1; then
            echo -e "${GREEN}✓ Backend is ready!${NC}"
            break
        fi
        if [ $i -eq 30 ]; then
            echo -e "${RED}✗ Backend failed to start after 30 seconds${NC}"
            echo "Check logs at /tmp/backend.log"
            tail -20 /tmp/backend.log
            exit 1
        fi
        sleep 1
        echo -n "."
    done
    echo
fi

# Run smoke test
echo
echo "Running smoke test..."
echo "─────────────────────────────────────────────────"
node smoke-test.js

TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ Smoke test completed successfully!${NC}"
else
    echo -e "${RED}✗ Smoke test failed with exit code: $TEST_EXIT_CODE${NC}"
fi

# Ask if user wants to keep backend running
echo
read -p "Keep backend running? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    if [ ! -z "$BACKEND_PID" ]; then
        echo "Stopping backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null
        echo "Backend stopped."
    fi
fi

exit $TEST_EXIT_CODE
