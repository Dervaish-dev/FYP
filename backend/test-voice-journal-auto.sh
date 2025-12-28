#!/bin/bash

echo "🧪 Testing Voice Journal Auto-Creation System"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:5005"

echo "📋 Step 1: Check if server is running..."
health_check=$(curl -s "$BASE_URL/api/health")
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Server is running${NC}"
else
    echo -e "${RED}❌ Server is not running. Start with: node server.js${NC}"
    exit 1
fi

echo ""
echo "📋 Step 2: Simulate Retell AI webhook call completion..."
echo ""

# Simulate a call completion webhook
response=$(curl -s -X POST "$BASE_URL/api/voice-journal/webhook/call-completed" \
  -H "Content-Type: application/json" \
  -d '{
    "call_id": "test_call_'$(date +%s)'",
    "user_id": "6949b364cacafdcef3b2e3a7",
    "transcript": "Agent: Hello, this is Dr. Nadia. How are you feeling today?\nUser: Hi Dr. Nadia. I have been feeling quite stressed lately. Work has been overwhelming and I am having trouble sleeping.\nAgent: I understand. Can you tell me more about what is causing you stress at work?\nUser: Well, I have multiple deadlines coming up and my manager keeps adding more tasks. I feel like I cannot catch a break.\nAgent: That sounds very challenging. How are you coping with these feelings?\nUser: I try to take breaks but I feel guilty when I do. I just keep pushing through even though I am exhausted.\nAgent: It is important to take care of yourself. Have you tried any relaxation techniques?\nUser: Not really. I know I should but I do not have time.\nAgent: I would recommend starting with just 5 minutes of deep breathing each day. Small steps can make a big difference.\nUser: That sounds manageable. I will try that.\nAgent: Great. Remember, your wellbeing is important. Is there anything else you would like to discuss?\nUser: No, I think that is all for now. Thank you Dr. Nadia.\nAgent: You are welcome. Take care of yourself.",
    "summary": "Patient expressed feeling stressed due to overwhelming work demands and multiple deadlines. Reported difficulty sleeping and feelings of guilt when taking breaks. Dr. Nadia recommended starting with 5-minute daily breathing exercises as a manageable first step."
  }')

echo "Response:"
echo "$response" | jq '.' 2>/dev/null || echo "$response"
echo ""

# Extract call_id from response
call_id=$(echo "$response" | jq -r '.call_id' 2>/dev/null)

if [ "$call_id" != "null" ] && [ ! -z "$call_id" ]; then
    echo -e "${GREEN}✅ Webhook received successfully${NC}"
    echo "Call ID: $call_id"
else
    echo -e "${RED}❌ Webhook failed${NC}"
    exit 1
fi

echo ""
echo "⏳ Waiting 4 seconds for background processing..."
sleep 4

echo ""
echo "📋 Step 3: Check if journal was created..."
echo ""

# Check for voice journals for this user
journals=$(curl -s "$BASE_URL/api/voice-journal/history?user_id=6949b364cacafdcef3b2e3a7")
echo "Recent voice journals:"
echo "$journals" | jq '.' 2>/dev/null || echo "$journals"

journal_count=$(echo "$journals" | jq '.count' 2>/dev/null)

echo ""
if [ "$journal_count" -gt 0 ]; then
    echo -e "${GREEN}✅ Voice journals found: $journal_count${NC}"
    
    # Show the latest journal
    echo ""
    echo "📝 Latest Journal Entry:"
    echo "------------------------"
    echo "$journals" | jq -r '.journals[0] | "Title: \(.title)\n\nContent (first 300 chars):\n\(.content[:300])...\n\nEmotion: \(.mood)\nIntensity: \(.emotionalIntensity)\nSentiment: \(.sentiment)\nStress: \(.stressLevel)"' 2>/dev/null
else
    echo -e "${YELLOW}⚠️  No voice journals found yet. Processing may still be running.${NC}"
fi

echo ""
echo "=============================================="
echo "🎉 Test Complete!"
echo ""
echo "📚 Available Endpoints:"
echo "  POST   $BASE_URL/api/voice-journal/webhook/call-completed"
echo "  GET    $BASE_URL/api/voice-journal/history?user_id=xxx"
echo "  GET    $BASE_URL/api/voice-journal/process-pending?user_id=xxx"
echo ""
echo "💡 Integration Notes:"
echo "  1. Configure Retell AI to send webhook to: /api/voice-journal/webhook/call-completed"
echo "  2. Journal creation happens after 3-second delay"
echo "  3. Transcript is converted to narrative paragraph format using Gemini AI"
echo "  4. Emotions are detected automatically from content"
echo "  5. Journal is tagged with source='voice_call' and linked to call_id"
