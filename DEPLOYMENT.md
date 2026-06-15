# Deployment Guide

## Vercel

1. Push the latest commit to GitHub.
2. Open Vercel and import the repository.
3. Keep the root directory as the repository root.
4. Use these settings:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: Frontend/User/dist
Install Command: npm install
```

5. Add these environment variables in Vercel dashboard:

### Required
```env
MONGO_URL=mongodb+srv://...
JWT_SECRET=your-secret-key
```

### Optional (features disabled without these)
```env
RAPIDAPI_KEY=
RAPIDAPI_CRICKET_HOST=free-cricbuzz-cricket-api.p.rapidapi.com
ANTHROPIC_API_KEY=
ENABLE_FREE_CRICBUZZ=false
ENABLE_EXTERNAL_SYNC=false
```

6. Deploy.

## Important Production Notes

- Do not commit `.env` files.
- MongoDB Atlas must allow Vercel outbound connections. For first deployment, allow access from `0.0.0.0/0`, then tighten it if your hosting plan supports static outbound IPs.
- Socket.IO live rooms need a persistent Node server for best production behavior. Vercel serverless is fine for HTTP API routes, but not ideal for long-lived socket connections.
- If the live cricket provider does not expose a series-specific completed-matches endpoint, BQ-PLAY can only show the series metadata and whatever fixtures/results the provider returns.
