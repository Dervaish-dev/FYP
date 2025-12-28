#!/bin/bash

# HuggingFace Emotion Detection Test Script
# Tests the trpakov/vit-face-expression model via router endpoint

echo "🧪 Testing HuggingFace Facial Emotion Detection"
echo "=================================================="
echo ""

# Check if server is running
if ! lsof -ti:5005 > /dev/null 2>&1; then
    echo "❌ Backend server is not running on port 5005"
    echo "   Please start it with: npm start"
    exit 1
fi

echo "✅ Server is running"
echo ""

# Test with real image
if [ ! -f "test-real-face.jpg" ]; then
    echo "📥 Downloading test image..."
    curl -s "https://raw.githubusercontent.com/opencv/opencv/master/samples/data/lena.jpg" -o test-real-face.jpg
    echo "✅ Test image downloaded"
    echo ""
fi

echo "📤 Sending image for emotion analysis..."
echo ""

RESPONSE=$(curl -s -X POST "http://localhost:5005/api/emotion/analyze-face" \
    -F "image=@test-real-face.jpg")

echo "📊 Results:"
echo "$RESPONSE" | jq '.'

echo ""
echo "=================================================="

# Parse and display summary
EMOTION=$(echo "$RESPONSE" | jq -r '.emotion // "Error"')
CONFIDENCE=$(echo "$RESPONSE" | jq -r '.confidence // 0')
CONFIDENCE_PCT=$(echo "$CONFIDENCE * 100" | bc | cut -d'.' -f1)

if [ "$EMOTION" != "Error" ] && [ "$EMOTION" != "null" ]; then
    echo "✅ Detection successful!"
    echo "   Detected: $EMOTION (${CONFIDENCE_PCT}% confident)"
    exit 0
else
    echo "❌ Detection failed"
    echo "   Error: $(echo "$RESPONSE" | jq -r '.error // .message // "Unknown error"')"
    exit 1
fi
