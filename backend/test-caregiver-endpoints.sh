#!/bin/bash

# Base URL
API_URL="http://localhost:5005/api"

echo "🧪 Testing Caregiver Password Reset Flow..."

# 1. Request Password Reset (Forgot Password)
# We'll use a dummy email. If the backend is working, it should return success (200)
# regardless of whether the email exists (security practice), or 404 if you implemented it that way.
# Based on my code, it returns 200 with a message.

echo "\n1️⃣  Requesting Password Reset (Forgot Password)..."
curl -X POST "$API_URL/caregiver/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# 2. Verify OTP (This will fail with a random OTP, but checks if the endpoint exists)
echo "\n\n2️⃣  Verifying OTP (Expected to fail with Invalid OTP)..."
curl -X POST "$API_URL/caregiver/verify-reset-otp" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "otp": "123456"}'

# 3. Reset Password (This will fail with Invalid OTP, but checks endpoint existence)
echo "\n\n3️⃣  Resetting Password (Expected to fail with Invalid OTP)..."
curl -X POST "$API_URL/caregiver/reset-password" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "otp": "123456", "newPassword": "newpassword123"}'

echo "\n\n✅ Endpoint connectivity test complete."
echo "   (Note: Actual logic requires a real email in the DB and a valid OTP from the email)"
