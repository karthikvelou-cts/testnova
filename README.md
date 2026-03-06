# TestNova - Full Stack Vercel Deployment

This repo is configured to deploy as:

- Vue frontend from `client/` (built to root `dist` for Vercel)
- Node/Express API as a Vercel Function from `api/index.js`

## Required Environment Variables (Vercel Project Settings)

Set these in Vercel:

- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN` (example: `7d`)
- `OLLAMA_API_URL`
- `OLLAMA_MODEL`
- `OLLAMA_API_KEY` (optional)
- `CLIENT_URL` (set to your deployed frontend URL)

## Local Development

1. Install dependencies:
   - `npm install`
2. Backend env file:
   - copy `server/.env.example` to `server/.env`
3. Run apps:
   - backend: `npm run dev:server`
   - frontend: `npm run dev:client`

Frontend uses `/api` and Vite proxy forwards to `http://localhost:5000` in local dev.
