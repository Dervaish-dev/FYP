# 🚀 NeuroCompanion - Setup Guide for New Machine

This guide will help you set up the NeuroCompanion project on a new machine after cloning from GitHub.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)
- **MongoDB Atlas Account** (or local MongoDB instance)
- **API Keys** (listed below)

## 🔧 Required API Keys

You'll need to obtain the following API keys:

1. **MongoDB Connection String**
   - Get from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a cluster and get the connection string

2. **HuggingFace API Token**
   - Get from [HuggingFace](https://huggingface.co/settings/tokens)
   - Used for emotion analysis

3. **Google Gemini API Key** (Optional but recommended)
   - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Used for advanced text analysis

4. **Gmail App Password** (For email features)
   - Enable 2FA on your Gmail account
   - Generate App Password from [Google Account Settings](https://myaccount.google.com/apppasswords)

5. **N8N Webhook URL** (For voice journal via Retell AI)
   - Your custom n8n webhook URL
   - Or use the default provided in env.example

## 📥 Installation Steps

### 1. Clone the Repository

```bash
git clone <your-github-repo-url>
cd NC/FYP
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file from example
cp env.example .env

# Edit .env file with your actual values
nano .env  # or use any text editor
```

**Configure your `.env` file:**

```env
# Database
MONGO_URI=your_mongodb_connection_string
MONGODB_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_secure_random_secret_key

# Server Port
PORT=5005

# Invite & OTP Secrets
INVITE_HMAC_SECRET=your_invite_secret_key
OTP_HMAC_SECRET=your_otp_secret_key
CLAIM_TOKEN_HMAC_SECRET=your_claim_token_secret
INVITE_EXPIRES_HOURS=72
OTP_EXPIRES_MINUTES=10
CLAIM_TOKEN_EXPIRES_MINUTES=30

# Email Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM=your_email@gmail.com

# AI APIs
HF_TOKEN=your_huggingface_token
GEMINI_API_KEY=your_gemini_api_key
GEMINI_EMOTION_MODEL=gemini-2.0-flash-exp
GEMINI_VOICE_MODEL=gemini-2.0-flash-exp

# Voice Journal (Retell AI via n8n)
N8N_WEBHOOK_URL=your_n8n_webhook_url
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd ../frontend

# Install dependencies
npm install

# The frontend uses backend API at http://localhost:5005
# No additional .env needed for development
```

### 4. Mobile App Setup (Flutter - Optional)

```bash
# Navigate to mobile app directory
cd ../../FYPApp/neurocompanion_flutter

# Create API keys file from example
cp lib/config/api_keys.dart.example lib/config/api_keys.dart

# Edit the file with your backend URL
# Default: http://localhost:5005
# For physical device: http://YOUR_MACHINE_IP:5005

# Install Flutter dependencies
flutter pub get
```

## 🚀 Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

Backend will run on: `http://localhost:5005`

### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend will run on: `http://localhost:5173` (or the port shown in terminal)

### Start Mobile App (Optional)

```bash
cd FYPApp/neurocompanion_flutter
flutter run
```

## 🧪 Testing the Setup

### 1. Backend Health Check

```bash
curl http://localhost:5005/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "NeuroCompanion API is running",
  "timestamp": "2025-12-28T..."
}
```

### 2. Test Emotion Analysis

```bash
cd backend
node test-hf-emotion.js
```

### 3. Test Voice Journal

```bash
cd backend
node test-voice-journal-fix.js
```

## 📁 Project Structure

```
FYP/
├── backend/           # Node.js/Express API
│   ├── controllers/   # Business logic
│   ├── models/        # MongoDB schemas
│   ├── routes/        # API endpoints
│   ├── utils/         # Helper functions
│   ├── config/        # Configuration files
│   └── .env          # Environment variables (create this)
│
├── frontend/          # React/Vite web app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── services/
│   └── package.json
│
└── FYPApp/           # Flutter mobile app
    └── neurocompanion_flutter/
```

## 🔑 Important Notes

### Security
- **Never commit `.env` files** to GitHub (already in .gitignore)
- Keep all API keys and secrets secure
- Use strong, random strings for JWT_SECRET and HMAC secrets

### Database
- The MongoDB connection string contains credentials
- Ensure your MongoDB cluster allows connections from your IP
- For production, whitelist specific IPs only

### Email Features
- Gmail requires "App Password" (not your regular password)
- Enable 2FA on Gmail first
- Generate App Password from Google Account settings

### AI APIs
- **HuggingFace**: Free tier available, used for emotion detection
- **Gemini**: Free tier available with rate limits
- Both are optional but recommended for full functionality

### Voice Journal
- Requires n8n webhook setup with Retell AI integration
- Can work without it - other features will function normally
- Voice journal will show as unavailable if not configured

## 🐛 Common Issues

### "Cannot find module" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Port already in use
```bash
# Kill process on port 5005
lsof -ti:5005 | xargs kill -9

# Or use a different port in .env
PORT=5006
```

### MongoDB connection fails
- Check if your IP is whitelisted in MongoDB Atlas
- Verify connection string format
- Ensure database user has proper permissions

### HuggingFace API errors
- Verify HF_TOKEN is correct
- Check if you have rate limit quota
- Try different inference provider in HuggingFace settings

## 📞 Support

If you encounter any issues:
1. Check the logs in terminal
2. Verify all environment variables are set
3. Ensure all API keys are valid
4. Check MongoDB Atlas network access settings

## 🎉 Success!

If everything is set up correctly, you should be able to:
- ✅ Register/Login to the application
- ✅ Create journal entries
- ✅ Track emotions and mood
- ✅ Manage tasks
- ✅ Use voice journal (if configured)
- ✅ Access caregiver portal

Happy coding! 🚀
