# AI Native Game Platform

An AI-powered platform that allows users to generate and play HTML5 games using GPT-5.5.

## Features

* User Registration
* User Login
* JWT Authentication
* AI Game Generation
* HTML5 Game Publishing
* Game List Management
* Play Generated Games
* Next.js Frontend
* FastAPI Backend

---

## Project Structure

```text
ai_native_platform

├── backend
├── frontend
├── storage
├── docs
└── README.md
```

---

## Tech Stack

### Frontend

* Next.js 15
* TypeScript
* React

### Backend

* FastAPI
* SQLAlchemy
* SQLite

### AI

* GPT-5.5 API

---

## Setup

### Backend

```bash
cd backend

pip install -r requirements.txt

uvicorn main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

---

### Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

---

## Environment Variables

Create:

```text
backend/.env
```

Example:

```env
OPENAI_API_KEY=your_api_key
```

---

## Workflow

Login

↓

Create Game

↓

GPT-5.5 Generation

↓

HTML Save

↓

Publish

↓

Play

---

## Future Improvements

* Multi-Agent Workflow
* Async Generation Queue
* Cloud Storage
* Content Moderation
* Game Analytics
