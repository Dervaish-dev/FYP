# NeuroCompanion - Full-Stack Mental Health Companion

A comprehensive mental health companion application built with React (Vite) frontend and Node.js backend, featuring emotion recognition, task management, therapeutic voice assistant, and adaptive UI.

## 🏗️ Project Structure

```
/neurocompanion
├── /frontend  → React (Vite) + TailwindCSS + Complete UI System
│   ├── /src
│   │   ├── /components
│   │   │   ├── AuthForm.jsx
│   │   │   ├── InputField.jsx
│   │   │   ├── Layout.jsx
│   │   │   └── DashboardCard.jsx
│   │   ├── /pages
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Emotions.jsx
│   │   │   ├── Tasks.jsx
│   │   │   ├── VoiceAssistant.jsx
│   │   │   ├── Journal.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── CaregiverPortal.jsx
│   │   │   ├── Wellness.jsx
│   │   │   └── Settings.jsx
│   │   ├── /context
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── /utils
│   │   │   ├── api.js
│   │   │   └── themes.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── /backend   → Express + MongoDB + AI Integration
│   ├── /config
│   │   └── db.js
│   ├── /controllers
│   │   └── authController.js
│   ├── /middleware
│   │   └── auth.js
│   ├── /models
│   │   └── User.js
│   ├── /routes
│   │   ├── authRoutes.js
│   │   ├── emotionRoutes.js
│   │   ├── emotionHistoryRoutes.js
│   │   └── taskRoutes.js
│   ├── server.js
│   ├── package.json
│   └── env.example
└── README.md
```

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
cp env.example .env
npm run dev
```
Backend runs on: http://localhost:5000

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: http://localhost:5556

### 3. Environment Setup
Create a `.env` file in the backend directory with:
```
MONGODB_URI=mongodb+srv://dervaishabbas_db_user:w5bdJM9PsL33rz0A@cluster0.erw6pvk.mongodb.net/neurocompanion?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=neurocompanion_jwt_secret_key_2024_secure_random_string
PORT=5000
```

## 🛠️ Tech Stack

### Backend
- **Node.js + Express** - Server framework
- **MongoDB Atlas** - Cloud database
- **JWT Authentication** - Secure token-based auth
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Mongoose** - MongoDB object modeling
- **Gemini AI API** - Emotion recognition and therapeutic responses
- **Multer** - File upload handling

### Frontend
- **React (Vite)** - Fast development and building
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Axios** - HTTP client for API calls
- **React Router DOM** - Client-side routing
- **Lucide React** - Beautiful icons
- **@dnd-kit** - Drag and drop functionality
- **Recharts** - Data visualization
- **React Toastify** - Notifications

## 📋 Core Features

### 🔐 Authentication System
- ✅ **User Registration** - Create new accounts with validation
- ✅ **User Login** - Secure authentication with JWT
- ✅ **Protected Routes** - Dashboard access control
- ✅ **Token Management** - Automatic token refresh and storage

### 🎭 Emotion Recognition & Analysis
- ✅ **AI-Powered Emotion Detection** - Upload images for emotion analysis
- ✅ **Manual Emotion Selection** - Choose emotions manually
- ✅ **Adaptive Theme Switching** - UI adapts based on detected emotions
- ✅ **Emotion History Tracking** - Store and visualize emotional patterns
- ✅ **Confidence Scoring** - AI confidence levels for emotion detection

### 📋 Task Scheduling & Management
- ✅ **Drag & Drop Interface** - Intuitive task organization
- ✅ **Priority System** - High, medium, low priority tasks
- ✅ **Due Date Management** - Time-based task scheduling
- ✅ **Nudging System** - Smart reminders and notifications
- ✅ **Task History Analytics** - Completion statistics and trends
- ✅ **Weekly Completion Charts** - Visual progress tracking

### 🧠 Therapeutic Voice Assistant
- ✅ **AI-Powered Responses** - Dr. Sarah, your mental health companion
- ✅ **Empathetic Guidance** - Professional therapeutic support
- ✅ **Real-time Chat** - Instant responses to mental health concerns
- ✅ **Quick Response Buttons** - Pre-made therapeutic prompts
- ✅ **Voice Input Support** - Microphone integration ready

### 🎨 Adaptive UI Engine
- ✅ **6 Theme System** - Ocean, Coral, Midnight, Mint, Lavender, Golden
- ✅ **Emotion-Based Themes** - Automatic theme switching
- ✅ **Font Customization** - Size and style adjustments
- ✅ **Smooth Transitions** - Framer Motion animations
- ✅ **Persistent Settings** - localStorage integration

### 📊 Analytics & Insights
- ✅ **Emotion Trend Charts** - Weekly emotional patterns
- ✅ **Task Completion Stats** - Productivity metrics
- ✅ **Mood Distribution** - Emotional state visualization
- ✅ **AI Insights** - Personalized recommendations

### 📝 Journaling & Wellness
- ✅ **Digital Journal** - Rich text editor with mood analysis
- ✅ **Entry Management** - Save, edit, delete journal entries
- ✅ **Sleep Tracking** - Sleep schedule management
- ✅ **Breathing Exercises** - Guided relaxation techniques
- ✅ **Wellness Reminders** - Persistent nudge system

### 👥 Caregiver Dashboard
- ✅ **Progress Reports** - User activity summaries
- ✅ **Emotion Trends** - Caregiver insights
- ✅ **Task Completion** - Productivity tracking
- ✅ **AI Recommendations** - Personalized suggestions

## 📝 API Endpoints

### Authentication Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Emotion Analysis Routes
- `POST /api/emotion/analyze` - Analyze emotion from image
- `POST /api/emotions/history` - Log emotion entry
- `GET /api/emotions/history/:userId` - Get emotion history
- `GET /api/emotions/history/:userId/chart` - Get chart data

### Task Management Routes
- `POST /api/tasks/create` - Create new task
- `GET /api/tasks/:userId` - Get user tasks
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/:userId/due` - Get due tasks
- `PUT /api/tasks/:id/nudge` - Mark task as nudged

