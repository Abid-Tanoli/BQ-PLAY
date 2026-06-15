# BQ-PLAY

BQ-PLAY is a full-stack live cricket scoring and tournament platform with a public user app, an admin scoring console, and a Node/Express API.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **User Frontend** | React 19, Vite 7, Tailwind CSS 4, Redux Toolkit, React Query 5, Socket.IO Client |
| **Admin Console** | React 18, Vite 8, Tailwind CSS 4, Redux Toolkit 2, Socket.IO Client |
| **Backend API** | Node.js, Express 5, Mongoose 9, Socket.IO 4, JWT, bcryptjs |
| **Database** | MongoDB (Mongoose ODM) |
| **Real-time** | Socket.IO (WebSocket transport) |
| **External APIs** | RapidAPI (Cricbuzz), CricAPI, YouTube Data API, RSS |
| **AI Commentary** | Anthropic Claude API |
| **Deployment** | Vercel (serverless-ready) |

## Project Structure

```
BQ-PLAY/
├── Frontend/
│   ├── User/            # Public cricket experience (25 pages)
│   ├── Admin/           # Admin scoring console (20 pages)
│   └── Shared/          # 6 reusable components + services
├── Backend/             # Express API (20+ route groups, 22 models)
├── api/index.js         # Vercel serverless entry
├── README.md            # This file
├── DEPLOYMENT.md        # Vercel deployment guide
└── vercel.json          # Vercel config
```

## Features

### User App
- Live match scores with real-time WebSocket updates
- Match detail page with Live, Scorecard, Commentary, Partnerships, Graphs, Info tabs
- Match summary with MVP impact list, key moments, top performers
- Series/tournament listings
- Team & player profiles
- Rankings (batting, bowling, all-rounder, fielding, wicket-keeper)
- Points table for tournaments/leagues
- International cricket data (via external providers)
- News, videos, highlights pages
- Player registration and profile creation
- Dark/light theme toggle

### Admin Console
- Dashboard with match overview
- Ball-by-ball live scoring with full controls
- Match setup wizard (format, playing XI, toss, openers)
- Wagon wheel, pitch map, shot diagram, cricket field map
- AI-powered commentary (via Anthropic Claude)
- DRS review system, super over, tie resolution
- Team, player, event, tournament, series management
- Bulk import for players/teams
- Blog management
- Synchronization panel for external data
- Dark/light mode, mobile-responsive layout

### Backend API
- Full match lifecycle (CRUD, scoring, innings, toss, playing XI)
- Ball-by-ball scoring engine with extras, wickets, partnerships
- Real-time Socket.IO events (ball recorded, score update, over complete, innings end, match end)
- Player & team management with rankings
- Tournament/event management with points table
- External cricket data polling (RapidAPI Cricbuzz)
- AI commentary generation
- Multi-category team system (International/League/Incubation)
- File uploads for team logos

## Local Development

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm

### Install Dependencies

```bash
npm --prefix Backend install
npm --prefix Frontend/User install
npm --prefix Frontend/Admin install
```

### Environment Variables

Create `Backend/.env`:

```env
PORT=5000
MONGO_URL=mongodb://localhost:27017/bqplay
JWT_SECRET=your-secret-key
RAPIDAPI_KEY=
RAPIDAPI_CRICKET_HOST=free-cricbuzz-cricket-api.p.rapidapi.com
ENABLE_FREE_CRICBUZZ=false
ENABLE_EXTERNAL_SYNC=false
ANTHROPIC_API_KEY=
```

Create `Frontend/Admin/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Create `Frontend/User/.env`:

```env
VITE_API_URL=/api
```

### Run Development Servers

**Backend** (port 5000):
```bash
npm --prefix Backend run dev
```

**User Frontend** (port 5173):
```bash
npm --prefix Frontend/User run dev
```

**Admin Frontend** (port 5174):
```bash
npm --prefix Frontend/Admin run dev
```

### User App Routes

| Path | Page |
|------|------|
| `/` | Home (live scores, upcoming, results) |
| `/live` | Live matches |
| `/match/:matchId` | Match detail with tabs |
| `/series` | Series/tournament listings |
| `/series/:seriesId` | Series detail |
| `/players` | Player directory |
| `/teams` | Teams by category |
| `/rankings` | Player/team rankings |
| `/points-table` | Tournament points table |
| `/news`, `/videos`, `/highlights` | Media pages |
| `/international` | International cricket |

### Admin Routes

| Path | Page |
|------|------|
| `/admin` | Dashboard |
| `/admin/score` | Match selection for scoring |
| `/admin/score/:matchId` | Live scoring interface |
| `/admin/teams` | Team management |
| `/admin/players` | Player management |
| `/admin/events` | Event/tournament management |
| `/admin/blogs` | Blog management |
| `/admin/bulk-import` | Bulk import data |
| `/admin/rankings` | Rankings management |
| `/admin/international` | International cricket management |
| `/admin/sync` | External data sync panel |

## Production Build

```bash
npm run build
```

The root build script installs Backend, User, and Admin dependencies, then builds all frontend dist folders.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Vercel deployment guide.

## Socket.IO Architecture

- Backend initializes Socket.IO on the HTTP server
- Three frontend socket clients: User, Admin, Shared
- Room-based events: `match-{matchId}` for match-specific updates
- Ball scoring events: `ball:recorded`, `score:update`, `strike:changed`, `over:completed`, `innings:end`, `match:end`
- Legacy events maintained for backward compatibility

## Development Notes

- External cricket APIs are completely optional; the app works fully with local data
- AI commentary requires an Anthropic API key
- Legacy socket events are being phased out in favor of the new event naming convention
- The Shared folder contains cross-app components; prefer importing from Shared when possible

## License

Private project
