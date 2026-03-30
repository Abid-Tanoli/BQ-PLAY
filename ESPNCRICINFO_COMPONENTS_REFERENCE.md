# ESPNCricinfo-Style Components - Complete Reference

## 📋 Table of Contents
1. DetailedScorecard
2. MatchFlow
3. PlayerOfMatchAwards
4. MatchDetailsPanel
5. LiveProbability
6. EnhancedLiveCommentary

---

## 1️⃣ DetailedScorecard Component

### Purpose
Display complete scorecard with batting, bowling, and match statistics in a professional format.

### File Location
`Frontend/Admin/src/components/DetailedScorecard.jsx`

### Features
✅ **Batting Table**
- Player name with status (Out/Not Out)
- Runs scored
- Balls faced
- Number of 4s and 6s
- Strike rate
- How the batter got out

✅ **Bowling Table**
- Bowler name
- Overs, Maidens
- Runs conceded
- Wickets taken
- Economy rate
- Dots, 4s, 6s

✅ **Fall of Wickets**
- Chronological order of dismissals
- Run when wicket fell
- Batsman name
- Over and ball number

✅ **Extras Breakdown**
- Total extras
- Breakdown: leg byes, no balls, wides, byes

### Usage Example
```jsx
import DetailedScorecard from '../components/DetailedScorecard';

function ScorecardTab({ match }) {
  return (
    <div>
      <DetailedScorecard match={match} />
    </div>
  );
}
```

### Expected Data Structure
```javascript
match.innings = [
  {
    runs: 128,
    wickets: 9,
    overs: 20,
    balls: 120,
    batting: [
      {
        player: { _id: "...", name: "Abdullah Shafique" },
        runs: 33,
        balls: 24,
        fours: 4,
        sixes: 1,
        strikeRate: 137.50,
        dismissal: "c Hasan Ali b Zampa",
        isOut: true
      }
    ],
    bowling: [
      {
        player: { _id: "...", name: "Adam Zampa" },
        overs: 4,
        maidens: 1,
        runs: 11,
        wickets: 2,
        economy: 2.75,
        dots: 0,
        fours: 0,
        sixes: 0
      }
    ],
    fallOfWickets: [
      {
        batsman: "Fakhar Zaman",
        runs: 3,
        over: 0,
        ball: 4
      }
    ],
    extras: {
      total: 9,
      wides: 4,
      noBalls: 2,
      byes: 1,
      legByes: 2
    }
  }
];
```

### Styling
- Header: Gradient slate background
- Hover effects on rows
- Color-coded: Active rows, footer emphasis
- Responsive: Scrollable tables on mobile

### Output Format
Professional scorecard table with:
- Team name and logo
- Runs/Wickets score
- Detailed statistics per player
- Comprehensive extras breakdown

---

## 2️⃣ MatchFlow Component

### Purpose
Display a timeline of match events including milestones, wickets, and strategic moments.

### File Location
`Frontend/Admin/src/components/MatchFlow.jsx`

### Features
✅ **Powerplay Highlights**
- First 6 overs data
- Runs scored during powerplay
- Wickets lost

✅ **Run Milestones**
- Automatically adds 50, 100, 150-run markers
- Shows balls taken to reach milestone
- Visual timeline indicator

✅ **Strategic Timeouts**
- Team name
- Run rate at timeout
- Over number

✅ **Wicket Information**
- Batsman name
- Runs when out
- Over/ball reference
- Dismissal type

### Usage Example
```jsx
import MatchFlow from '../components/MatchFlow';

function MatchFlowTab({ match, currentInnings }) {
  return <MatchFlow match={match} innings={currentInnings} />;
}
```

### Expected Data Structure
```javascript
match = {
  innings: [
    {
      runs: 128,
      wickets: 9,
      balls: 120,
      powerPlayRuns: 42,
      powerPlayWickets: 2,
      oversHistory: [
        { overNumber: 1, runs: 7, wickets: 0 }
      ],
      fallOfWickets: [
        {
          batsman: "Fakhar Zaman",
          runs: 3,
          over: 0,
          ball: 4,
          dismissal: "b Mir Hamza"
        }
      ]
    }
  ],
  strategicTimeouts: [
    {
      team: "Lahore Qalandars",
      runRate: 6.2,
      overs: "13"
    }
  ]
};
```

### Visual Elements
- Vertical timeline with gradient
- Color-coded event cards:
  - 📊 Milestones (blue)
  - ⏱️ Timeouts (orange)
  - ⚠️ Wickets (red)
- Clickable dots on timeline

---

## 3️⃣ PlayerOfMatchAwards Component

### Purpose
Showcase MVP, Player of the Match, and impact rankings in an engaging card format.

### File Location
`Frontend/Admin/src/components/PlayerOfMatchAwards.jsx`

