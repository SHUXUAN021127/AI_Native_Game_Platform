# AI Native Game Platform - System Design

## 1. Project Overview

AI Native Game Platform is an AI-powered game generation platform that enables users to create HTML5 games using natural language descriptions.

Users can:

* Register and login
* Generate games through AI Agents
* Browse published games
* Play generated games
* Like and favorite games
* View creation history
* Manage their own games

---

## 2. System Architecture

Frontend Layer

* Next.js
* React
* TypeScript

Backend Layer

* FastAPI
* SQLAlchemy
* JWT Authentication

Database Layer

* SQLite

AI Layer

* Planner Agent
* Generator Agent
* Reviewer Agent
* Storage Agent

Storage Layer

* Generated HTML Files
* Generated Cover Images
* Generated Game Tags

---

## 3. Agent Workflow

User Prompt

↓

Planner Agent

Analyze user requirements and generate game specifications

↓

Generator Agent

Generate HTML5 game code

↓

Reviewer Agent

Validate generated HTML content

↓

Storage Agent

Save generated game files

↓

Game Published

---

## 4. User Roles

### Player

* Browse games
* Play games
* Like games
* Favorite games

### Creator

* All Player permissions
* Create games
* Delete games
* Retry failed generations

### Admin

* Platform management
* User management
* Content moderation
* Statistics dashboard

---

## 5. Security Design

Authentication:

* JWT Token Authentication

Authorization:

* Role-Based Access Control (RBAC)

Data Validation:

* Pydantic Schema Validation

Password Storage:

* bcrypt Hashing

---

## 6. Future Improvements

* Google OAuth Login
* GitHub OAuth Login
* MinIO Object Storage
* Trending Recommendation System
* Remix Game Generation
* Content Moderation Agent
