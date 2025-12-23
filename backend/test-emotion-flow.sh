#!/bin/bash

echo "🔍 Testing Emotion Data Flow"
echo "=============================="

# Test 1: Patient endpoint
echo -e "\n1️⃣ PATIENT ENDPOINT (what patients see on /emotions page):"
PATIENT_RESPONSE=$(curl -s "http://localhost:5005/api/emotions/history/6946df27a8cbe7339319cd79?limit=5")
echo "$PATIENT_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
emotions = data.get('data', {}).get('emotions', [])
print(f'   ✅ Success: {data.get(\"success\", False)}')
print(f'   📊 Emotions returned: {len(emotions)}')
if emotions:
    print('   Recent emotions:')
    for e in emotions[:5]:
        print(f'      - {e[\"emotion\"]} (intensity: {e[\"intensity\"]}/10)')
else:
    print('   ⚠️  No emotions found')
"

# Test 2: Caregiver endpoint
echo -e "\n2️⃣ CAREGIVER ENDPOINT (what caregivers see on dashboard):"
cd /Users/apple/NC/FYP/backend
TOKEN=$(node -e "const jwt = require('jsonwebtoken'); console.log(jwt.sign({id: '6945922901bcd9aca38742a2', role: 'caregiver', email: 'dummy123@gmail.com'}, 'neurocompanion_jwt_secret_key_2024_secure_random_string_change_this_in_production', {expiresIn: '7d'}))")

CAREGIVER_RESPONSE=$(curl -s "http://localhost:5005/api/caregiver/patients" -H "Authorization: Bearer $TOKEN")
echo "$CAREGIVER_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
patients = data.get('patients', [])
print(f'   ✅ Success: {data.get(\"success\", False)}')
print(f'   👥 Total patients: {len(patients)}')
for patient in patients:
    emotions = patient.get('recentEmotions', [])
    print(f'   \n   Patient: {patient.get(\"name\")}')
    print(f'   📊 Recent emotions: {len(emotions)}')
    if emotions:
        print('   Recent emotions:')
        for e in emotions[:5]:
            print(f'      - {e[\"emotion\"]} (intensity: {e.get(\"intensity\", \"N/A\")}/10)')
    else:
        print('   ⚠️  No emotions found for this patient')
"

echo -e "\n✅ Test Complete!"
echo "If both endpoints show emotions for John Doe, the data flow is working correctly."
