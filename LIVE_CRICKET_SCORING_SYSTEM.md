# BQ-PLAY Live Cricket Scoring System

A professional full-stack live cricket scoring system similar to ESPN Cricinfo with AI-powered commentary generation and interactive field visualization.

## 🏏 Features

### Core Architecture
- **Frontend**: React (Vite + Tailwind CSS)
- **Backend**: Node.js (Express 5)
- **Database**: MongoDB (Mongoose)
- **Real-time**: Socket.IO for live updates
- **API Integration**: CricAPI / RapidAPI Cricket support

### User-Facing Features
- **Cricinfo-Style Scoreboard**: Professional live score display with run rates, partnerships, and recent balls
- **Ball-by-Ball Commentary**: Color-coded commentary feed with live updates
- **Detailed Scorecard**: 
  - Batting table (R, B, 4s, 6s, SR)
  - Bowling table (O, M, R, W, ECON)
  - Fall of wickets
  - Yet to bat list
  - Extras breakdown
- **Match Tabs**: Live | Scorecard | Commentary | Info
- **Dark/Light Mode**: Automatic theme detection with manual toggle
- **Smooth Animations**: Score updates, ball indicators, and transitions

### Admin (Scorer) Features
- **Interactive Field Map**: Clickable cricket field visualization
- **AI Commentary Generation**: Automatic commentary based on field position
- **Score Controls**: 
  - Run buttons (0, 1, 2, 3, 4, 6)
  - Extras (Wide, No Ball, Bye, Leg Bye)
  - Wicket modes with dismissal types
- **Real-time Sync**: All user views update instantly
- **Player Auto-Selection**: Automatic batsman/bowler tracking
- **Innings Management**: End innings, start next innings, DLS overs reduction

## 📁 Project Structure

```
BQ-PLAY/
├── Backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── scoreController.js       # Core scoring + AI commentary
│   │   ├── services/
│   │   │   ├── fieldPositionMapper.js   # Field zone mapping
│   │   │   ├── aiCommentary.js          # AI commentary generation
│   │   │   ├── cricketApi.js            # External cricket API
│   │   │   └── cricketPolling.js        # Live score polling
│   │   ├── socket/
│   │   │   └── socket.js                # WebSocket setup
│   │   ├── models/
│   │   │   └── match.js                 # Match schema
│   │   └── routes/
│   │       └── matchRoutes.js           # API routes
│   └── package.json
│
├── Frontend/
│   ├── Admin/
│   │   └── src/
│   │       ├── components/
│   │       │   ├── CricketFieldMap.jsx      # Clickable field map
│   │       │   └── EnhancedScoringPanel.jsx # Admin scoring UI
│   │       └── pages/
│   │           └── ManageScore.jsx          # Score management
│   │
│   └── User/
│       └── src/
│           ├── components/
│           │   ├── CricinfoScoreboard.jsx   # Live scoreboard
│           │   ├── CommentaryFeed.jsx       # Ball-by-ball commentary
│           │   ├── DetailedScorecard.jsx    # Full scorecard
│           │   ├── EnhancedMatchTabs.jsx    # Tabbed interface
│           │   └── ThemeToggle.jsx          # Dark/light toggle
│           ├── context/
│           │   └── ThemeContext.jsx         # Theme management
│           └── pages/
│               └── Match.jsx                # Match view
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Cricket API key (optional, for external data)

### Backend Setup

```bash
cd Backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration:
# MONGO_URL=mongodb://localhost:27017/bqplay
# PORT=8000
# JWT_SECRET=your-secret-key
# CRICKET_API_KEY=your-api-key (optional)

# Start development server
npm run dev
```

### Frontend User App

```bash
cd Frontend/User

# Install dependencies
npm install

# Start development server
npm run dev
```

### Frontend Admin App

```bash
cd Frontend/Admin

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🎯 How to Score a Match

### Admin Workflow

1. **Navigate to Score Management**
   - Go to `/admin/score`
   - Select an active match

2. **Select Players**
   - Batsmen auto-populate from match data
   - Select bowler from dropdown
   - System tracks on-strike batsman

3. **Score a Ball**
   - Select runs (0, 1, 2, 3, 4, 6)
   - Click field position on the interactive map
   - AI commentary auto-generates
   - Click "Submit Ball"

4. **Handle Wickets**
   - Click "WICKET" button
   - Select dismissal type
   - Select dismissed player
   - Submit ball

5. **End Innings**
   - Click "End Innings" button
   - Confirm when prompted

### User Experience

1. **View Live Match**
   - Navigate to `/match/:matchId`
   - See real-time scoreboard
   - Ball updates appear instantly

2. **Switch Tabs**
   - **Live**: Scoreboard + recent balls
   - **Scorecard**: Full batting/bowling stats
   - **Commentary**: Ball-by-ball feed
   - **Info**: Match details, squads, toss

