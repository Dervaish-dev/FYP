#!/bin/bash

echo "🔍 Testing Caregiver Patient Detail Data"
echo "=========================================="

cd /Users/apple/NC/FYP/backend

# Generate token
TOKEN=$(node -e "const jwt = require('jsonwebtoken'); console.log(jwt.sign({id: '6945922901bcd9aca38742a2', role: 'caregiver', email: 'dummy123@gmail.com'}, 'neurocompanion_jwt_secret_key_2024_secure_random_string_change_this_in_production', {expiresIn: '7d'}))")

echo -e "\n📊 Fetching patient detail for John Doe..."
RESPONSE=$(curl -s "http://localhost:5005/api/caregiver/patient/6946df27a8cbe7339319cd79" -H "Authorization: Bearer $TOKEN")

echo "$RESPONSE" | python3 << 'EOF'
import sys, json

data = json.load(sys.stdin)

if data.get('success'):
    patient = data.get('patient', {})
    patient_data = data.get('data', {})
    
    print(f"\n✅ Patient: {patient.get('name')}")
    print(f"   Email: {patient.get('email')}")
    
    print(f"\n📈 Data Summary:")
    print(f"   Emotions: {len(patient_data.get('emotions', []))}")
    print(f"   Tasks: {len(patient_data.get('tasks', []))}")
    print(f"   Journals: {len(patient_data.get('journals', []))}")
    print(f"   Wellness: {len(patient_data.get('wellness', []))}")
    
    # Show emotion breakdown
    from collections import Counter
    emotions = patient_data.get('emotions', [])
    if emotions:
        emotion_counts = Counter([e['emotion'] for e in emotions])
        print(f"\n😊 Emotion Distribution:")
        for emotion, count in sorted(emotion_counts.items()):
            percentage = (count / len(emotions)) * 100
            print(f"   {emotion}: {count} ({percentage:.0f}%)")
    
    # Show sample journals
    journals = patient_data.get('journals', [])
    if journals:
        print(f"\n📝 Sample Journal Entries:")
        for i, journal in enumerate(journals[:3]):
            print(f"   {i+1}. {journal.get('title', 'Untitled')}")
            content = journal.get('content', '')[:60]
            print(f"      {content}...")
    
    # Show tasks
    tasks = patient_data.get('tasks', [])
    if tasks:
        done_tasks = sum(1 for t in tasks if t.get('status') == 'done')
        print(f"\n✅ Tasks: {done_tasks}/{len(tasks)} completed ({(done_tasks/len(tasks)*100):.0f}%)")
    
    print(f"\n✅ All data is available for the frontend!")
else:
    print(f"\n❌ Error: {data.get('message', 'Unknown error')}")

EOF

echo -e "\n✨ Test complete!"
