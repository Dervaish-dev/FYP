# NeuroCompanion - Full-Stack Authentication System

A complete authentication system built with React (Vite) frontend and Node.js backend for the NeuroCompanion project.

## 🏗️ Project Structure

```
/neurocompanion
├── /frontend  → React (Vite) + TailwindCSS + Authentication UI
│   ├── /src
│   │   ├── /components
│   │   │   ├── AuthForm.jsx
│   │   │   └── InputField.jsx
│   │   ├── /pages
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── /context
│   │   │   └── AuthContext.jsx
│   │   ├── /utils
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── /backend   → Express + MongoDB + JWT Authentication API
│   ├── /config
│   │   └── db.js
│   ├── /controllers
│   │   └── authController.js
│   ├── /middleware
│   │   └── auth.js
│   ├── /models
│   │   └── User.js
│   ├── /routes
│   │   └── authRoutes.js
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
Frontend runs on: http://localhost:5555

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

### Frontend
- **React (Vite)** - Fast development and building
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Axios** - HTTP client for API calls
- **React Router DOM** - Client-side routing
- **Lucide React** - Beautiful icons

## 📋 Features

- ✅ **User Registration** - Create new accounts with validation
- ✅ **User Login** - Secure authentication with JWT
- ✅ **Protected Routes** - Dashboard access control
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Form Validation** - Client and server-side validation
- ✅ **Error Handling** - Comprehensive error management
- ✅ **Modern UI** - Beautiful animations and interactions
- ✅ **Token Management** - Automatic token refresh and storage

## 🔮 Future Features Ready

The project is structured to easily add:
- **Emotion Recognition & Analysis** - AI-powered emotion detection
- **Adaptive UI Engine** - Dynamic interface adaptation
- **ADHD Task Scheduling** - Smart task management
- **Voice Assistant Integration** - Voice-controlled interactions

## 📝 API Endpoints

### Authentication Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Utility Routes
- `GET /api/health` - Health check endpoint

## 🔐 Security Features

- **Password Hashing** - bcrypt with salt rounds
- **JWT Tokens** - Secure token-based authentication
- **CORS Protection** - Configured for frontend origin
- **Input Validation** - Server-side validation
- **Error Handling** - Secure error responses

## 🎨 UI/UX Features

- **Modern Design** - Clean, professional interface
- **Smooth Animations** - Framer Motion powered
- **Responsive Layout** - Works on all devices
- **Loading States** - User feedback during operations
- **Form Validation** - Real-time validation feedback
- **Accessibility** - Proper ARIA labels and keyboard navigation

## 🧪 Testing the Application

1. **Start both servers** (backend on port 5000, frontend on port 5555)
2. **Visit** http://localhost:5555
3. **Register** a new account
4. **Login** with your credentials
5. **Access** the protected dashboard
6. **Test logout** functionality

## 📦 Installation Commands

### Backend Dependencies
```bash
npm install express mongoose dotenv cors bcryptjs jsonwebtoken
npm install -D nodemon
```

### Frontend Dependencies
```bash
npm install axios react-router-dom tailwindcss lucide-react framer-motion
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
2. **JWT Token Management** - Automatic token handling
3. **Protected Routes** - Route guards for authentication
4. **Form Validation** - Client and server-side validation
5. **Error Handling** - Comprehensive error management
6. **Responsive Design** - Mobile-first approach
7. **Modern Animations** - Smooth user interactions
8. **Clean Architecture** - Modular, scalable code structure

## 🚀 Ready for Production

The application is production-ready with:
- Environment variable configuration
- Error handling and logging
- Security best practices
- Clean, maintainable code
- Comprehensive documentation
