# 🏏 Live Cricket API Integration Guide

## Overview
This system automatically fetches live cricket scores from external APIs and displays them in a modern ESPN Cricinfo-style interface.

## Features
✅ **Automatic Live Scores** - Fetches from cricket APIs every 10 seconds  
✅ **Real-time Updates** - WebSocket integration for instant score updates  
✅ **Modern UI** - ESPN Cricinfo-style cards with dark mode  
✅ **Caching** - 8-second cache to reduce API calls  
✅ **Error Handling** - Graceful fallbacks and error messages  
✅ **Multiple Formats** - T20, ODI, Test matches supported  
✅ **Score Details** - Runs, wickets, overs, run rates, toss info  
✅ **Filtering** - Filter by status (live, upcoming, completed) and format  

## Setup Instructions

### 1. Get a Cricket API Key

You have two options:

#### Option A: CricAPI (Recommended - Free Tier Available)
1. Go to https://cricketdata.org/
2. Sign up for a free account
3. Get your API key from the dashboard
4. Free tier: 100 requests/day

#### Option B: RapidAPI Cricket
1. Go to https://rapidapi.com/
2. Search for "Cricket API"
3. Subscribe to a plan
4. Get your API key

### 2. Configure Backend

Create or update `.env` file in the `Backend` directory:

```env
# Cricket API Configuration
CRICKET_API_KEY=your_actual_api_key_here
CRICKET_API_PROVIDER=cricapi  # Options: cricapi, rapidapi-cricket
```

### 3. Restart Backend Server

```bash
cd Backend
npm run dev
```

You should see:
```
🏏 Cricket API polling started (interval: 10000ms)
```

If not configured:
```
⚠️  Cricket API not configured - set CRICKET_API_KEY in .env to enable live scores
```

### 4. Access Live Scores

Go to: http://localhost:3000/admin/live-scores

## API Endpoints

All endpoints are prefixed with `/api/cricket`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/cricket/live` | GET | Get all live matches |
| `/api/cricket/upcoming` | GET | Get upcoming matches |
| `/api/cricket/completed` | GET | Get completed matches |
| `/api/cricket/all` | GET | Get all matches (grouped) |
| `/api/cricket/match/:matchId` | GET | Get specific match details |
| `/api/cricket/match/:matchId/scorecard` | GET | Get full scorecard |
| `/api/cricket/match/:matchId/commentary` | GET | Get ball-by-ball commentary |
| `/api/cricket/cache/clear` | POST | Clear API cache |

## How It Works

### Backend Flow
```
1. Backend starts → cricketPolling.start()
2. Every 10 seconds → Fetch from external API
3. Check for changes → Compare with cached data
4. If changed → Emit via WebSocket to all clients
5. Cache response → Reduces API calls
```

### Frontend Flow
```
1. User opens /admin/live-scores
2. Fetches initial data from /api/cricket/all
3. Joins 'cricket-live' WebSocket room
4. Listens for 'cricket:liveUpdate' events
5. Updates UI in real-time without page refresh
6. Falls back to 10s polling if WebSocket fails
```

## WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-cricket-live` | Client → Server | Join live scores room |
| `cricket:liveUpdate` | Server → Client | New match data available |

## File Structure

### Backend
```
Backend/
├── src/
│   ├── services/
│   │   ├── cricketApi.js          # API integration service
│   │   └── cricketPolling.js      # Background polling service
│   ├── controllers/
│   │   └── cricketApiController.js # Request handlers
│   ├── routes/
│   │   └── cricketApiRoutes.js    # API routes
│   ├── socket/
│   │   └── socket.js              # WebSocket configuration
│   └── index.js                   # Main server file
```

### Frontend
```
Frontend/Admin/
└── src/
    ├── pages/
    │   └── LiveCricketScores.jsx  # Main live scores page
    ├── components/
    │   └── Sidebar.jsx            # Navigation menu
    └── App.jsx                     # Route configuration
```

## Troubleshooting

### No Live Scores Showing

**Problem:** "Unable to Load Scores" message

**Solutions:**
1. Check if API key is set in `.env`
2. Verify API key is valid on provider's dashboard
3. Check backend console for errors
4. Try manual request: `curl http://localhost:5000/api/cricket/live`

### API Rate Limit Exceeded

**Problem:** Getting 429 errors

**Solutions:**
1. Increase polling interval in `cricketPolling.js`
2. Upgrade to paid API plan
3. Check your API usage on provider's dashboard

### WebSocket Not Working

**Problem:** Scores not updating in real-time

**Solutions:**
1. Check browser console for WebSocket errors
2. Verify backend server is running
3. Check if firewall blocks WebSocket connections
4. Fallback: Page auto-refreshes every 10s anyway

## Customization

### Change Polling Interval

In `Backend/src/services/cricketPolling.js`:
```javascript
this.pollingInterval = 10000; // Change to desired ms (e.g., 5000 for 5s)
```

### Change Cache Timeout

In `Backend/src/services/cricketApi.js`:
```javascript
this.cacheTimeout = 8000; // Change to desired ms
```

### Add New API Provider

1. Update `cricketApi.js` with new provider
2. Add transformation method
3. Update `.env` options

## Performance Optimization

- **Caching**: 8-second cache prevents redundant API calls
- **Change Detection**: Only emits updates when data actually changes
- **Lazy Loading**: Components load on demand
- **WebSocket**: Reduces HTTP requests
- **Auto-cleanup**: Old cache entries are automatically removed

## Security Notes

⚠️ **Never commit your API key to version control**
- Use `.env` file (already in `.gitignore`)
- Use environment variables in production
- Rotate keys periodically

## Production Deployment

### Environment Variables
```env
CRICKET_API_KEY=your_production_key
CRICKET_API_PROVIDER=cricapi
NODE_ENV=production
```

### Recommended Settings
- Use HTTPS for all API calls
- Set up proper CORS policies
- Use Redis for distributed caching
- Monitor API usage and costs

## Support

For issues or questions:
1. Check this README
2. Review console logs
3. Test API endpoints directly
4. Verify API key is active

## License

This integration is part of the BQ-PLAY project.
