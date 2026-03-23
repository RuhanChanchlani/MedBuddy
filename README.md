# MedBuddy — The AI That Sits Between a Patient and Confusion

**IAR Udaan Hackathon 2026 — Day 1**

MedBuddy is an AI-powered medical document simplifier that helps patients understand their prescriptions, discharge summaries, and lab reports in plain, human language.

## 🚀 Features

- **JWT Authentication**: Secure user registration and login.
- **AI Analysis**: Uses Google Gemini 1.5 Flash to parse and simplify medical documents.
- **Multi-format Support**: Upload PDF, JPG, or PNG files.
- **Structured Output**: Clear diagnosis, medication schedule (dosage, timing, duration), side effects, and follow-up checklists.
- **History Tracking**: Logged-in users can view their past analyses.
- **Modern UI**: Glassmorphic design with smooth animations.

## 🛠️ Tech Stack

- **Frontend**: React, Framer Motion, Tailwind CSS, Lucide Icons.
- **Backend**: FastAPI, SQLAlchemy (SQLite), JWT, Pydantic.
- **AI**: Google Generative AI (Gemini 1.5 Flash).

## 🔧 Installation & Setup

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file and add your Gemini API Key:
   ```env
   GENAI_API_KEY=your_gemini_api_key
   SECRET_KEY=your_jwt_secret_key
   ```
4. Start the server:
   ```bash
   python main.py
   ```

### Frontend

1. Ensure you have the required React dependencies:
   ```bash
   npm install framer-motion lucide-react
   ```
2. Run your development server (e.g., Vite):
   ```bash
   npm run dev
   ```

## 📄 License

This project was built for the IAR Udaan Hackathon 2026.
