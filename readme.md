# WriteFlow AI

A full-stack AI-powered SaaS content platform built with Next.js 14.

## 🌐 Live Demo

**[https://write-flow-ai-ten.vercel.app/](https://write-flow-ai-ten.vercel.app/)**

## 🔑 Demo Credentials

| Role  | Email                   | Password       |
|-------|-------------------------|----------------|
| User  | user@writeflow.com      | WriteFlow@2024 |
| Admin | admin@writeflow.com     | WriteFlow@2024 |

## ✨ Features

- AI Content Generation (Blog, Social, Email, Ad Copy)
- Tone Rewriting Agent
- AI Chat Assistant
- User Dashboard
- Admin Dashboard with Analytics
- Dark/Light Mode
- Fully Responsive

## 🛠️ Tech Stack

- Next.js 14 (App Router, TypeScript)
- Tailwind CSS + Shadcn/UI
- Clerk Authentication
- Supabase (PostgreSQL)
- Groq AI API (Llama 3.1)
- Recharts
- Vercel Deployment

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repo

```bash
git clone https://github.com/suronjit02/writeflow-ai.git
cd writeflow-ai
```

2. Install dependencies

```bash
npm install
```

3. Setup environment variables

```bash
cp .env.example .env.local
```

4. Fill in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
GROQ_API_KEY=your_groq_api_key
```

5. Run development server

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
app/         - Next.js App Router pages
components/  - Reusable UI components
lib/         - Utility functions and API clients
supabase/    - Database schema
```

## 🗄️ Database Setup

Run the SQL schema in Supabase SQL Editor:

```bash
supabase/schema.sql
```

## 👤 Author

Suronjit Sutradhar

## 📄 License

MIT
