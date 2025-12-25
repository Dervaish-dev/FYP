#!/bin/bash

echo "📱 Testing Mobile App Voice Call Flow"
echo "======================================"
echo ""

BASE_URL="http://localhost:5005"
USER_ID="6949b364cacafdcef3b2e3a7"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "Step 1: User makes call → n8n stores in call_reports"
echo "-------------------------------------------------------"
echo "Simulating n8n webhook that stores call data..."
echo ""

# Simulate n8n storing call (your existing flow)
mongo_insert=$(cat <<MONGO
use FYP;
db.call_reports.insertOne({
  user_id: "${USER_ID}",
  call_id: "mobile_test_$(date +%s)",
  transcript: "Agent: Hello, this is Dr. Nadia. How are you feeling today?\nUser: Hi Dr. Nadia! I'm feeling much better today. I went for a walk and got some fresh air.\nAgent: That's wonderful to hear! Exercise and fresh air can really help improve your mood.\nUser: Yes, exactly! I'm trying to make it a daily habit.\nAgent: That's an excellent goal. How has your sleep been?\nUser: Much improved, thank you. I'm sleeping through the night now.\nAgent: I'm so glad to hear that. Keep up the great work!",
  summary: "Patient reported improved mood and better sleep. Engaging in regular exercise and outdoor activities. Making good progress with healthy habits.",
  created_at: new Date(),
  processed: false
});
MONGO
)

echo "$mongo_insert" | mongosh "mongodb+srv://nomanmustafa:TkZ7fhh2B9eQv0Jh@cluster0.popuf6f.mongodb.net/FYP?retryWrites=true&w=majority" --quiet

echo -e "${GREEN}✅ Call stored in database${NC}"
echo ""

echo "Step 2: User ends call in mobile app"
echo "-------------------------------------------------------"
echo "Mobile app sends request to backend..."
echo ""

response=$(curl -s -X POST "$BASE_URL/api/voice-journal/process-latest" \
  -H "Content-Type: application/json" \
  -d "{\"user_id\": \"${USER_ID}\"}")

echo "Response:"
echo "$response" | jq '.'

success=$(echo "$response" | jq -r '.success')

if [ "$success" = "true" ]; then
  echo ""
  echo -e "${GREEN}✅ SUCCESS: Voice journal created!${NC}"
  echo ""
  echo "Journal Details:"
  echo "----------------"
  echo "$response" | jq -r '.journal | "Title: \(.title)\nMood: \(.mood)\nIntensity: \(.emotionalIntensity)\nSentiment: \(.sentiment)\nStress: \(.stressLevel)\n\nContent Preview:\n\(.content[:300])..."'
else
  echo ""
  echo -e "${YELLOW}⚠️  Failed to create journal${NC}"
  echo "$response" | jq -r '.message'
fi

echo ""
echo "======================================"
echo "📱 Mobile Flow Complete!"
echo ""
echo "USAGE IN YOUR MOBILE APP:"
echo "When user ends call, call this endpoint:"
echo ""
echo -e "${BLUE}POST $BASE_URL/api/voice-journal/process-latest${NC}"
echo -e "${BLUE}Body: { \"user_id\": \"xxx\" }${NC}"
echo ""
echo "It will:"
echo "  1. Find latest unprocessed call"
echo "  2. Convert to journal with AI"
echo "  3. Return complete journal object"
echo "  4. User can see it immediately!"
echo ""
