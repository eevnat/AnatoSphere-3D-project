# AnatoSphere 3D – Interactive Human Anatomy Learning Platform

> An interactive educational platform that allows learners to visually explore, isolate and understand human anatomical structures through manipulatable 3D models and simplified explanations.

Built for students **without a medical background**.

## Features (implemented)
- **3D Human Body Viewer** – rotate, zoom, pan, front/side/back views, auto-rotate (Three.js)
- **62 named structures across 9 body systems** – skeletal, muscular, circulatory, respiratory, digestive, nervous, urinary, endocrine/immune, skin
- **Extract** – pull any organ/bone out of the body and inspect it alone
- **Exploded view** – separate the heart into chambers & vessels, the brain into lobes, lungs into lobes/bronchi
- **Layer control** – skin → muscles → bones → organs → vessels & nerves, with show/hide + opacity sliders
- **X-Ray mode, Hide, Show All, clickable 3D labels, hover tooltips**
- **Information panel** – *What is it? Where is it? What does it do? Important parts, Interesting facts, Related structures*
- **Beginner / Advanced mode** – simple language vs. anatomical terminology
- **Search** with aliases (e.g. "thigh bone" → femur, "funny bone" → ulnar nerve), keyboard navigation
- **Anatomy Journeys** – animated particle + narration: **Food**, **Blood**, **Breathing**, **Nerve Signal**
- **Quiz mode** – identify highlighted structure on the model, match function, solve clues
- **Pronunciation audio** (Web Speech API)
- **AI Anatomy Assistant "Ana"** – context-aware (knows the selected organ), level-aware, with offline knowledge-base fallback
- **Progress tracking & achievements** (stored in browser localStorage)
- Living body: beating heart and breathing lungs

## Tech Stack
- **Backend**: Hono on Cloudflare Pages/Workers (TypeScript)
- **Frontend**: Three.js (ES modules via CDN), Tailwind CSS, Font Awesome
- **3D model**: procedurally generated in `public/static/model.js` – each structure is a separately named group so it can be highlighted, extracted and exploded. Can be replaced with Blender-prepared GLB/GLTF models by mapping node names to structure ids.
- **AI**: OpenAI-compatible chat completions API (server-side; key never exposed to browser)

## API Endpoints
| Method | Path | Description |
|---|---|---|
| GET | `/api/anatomy` | All systems, structures and journeys |
| GET | `/api/systems` | Body systems |
| GET | `/api/structures?system=` | Structures (optionally filtered) |
| GET | `/api/structures/:id` | One structure |
| GET | `/api/journeys` | Anatomy journeys |
| GET | `/api/search?q=` | Search by name / alias |
| GET | `/api/quiz?system=&n=` | Generated quiz questions |
| POST | `/api/ask` | AI assistant `{ question, context, level, history }` |

Deep link: `/#heart` opens with a structure selected.

## Project Structure
```
src/index.tsx          Hono app + API routes + AI endpoint
src/page.ts            HTML shell (layout)
src/data/anatomy.ts    Anatomy knowledge base (systems, structures, journeys)
public/static/model.js Procedural 3D body model
public/static/app.js   Viewer, interactions, journeys, quiz, progress, AI chat
public/static/style.css UI styles
```

## Run locally
```bash
npm install
npm run build
# optional AI: create .dev.vars with OPENAI_API_KEY=..., OPENAI_BASE_URL=..., OPENAI_MODEL=gpt-5-mini
npx wrangler pages dev dist --ip 0.0.0.0 --port 3000
```

Keyboard: `/` search · `E` extract · `X` explode · `H` hide · `L` labels · `Esc` deselect

## Deployment
Cloudflare Pages: `npm run build && npx wrangler pages deploy dist`. Set the AI key as a secret: `npx wrangler pages secret put OPENAI_API_KEY`.

## Not yet implemented / next steps
- Replace procedural model with detailed Blender GLB models
- Server-side user accounts & progress (Cloudflare D1)
- More structures (reproductive system, hands/feet bones, more muscles)
- CT/MRI → AI segmentation → 3D reconstruction (advanced version)

> Educational simplified model – not to scale and not for medical diagnosis.

## Project Links

**Live Deployment:**  
https://3000-iiotvf40nteu9gfz6lddw-0e616f0a.sandbox.gensparksite.com/

**Hackathon PPT:**  
https://www.genspark.ai/slides?project_id=0d29d013-9a86-4e18-bdcf-53de676d356a

## Colaborated with

- **Samruddhi2103**
- **Mruj12**
