# Near By Mart

> A local product discovery platform that connects buyers with nearby shops. Search for products, discover local sellers, confirm availability, and navigate to the shop — all in one app.

---

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Angular    │────▶│  Express API │────▶│   MongoDB    │
│  Frontend    │◀────│  (Node.js)   │◀────│              │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                     ┌──────┴───────┐
                     │  RAG / AI    │
                     │  Layer       │
                     └──────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 18, TypeScript, Angular Material |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt |
| AI | RAG with vector search |
| Maps | Google Maps Platform |
| Images | Cloudinary |

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB (local or Atlas)
- Angular CLI (`npm install -g @angular/cli`)

### 1. Clone & Install

```bash
# Backend
cd backend
cp .env.example .env   # Then edit .env with your values
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Run

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
ng serve
```

- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:4200
- **Health Check**: http://localhost:5000/api/health

## Project Structure

```
Near_By_Mart/
├── backend/
│   ├── src/
│   │   ├── config/         # Database, Cloudinary, AI config
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/      # Auth, error handling, validation
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helpers, response classes
│   │   ├── validators/      # Input validation schemas
│   │   ├── app.ts           # Express setup
│   │   └── server.ts        # Entry point
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/        # Guards, interceptors, services
│   │   │   ├── shared/      # Reusable components, pipes
│   │   │   ├── auth/        # Login, register
│   │   │   ├── buyer/       # Home, search, shop details
│   │   │   ├── seller/      # Dashboard, product mgmt
│   │   │   └── chatbot/     # AI assistant
│   │   ├── environments/
│   │   └── styles.css
│   ├── angular.json
│   └── package.json
│
├── .gitignore
├── .env.example
└── README.md
```

## Development Phases

- [x] Phase 1 — Project Setup
- [ ] Phase 2 — MongoDB Models
- [ ] Phase 3 — Authentication
- [ ] Phase 4 — Seller (Shop Creation)
- [ ] Phase 5 — Product Management
- [ ] Phase 6 — Buyer Interface
- [ ] Phase 7 — Search & Ranking
- [ ] Phase 8 — Location Services
- [ ] Phase 9 — Google Maps Integration
- [ ] Phase 10 — RAG AI Chatbot
- [ ] Phase 11 — Analytics
- [ ] Phase 12 — Security Audit
- [ ] Phase 13 — Testing
- [ ] Phase 14 — Production Prep

## License

Private — All rights reserved.
