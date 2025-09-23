# 📝 Memoir – The Offline Journal

> A privacy-first, secure, and offline-capable visual journaling app, powered by AI search and serverless automation.

---

## 🌟 Vision

Modern users rely on digital tools to document their lives, but most journaling apps:

- Require an internet connection to work
- Store your data in the cloud, risking your privacy
- Offer poor search functionality, often limited to keywords

**Memoir aims to change all of that.**

### Here's what we're building:

- ✅ **Offline Writing** – Journal without an internet connection  
- ✅ **Local-First Storage** – Your data lives on your device  
- ✅ **AI-Assisted Search** – Find memories via natural language  
- ✅ **Secure Backups** – Sync on your terms  
- ✅ **Mood Tracking & Summaries** – Monthly life digests, automatically

---

## 🌟 Technical Stacks:
<img width="767" height="531" alt="image" src="https://github.com/user-attachments/assets/79d9d023-e6a7-488e-8522-07608e76f986" />


---

## 📘 What Is Memoir?

Memoir is an **offline-first journaling application** built with modern tools like **Next.js PWA**, **Spring Boot microservices**, and AI-assisted search.

Key features:

- 💾 Private by default – All data stored locally
- ✍️ Seamless offline editing – Write anytime, anywhere
- 🔍 Smart search – Find entries with natural language
- ☁️ Optional backups – Sync to cloud only if you choose
- 📊 Auto summaries – Weekly and monthly reports

---

## 🎯 Core Principles

| Principle         | Description                                                                 |
|------------------|-----------------------------------------------------------------------------|
| 🔐 Privacy-first  | Data is not uploaded unless explicitly requested; stored locally in IndexedDB or filesystem |
| 📴 Offline-first  | Works entirely offline, including viewing, editing, and search              |
| 🧠 AI-powered     | Supports natural language search, emotion tracking, and automatic summaries |
| 💾 Backup-friendly| Local and optional cloud backups (e.g., AWS S3)                             |
| 🔗 Share freely   | Export and share diary entries as images or links without requiring accounts |

---

## 🧱 Architecture Overview

### ⚛️ Frontend (Next.js)

- PWA (Installable Web App)
- Offline caching via IndexedDB
- JWT-based auth system
- Rich-text editor with image support
- Data visualization via ECharts / D3

### ☕ Backend Microservices (Java Spring Boot)

- **User Service**
  - Register/Login with JWT
  - Role-based access control

- **Content Service**
  - Create/edit/delete/search diary entries
  - Image upload (memory or S3)
  - Offline sync mechanism

- **AI Service**
  - Elasticsearch / vector DB for natural language search
  - AI-driven tagging and summarization

- **Backup Service**
  - Cloud sync to AWS S3
  - Export/import functionality

### ☁️ Serverless Functions (AWS Lambda)

- Weekly/monthly digests
- Scheduled content analysis
- Tag clustering and statistics

---

## 🚀 Getting Started

### 📦 Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
