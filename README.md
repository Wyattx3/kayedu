# Kay AI - Intelligent Study Companion

AI-powered learning assistant for GED, IGCSE, OTHM, and all students. Features essay writing, AI detection, content humanization, tutoring, and more.

## Features

- **Essay Writer** - Generate well-structured academic essays with citations
- **AI Detector** - Check if text appears AI-generated
- **Content Humanizer** - Transform AI text into natural writing
- **Answer Finder** - Get detailed answers to questions
- **Homework Helper** - Guidance for assignments
- **Study Guide Generator** - Create comprehensive study materials
- **Presentation Maker** - Generate slide outlines
- **AI Tutor** - Personalized tutoring sessions

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: Tailwind CSS + shadcn/ui
- **Authentication**: NextAuth.js v5
- **Database**: PostgreSQL (Supabase) + Prisma ORM
- **AI Providers**: OpenAI, Anthropic Claude, Google Gemini, Grok

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Supabase account)
- API keys for AI providers

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Copy the environment example file:

```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/kay_ai"

# NextAuth
AUTH_SECRET="generate-a-random-secret"
NEXTAUTH_URL="http://localhost:3000"

# AI API Keys
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_AI_API_KEY="..."
XAI_API_KEY="..."
```

4. Generate Prisma client and push schema:

```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set these in your Vercel dashboard:

- `DATABASE_URL` - Your PostgreSQL connection string
- `AUTH_SECRET` - A random secret for session encryption
- `OPENAI_API_KEY` - OpenAI API key
- `ANTHROPIC_API_KEY` - Claude API key
- `GOOGLE_AI_API_KEY` - Gemini API key
- `XAI_API_KEY` - Grok API key

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login & Register pages
│   ├── (dashboard)/     # Protected dashboard pages
│   ├── api/             # API routes
│   └── page.tsx         # Landing page
├── components/
│   ├── ui/              # shadcn/ui components
│   └── layout/          # Layout components
├── lib/
│   ├── ai-providers/    # AI provider integrations
│   ├── auth.ts          # NextAuth configuration
│   └── prisma.ts        # Prisma client
└── hooks/               # React hooks
```

## License

MIT