3. **Dark/Light Mode**
   - Click sun/moon icon in header
   - Preference saved to localStorage

## ⚡ WebSocket Events

### Server → Client
| Event | Data | Description |
|-------|------|-------------|
| `match:ballUpdate` | Ball data | Every ball scored |
| `match:scoreUpdate` | Score stats | Runs, wickets, overs, RR |
| `match:overComplete` | Over summary | When over finishes |
| `match:updated` | Full match | Complete match object |
| `match:aiCommentary` | Commentary | AI-generated commentary |
| `match:fieldClick` | Field data | Admin field position click |

### Client → Server
| Event | Data | Description |
|-------|------|-------------|
| `join-match` | matchId | Join match room |
| `leave-match` | matchId | Leave match room |

## 🤖 AI Commentary System

### Field Position Mapping
The system maps click coordinates to 30+ fielding zones:
- Off side: Cover, Point, Slip, Third Man, etc.
- On side: Mid Wicket, Square Leg, Fine Leg, etc.
- Straight: Mid On, Mid Off, Long On, Long Off

### Commentary Generation
AI commentary considers:
- Runs scored
- Field position/zone
- Distance category (infield/ring/deep)
- Wicket type (if applicable)
- Match context (target, required rate)

### Example Commentary
```
10.3
Bowler to Batsman, FOUR! Beautiful drive through covers, leans into it and sends it racing through cover
```

## 🎨 UI Features

### Color-Coded Ball Indicators
- **Red**: Wicket
- **Green**: Four/Six
- **Orange**: Wide/No Ball
- **Blue**: Runs (1, 2, 3)
- **Gray**: Dot ball

### Animations
- Score update pulse
- Ball entry fade-in
- Live indicator pulse
- Boundary glow effect
- Smooth tab transitions

### Responsive Design
- Mobile-first approach
- Touch-friendly controls
- Adaptive layouts

## 📊 Database Schema

### Match Model
```javascript
{
  title: String,
  matchType: enum,
  matchCategory: enum,
  teams: [Team],
  innings: [{
    team: Team,
    runs: Number,
    wickets: Number,
    balls: Number,
    oversHistory: [{
      overNumber: Number,
      bowler: Player,
      balls: [{
        ballNumber: Number,
        runs: Number,
        isWicket: Boolean,
        commentary: String,
        shotPlacement: { x, y, angle, position }
      }]
    }],
    batting: [{ player, runs, balls, fours, sixes }],
    bowling: [{ player, overs, runs, wickets }]
  }],
  status: enum,
  currentInnings: Number
}
```

## 🔧 API Endpoints

### Match Scoring
```
POST   /api/matches/:id/score              # Update score
POST   /api/matches/:id/field-click        # Field position click
POST   /api/matches/:id/end-innings        # End innings
POST   /api/matches/:id/start-next-innings # Start next innings
PUT    /api/matches/:id/edit-commentary    # Edit commentary
```

### Match Data
```
GET    /api/matches                        # List all matches
GET    /api/matches/:id                    # Get match details
POST   /api/matches                        # Create match
PUT    /api/matches/:id                    # Update match
```

## 🌐 External Cricket API

The system supports two providers:
- **CricAPI** (default): api.cricapi.com
- **RapidAPI Cricket**: Cricbuzz integration

Configure in `.env`:
```env
CRICKET_API_KEY=your-key
CRICKET_API_PROVIDER=cricapi
```

Auto-polling every 10 seconds with change detection and WebSocket broadcast.

## 🎭 Field Zones

The clickable field map includes 30+ zones:

### Off Side
- First/Second/Third Slip
- Gully
- Point / Backward Point / Deep Point
- Cover / Extra Cover / Deep Cover
- Third Man / Fine Leg / Deep Fine Leg
- Long Off

### On Side
- Mid Wicket / Deep Mid Wicket
- Square Leg / Backward Square Leg / Deep Square Leg
- Mid On / Long On

### Straight
- Bowler
- Mid Off

## 🚀 Deployment

### Backend
```bash
npm start  # Production mode
```

### Frontend
```bash
npm run build  # Build for production
```

Serve the `dist` folders with nginx, Apache, or any static file server.

## 📝 Notes

- PSL data has been removed from the system
- System uses modular architecture for scalability
- All scoring is manual (admin-driven) for accuracy
- AI commentary enhances but doesn't replace human judgment
- WebSocket rooms ensure match-specific updates only

## 🛠️ Tech Stack

**Backend:**
- Express 5
- Mongoose
- Socket.IO
- node-fetch

**Frontend:**
- React 18/19
- Vite 5/7
- Tailwind CSS 3/4
- Redux Toolkit
- React Router

**Database:**
- MongoDB

## 📞 Support

For issues or questions, check the existing codebase structure and documentation files:
- `Backend/CRICKET_API_GUIDE.md`
- `Backend/README.txt`

---

**Built with ❤️ for cricket fans everywhere** 🏏
