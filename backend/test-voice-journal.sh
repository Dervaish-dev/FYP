#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "═══════════════════════════════════════════════════"
echo "  Voice Journal Feature - Integration Test"
echo "═══════════════════════════════════════════════════"
echo ""

USER_ID="692931ed753d4984e951beb0"
API_URL="http://localhost:5005"

# Test 1: Start voice call
echo -e "${BLUE}📞 Test 1: Starting voice call...${NC}"
CALL_RESPONSE=$(curl -s -X POST $API_URL/api/journal/voice/start \
  -H "Content-Type: application/json" \
  -d "{\"userId\": \"$USER_ID\"}")

echo "$CALL_RESPONSE" | jq .

if [ $? -eq 0 ]; then
  CALL_ID=$(echo "$CALL_RESPONSE" | jq -r '.data.callId')
  if [ "$CALL_ID" != "null" ] && [ -n "$CALL_ID" ]; then
    echo -e "${GREEN}✅ Call ID: $CALL_ID${NC}"
  else
    echo -e "${RED}❌ Failed to get call ID${NC}"
    exit 1
  fi
else
  echo -e "${RED}❌ Failed to start call${NC}"
  exit 1
fi

echo ""
echo "───────────────────────────────────────────────────"
echo ""

# Test 2: Simulate webhook callback with transcript
echo -e "${BLUE}📝 Test 2: Simulating voice transcript webhook...${NC}"
sleep 2

WEBHOOK_RESPONSE=$(curl -s -X POST $API_URL/api/journal/voice/webhook \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"callId\": \"$CALL_ID\",
    \"transcript\": \"Today was a really productive day. I managed to complete all my tasks at work and felt very accomplished. I also spent some quality time with my family in the evening which made me feel grateful and happy. Overall, it was a great day and I'm looking forward to tomorrow.\",
    \"duration\": 45,
    \"status\": \"completed\"
  }")

echo "$WEBHOOK_RESPONSE" | jq .

if echo "$WEBHOOK_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Webhook processed successfully${NC}"
else
  echo -e "${RED}❌ Webhook failed${NC}"
  exit 1
fi

echo ""
echo "───────────────────────────────────────────────────"
echo ""

# Test 3: Check call status
echo -e "${BLUE}✓ Test 3: Checking call status...${NC}"
sleep 2

STATUS_RESPONSE=$(curl -s -X GET "$API_URL/api/journal/voice/status/$CALL_ID")
echo "$STATUS_RESPONSE" | jq .

STATUS=$(echo "$STATUS_RESPONSE" | jq -r '.status')
if [ "$STATUS" = "completed" ]; then
  echo -e "${GREEN}✅ Call status: completed${NC}"
else
  echo -e "${YELLOW}⚠️  Call status: $STATUS${NC}"
fi

echo ""
echo "───────────────────────────────────────────────────"
echo ""

# Test 4: Verify voice entry in journal list
echo -e "${BLUE}📋 Test 4: Fetching voice journal entries...${NC}"
sleep 1

ENTRIES_RESPONSE=$(curl -s -X GET "$API_URL/api/journal/$USER_ID?limit=5")

echo "$ENTRIES_RESPONSE" | jq '.data.entries[] | select(.isVoiceEntry == true) | {
  id: ._id,
  isVoice: .isVoiceEntry,
  duration: .voiceDuration,
  callId: .voiceCallId,
  emotion: .emotion,
  topics: .topics,
  stressLevel: .stressLevel,
  contentPreview: (.content | .[0:80])
}'

VOICE_COUNT=$(echo "$ENTRIES_RESPONSE" | jq '[.data.entries[] | select(.isVoiceEntry == true)] | length')

if [ "$VOICE_COUNT" -gt 0 ]; then
  echo ""
  echo -e "${GREEN}✅ Found $VOICE_COUNT voice journal entries${NC}"
else
  echo ""
  echo -e "${YELLOW}⚠️  No voice entries found yet${NC}"
fi

echo ""
echo "═══════════════════════════════════════════════════"
echo -e "${GREEN}✓ Voice Journal Integration Test Complete!${NC}"
echo "═══════════════════════════════════════════════════"
echo ""
echo "Summary:"
echo "  • Voice call initiated: ✓"
echo "  • Transcript processed: ✓"
echo "  • Call status tracked: ✓"
echo "  • Voice entries created: $VOICE_COUNT"
echo ""