### Features
✅ **Player of the Match**
- Large profile with player name
- Team affiliation
- Key statistics (runs/wickets/balls/SR)
- Optional player quote
- Gradient background with styling

✅ **Impact Player Rankings**
- Top 5 players by impact points
- Ranked list with points
- Team information
- Hover effects

✅ **Fan Ratings**
- Average rating (0-10)
- Total votes
- Distribution chart (5-1 star scale)
- Visual bar chart

✅ **Awards & Achievements**
- Multiple award cards
- Trophy emoji
- Award title and description
- Player name

### Usage Example
```jsx
import PlayerOfMatchAwards from '../components/PlayerOfMatchAwards';

function AwardsTab({ match }) {
  return <PlayerOfMatchAwards match={match} />;
}
```

### Expected Data Structure
```javascript
match = {
  playerOfMatch: {
    name: "Adam Zampa",
    teamName: "Karachi Kings",
    runs: 0,
    wickets: 2,
    balls: 0,
    strikeRate: "-",
    quote: "It was a pretty used wicket. I suited myself there."
  },
  impactRankings: [
    {
      name: "Shaheen Shah Afridi",
      team: "Lahore Qalandars",
      points: 62.62,
      impact: 5.38
    }
  ],
  fanRating: {
    average: 8.5,
    totalVotes: 1250,
    distribution: {
      5: 0.45,
      4: 0.30,
      3: 0.15,
      2: 0.07,
      1: 0.03
    }
  },
  awards: [
    {
      title: "Best Bowler",
      playerName: "Adam Zampa",
      description: "2/11 in 4 overs"
    }
  ]
};
```

### Visual Design
- Dark gradient background for Player of Match
- Card-based layout for rankings
- Color-coded sections (blue for rankings, orange for ratings)
- Emoji indicators for visual appeal

---

## 4️⃣ MatchDetailsPanel Component

### Purpose
Display comprehensive match metadata, officials, and conditions.

### File Location
`Frontend/Admin/src/components/MatchDetailsPanel.jsx`

### Features
✅ **Match Information**
- Series/Tournament name
- Match format/type
- Venue
- Match date
- Current status

✅ **Toss Information**
- Toss winner team
- Decision (bat/bowl)
- Toss statement

✅ **Officials Panel**
- Umpires (with country)
- Reserve umpire
- Match referee
- TV umpire
- DRS umpires

✅ **Ground Conditions**
- Weather
- Pitch condition
- Temperature
- Humidity percentage

✅ **Result/Target**
- Match result
- Winner/status
- Margin (runs/wickets)
- Description

### Usage Example
```jsx
import MatchDetailsPanel from '../components/MatchDetailsPanel';

function MainSidebar({ match }) {
  return <MatchDetailsPanel match={match} />;
}
```

### Expected Data Structure
```javascript
match = {
  tournament: { _id: "...", name: "Pakistan Super League" },
  matchType: "T20",
  venue: "Gaddafi Stadium, Lahore",
  date: "2026-03-29",
  status: "live",
  toss: {
    winner: "Lahore Qalandars",
    decision: "bat",
    statement: "Lahore Qalandars won the toss and opted to bat"
  },
  umpires: [
    { name: "Faisal Afridi", country: "Pakistan", role: "Umpire" },
    { name: "Sharfuddoula", country: "Bangladesh", role: "DRS Umpire" }
  ],
  tvUmpire: "Asif Yaqoob",
  referee: "Roshan Mahanama",
  reserves: "Tariq Rasheed",
  groundConditions: {
    weather: "Clear",
    pitch: "Good for batting",
    temperature: 28,
    humidity: 65
  },
  result: {
    winner: "Karachi Kings",
    description: "Kings won by 4 wickets",
    margin: "(with 3 balls remaining)"
  }
};
```

### Color Scheme
- Gray for general info
- Amber for toss info
- Blue for officials
- Green for successful result

---

## 5️⃣ LiveProbability Component

### Purpose
Display win probability and chase analytics in real-time.

### File Location
`Frontend/Admin/src/components/LiveProbability.jsx`

### Features
✅ **Win Probability**
- Team comparison bars
- Percentage for each team
- Real-time updates
- Smooth animations

✅ **Chase Dynamics**
- Target runs
- Runs needed
- Balls/Overs remaining
- Wickets left
- Current run rate vs required rate

✅ **Analysis & Recommendations**
- Smart analysis based on run rate
- Color-coded advice (green/yellow/red)
- Actionable insights

### Usage Example
```jsx
import LiveProbability from '../components/LiveProbability';

function SidebarInfo({ match, currentInnings }) {
  return <LiveProbability match={match} currentInnings={currentInnings} />;
}
```

