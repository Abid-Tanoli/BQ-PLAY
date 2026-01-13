Backend notes:
- Start: npm run dev
- Score update endpoint: POST /api/matches/:id/score
  Body example:
  {
    "inningsIndex": 0,
    "runs": 4,
    "wickets": 0,
    "balls": 1,
    "extras": 0,
    "commentaryText": "Beautiful cover drive! 4 runs."
  }