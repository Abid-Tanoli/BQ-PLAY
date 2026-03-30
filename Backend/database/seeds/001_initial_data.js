/**
 * Seed: 001_initial_data
 * Populates database with realistic T20 cricket data
 * 2 teams × 15 players, 2 matches (1 completed, 1 live)
 */

const { v4: uuidv4 } = require('uuid');

exports.seed = async function(knex) {
  // Clear existing data
  await knex('audit_logs').del();
  await knex('users').del();
  await knex('win_probability').del();
  await knex('worm_graph').del();
  await knex('over_summaries').del();
  await knex('partnerships').del();
  await knex('fall_of_wickets').del();
  await knex('balls').del();
  await knex('bowling_lineup').del();
  await knex('batting_lineup').del();
  await knex('innings').del();
  await knex('matches').del();
  await knex('career_stats').del();
  await knex('players').del();
  await knex('teams').del();

  // ============================================================================
  // TEAMS
  // ============================================================================
  const teamIndia = {
    team_id: uuidv4(),
    name: 'India',
    short_code: 'IND',
    country: 'India',
    flag_url: 'https://flagcdn.com/in.svg',
    home_ground: 'Arun Jaitley Stadium'
  };

  const teamAustralia = {
    team_id: uuidv4(),
    name: 'Australia',
    short_code: 'AUS',
    country: 'Australia',
    flag_url: 'https://flagcdn.com/au.svg',
    home_ground: 'MCG'
  };

  await knex('teams').insert([teamIndia, teamAustralia]);

  // ============================================================================
  // PLAYERS - INDIA
  // ============================================================================
  const indiaPlayers = [
    // Top-order Batsmen (openers)
    { player_id: uuidv4(), name: 'Rohit Sharma', role: 'Top-order Batsman', batting_style: 'RHB', bowling_style: null, batting_avg: 42.5, strike_rate: 138.2, bowling_avg: null },
    { player_id: uuidv4(), name: 'Shubman Gill', role: 'Top-order Batsman', batting_style: 'RHB', bowling_style: null, batting_avg: 38.1, strike_rate: 135.7, bowling_avg: null },
    
    // Middle-order Batsmen
    { player_id: uuidv4(), name: 'Virat Kohli', role: 'Middle-order Batsman', batting_style: 'RHB', bowling_style: null, batting_avg: 48.2, strike_rate: 139.5, bowling_avg: null },
    { player_id: uuidv4(), name: 'Shreyas Iyer', role: 'Middle-order Batsman', batting_style: 'RHB', bowling_style: null, batting_avg: 35.6, strike_rate: 125.8, bowling_avg: null },
    { player_id: uuidv4(), name: 'Suryakumar Yadav', role: 'Middle-order Batsman', batting_style: 'RHB', bowling_style: null, batting_avg: 33.4, strike_rate: 141.2, bowling_avg: null },
    
    // Wicket-keeper
    { player_id: uuidv4(), name: 'Rishabh Pant', role: 'Wicket-keeper Batsman', batting_style: 'LHB', bowling_style: null, batting_avg: 31.5, strike_rate: 142.8, bowling_avg: null },
    
    // All-rounders
    { player_id: uuidv4(), name: 'Hardik Pandya', role: 'All-rounder', batting_style: 'RHB', bowling_style: 'RFM', batting_avg: 32.1, strike_rate: 138.5, bowling_avg: 28.3, bowling_strike_rate: 16.4 },
    { player_id: uuidv4(), name: 'Ravindra Jadeja', role: 'All-rounder', batting_style: 'LHB', bowling_style: 'SLA', batting_avg: 28.7, strike_rate: 115.3, bowling_avg: 26.8, bowling_strike_rate: 18.9 },
    
    // Pace Bowlers
    { player_id: uuidv4(), name: 'Jasprit Bumrah', role: 'Pace Bowler', batting_style: 'RHB', bowling_style: 'RF', batting_avg: 12.3, strike_rate: 95.2, bowling_avg: 22.4, bowling_strike_rate: 14.2 },
    { player_id: uuidv4(), name: 'Mohammed Shami', role: 'Pace Bowler', batting_style: 'RHB', bowling_style: 'RF', batting_avg: 8.9, strike_rate: 78.5, bowling_avg: 24.1, bowling_strike_rate: 15.8 },
    { player_id: uuidv4(), name: 'Arshdeep Singh', role: 'Pace Bowler', batting_style: 'LHB', bowling_style: 'RF', batting_avg: 6.2, strike_rate: 71.4, bowling_avg: 23.7, bowling_strike_rate: 16.1 },
    
    // Spin Bowlers
    { player_id: uuidv4(), name: 'Yuzvendra Chahal', role: 'Spin Bowler', batting_style: 'RHB', bowling_style: 'LB', batting_avg: 5.1, strike_rate: 68.9, bowling_avg: 26.3, bowling_strike_rate: 18.7 },
    { player_id: uuidv4(), name: 'Axar Patel', role: 'Spin Bowler', batting_style: 'LHB', bowling_style: 'SLA', batting_avg: 7.5, strike_rate: 82.3, bowling_avg: 27.1, bowling_strike_rate: 19.4 },
  ];

  const indiaBatsmanPlayers = indiaPlayers.map(p => ({
    ...p,
    team_id: teamIndia.team_id,
    jersey_number: Math.floor(Math.random() * 50) + 1,
    is_captain: p.name === 'Rohit Sharma',
    is_vice_captain: p.name === 'Virat Kohli'
  }));

  // ============================================================================
  // PLAYERS - AUSTRALIA
  // ============================================================================
  const australiaPlayers = [
    // Top-order Batsmen
    { player_id: uuidv4(), name: 'David Warner', role: 'Top-order Batsman', batting_style: 'LHB', bowling_style: null, batting_avg: 39.2, strike_rate: 136.8, bowling_avg: null },
    { player_id: uuidv4(), name: 'Travis Head', role: 'Top-order Batsman', batting_style: 'LHB', bowling_style: null, batting_avg: 37.4, strike_rate: 144.5, bowling_avg: null },
    
    // Middle-order Batsmen
    { player_id: uuidv4(), name: 'Steven Smith', role: 'Middle-order Batsman', batting_style: 'RHB', bowling_style: null, batting_avg: 45.3, strike_rate: 128.7, bowling_avg: null },
    { player_id: uuidv4(), name: 'Marnus Labuschagne', role: 'Middle-order Batsman', batting_style: 'RHB', bowling_style: null, batting_avg: 41.2, strike_rate: 122.1, bowling_avg: null },
    { player_id: uuidv4(), name: 'Glenn Maxwell', role: 'Middle-order Batsman', batting_style: 'RHB', bowling_style: null, batting_avg: 32.5, strike_rate: 145.3, bowling_avg: null },
    
    // Wicket-keeper
    { player_id: uuidv4(), name: 'Alex Carey', role: 'Wicket-keeper Batsman', batting_style: 'RHB', bowling_style: null, batting_avg: 29.8, strike_rate: 125.4, bowling_avg: null },
    
    // All-rounders
    { player_id: uuidv4(), name: 'Mitchell Marsh', role: 'All-rounder', batting_style: 'RHB', bowling_style: 'RF', batting_avg: 30.2, strike_rate: 135.6, bowling_avg: 31.5, bowling_strike_rate: 17.8 },
    { player_id: uuidv4(), name: 'Marcus Stoinis', role: 'All-rounder', batting_style: 'RHB', bowling_style: 'RFM', batting_avg: 28.9, strike_rate: 144.2, bowling_avg: 32.1, bowling_strike_rate: 18.3 },
    
    // Pace Bowlers
    { player_id: uuidv4(), name: 'Mitchell Starc', role: 'Pace Bowler', batting_style: 'LHB', bowling_style: 'RF', batting_avg: 11.7, strike_rate: 98.5, bowling_avg: 23.8, bowling_strike_rate: 15.3 },
    { player_id: uuidv4(), name: 'Josh Hazlewood', role: 'Pace Bowler', batting_style: 'RHB', bowling_style: 'RF', batting_avg: 9.2, strike_rate: 85.3, bowling_avg: 25.2, bowling_strike_rate: 16.7 },
    { player_id: uuidv4(), name: 'Pat Cummins', role: 'Pace Bowler', batting_style: 'RHB', bowling_style: 'RF', batting_avg: 13.4, strike_rate: 105.2, bowling_avg: 22.1, bowling_strike_rate: 14.8 },
    
    // Spin Bowlers
    { player_id: uuidv4(), name: 'Adam Zampa', role: 'Spin Bowler', batting_style: 'RHB', bowling_style: 'LB', batting_avg: 4.8, strike_rate: 62.3, bowling_avg: 24.5, bowling_strike_rate: 17.2 },
    { player_id: uuidv4(), name: 'Nathan Lyon', role: 'Spin Bowler', batting_style: 'RHB', bowling_style: 'OB', batting_avg: 6.3, strike_rate: 70.1, bowling_avg: 28.9, bowling_strike_rate: 19.6 },
  ];

  const australiaBatsmanPlayers = australiaPlayers.map(p => ({
    ...p,
    team_id: teamAustralia.team_id,
    jersey_number: Math.floor(Math.random() * 50) + 1,
    is_captain: p.name === 'David Warner',
    is_vice_captain: p.name === 'Steven Smith'
  }));

  const allPlayers = [...indiaBatsmanPlayers, ...australiaBatsmanPlayers];
  await knex('players').insert(allPlayers);

  // Insert career stats for all players
  const careerStats = allPlayers.map(p => ({
    stat_id: uuidv4(),
    player_id: p.player_id,
    batting_matches: Math.floor(Math.random() * 100) + 20,
    batting_innings: Math.floor(Math.random() * 100) + 15,
    batting_runs: Math.floor(Math.random() * 3000) + 500,
    batting_highest_score: Math.floor(Math.random() * 80) + 40,
    batting_average: p.batting_avg,
    batting_strike_rate: p.strike_rate,
    batting_centuries: p.role.includes('Bowler') ? 0 : Math.floor(Math.random() * 5),
    batting_fifties: p.role.includes('Bowler') ? 0 : Math.floor(Math.random() * 10),
    batting_fours: Math.floor(Math.random() * 200) + 30,
    batting_sixes: Math.floor(Math.random() * 100) + 10,
    bowling_matches: ['Pace Bowler', 'Spin Bowler', 'All-rounder'].includes(p.role) ? Math.floor(Math.random() * 80) + 10 : 0,
    bowling_innings: ['Pace Bowler', 'Spin Bowler', 'All-rounder'].includes(p.role) ? Math.floor(Math.random() * 80) + 8 : 0,
    bowling_wickets: ['Pace Bowler', 'Spin Bowler', 'All-rounder'].includes(p.role) ? Math.floor(Math.random() * 150) + 20 : 0,
    bowling_runs_conceded: ['Pace Bowler', 'Spin Bowler', 'All-rounder'].includes(p.role) ? Math.floor(Math.random() * 2000) + 300 : 0,
    bowling_average: ['Pace Bowler', 'Spin Bowler', 'All-rounder'].includes(p.role) ? p.bowling_avg : null,
    bowling_economy: ['Pace Bowler', 'Spin Bowler', 'All-rounder'].includes(p.role) ? (Math.random() * 3 + 6).toFixed(2) : null,
    bowling_strike_rate: ['Pace Bowler', 'Spin Bowler', 'All-rounder'].includes(p.role) ? p.bowling_strike_rate : null,
    bowling_maidens: ['Pace Bowler', 'Spin Bowler', 'All-rounder'].includes(p.role) ? Math.floor(Math.random() * 20) : 0
  }));

  await knex('career_stats').insert(careerStats);

  // ============================================================================
  // USERS (for authentication)
  // ============================================================================
  await knex('users').insert([
    {
      user_id: uuidv4(),
      username: 'scorer1',
      email: 'scorer@cricketapp.com',
      password_hash: '$2b$10$dummy_hash_needs_bcrypt',
      role: 'scorer',
      team_id: null,
      is_active: true
    },
    {
      user_id: uuidv4(),
      username: 'admin',
      email: 'admin@cricketapp.com',
      password_hash: '$2b$10$dummy_hash_needs_bcrypt',
      role: 'admin',
      team_id: null,
      is_active: true
    }
  ]);

  // ============================================================================
  // MATCH 1: COMPLETED T20 MATCH (India vs Australia, India won by 8 runs)
  // ============================================================================
  const match1 = {
    match_id: uuidv4(),
    format: 'T20',
    status: 'completed',
    team_home_id: teamIndia.team_id,
    team_away_id: teamAustralia.team_id,
    venue_name: 'Arun Jaitley Stadium',
    city: 'Delhi',
    country: 'India',
    toss_winner_id: teamIndia.team_id,
    toss_decision: 'bat',
    match_date: knex.raw("CURRENT_DATE - INTERVAL '5 days'"),
    match_time: '18:30',
    date_start: knex.raw("CURRENT_TIMESTAMP - INTERVAL '5 days'"),
    date_end: knex.raw("CURRENT_TIMESTAMP - INTERVAL '5 days' + INTERVAL '4 hours'"),
    result_status: 'India won by 8 runs',
    winning_team_id: teamIndia.team_id,
    margin_runs: 8,
    margin_wickets: null,
    man_of_the_match_id: indiaBatsmanPlayers[2].player_id // Virat Kohli
  };

  await knex('matches').insert(match1);

  // Innings 1 - India batting
  const innings1_id = uuidv4();
  const innings1 = {
    innings_id: innings1_id,
    match_id: match1.match_id,
    innings_number: 1,
    batting_team_id: teamIndia.team_id,
    bowling_team_id: teamAustralia.team_id,
    status: 'completed',
    total_runs: 168,
    total_wickets: 5,
    total_overs: 20,
    total_legal_deliveries: 120,
    extras_wides: 6,
    extras_no_balls: 2,
    extras_byes: 2,
    extras_leg_byes: 3,
    extras_penalty: 0,
    extras_total: 13,
    current_run_rate: 8.4,
    required_run_rate: null,
    target: null
  };

  await knex('innings').insert(innings1);

  // Batting lineup for India (Innings 1)
  const indiaBattingLineup = [
    { lineup_id: uuidv4(), innings_id: innings1_id, player_id: indiaBatsmanPlayers[0].player_id, batting_position: 1, runs_scored: 42, balls_faced: 31, fours: 3, sixes: 2, strike_rate: 135.5, dot_balls: 12, is_out: true, wicket_type: 'caught', dismissal_over: 6, dismissal_ball: 4, bowler_id: australiaBatsmanPlayers[8].player_id, fielder_id: australiaBatsmanPlayers[5].player_id },
    { lineup_id: uuidv4(), innings_id: innings1_id, player_id: indiaBatsmanPlayers[1].player_id, batting_position: 2, runs_scored: 28, balls_faced: 24, fours: 2, sixes: 1, strike_rate: 116.7, dot_balls: 14, is_out: false, wicket_type: null, dismissal_over: null, dismissal_ball: null, bowler_id: null, fielder_id: null },
    { lineup_id: uuidv4(), innings_id: innings1_id, player_id: indiaBatsmanPlayers[2].player_id, batting_position: 3, runs_scored: 55, balls_faced: 38, fours: 4, sixes: 2, strike_rate: 144.7, dot_balls: 18, is_out: true, wicket_type: 'bowled', dismissal_over: 15, dismissal_ball: 2, bowler_id: australiaBatsmanPlayers[9].player_id, fielder_id: null },
    { lineup_id: uuidv4(), innings_id: innings1_id, player_id: indiaBatsmanPlayers[3].player_id, batting_position: 4, runs_scored: 19, balls_faced: 14, fours: 1, sixes: 1, strike_rate: 135.7, dot_balls: 7, is_out: true, wicket_type: 'lbw', dismissal_over: 17, dismissal_ball: 3, bowler_id: australiaBatsmanPlayers[11].player_id, fielder_id: null },
    { lineup_id: uuidv4(), innings_id: innings1_id, player_id: indiaBatsmanPlayers[4].player_id, batting_position: 5, runs_scored: 12, balls_faced: 9, fours: 1, sixes: 0, strike_rate: 133.3, dot_balls: 6, is_out: false, wicket_type: null, dismissal_over: null, dismissal_ball: null, bowler_id: null, fielder_id: null },
    { lineup_id: uuidv4(), innings_id: innings1_id, player_id: indiaBatsmanPlayers[5].player_id, batting_position: 6, runs_scored: 8, balls_faced: 6, fours: 1, sixes: 0, strike_rate: 133.3, dot_balls: 3, is_out: true, wicket_type: 'run_out', dismissal_over: 18, dismissal_ball: 5, bowler_id: null, fielder_id: australiaBatsmanPlayers[5].player_id },
    { lineup_id: uuidv4(), innings_id: innings1_id, player_id: indiaBatsmanPlayers[6].player_id, batting_position: 7, runs_scored: 3, balls_faced: 2, fours: 0, sixes: 0, strike_rate: 150.0, dot_balls: 2, is_out: true, wicket_type: 'caught', dismissal_over: 19, dismissal_ball: 1, bowler_id: australiaBatsmanPlayers[10].player_id, fielder_id: australiaBatsmanPlayers[1].player_id },
    { lineup_id: uuidv4(), innings_id: innings1_id, player_id: indiaBatsmanPlayers[7].player_id, batting_position: 8, runs_scored: 1, balls_faced: 1, fours: 0, sixes: 0, strike_rate: 100.0, dot_balls: 1, is_out: false, wicket_type: null, dismissal_over: null, dismissal_ball: null, bowler_id: null, fielder_id: null },
    { lineup_id: uuidv4(), innings_id: innings1_id, player_id: indiaBatsmanPlayers[8].player_id, batting_position: 9, runs_scored: 0, balls_faced: 0, fours: 0, sixes: 0, strike_rate: 0, dot_balls: 0, is_out: false, wicket_type: null, dismissal_over: null, dismissal_ball: null, bowler_id: null, fielder_id: null },
    { lineup_id: uuidv4(), innings_id: innings1_id, player_id: indiaBatsmanPlayers[9].player_id, batting_position: 10, runs_scored: 0, balls_faced: 0, fours: 0, sixes: 0, strike_rate: 0, dot_balls: 0, is_out: false, wicket_type: null, dismissal_over: null, dismissal_ball: null, bowler_id: null, fielder_id: null },
    { lineup_id: uuidv4(), innings_id: innings1_id, player_id: indiaBatsmanPlayers[10].player_id, batting_position: 11, runs_scored: 0, balls_faced: 0, fours: 0, sixes: 0, strike_rate: 0, dot_balls: 0, is_out: false, wicket_type: null, dismissal_over: null, dismissal_ball: null, bowler_id: null, fielder_id: null }
  ];

  await knex('batting_lineup').insert(indiaBattingLineup);

  // Bowling lineup for Australia (Innings 1)
  const australiaBowlingLineup = [
    { lineup_id: uuidv4(), innings_id: innings1_id, player_id: australiaBatsmanPlayers[8].player_id, overs_bowled: 4, legal_deliveries: 24, maidens: 0, runs_conceded: 35, wickets: 1, economy: 8.75, strike_rate: 24, dots: 8, fours_conceded: 2, sixes_conceded: 1, last_over_bowled: 6 },
    { lineup_id: uuidv4(), innings_id: innings1_id, player_id: australiaBatsmanPlayers[9].player_id, overs_bowled: 4, legal_deliveries: 24, maidens: 1, runs_conceded: 32, wickets: 1, economy: 8.0, strike_rate: 24, dots: 10, fours_conceded: 2, sixes_conceded: 0, last_over_bowled: 15 },
    { lineup_id: uuidv4(), innings_id: innings1_id, player_id: australiaBatsmanPlayers[10].player_id, overs_bowled: 4, legal_deliveries: 24, maidens: 1, runs_conceded: 28, wickets: 1, economy: 7.0, strike_rate: 24, dots: 11, fours_conceded: 1, sixes_conceded: 0, last_over_bowled: 19 },
    { lineup_id: uuidv4(), innings_id: innings1_id, player_id: australiaBatsmanPlayers[11].player_id, overs_bowled: 4, legal_deliveries: 24, maidens: 2, runs_conceded: 26, wickets: 1, economy: 6.5, strike_rate: 24, dots: 13, fours_conceded: 0, sixes_conceded: 0, last_over_bowled: 17 },
    { lineup_id: uuidv4(), innings_id: innings1_id, player_id: australiaBatsmanPlayers[6].player_id, overs_bowled: 4, legal_deliveries: 24, maidens: 0, runs_conceded: 47, wickets: 1, economy: 11.75, strike_rate: 24, dots: 6, fours_conceded: 3, sixes_conceded: 2, last_over_bowled: 18 }
  ];

  await knex('bowling_lineup').insert(australiaBowlingLineup);

  // ============================================================================
  // MATCH 2: LIVE T20 MATCH (India vs Australia, In Progress - 8.3 overs)
  // ============================================================================
  const match2 = {
    match_id: uuidv4(),
    format: 'T20',
    status: 'live',
    team_home_id: teamAustralia.team_id,
    team_away_id: teamIndia.team_id,
    venue_name: 'MCG',
    city: 'Melbourne',
    country: 'Australia',
    toss_winner_id: teamAustralia.team_id,
    toss_decision: 'field',
    match_date: knex.raw("CURRENT_DATE"),
    match_time: '14:30',
    date_start: knex.raw("CURRENT_TIMESTAMP - INTERVAL '2 hours'"),
    date_end: null,
    result_status: null,
    winning_team_id: null,
    margin_runs: null,
    margin_wickets: null,
    man_of_the_match_id: null
  };

  await knex('matches').insert(match2);

  // Innings 1 - Australia batting (live)
  const innings2_id = uuidv4();
  const innings2 = {
    innings_id: innings2_id,
    match_id: match2.match_id,
    innings_number: 1,
    batting_team_id: teamAustralia.team_id,
    bowling_team_id: teamIndia.team_id,
    status: 'live',
    total_runs: 68,
    total_wickets: 2,
    total_overs: 8,
    total_legal_deliveries: 50,
    extras_wides: 2,
    extras_no_balls: 1,
    extras_byes: 1,
    extras_leg_byes: 1,
    extras_penalty: 0,
    extras_total: 5,
    current_run_rate: 8.5,
    required_run_rate: null,
    target: null
  };

  await knex('innings').insert(innings2);

  // Batting lineup for Australia (Innings 2 - Live)
  const australiaBattingLineup = [
    { lineup_id: uuidv4(), innings_id: innings2_id, player_id: australiaBatsmanPlayers[0].player_id, batting_position: 1, runs_scored: 24, balls_faced: 18, fours: 2, sixes: 1, strike_rate: 133.3, dot_balls: 8, is_out: false, wicket_type: null, dismissal_over: null, dismissal_ball: null, bowler_id: null, fielder_id: null },
    { lineup_id: uuidv4(), innings_id: innings2_id, player_id: australiaBatsmanPlayers[1].player_id, batting_position: 2, runs_scored: 18, balls_faced: 15, fours: 1, sixes: 1, strike_rate: 120.0, dot_balls: 8, is_out: true, wicket_type: 'caught', dismissal_over: 5, dismissal_ball: 2, bowler_id: indiaBatsmanPlayers[8].player_id, fielder_id: indiaBatsmanPlayers[4].player_id },
    { lineup_id: uuidv4(), innings_id: innings2_id, player_id: australiaBatsmanPlayers[2].player_id, batting_position: 3, runs_scored: 12, balls_faced: 10, fours: 1, sixes: 0, strike_rate: 120.0, dot_balls: 6, is_out: false, wicket_type: null, dismissal_over: null, dismissal_ball: null, bowler_id: null, fielder_id: null },
    { lineup_id: uuidv4(), innings_id: innings2_id, player_id: australiaBatsmanPlayers[3].player_id, batting_position: 4, runs_scored: 7, balls_faced: 5, fours: 0, sixes: 0, strike_rate: 140.0, dot_balls: 3, is_out: true, wicket_type: 'lbw', dismissal_over: 7, dismissal_ball: 4, bowler_id: indiaBatsmanPlayers[7].player_id, fielder_id: null },
    { lineup_id: uuidv4(), innings_id: innings2_id, player_id: australiaBatsmanPlayers[4].player_id, batting_position: 5, runs_scored: 5, balls_faced: 4, fours: 0, sixes: 0, strike_rate: 125.0, dot_balls: 3, is_out: false, wicket_type: null, dismissal_over: null, dismissal_ball: null, bowler_id: null, fielder_id: null },
    { lineup_id: uuidv4(), innings_id: innings2_id, player_id: australiaBatsmanPlayers[5].player_id, batting_position: 6, runs_scored: 2, balls_faced: 1, fours: 0, sixes: 0, strike_rate: 200.0, dot_balls: 0, is_out: false, wicket_type: null, dismissal_over: null, dismissal_ball: null, bowler_id: null, fielder_id: null },
    { lineup_id: uuidv4(), innings_id: innings2_id, player_id: australiaBatsmanPlayers[6].player_id, batting_position: 7, runs_scored: 0, balls_faced: 0, fours: 0, sixes: 0, strike_rate: 0, dot_balls: 0, is_out: false, wicket_type: null, dismissal_over: null, dismissal_ball: null, bowler_id: null, fielder_id: null },
    { lineup_id: uuidv4(), innings_id: innings2_id, player_id: australiaBatsmanPlayers[7].player_id, batting_position: 8, runs_scored: 0, balls_faced: 0, fours: 0, sixes: 0, strike_rate: 0, dot_balls: 0, is_out: false, wicket_type: null, dismissal_over: null, dismissal_ball: null, bowler_id: null, fielder_id: null },
    { lineup_id: uuidv4(), innings_id: innings2_id, player_id: australiaBatsmanPlayers[8].player_id, batting_position: 9, runs_scored: 0, balls_faced: 0, fours: 0, sixes: 0, strike_rate: 0, dot_balls: 0, is_out: false, wicket_type: null, dismissal_over: null, dismissal_ball: null, bowler_id: null, fielder_id: null },
    { lineup_id: uuidv4(), innings_id: innings2_id, player_id: australiaBatsmanPlayers[9].player_id, batting_position: 10, runs_scored: 0, balls_faced: 0, fours: 0, sixes: 0, strike_rate: 0, dot_balls: 0, is_out: false, wicket_type: null, dismissal_over: null, dismissal_ball: null, bowler_id: null, fielder_id: null },
    { lineup_id: uuidv4(), innings_id: innings2_id, player_id: australiaBatsmanPlayers[10].player_id, batting_position: 11, runs_scored: 0, balls_faced: 0, fours: 0, sixes: 0, strike_rate: 0, dot_balls: 0, is_out: false, wicket_type: null, dismissal_over: null, dismissal_ball: null, bowler_id: null, fielder_id: null }
  ];

  await knex('batting_lineup').insert(australiaBattingLineup);

  // Bowling lineup for India (Innings 2 - Live)
  const indiaBowlingLineup = [
    { lineup_id: uuidv4(), innings_id: innings2_id, player_id: indiaBatsmanPlayers[8].player_id, overs_bowled: 2, legal_deliveries: 12, maidens: 0, runs_conceded: 14, wickets: 1, economy: 7.0, strike_rate: 12, dots: 4, fours_conceded: 1, sixes_conceded: 0, last_over_bowled: 5 },
    { lineup_id: uuidv4(), innings_id: innings2_id, player_id: indiaBatsmanPlayers[9].player_id, overs_bowled: 2, legal_deliveries: 12, maidens: 0, runs_conceded: 18, wickets: 0, economy: 9.0, strike_rate: 0, dots: 3, fours_conceded: 2, sixes_conceded: 0, last_over_bowled: 8 },
    { lineup_id: uuidv4(), innings_id: innings2_id, player_id: indiaBatsmanPlayers[7].player_id, overs_bowled: 2, legal_deliveries: 12, maidens: 1, runs_conceded: 13, wickets: 1, economy: 6.5, strike_rate: 12, dots: 6, fours_conceded: 0, sixes_conceded: 0, last_over_bowled: 7 },
    { lineup_id: uuidv4(), innings_id: innings2_id, player_id: indiaBatsmanPlayers[11].player_id, overs_bowled: 1.3, legal_deliveries: 8, maidens: 1, runs_conceded: 9, wickets: 0, economy: 5.4, strike_rate: 0, dots: 5, fours_conceded: 0, sixes_conceded: 0, last_over_bowled: 8 },
    { lineup_id: uuidv4(), innings_id: innings2_id, player_id: indiaBatsmanPlayers[10].player_id, overs_bowled: 1, legal_deliveries: 6, maidens: 0, runs_conceded: 14, wickets: 0, economy: 14.0, strike_rate: 0, dots: 1, fours_conceded: 2, sixes_conceded: 0, last_over_bowled: 3 }
  ];

  await knex('bowling_lineup').insert(indiaBowlingLineup);

  console.log('✓ Seed data inserted successfully:');
  console.log('  - 2 Teams (India, Australia)');
  console.log('  - 26 Players (13 per team)');
  console.log('  - 2 Matches (1 completed, 1 live)');
  console.log('  - Career stats for all players');
};
