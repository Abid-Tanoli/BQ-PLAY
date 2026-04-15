# Multi-Category Teams & Matches System

## Overview

The BQ-PLAY platform now supports a scalable, multi-category system that clearly separates different types of cricket teams and matches. This system distinguishes between professional international teams, league franchises, and internal incubation/training teams.

## Architecture

### Team Types

All teams in the system are classified into three types:

| Type | Description | Example | Color Theme |
|------|-------------|---------|-------------|
| `international_team` | Country-based national teams | Pakistan, India, Australia | Blue |
| `league_team` | Professional franchise leagues | PSL, IPL, BBL teams | Green |
| `incubation_team` | Internal training/development teams | AL-Khidmat BanoQabil teams | Purple |

### Match Categories

Matches are categorized into five types:

| Category | Description | Subcategories |
|----------|-------------|---------------|
| `international` | International cricket matches | Test Championship, World Cup, Asia Cup, etc. |
| `league` | Professional league matches | IPL, PSL, BBL, CPL, etc. |
| `domestic` | Domestic cricket | National T20, First-Class, Regional |
| `local-club` | Local club cricket | Club Tournament, Friendly, Tape Ball |
| `incubation` | Internal training matches | Training Match, Practice Game, Academy |

## User Experience

### Teams Page Flow

```
/teams (Category Selection)
├── /teams/international (Country Teams)
│   └── View national teams with squads
├── /teams/leagues (Professional Leagues)
│   ├── /teams/leagues/:leagueId (League Details)
│   │   ├── Teams Tab
│   │   ├── Players Tab
│   │   ├── Matches Tab
│   │   └── Blogs & Media Tab
└── /teams/incubation (Internal Teams)
    └── Groups with training teams clearly marked
```

### Category Selection Page (/teams)

Users are presented with three category cards:

1. **🌍 International Teams** - Blue themed
   - Country-based national teams
   - Common knowledge teams (no need to register)

2. **🏆 International Leagues** - Green themed
   - Professional franchise leagues
   - Contains teams, players, blogs, media

3. **🚀 Incubation Teams** - Purple themed
   - Internal/training teams
   - Clearly marked as "Internal / Training"
   - Different visual identity from professional teams

### Incubation Team Visual Distinction

Incubation teams are clearly distinguished with:
- **Purple color theme** (vs blue/green for professional)
- **"Incubation Team" badge**
- **"Internal / Training" tag**
- **Different card styling**
- **Grouped under parent organization** (e.g., AL-Khidmat BanoQabil Incubation)

## Admin Features

### Team Creation

When creating a team, admins must select:
1. **Team Type** (required):
   - League Team
   - International Team
   - Incubation Team (Internal/Training)

2. **Category/League** (optional):
   - For international: Country name
   - For league: League name (PSL, IPL, etc.)
   - For incubation: Group name

### Match Creation

When creating a match, admins select:
1. **Match Category** (required):
   - 🌍 International
   - 🏆 League
   - 🏛️ Domestic
   - 🏟️ Local Club
   - 🚀 Incubation (NEW)

2. **Match Subcategory** (based on category):
   - International: Test, ODI, T20I, etc.
   - League: IPL, PSL, BBL, etc.
   - Domestic: National T20, First-Class, etc.
   - Local Club: Club Tournament, Friendly, etc.
   - Incubation: Training Match, Practice Game, Academy, etc.

### Match Filtering

Admin can filter matches by:
- Category (International, League, Domestic, Local Club, Incubation)
- Subcategory (specific league/tournament type)
- Format (T20, ODI, Test, etc.)

## Backend API

### Team Endpoints

```
GET    /api/teams?type=:type           # Filter by team type
GET    /api/categories                 # Get all categories with counts
GET    /api/categories/teams/:type     # Get teams by type
GET    /api/categories/leagues         # Get all leagues
GET    /api/categories/leagues/:id     # Get league details with teams/players/media
GET    /api/categories/incubation      # Get incubation groups
GET    /api/categories/incubation/:id  # Get incubation group details
```

### Admin Endpoints

```
POST   /api/categories/incubation                    # Create incubation group
PUT    /api/categories/incubation/:id                # Update incubation group
DELETE /api/categories/incubation/:id                # Delete incubation group
POST   /api/categories/incubation/:groupId/teams/:teamId  # Add team to group
```

### Match Endpoints

```
GET    /api/matches?matchCategory=:category    # Filter matches by category
POST   /api/matches                           # Create match (with matchCategory)
```

## Database Schema

### Team Model Updates

```javascript
{
  type: {
    type: String,
    enum: ["international_team", "league_team", "incubation_team"],
    default: "league_team"
  },
  category: {
    type: String,
    default: ""
    // International: country name
    // League: league name
    // Incubation: group name
  },
  incubationGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "IncubationGroup"
  },
  isInternal: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String
  }]
}
```

### IncubationGroup Model

