# AI Native Game Platform Architecture

## Overview

AI Native Game Platform is a web platform that allows users to generate and play AI-generated HTML5 games.

The platform provides a complete workflow:

User Login → Create Game → AI Generation → Publish → Play

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

### AI Layer

* GPT-5.5 API

### Storage

* Local File Storage

---

## System Architecture

Frontend (Next.js)

↓

Backend API (FastAPI)

↓

GPT-5.5 Service

↓

HTML Game Generation

↓

Storage + Database

---

## Create Game Workflow

1. User enters game idea
2. Frontend sends request to FastAPI
3. Backend calls GPT-5.5
4. GPT generates HTML5 game
5. Backend saves HTML file
6. Backend saves metadata to database
7. Game appears on Home page

---

## Play Game Workflow

1. User opens Home page
2. User selects a game
3. Frontend loads game information
4. Browser opens generated HTML
5. User plays the game

---

## Multi-Agent Workflow

Planner Agent

↓

Generator Agent

↓

Reviewer Agent

↓

Save Game

---

## Database Design

### User

* id
* email
* password_hash
* created_at

### Game

* id
* title
* description
* file_url
* creator_id
* created_at

---

## Future Improvements

* Multi-Agent workflow
* Async task queue
* Cloud object storage
* Sandbox execution
* Game moderation
* User profile system
