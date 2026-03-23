<div align="center">

# 🩺 MedBuddy

### AI-Powered Medical Document Simplifier

*Simplifying healthcare. Without distortion.*

**IAR Udaan Hackathon 2026**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit-10B981?style=for-the-badge)](https://healthcare-hackathon.vercel.app)
[![Tech Stack](https://img.shields.io/badge/React_+_FastAPI_+_Gemini_AI-Stack-CC5833?style=for-the-badge)]()

</div>

---

## 🧠 Problem Statement

Millions of patients receive prescriptions and discharge summaries they **cannot understand**. Medical jargon creates confusion, missed medications, and unnecessary anxiety — especially for elderly patients and non-English speakers.

## 💡 Solution

**MedBuddy** is an AI-powered healthcare companion that takes complex medical documents and translates them into **clear, patient-friendly language**.

Upload a prescription or discharge summary → Get an instant, structured breakdown:
- ✅ **Plain-language summary** of your condition
- 💊 **Medication table** with dosage, frequency, and purpose
- ⚠️ **Drug interaction warnings** and side effects to watch
- 📋 **Follow-up checklist** of next steps

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 📄 **Document Upload** | Drag & drop prescriptions, discharge summaries, or lab reports (Image/PDF) |
| 🤖 **AI Analysis** | Powered by Google Gemini for clinically accurate, plain-language translation |
| 💊 **Medication Breakdown** | Structured table with medicine, dosage, timing, and purpose |
| ⚠️ **Safety Alerts** | Drug interaction warnings and side effect alerts |
| ✅ **Follow-up Protocol** | Clear checklist of next steps for the patient |
| 🔐 **Authentication** | Sign-in / Sign-up with demo & guest access |
| 🎨 **Premium UI** | GSAP animations, glassmorphism, responsive design |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Tailwind CSS v4, GSAP, Lucide Icons |
| **Backend** | FastAPI (Python), Uvicorn |
| **AI Engine** | Google Gemini 1.5 Flash |
| **Automation** | n8n Webhooks |
| **Deployment** | Vercel (Frontend) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- Google Gemini API Key

### Frontend
```bash
git clone https://github.com/manvv007/healthcare.hackathon.git
cd healthcare.hackathon
npm install
npm run dev
```

### Backend
```bash
cd medbuddy-backend
pip install -r requirements.txt
echo "GEMINI_API_KEY=your_key_here" > .env
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## 📸 Screenshots

### Landing Page
> Cinematic hero section with GSAP scroll animations

### Sign In
> Split-layout authentication with demo login option

### Upload & Analyze
> Drag-and-drop upload with real-time AI analysis results

### Swagger API Docs
> Auto-generated API documentation at `/docs`

---

## 🏗️ Architecture

```
┌───────────────┐     ┌──────────────┐     ┌──────────────┐
│   React App   │────▶│  n8n Webhook  │────▶│  Gemini AI   │
│  (Frontend)   │     │  / FastAPI    │     │   (LLM)      │
└───────────────┘     └──────────────┘     └──────────────┘
       │                     │                     │
   Upload File         Process &              Analyze &
   Select Type         Extract Text           Simplify
       │                     │                     │
       ◀─────────── Structured JSON ◀──────────────┘
       │
   Display Results:
   • Summary
   • Medications
   • Warnings
   • Follow-ups
```

---

## 👥 Team

Built with ❤️ for **IAR Udaan Hackathon 2026**

---

## 📜 License

This project is built for educational and hackathon purposes.