```javascript
{
  name: String,
  slug: String,
  description: String,
  parentOrganization: String,  // e.g., "AL-Khidmat BanoQabil"
  manager: String,
  contactEmail: String,
  teams: [{ type: ObjectId, ref: "Team" }],
  blogs: [{ type: ObjectId, ref: "Blog" }],
  status: { enum: ["active", "inactive", "archived"] },
  images: [],
  videos: []
}
```

### Match Model Updates

```javascript
{
  matchCategory: {
    type: String,
    enum: ["international", "league", "domestic", "local-club", "incubation"],
    default: "local-club"
  },
  matchSubcategory: {
    type: String,
    default: ""
  }
}
```

## Routing Structure

### User Routes (Frontend/User/src/App.jsx)

```jsx
<Route path="/teams" element={<Teams />} />
<Route path="/teams/international" element={<InternationalTeams />} />
<Route path="/teams/leagues" element={<LeagueTeams />} />
<Route path="/teams/leagues/:leagueId" element={<LeagueDetails />} />
<Route path="/teams/incubation" element={<IncubationTeams />} />
```

### Backend Routes (Backend/src/routes/categoryRoutes.js)

```javascript
// Public
GET    /api/categories
GET    /api/categories/teams/:type
GET    /api/categories/leagues
GET    /api/categories/leagues/:leagueId
GET    /api/categories/incubation
GET    /api/categories/incubation/:groupId

// Admin (requires auth + admin role)
POST   /api/categories/incubation
PUT    /api/categories/incubation/:groupId
DELETE /api/categories/incubation/:groupId
POST   /api/categories/incubation/:groupId/teams/:teamId
```

## File Structure

```
Backend/
├── src/
│   ├── models/
│   │   ├── Team.js                  # Updated with type, category, tags
│   │   ├── IncubationGroup.js       # NEW: Incubation group model
│   │   └── match.js                 # Updated with incubation category
│   ├── controllers/
│   │   └── categoryController.js    # NEW: Category endpoints
│   └── routes/
│       └── categoryRoutes.js        # NEW: Category routes
│
Frontend/User/src/
├── pages/
│   ├── Teams.jsx                    # Category selection page
│   ├── InternationalTeams.jsx       # International teams list
│   ├── LeagueTeams.jsx              # Leagues list
│   ├── LeagueDetails.jsx            # League detail with tabs
│   └── IncubationTeams.jsx          # Incubation groups & teams
└── App.jsx                          # Updated routes
│
Frontend/Admin/src/
├── pages/
│   ├── Teams.jsx                    # Updated with team type selector
│   ├── EventDetail.jsx              # Updated with incubation category
│   └── LiveScores.jsx               # Updated with incubation filter
└── ...
```

## Usage Examples

### Creating an Incubation Team

1. Admin goes to Teams page
2. Selects "Incubation Team (Internal/Training)" as team type
3. Enters category as "AL-Khidmat BanoQabil Incubation"
4. Team is created with `type: "incubation_team"` and `isInternal: true`
5. Team appears in /teams/incubation with purple theme and badges

### Creating an Incubation Match

1. Admin creates new match
2. Selects "🚀 Incubation" as match category
3. Selects subcategory (e.g., "Training Match", "AL-Khidmat BanoQabil")
4. Match is created with `matchCategory: "incubation"`
5. Match can be filtered by incubation category in LiveScores

### Viewing League Details

1. User goes to /teams/leagues
2. Clicks on a league (e.g., PSL)
3. Sees league detail page with tabs:
   - **Teams**: All teams in the league
   - **Players**: All players across all teams
   - **Matches**: Scheduled/completed matches
   - **Blogs & Media**: Articles, images, videos

## Migration Guide

### Existing Teams

Existing teams in the database will default to `type: "league_team"` since that's the default value. To update existing teams:

```javascript
// Script to categorize existing teams
db.teams.updateMany(
  { name: { $in: ["Pakistan", "India", "Australia", "England"] } },
  { $set: { type: "international_team" } }
);

db.teams.updateMany(
  { category: { $regex: /PSL|IPL|BBL/i } },
  { $set: { type: "league_team" } }
);

db.teams.updateMany(
  { isInternal: true },
  { $set: { type: "incubation_team" } }
);
```

### Existing Matches

Existing matches will default to `matchCategory: "local-club"`. Update as needed based on your data.

## Benefits

1. **Clear Separation**: Professional and internal teams are visually and logically separated
2. **Scalability**: Easy to add new categories or subcategories
3. **User Experience**: Users can quickly find the type of content they're interested in
4. **Admin Control**: Full control over categorization at team and match level
5. **Filtering**: Efficient filtering by category across the platform
6. **Branding**: Different color themes for different categories improve recognition

## Future Enhancements

- Add team transfer system between categories
- League-specific branding and themes
- Automated categorization based on team names
- Category-based permissions and access control
- Analytics dashboard per category
- Export functionality for incubation groups
