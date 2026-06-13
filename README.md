<div align="center">

<img src="https://img.shields.io/badge/DevLaunch-AI%20Scaffold%20Generator-7c3aed?style=for-the-badge&logo=lightning&logoColor=white" />

<br/>
<br/>

# ⚡ DevLaunch

### Stop wasting hours on project setup. Start building instantly.

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-devlaunch--one.vercel.app-7c3aed?style=for-the-badge)](https://devlaunch-one.vercel.app)
[![Backend](https://img.shields.io/badge/⚙️%20Backend-Render-22c55e?style=for-the-badge)](https://devlaunch-backend-o7j6.onrender.com)
[![Made with FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Made with Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![Powered by Claude](https://img.shields.io/badge/Powered%20by-Claude%20AI-d97706?style=for-the-badge)](https://anthropic.com)

<br/>

> **Built for Devlynix Buildathon 2.0 — The 72-Hour MVP Sprint**
> Track 10: Open Innovation | Solo Project

<br/>

![DevLaunch Demo](https://devlaunch-one.vercel.app/og.png)

</div>

---

## 🎯 The Problem

Every developer knows this pain:

> *"I know what I want to build. But I just spent 3 hours setting up the project before writing a single line of actual code."*

Config files. Folder structures. `.env` setups. CORS configuration. Database connections. Package versions. `.gitignore` templates.

**Setup hell is real. DevLaunch kills it.**

---

## ✨ What DevLaunch Does

Type your tech stack. Get a **complete, production-ready project scaffold** in under 20 seconds.

Not a template. Not a cookie-cutter boilerplate.

A **Claude AI-generated scaffold** that understands your exact stack combination and generates the right files, the right configs, and the right folder structure — every time.

---

## 🚀 Features

| Feature | Description |
|--------|-------------|
| ⚡ **Instant Generation** | Full scaffold generated in 15-20 seconds |
| 📁 **Interactive File Tree** | Browse every generated file with syntax highlighting |
| 🤖 **AI File Explanation** | Click any file — Claude explains what it does and why |
| ⬇️ **Download as ZIP** | Get actual files on your machine, ready to use |
| 🚀 **One-Click GitHub Push** | Auto-create a GitHub repo with all files pushed |
| ✅ **Input Validation** | Smart tech stack detection — no garbage input |
| 🔄 **Keep-Alive Backend** | Auto-ping prevents Render cold starts |

---

## 🔄 How It Works

## 🔄 How It Works

```mermaid
flowchart TD
    A[👤 User visits DevLaunch] --> B[⌨️ Types tech stack\ne.g. Next.js + FastAPI + PostgreSQL]
    B --> C{✅ Input Validation\nIs it a real tech stack?}
    C -->|❌ Invalid| D[⚠️ Show error message]
    C -->|✅ Valid| E[📡 POST /generate\nFastAPI Backend on Render]
    E --> F[🤖 Claude AI\nclaude-opus-4-6\n4096 max tokens]
    F --> G[📝 Parse Response\nExtract individual files\nBuild file tree]
    G --> H[🖥️ Next.js Frontend\nDisplay results]
    H --> I[📁 Interactive File Tree]
    H --> J[✨ AI File Explanation]
    H --> K[⬇️ Download ZIP]
    H --> L[🚀 Push to GitHub]
    L --> M[✅ Real GitHub Repo Created\nAll files pushed automatically]

    style A fill:#7c3aed,color:#fff
    style F fill:#d97706,color:#fff
    style M fill:#22c55e,color:#fff
    style D fill:#ef4444,color:#fff
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** — App Router, TypeScript
- **Tailwind CSS** — Styling
- **Framer Motion** — Animations
- **Vercel** — Deployment

### Backend
- **FastAPI** — Python web framework
- **Anthropic SDK** — Claude API integration
- **httpx** — Async HTTP client (GitHub API)
- **Render** — Deployment

### AI / Intelligence
- **Claude Opus (claude-opus-4-6)** — Scaffold generation
- **Structured prompt engineering** — Consistent file extraction
- **RAG-style file parsing** — Regex-based markdown extraction

---

## 📁 Project Structure

```mermaid
graph TD
    A[📦 devlaunch] --> B[🖥️ frontend/]
    A --> C[⚙️ backend/]
    A --> D[📄 README.md]

    B --> B1[📁 app/]
    B --> B2[📄 package.json]
    B --> B3[📄 next.config.ts]
    B --> B4[📄 globals.css]

    B1 --> B1A[📄 page.tsx\nMain UI]
    B1 --> B1B[📄 layout.tsx\nRoot layout]

    C --> C1[📄 main.py\nAll 4 API endpoints]
    C --> C2[📄 requirements.txt\nDependencies]
    C --> C3[📄 .env\nAPI Keys]

    style A fill:#7c3aed,color:#fff
    style B fill:#4f46e5,color:#fff
    style C fill:#059669,color:#fff
    style B1 fill:#1e1b4b,color:#fff
    style C1 fill:#064e3b,color:#fff
```
## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- Anthropic API key

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Create .env file
echo "ANTHROPIC_API_KEY=your_key_here" > .env

uvicorn main:app --reload
# Runs on http://localhost:8000
```

---

## 🌐 Live Deployment

| Service | URL | Status |
|---------|-----|--------|
| Frontend | [devlaunch-one.vercel.app](https://devlaunch-one.vercel.app) | ✅ Live |
| Backend | [devlaunch-backend-o7j6.onrender.com](https://devlaunch-backend-o7j6.onrender.com) | ✅ Live |

---

## 🔐 GitHub Integration

DevLaunch can push your generated scaffold directly to a new GitHub repository.

**How it works:**
1. Generate your scaffold
2. Click "Push to GitHub"
3. Enter repo name + Personal Access Token
4. DevLaunch creates the repo and pushes all files automatically

> **Security:** Your token is never stored. It's used only for the single API call and discarded immediately.

> **Production roadmap:** GitHub OAuth for one-click connection (replacing manual token entry)

---

## 🎯 Supported Stacks

DevLaunch understands and generates scaffolds for:

**Frontend:** React, Next.js, Vue.js, Angular, Svelte  
**Backend:** FastAPI, Django, Flask, Node.js, Express  
**Databases:** PostgreSQL, MySQL, MongoDB, Redis, Supabase  
**DevOps:** Docker, Docker Compose  
**ORMs:** Prisma, SQLAlchemy, Mongoose  
**Auth:** JWT, OAuth patterns  
**And any combination of the above**

---

## 👨‍💻 Built By

**Prathamesh Patil** — 1st Year B.Tech CSE, NMIET Pune

[![GitHub](https://img.shields.io/badge/GitHub-prathamesh--lang-181717?style=for-the-badge&logo=github)](https://github.com/prathamesh-lang)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-prathamesh--patil-0077B5?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/prathamesh-patil-794441385)

---

## 🏆 Devlynix Buildathon 2.0

Built in **72 hours** as part of **Devlynix Buildathon 2.0 — The 72-Hour MVP Sprint**

> *"Escape Tutorial Hell. Build Real Solutions."*

**Track:** Open Innovation (Track 10)  
**Theme:** Identifying a real developer bottleneck and building a scalable MVP  
**Problem solved:** Project setup hell — the biggest time waster before actual development begins

---

<div align="center">

**⚡ Stop watching tutorials. Start building.**

[Try DevLaunch →](https://devlaunch-one.vercel.app)

</div>