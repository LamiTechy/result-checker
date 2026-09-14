# CA Result Checker System

A full-stack Continuous Assessment (CA) Result Checker for Moshood Abiola Polytechnic with Admin and Student portals.

## Tech Stack

- **Frontend:** React + Vite, Tailwind CSS, Framer Motion
- **Backend:** Express.js (Node), Drizzle ORM
- **Database:** Neon (serverless Postgres)
- **Auth:** JWT-based (bcrypt + jsonwebtoken)
- **Hosting:** Vercel-ready

## Setup

### Prerequisites

- Node.js 18+
- A Neon Postgres database ([neon.tech](https://neon.tech))

### Environment Variables

**backend/.env**
```
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your-super-secret-key-change-this
PORT=3001
```

### Installation

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install
cd ..

# Generate DB schema & migrate
cd backend
npx drizzle-kit generate
npx drizzle-kit migrate

# Seed test data
npm run db:seed
```

### Run Development

```bash
npm run dev
```

This starts the backend (port 3001) and frontend (port 5173) concurrently.

## Default Login

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@ife.edu.ng | admin123 |
| Lecturer | lecturer@ife.edu.ng | admin123 |

## Test Students

| Matric No | Surname |
|-----------|---------|
| IFE2020/001 | Adeyemi |
| IFE2020/002 | Chioma |
| IFE2020/003 | Emeka |
| IFE2020/004 | Funmi |
| IFE2020/005 | Garba |

## Deployment (Vercel)

1. Push to a GitHub repository
2. Import project in Vercel
3. Set environment variables: `DATABASE_URL`, `JWT_SECRET`
4. Deploy
