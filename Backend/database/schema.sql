-- BQ-PLAY Cricket Scoring Database Schema (PostgreSQL)
-- Based on ESPN Cricinfo model with T20/ODI support
-- Created: March 30, 2026

-- ============================================================================
-- TEAMS TABLE
-- ============================================================================
CREATE TABLE teams (
  team_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  short_code CHAR(3) NOT NULL UNIQUE,
  country VARCHAR(100) NOT NULL,
  flag_url TEXT,
  home_ground VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PLAYERS TABLE
-- ============================================================================
CREATE TABLE players (
  player_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  
  -- Player role (role composition for team selection rules)
  role VARCHAR(30) NOT NULL CHECK (role IN (
    'Top-order Batsman',
    'Middle-order Batsman',
    'Wicket-keeper Batsman',
    'All-rounder',
    'Pace Bowler',
    'Spin Bowler'
  )),
  
  -- Batting & Bowling styles with specific abbreviations
  batting_style VARCHAR(10) NOT NULL CHECK (batting_style IN ('RHB', 'LHB')),
  bowling_style VARCHAR(10) CHECK (bowling_style IN (
    'RF',   -- Right Arm Fast
    'RFM',  -- Right Arm Fast-Medium
    'RM',   -- Right Arm Medium
    'OB',   -- Off-break (Spinner)
    'LB',   -- Leg-break (Spinner)
    'SLA',  -- Slow Left Arm (Spinner)
    'LSM'   -- Left Arm Slow-Medium
  )),
  
  -- Player metadata
  profile_image_url TEXT,
  jersey_number INT,
  is_captain BOOLEAN DEFAULT FALSE,
  is_vice_captain BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_team (team_id),
  INDEX idx_role (role)
);

-- ============================================================================
-- CAREER STATS TABLE (aggregated across all matches)
-- ============================================================================
CREATE TABLE career_stats (
  stat_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL UNIQUE REFERENCES players(player_id) ON DELETE CASCADE,
  
  -- Batting stats
  batting_matches INT DEFAULT 0,
  batting_innings INT DEFAULT 0,
  batting_runs INT DEFAULT 0,
  batting_highest_score INT DEFAULT 0,
  batting_average DECIMAL(6, 2) DEFAULT 0,
  batting_strike_rate DECIMAL(6, 2) DEFAULT 0,
  batting_centuries INT DEFAULT 0,
  batting_fifties INT DEFAULT 0,
  batting_fours INT DEFAULT 0,
  batting_sixes INT DEFAULT 0,
  batting_dots INT DEFAULT 0,
  
  -- Bowling stats
  bowling_matches INT DEFAULT 0,
  bowling_innings INT DEFAULT 0,
  bowling_wickets INT DEFAULT 0,
  bowling_runs_conceded INT DEFAULT 0,
  bowling_average DECIMAL(6, 2) DEFAULT 0,
  bowling_economy DECIMAL(6, 2) DEFAULT 0,
  bowling_strike_rate DECIMAL(6, 2) DEFAULT 0,
  bowling_best_analysis VARCHAR(10),
  bowling_maidens INT DEFAULT 0,
  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_player (player_id)
);

-- ============================================================================
-- MATCHES TABLE
-- ============================================================================
CREATE TABLE matches (
  match_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Match metadata
  format VARCHAR(10) NOT NULL CHECK (format IN ('T20', 'ODI', 'Test')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('upcoming', 'live', 'completed')),
  
  -- Teams
  team_home_id UUID NOT NULL REFERENCES teams(team_id),
  team_away_id UUID NOT NULL REFERENCES teams(team_id),
  
  -- Venue information
  venue_name VARCHAR(150),
  city VARCHAR(100),
  country VARCHAR(100),
  
  -- Toss information
  toss_winner_id UUID REFERENCES teams(team_id),
  toss_decision VARCHAR(10) CHECK (toss_decision IN ('bat', 'field')),
  
  -- Match timing
  match_date DATE NOT NULL,
  match_time TIME,
  date_start TIMESTAMP,
  date_end TIMESTAMP,
  
  -- Match result
  result_status VARCHAR(50), -- 'Team A won by X runs', 'Team B won by Y wickets', 'No result', 'Tie'
  winning_team_id UUID REFERENCES teams(team_id),
  margin_runs INT,
  margin_wickets INT,
  man_of_the_match_id UUID REFERENCES players(player_id),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_status (status),
  INDEX idx_format (format),
  INDEX idx_teams (team_home_id, team_away_id),
  INDEX idx_date (match_date)
);

-- ============================================================================
-- INNINGS TABLE (one or two per match)
-- ============================================================================
CREATE TABLE innings (
  innings_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(match_id) ON DELETE CASCADE,
  innings_number INT NOT NULL CHECK (innings_number IN (1, 2, 3, 4)),
  
  -- Team/Side information
  batting_team_id UUID NOT NULL REFERENCES teams(team_id),
  bowling_team_id UUID NOT NULL REFERENCES teams(team_id),
  
  -- Innings status
  status VARCHAR(20) NOT NULL CHECK (status IN ('upcoming', 'live', 'completed')),
  
  -- Scorecard summary
  total_runs INT DEFAULT 0,
  total_wickets INT DEFAULT 0,
  total_overs INT DEFAULT 0, -- legal deliveries / 6
  total_legal_deliveries INT DEFAULT 0,
  
  -- Extras breakdown
  extras_wides INT DEFAULT 0,
  extras_no_balls INT DEFAULT 0,
  extras_byes INT DEFAULT 0,
  extras_leg_byes INT DEFAULT 0,
  extras_penalty INT DEFAULT 0,
  extras_total INT DEFAULT 0,
  
  -- Derived metrics
  current_run_rate DECIMAL(6, 2) DEFAULT 0,
  required_run_rate DECIMAL(6, 2),
  win_probability DECIMAL(5, 2), -- 0-100%
  
  -- Target (for 2nd innings)
  target INT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE (match_id, innings_number),
  INDEX idx_match (match_id),
  INDEX idx_status (status),
  INDEX idx_teams (batting_team_id, bowling_team_id)
);

-- ============================================================================
-- BATTING LINEUP TABLE (XI composition + batting order for each innings)
-- ============================================================================
CREATE TABLE batting_lineup (
  lineup_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  innings_id UUID NOT NULL REFERENCES innings(innings_id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(player_id),
  
  -- Batting position (1-11)
  batting_position INT NOT NULL CHECK (batting_position >= 1 AND batting_position <= 11),
  
  -- Batting statistics for this innings
  runs_scored INT DEFAULT 0,
  balls_faced INT DEFAULT 0,
  fours INT DEFAULT 0,
  sixes INT DEFAULT 0,
  strike_rate DECIMAL(6, 2) DEFAULT 0,
  dot_balls INT DEFAULT 0,
  
  -- Wicket information
  is_out BOOLEAN DEFAULT FALSE,
  wicket_type VARCHAR(30) CHECK (wicket_type IN (
    'bowled', 'caught', 'lbw', 'run_out', 'stumped', 
    'hit_wicket', 'retired_hurt', 'obstructing_field', NULL
  )),
  dismissal_over INT,
  dismissal_ball INT,
  bowler_id UUID REFERENCES players(player_id),
  fielder_id UUID REFERENCES players(player_id),
  how_out_description TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE (innings_id, player_id),
  INDEX idx_innings (innings_id),
  INDEX idx_player (player_id),
  INDEX idx_batting_position (batting_position)
);

-- ============================================================================
-- BOWLING LINEUP TABLE (eligible bowlers for each innings)
-- ============================================================================
CREATE TABLE bowling_lineup (
  lineup_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  innings_id UUID NOT NULL REFERENCES innings(innings_id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(player_id),
  
  -- Bowling statistics for this innings
  overs_bowled INT DEFAULT 0,
  legal_deliveries INT DEFAULT 0,
  maidens INT DEFAULT 0,
  runs_conceded INT DEFAULT 0,
  wickets INT DEFAULT 0,
  economy DECIMAL(6, 2) DEFAULT 0,
  strike_rate DECIMAL(6, 2) DEFAULT 0,
  dots INT DEFAULT 0,
  fours_conceded INT DEFAULT 0,
  sixes_conceded INT DEFAULT 0,
  
  -- Fatigue/usage tracking
  last_over_bowled INT, -- for rotation logic (cannot bowl consecutive overs)
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE (innings_id, player_id),
  INDEX idx_innings (innings_id),
  INDEX idx_player (player_id)
);

-- ============================================================================
-- BALLS TABLE (every delivery recorded)
-- ============================================================================
CREATE TABLE balls (
  ball_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(match_id) ON DELETE CASCADE,
  innings_id UUID NOT NULL REFERENCES innings(innings_id) ON DELETE CASCADE,
  
  -- Ball identification
  over_number INT NOT NULL CHECK (over_number >= 0),
  ball_in_over INT NOT NULL CHECK (ball_in_over >= 1 AND ball_in_over <= 6),
  ball_sequence INT NOT NULL, -- overall delivery count including wides/no-balls
  
  -- Players involved
  bowler_id UUID NOT NULL REFERENCES players(player_id),
  batsman_on_strike_id UUID NOT NULL REFERENCES players(player_id),
  non_striker_id UUID NOT NULL REFERENCES players(player_id),
  
  -- Runs and extras
  runs_off_bat INT DEFAULT 0 CHECK (runs_off_bat >= 0 AND runs_off_bat <= 6),
  is_wide BOOLEAN DEFAULT FALSE,
  is_no_ball BOOLEAN DEFAULT FALSE,
  is_bye BOOLEAN DEFAULT FALSE,
  is_leg_bye BOOLEAN DEFAULT FALSE,
  is_free_hit BOOLEAN DEFAULT FALSE, -- follows a no-ball
  total_runs INT DEFAULT 0, -- sum of all runs from this delivery
  
  -- Wicket information
  is_wicket BOOLEAN DEFAULT FALSE,
  wicket_type VARCHAR(30) CHECK (wicket_type IN (
    'bowled', 'caught', 'lbw', 'run_out', 'stumped',
    'hit_wicket', 'retired_hurt', 'obstructing_field', NULL
  )),
  dismissed_player_id UUID REFERENCES players(player_id),
  fielder_id UUID REFERENCES players(player_id),
  
  -- Batting zone / shot placement (for wagon wheel)
  shot_type VARCHAR(50), -- e.g., 'drive', 'pull', 'defense', 'leave'
  batting_zone VARCHAR(20), -- 'off_side', 'leg_side', 'short_pitch', etc.
  
  -- Commentary and metadata
  commentary TEXT,
  ball_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_match (match_id),
  INDEX idx_innings (innings_id),
  INDEX idx_over (over_number),
  INDEX idx_bowler (bowler_id),
  INDEX idx_batsman (batsman_on_strike_id),
  INDEX idx_sequence (ball_sequence)
);

-- ============================================================================
-- FALL OF WICKETS TABLE
-- ============================================================================
CREATE TABLE fall_of_wickets (
  fow_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  innings_id UUID NOT NULL REFERENCES innings(innings_id) ON DELETE CASCADE,
  
  wicket_number INT NOT NULL CHECK (wicket_number >= 1 AND wicket_number <= 10),
  dismissed_player_id UUID NOT NULL REFERENCES players(player_id),
  bowler_id UUID REFERENCES players(player_id),
  fielder_id UUID REFERENCES players(player_id),
  
  runs_at_fall INT NOT NULL,
  overs_at_fall INT NOT NULL,
  ball_at_fall INT NOT NULL,
  
  wicket_type VARCHAR(30),
  runs_in_partnership INT,
  balls_in_partnership INT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE (innings_id, wicket_number),
  INDEX idx_innings (innings_id)
);

-- ============================================================================
-- PARTNERSHIPS TABLE (optional, for live tracking)
-- ============================================================================
CREATE TABLE partnerships (
  partnership_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  innings_id UUID NOT NULL REFERENCES innings(innings_id) ON DELETE CASCADE,
  
  batsman_1_id UUID NOT NULL REFERENCES players(player_id),
  batsman_2_id UUID NOT NULL REFERENCES players(player_id),
  
  partnership_number INT NOT NULL,
  partnership_runs INT DEFAULT 0,
  partnership_balls INT DEFAULT 0,
  partnership_run_rate DECIMAL(6, 2) DEFAULT 0,
  
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_innings (innings_id)
);

-- ============================================================================
-- OVER SUMMARIES TABLE (for quick access to over-by-over data)
-- ============================================================================
CREATE TABLE over_summaries (
  over_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  innings_id UUID NOT NULL REFERENCES innings(innings_id) ON DELETE CASCADE,
  
  over_number INT NOT NULL,
  bowler_id UUID NOT NULL REFERENCES players(player_id),
  
  legal_deliveries INT DEFAULT 0,
  wides INT DEFAULT 0,
  no_balls INT DEFAULT 0,
  runs INT DEFAULT 0,
  wickets INT DEFAULT 0,
  maiden BOOLEAN DEFAULT FALSE,
  
  cumulative_runs INT,
  cumulative_wickets INT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE (innings_id, over_number),
  INDEX idx_innings (innings_id),
  INDEX idx_over (over_number)
);

-- ============================================================================
-- WORM GRAPH DATA (cumulative runs per over for charting)
-- ============================================================================
CREATE TABLE worm_graph (
  worm_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(match_id) ON DELETE CASCADE,
  
  innings_number INT NOT NULL,
  over_number INT NOT NULL,
  cumulative_runs INT NOT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE (match_id, innings_number, over_number),
  INDEX idx_match (match_id)
);

-- ============================================================================
-- WIN PROBABILITY TIMESERIES (for live graph)
-- ============================================================================
CREATE TABLE win_probability (
  wp_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(match_id) ON DELETE CASCADE,
  
  batting_team_id UUID NOT NULL REFERENCES teams(team_id),
  win_probability DECIMAL(5, 2) NOT NULL,
  
  over_number INT,
  ball_number INT,
  
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_match (match_id),
  INDEX idx_recorded (recorded_at)
);

-- ============================================================================
-- USERS TABLE (for authentication and roles)
-- ============================================================================
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  
  role VARCHAR(30) NOT NULL CHECK (role IN ('viewer', 'scorer', 'admin')),
  team_id UUID REFERENCES teams(team_id),
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX idx_balls_match_over ON balls(match_id, over_number);
CREATE INDEX idx_balls_innings_over ON balls(innings_id, over_number, ball_in_over);
CREATE INDEX idx_batting_lineup_innings ON batting_lineup(innings_id, batting_position);
CREATE INDEX idx_bowling_lineup_innings ON bowling_lineup(innings_id);
CREATE INDEX idx_matches_active ON matches(status) WHERE status IN ('upcoming', 'live');
CREATE INDEX idx_innings_active ON innings(match_id, status) WHERE status IN ('live', 'upcoming');

-- ============================================================================
-- AUDIT LOG TABLE (optional but recommended)
-- ============================================================================
CREATE TABLE audit_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  changes JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user (user_id),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_created (created_at)
);
