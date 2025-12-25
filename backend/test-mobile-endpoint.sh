#!/bin/bash

echo "📱 Testing: n8n → Mobile App Flow"
echo "=================================="
echo ""

# Step 1: n8n stores call (using webhook, but without delay processing)
echo "Step 1: n8n stores call data..."
curl -s -X POST "http://localhost:5005/api/voice-journal/webhook/call-completed" \
  -H "Content-Type: application/json" \
  -d '{
    "call_id": "mobile_instant_'$(date +%s)'",
    "user_id": "6949b364cacafdcef3b2e3a7",
    "transcript": "Agent: Hello! How are you today?\nUser: I am feeling fantastic! Today was amazing.\nAgent: That is wonderful! What made it special?\nUser: I spent time with my family and we had so much fun together.\nAgent: Family time is so important for mental health.\nUser: Absolutely! I feel so grateful.",
    "summary": "Patient expressed very positive mood. Strong family connections and feelings of gratitude."
  }' > /dev/null

echo "✅ Call stored"
echo ""

# Step 2: User ends call - Mobile app immediately processes
echo "Step 2: Mobile app requests journal creation..."
sleep 1  # Small delay to ensure DB write complete

response=$(curl -s -X POST "http://localhost:5005/api/voice-journal/process-latest" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "6949b364cacafdcef3b2e3a7"}')

echo ""
echo "✅ Response received:"
echo "$response" | jq '.'

success=$(echo "$response" | jq -r '.success')

if [ "$success" = "true" ]; then
  echo ""
  echo "🎉 SUCCESS! Journal created instantly!"
  echo ""
  echo "📖 Journal Preview:"
  echo "$response" | jq -r '.journal | "Title: \(.title)\nMood: \(.mood) (\(.emotionalIntensity)/10)\nSentiment: \(.sentiment)\nStress: \(.stressLevel)\n\nContent:\n\(.content[:400])..."'
fi

echo ""
echo "=================================="
echo "💡 Integration Code for Flutter:"
echo ""
echo "// When user ends call:"
echo "final response = await http.post("
echo "  Uri.parse('\$baseUrl/api/voice-journal/process-latest'),"
echo "  headers: {'Content-Type': 'application/json'},"
echo "  body: jsonEncode({'user_id': userId}),"
echo ");"
echo ""
echo "final journal = jsonDecode(response.body)['journal'];"
echo "// Show journal to user immediately!"
