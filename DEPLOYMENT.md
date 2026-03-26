# Deployment Guide for MedBuddy

MedBuddy is a full-stack application. The recommended approach is to deploy the **Frontend** to Vercel and the **Backend** to Render or Railway.

## 1. Backend Deployment (Render)

1. Create an account on [Render.com](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Fill in the following settings:
   - **Name**: `medbuddy-backend` (or similar)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `PORT`: `5000` (optional, Render usually handles this)
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
   - `AI_MODEL`: `gemini`
6. Click **Create Web Service**. Once deployed, copy the provided `onrender.com` URL.

## 2. Frontend Deployment (Vercel)

1. Go to [Vercel.com](https://vercel.com/) and create a new project.
2. Import your GitHub repository.
3. In the "Configure Project" step:
   - **Framework Preset**: Vercel should auto-detect Vite.
   - **Root Directory**: Leave empty (the default).
   - **Environment Variables**: Add exactly one variable:
     - **Name**: `VITE_BACKEND_URL`
     - **Value**: The URL you got from Render in step 1 (e.g., `https://medbuddy-backend.onrender.com/api`).
4. Click **Deploy**.

## 3. Testing the Live Site

1. Open your Vercel deployment URL.
2. Ensure you can log in (using local mock users like `patient@example.com`).
3. Upload a document and verify the AI analyzes it correctly.

*Note: Since the backend uses an in-memory mock database for users, new sign-ups will disappear if the backend server restarts. For a fully persistent app, you would need to connect a real database (like MongoDB or PostgreSQL).*
