<div align="center">
  <h1>✨ Nexora AI Content Studio</h1>
  <p><b>An enterprise-grade, AI-powered content marketing platform built for modern businesses.</b></p>

  <!-- Tech Stack Badges -->
  <img src="https://img.shields.io/badge/Python-3.13-blue?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Gemini_AI-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white" alt="Gemini AI">
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite">
</div>

<br>

## 📌 Project Overview
Nexora AI is a comprehensive SaaS platform designed to eliminate writer's block. By leveraging the power of **Google's Gemini 2.5 AI**, it provides marketers, freelancers, and business owners with an intuitive workspace to generate high-quality Blogs, Google Ads, SEO Keywords, and Social Media content in seconds.

## 📸 Platform Sneak Peek

### Landing Page & Pricing
*(Showcasing the premium Light-theme glassmorphism UI and conversion-focused design)*
![Homepage Screenshot](Assets/home-page.png)

### AI Dashboard Workspace
*(Showcasing the ChatGPT-style chat interface, sidebar tools, and export functionality)*
![Dashboard Screenshot](Assets/dashboard.png)

---

## 🔥 Core Features

*   **🧠 Advanced Prompt Engineering:** Implicit context injection for highly professional, industry-standard outputs.
*   **💬 Conversational AI Workspace:** A modern, scrolling chat interface that remembers the session state and context.
*   **🔐 Secure Authentication:** JWT-based user authentication with Bcrypt password hashing.
*   **🗄️ Persistent History:** SQLite database integration to automatically save and retrieve past AI generations.
*   **📄 Export Functionality:** One-click download of generated content into properly formatted `.txt` documents.
*   **📱 Responsive Design:** Fully optimized for Desktop, Tablet, and Mobile views.
*   **🌐 Language Adaptive:** Adapts to the user's input language (e.g., smoothly handles "Hinglish").

---

## 🛠️ Technical Architecture

### Frontend (Client-Side)
*   **Tech:** HTML5, CSS3, Vanilla JavaScript (ES6+).
*   **Design System:** Custom Light-Theme Glassmorphism, CSS Variables.
*   **Animations:** GSAP (GreenSock) for smooth scroll and micro-interactions.
*   **UX Features:** Toast notifications, skeleton loaders, asynchronous fetching, and dynamic DOM manipulation.

### Backend (Server-Side)
*   **Framework:** FastAPI (Python) for asynchronous, lightning-fast endpoints.
*   **AI Integration:** Official `google-genai` SDK.
*   **Database:** SQLite via SQLAlchemy ORM.
*   **Security:** CORS Middleware, Environment Variables (`.env`), JWT Tokens, and Bcrypt hashing.

---

## 💻 Local Installation & Setup

To run this project locally, follow these steps:

**1. Clone the repository:**
git clone https://github.com/YourUsername/nexora-ai-content-studio.git
cd nexora-ai-content-studio

**2. Setup Virtual Environment:**
python -m venv .venv
# On Windows
.venv\Scripts\activate
# On Mac/Linux
source .venv/bin/activate

**3. Install Dependencies:**
cd backend
pip install -r requirements.txt

**4. Environment Variables:**
Create a .env file inside the backend/ directory and add your credentials:
GEMINI_API_KEY=your_gemini_api_key_here
SECRET_KEY=your_secure_random_string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DATABASE_URL=sqlite:///./nexora.db

**5. Start the FastAPI Server:**
uvicorn main:app --reload
The API will be running at http://127.0.0.1:8000 (Visit /docs for Swagger UI).

**6. Launch the Frontend:**
Open frontend/index.html using a Live Server extension in VS Code.

---

## 🚀 Future Scope & Upgrades

This project is built with scalability in mind. Future upgrades include:

*   Migration to PostgreSQL (AWS RDS / Supabase) for cloud database management.
*   Integration of Stripe/Razorpay for subscription-based billing (SaaS model).
*   Implementation of a Credit/Rate-limiting system to manage API quotas.
*   Export to PDF functionality.

<div align="center">
  <p>Developed with passion by <b>Hardik Sharma</b></p>
</div>