### Calculation Logic
```javascript
// Win probability calculation:
- If chasing team ahead of required RR → 80% win prob
- If chasing team behind by < 20% → 65-50% win prob
- If chasing team behind by 20-50% → 35-50% win prob
- If required RR > 12 → 20% win prob

// Chase dynamics:
- Target = First innning runs + 1
- Runs needed = Target - Current ruins
- Required RR = (Runs needed / Balls left) * 6
- Analysis compares current RR with required RR
```

### Expected Data Structure
```javascript
match = {
  totalOvers: 20,
  innings: [
    {
      status: "completed",
      runs: 128,
      wickets: 9,
      overs: 20
    },
    {
      status: "live",
      runs: 95,
      wickets: 4,
      balls: 105,
      overs: 17
    }
  ]
};
currentInnings = match.innings[1];
```

### Visual Elements
- Progress bars with gradients
- Grid layout for statistics
- Color-coded sections
- Real-time animation

---

## 6️⃣ EnhancedLiveCommentary Component

### Purpose
Display professional ball-by-ball commentary with detailed information.

### File Location
`Frontend/Admin/src/components/EnhancedLiveCommentary.jsx`

### Features
✅ **Recent Balls Indicator**
- Last 3 overs balls
- Color-coded: wicket (red), boundary (green), single (blue), dot (gray)
- Clickable for more info
- Runs displayed in ball

✅ **Ball-by-Ball Commentary**
- Over number and bowler
- Individual ball details:
  - Ball number
  - Runs scored
  - Commentary text
  - Special indicators (wide, no-ball, bye, leg bye)
  
✅ **Dismissal Information**
- Dismissal type
- Batsman name
- Bowler name
- Fielder position (if applicable)

✅ **Match Summary Stats**
- Total runs
- Wickets
- Current overs
- Run rate

### Usage Example
```jsx
import EnhancedLiveCommentary from '../components/EnhancedLiveCommentary';

function CommentaryTab({ match, currentInnings }) {
  return <EnhancedLiveCommentary match={match} currentInnings={currentInnings} />;
}
```

### Expected Data Structure
```javascript
currentInnings = {
  runs: 95,
  wickets: 4,
  balls: 105,
  overs: 17,
  runRate: 5.65,
  oversHistory: [
    {
      overNumber: 1,
      bowler: { _id: "...", name: "Shaheen Shah Afridi" },
      runs: 7,
      wickets: 0,
      balls: [
        {
          ballNumber: 1,
          runs: 0,
          isWicket: false,
          isWide: false,
          isNoBall: false,
          isBye: false,
          isLegBye: false,
          commentary: "Good length on off stump, blocked back"
        }
      ]
    }
  ]
};
```

### Color Coding
- 🔴 Red (W): Wicket balls
- 🟢 Green (4+): Boundary balls (4 or 6)
- 🔵 Blue (1-3): Single/double/triple
- ⚫ Gray (•): Dot balls

### Features
- Last 3 overs displayed (most recent)
- Expandable ball cards
- Over summaries
- Dismissal details with backgrounds
- Fielding position tracking

---

## 🎨 Color Palette Reference

### Primary Colors
- Dark Blue: `#031d44` (ESPNCricinfo signature)
- Light Blue: `#003d66`

### Semantic Colors
- Success (Runs): Green (`from-green-50 to-emerald-50`)
- Alert (Wickets): Red (`from-red-50 to-orange-50`)
- Info (Probability): Blue (`from-blue-50 to-indigo-50`)
- Warning (Required): Yellow (`from-amber-50 to-yellow-50`)

### Backgrounds
- Primary: `white`
- Secondary: `slate-50`
- Hover: `slate-100`

### Text
- Primary: `slate-800`
- Secondary: `slate-500`
- Accent: `slate-700`

---

## 📱 Responsive Breakpoints

All components are optimized for:
- **Mobile**: < 640px (single column)
- **Tablet**: 640px - 1024px (2 columns)
- **Desktop**: > 1024px (3+ columns)

Tables hide columns on smaller screens:
- Hidden on Mobile: 4s, 6s columns
- Hidden on Tablet: Extra stats
- Visible on Desktop: All columns

---

## ⚡ Performance Notes

✅ **Optimizations**
- useMemo for calculations
- Lazy rendering of tabs
- Efficient array mapping
- Minimal DOM updates

⚠️ **Best Practices**
- Limit oversHistory to last 5 overs for live commentary
- Cache calculation results
- Use React.memo for child components if needed
- Implement virtual scrolling for large scorecards

---

## 🔗 Integration Checklist

Before deploying:
- [ ] All 6 components created
- [ ] Imports added to Livematchview.jsx
- [ ] Tab handlers defined
- [ ] Match data structure verified
- [ ] Styling looks correct
- [ ] No console errors
- [ ] Responsive design tested
- [ ] Real-time updates working
- [ ] Mobile performance acceptable

---

**Last Updated:** March 30, 2026  
**Version:** 1.0  
**Status:** Production Ready
