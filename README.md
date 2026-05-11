# FYEC100 AI Support Assistant

A local Phase 1 MVP prototype for the COSTAATT FYEC100 AI Academic Support Assistant. The app demonstrates a simple AI-powered support assistant for first-year students taking FYEC100.

## Project Goal

Create a working prototype that helps students ask FYEC100 questions, understand course expectations, get study tips, navigate the LMS, and receive academic integrity guidance.

## Phase Status

### Phase 1: Rapid MVP prototype

Built in this repository. Includes a local Next.js app, TypeScript, Tailwind CSS, OpenAI API route, Markdown knowledge base, chat interface, guardrails, and documentation.

### Phase 2: Enterprise integrated deployment

Future phase. May include institutional hosting, authentication, Moodle integration, Banner-aware support pathways, governance, monitoring, privacy review, and production operations.

### Phase 3: Advanced AI learning ecosystem

Future phase. May include personalized learning support, proactive nudges, multilingual guidance, richer analytics, and broader student success integrations.

## Project Team

- Kevin Ramsoobhag, VP Information Technology and Digital Transformation, Project Sponsor
- Darren Headley, Director | Technology Services, Project Lead and Technical Lead
- Deborah Romero, Developer
- Jessica David, LMS Administrator
- Kevin Reece, System Administrator and Infrastructure Support

## Phase 1 Features

- Home page
- Chat assistant page
- About page
- Roadmap page
- Local Markdown knowledge base at `data/fyec100-knowledge-base.md`
- OpenAI-powered chat route at `app/api/chat/route.ts`
- Guardrails against writing full assignments
- Guardrails against claiming to grade work
- Academic integrity guidance
- Fallback response when information is not in the knowledge base
- Admin-friendly folders for app, components, library code, data, docs, and public assets

## Not Included in Phase 1

- Database
- Authentication
- Moodle integration
- Banner integration
- Production hosting
- Official grading
- Student record access

## Folder Structure

```text
app/
components/
lib/
data/
docs/
public/
```

## Mac Setup

1. Install Node.js 18 or later.
2. Install dependencies:

```bash
npm install
```

3. Create a local environment file:

```bash
cp .env.example .env.local
```

4. Add your OpenAI API key to `.env.local`:

```bash
OPENAI_API_KEY=your_api_key_here
```

5. Start the local development server:

```bash
npm run dev
```

6. Open the app:

```text
http://localhost:3000
```

## OpenAI Integration

The chat assistant uses `OPENAI_API_KEY` through a Next.js API route. The route reads `data/fyec100-knowledge-base.md` and passes it to the model as context. If the key is not configured, the chat page still loads and returns a setup reminder.

## Knowledge Base Updates

Edit this file to update Phase 1 course content:

```text
data/fyec100-knowledge-base.md
```

After changes, restart the dev server if needed.

## GitHub Upload Instructions

```bash
git init
git add .
git commit -m "Initial FYEC100 AI support assistant MVP"
git branch -M main
git remote add origin <GITHUB_REPO_URL>
git push -u origin main
```

For this project repository:

```bash
git remote add origin https://github.com/ZeroZenx/FYEC100-AI-Support-Assistant.git
git branch -M main
git push -u origin main
```

## Responsible Use

This assistant supports learning but does not replace lecturers, LMS administrators, official course outlines, or institutional policies. Students should not submit AI-generated content as their own work.