### Utility Routes
- `GET /api/health` - Health check endpoint

## 🔐 Security Features

- **Password Hashing** - bcrypt with salt rounds
- **JWT Tokens** - Secure token-based authentication
- **CORS Protection** - Configured for frontend origin
- **Input Validation** - Server-side validation
- **Error Handling** - Secure error responses
- **File Upload Security** - Image validation and size limits

## 🎨 UI/UX Features

- **Modern Design** - Clean, professional interface
- **Smooth Animations** - Framer Motion powered
- **Responsive Layout** - Works on all devices
- **Loading States** - User feedback during operations
- **Form Validation** - Real-time validation feedback
- **Accessibility** - Proper ARIA labels and keyboard navigation
- **Theme System** - Multiple color schemes
- **Drag & Drop** - Intuitive task management

## 🧪 Testing the Application

1. **Start both servers** (backend on port 5000, frontend on port 5556)
2. **Visit** http://localhost:5556
3. **Register** a new account
4. **Login** with your credentials
5. **Explore** all features:
   - Upload images for emotion analysis
   - Create and manage tasks with drag & drop
   - Chat with the therapeutic voice assistant
   - Customize themes and settings
   - View analytics and insights

## 📦 Installation Commands

### Backend Dependencies
```bash
npm install express mongoose dotenv cors bcryptjs jsonwebtoken multer node-fetch
npm install -D nodemon
```

### Frontend Dependencies
```bash
npm install axios react-router-dom tailwindcss lucide-react framer-motion @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities recharts react-toastify
npx tailwindcss init -p
```

## 🔧 Development Commands

### Backend
```bash
npm run dev    # Start development server with nodemon
npm start      # Start production server
```

### Frontend
```bash
npm run dev    # Start Vite development server
npm run build  # Build for production
npm run preview # Preview production build
```

## 🌟 Key Features Implemented

1. **Complete Authentication Flow** - Registration, login, logout
2. **AI-Powered Emotion Recognition** - Image analysis with Gemini API
3. **Adaptive UI System** - Dynamic theme switching
4. **Task Management** - Drag & drop with analytics
5. **Therapeutic Voice Assistant** - AI mental health companion
6. **Comprehensive Analytics** - Charts and insights
7. **Journaling System** - Digital diary with mood tracking
8. **Caregiver Dashboard** - Progress monitoring
9. **Wellness Features** - Sleep tracking and breathing exercises
10. **Modern Animations** - Smooth user interactions

## 🚀 Ready for Production

The application is production-ready with:
- Environment variable configuration
- Error handling and logging
- Security best practices
- Clean, maintainable code
- Comprehensive documentation
- AI integration
- Real-time features
- Responsive design

## 🤖 AI Integration

- **Gemini Vision API** - Emotion detection from images
- **Gemini Text API** - Therapeutic conversation responses
- **Real-time Processing** - Instant AI responses
- **Confidence Scoring** - AI accuracy metrics
- **Adaptive Learning** - Context-aware responses

## 📱 Mobile Responsive

- **Mobile-First Design** - Optimized for all devices
- **Touch Interactions** - Drag & drop on mobile
- **Responsive Charts** - Adaptive data visualization
- **Mobile Navigation** - Bottom navigation bar
- **Touch-Friendly UI** - Large buttons and inputs

---

**Developed by Dervaish Ahmed** - A comprehensive mental health companion for ADHD and general wellness support.