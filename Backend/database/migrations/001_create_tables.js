/**
 * Migration: 001_create_tables
 * Creates full schema for BQ-PLAY cricket scoring application
 * PostgreSQL with T20/ODI support
 */

exports.up = async function(knex) {
  // Teams
  await knex.schema.createTable('teams', (table) => {
    table.uuid('team_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 100).notNullable().unique();
    table.string('short_code', 3).notNullable().unique();
    table.string('country', 100).notNullable();
    table.text('flag_url').nullable();
    table.string('home_ground', 100).nullable();
    table.timestamps(true, true);
  });

  // Players
  await knex.schema.createTable('players', (table) => {
    table.uuid('player_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('team_id').notNullable().references('team_id').inTable('teams').onDelete('CASCADE');
    table.string('name', 100).notNullable();
    table.string('country', 100).notNullable();
    table.date('date_of_birth').nullable();
    table.enum('role', [
      'Top-order Batsman',
      'Middle-order Batsman',
      'Wicket-keeper Batsman',
      'All-rounder',
      'Pace Bowler',
      'Spin Bowler'
    ]).notNullable();
    table.enum('batting_style', ['RHB', 'LHB']).notNullable();
    table.enum('bowling_style', ['RF', 'RFM', 'RM', 'OB', 'LB', 'SLA', 'LSM']).nullable();
    table.text('profile_image_url').nullable();
    table.integer('jersey_number').nullable();
    table.boolean('is_captain').defaultTo(false);
    table.boolean('is_vice_captain').defaultTo(false);
    table.timestamps(true, true);
    table.index(['team_id']);
    table.index(['role']);
  });

  // Career Stats
  await knex.schema.createTable('career_stats', (table) => {
    table.uuid('stat_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('player_id').notNullable().unique().references('player_id').inTable('players').onDelete('CASCADE');
    
    // Batting stats
    table.integer('batting_matches').defaultTo(0);
    table.integer('batting_innings').defaultTo(0);
    table.integer('batting_runs').defaultTo(0);
    table.integer('batting_highest_score').defaultTo(0);
    table.decimal('batting_average', 6, 2).defaultTo(0);
    table.decimal('batting_strike_rate', 6, 2).defaultTo(0);
    table.integer('batting_centuries').defaultTo(0);
    table.integer('batting_fifties').defaultTo(0);
    table.integer('batting_fours').defaultTo(0);
    table.integer('batting_sixes').defaultTo(0);
    table.integer('batting_dots').defaultTo(0);
    
    // Bowling stats
    table.integer('bowling_matches').defaultTo(0);
    table.integer('bowling_innings').defaultTo(0);
    table.integer('bowling_wickets').defaultTo(0);
    table.integer('bowling_runs_conceded').defaultTo(0);
    table.decimal('bowling_average', 6, 2).defaultTo(0);
    table.decimal('bowling_economy', 6, 2).defaultTo(0);
    table.decimal('bowling_strike_rate', 6, 2).defaultTo(0);
    table.string('bowling_best_analysis', 10).nullable();
    table.integer('bowling_maidens').defaultTo(0);
    
    table.timestamp('updated_at').defaultTo(knex.fn.now()).alter();
    table.index(['player_id']);
  });

  // Matches
  await knex.schema.createTable('matches', (table) => {
    table.uuid('match_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.enum('format', ['T20', 'ODI', 'Test']).notNullable();
    table.enum('status', ['upcoming', 'live', 'completed']).notNullable();
    table.uuid('team_home_id').notNullable().references('team_id').inTable('teams');
    table.uuid('team_away_id').notNullable().references('team_id').inTable('teams');
    table.string('venue_name', 150).nullable();
    table.string('city', 100).nullable();
    table.string('country', 100).nullable();
    table.uuid('toss_winner_id').nullable().references('team_id').inTable('teams');
    table.enum('toss_decision', ['bat', 'field']).nullable();
    table.date('match_date').notNullable();
    table.time('match_time').nullable();
    table.timestamp('date_start').nullable();
    table.timestamp('date_end').nullable();
    table.string('result_status', 50).nullable();
    table.uuid('winning_team_id').nullable().references('team_id').inTable('teams');
    table.integer('margin_runs').nullable();
    table.integer('margin_wickets').nullable();
    table.uuid('man_of_the_match_id').nullable().references('player_id').inTable('players');
    table.timestamps(true, true);
    table.index(['status']);
    table.index(['format']);
    table.index(['team_home_id', 'team_away_id']);
    table.index(['match_date']);
  });

  // Innings
  await knex.schema.createTable('innings', (table) => {
    table.uuid('innings_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('match_id').notNullable().references('match_id').inTable('matches').onDelete('CASCADE');
    table.integer('innings_number').notNullable();
    table.uuid('batting_team_id').notNullable().references('team_id').inTable('teams');
    table.uuid('bowling_team_id').notNullable().references('team_id').inTable('teams');
    table.enum('status', ['upcoming', 'live', 'completed']).notNullable();
    table.integer('total_runs').defaultTo(0);
    table.integer('total_wickets').defaultTo(0);
    table.integer('total_overs').defaultTo(0);
    table.integer('total_legal_deliveries').defaultTo(0);
    table.integer('extras_wides').defaultTo(0);
    table.integer('extras_no_balls').defaultTo(0);
    table.integer('extras_byes').defaultTo(0);
    table.integer('extras_leg_byes').defaultTo(0);
    table.integer('extras_penalty').defaultTo(0);
    table.integer('extras_total').defaultTo(0);
    table.decimal('current_run_rate', 6, 2).defaultTo(0);
    table.decimal('required_run_rate', 6, 2).nullable();
    table.decimal('win_probability', 5, 2).nullable();
    table.integer('target').nullable();
    table.timestamps(true, true);
    table.unique(['match_id', 'innings_number']);
    table.index(['match_id']);
    table.index(['status']);
    table.index(['batting_team_id', 'bowling_team_id']);
  });

  // Batting Lineup
  await knex.schema.createTable('batting_lineup', (table) => {
    table.uuid('lineup_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('innings_id').notNullable().references('innings_id').inTable('innings').onDelete('CASCADE');
    table.uuid('player_id').notNullable().references('player_id').inTable('players');
    table.integer('batting_position').notNullable();
    table.integer('runs_scored').defaultTo(0);
    table.integer('balls_faced').defaultTo(0);
    table.integer('fours').defaultTo(0);
    table.integer('sixes').defaultTo(0);
    table.decimal('strike_rate', 6, 2).defaultTo(0);
    table.integer('dot_balls').defaultTo(0);
    table.boolean('is_out').defaultTo(false);
    table.enum('wicket_type', [
      'bowled', 'caught', 'lbw', 'run_out', 'stumped',
      'hit_wicket', 'retired_hurt', 'obstructing_field'
    ]).nullable();
    table.integer('dismissal_over').nullable();
    table.integer('dismissal_ball').nullable();
    table.uuid('bowler_id').nullable().references('player_id').inTable('players');
    table.uuid('fielder_id').nullable().references('player_id').inTable('players');
    table.text('how_out_description').nullable();
    table.timestamps(true, true);
    table.unique(['innings_id', 'player_id']);
    table.index(['innings_id']);
    table.index(['player_id']);
    table.index(['batting_position']);
  });

  // Bowling Lineup
  await knex.schema.createTable('bowling_lineup', (table) => {
    table.uuid('lineup_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('innings_id').notNullable().references('innings_id').inTable('innings').onDelete('CASCADE');
    table.uuid('player_id').notNullable().references('player_id').inTable('players');
    table.integer('overs_bowled').defaultTo(0);
    table.integer('legal_deliveries').defaultTo(0);
    table.integer('maidens').defaultTo(0);
    table.integer('runs_conceded').defaultTo(0);
    table.integer('wickets').defaultTo(0);
    table.decimal('economy', 6, 2).defaultTo(0);
    table.decimal('strike_rate', 6, 2).defaultTo(0);
    table.integer('dots').defaultTo(0);
    table.integer('fours_conceded').defaultTo(0);
    table.integer('sixes_conceded').defaultTo(0);
    table.integer('last_over_bowled').nullable();
    table.timestamps(true, true);
    table.unique(['innings_id', 'player_id']);
    table.index(['innings_id']);
    table.index(['player_id']);
  });

  // Balls
  await knex.schema.createTable('balls', (table) => {
    table.uuid('ball_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('match_id').notNullable().references('match_id').inTable('matches').onDelete('CASCADE');
    table.uuid('innings_id').notNullable().references('innings_id').inTable('innings').onDelete('CASCADE');
    table.integer('over_number').notNullable();
    table.integer('ball_in_over').notNullable();
    table.integer('ball_sequence').notNullable();
    table.uuid('bowler_id').notNullable().references('player_id').inTable('players');
    table.uuid('batsman_on_strike_id').notNullable().references('player_id').inTable('players');
    table.uuid('non_striker_id').notNullable().references('player_id').inTable('players');
    table.integer('runs_off_bat').defaultTo(0);
    table.boolean('is_wide').defaultTo(false);
    table.boolean('is_no_ball').defaultTo(false);
    table.boolean('is_bye').defaultTo(false);
    table.boolean('is_leg_bye').defaultTo(false);
    table.boolean('is_free_hit').defaultTo(false);
    table.integer('total_runs').defaultTo(0);
    table.boolean('is_wicket').defaultTo(false);
    table.enum('wicket_type', [
      'bowled', 'caught', 'lbw', 'run_out', 'stumped',
      'hit_wicket', 'retired_hurt', 'obstructing_field'
    ]).nullable();
    table.uuid('dismissed_player_id').nullable().references('player_id').inTable('players');
    table.uuid('fielder_id').nullable().references('player_id').inTable('players');
    table.string('shot_type', 50).nullable();
    table.string('batting_zone', 20).nullable();
    table.text('commentary').nullable();
    table.timestamp('ball_timestamp').defaultTo(knex.fn.now());
    table.timestamps(true, true);
    table.index(['match_id']);
    table.index(['innings_id']);
    table.index(['over_number']);
    table.index(['bowler_id']);
    table.index(['batsman_on_strike_id']);
    table.index(['ball_sequence']);
  });

  // Fall of Wickets
  await knex.schema.createTable('fall_of_wickets', (table) => {
    table.uuid('fow_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('innings_id').notNullable().references('innings_id').inTable('innings').onDelete('CASCADE');
    table.integer('wicket_number').notNullable();
    table.uuid('dismissed_player_id').notNullable().references('player_id').inTable('players');
    table.uuid('bowler_id').nullable().references('player_id').inTable('players');
    table.uuid('fielder_id').nullable().references('player_id').inTable('players');
    table.integer('runs_at_fall').notNullable();
    table.integer('overs_at_fall').notNullable();
    table.integer('ball_at_fall').notNullable();
    table.string('wicket_type', 30).nullable();
    table.integer('runs_in_partnership').nullable();
    table.integer('balls_in_partnership').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.unique(['innings_id', 'wicket_number']);
    table.index(['innings_id']);
  });

  // Partnerships
  await knex.schema.createTable('partnerships', (table) => {
    table.uuid('partnership_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('innings_id').notNullable().references('innings_id').inTable('innings').onDelete('CASCADE');
    table.uuid('batsman_1_id').notNullable().references('player_id').inTable('players');
    table.uuid('batsman_2_id').notNullable().references('player_id').inTable('players');
    table.integer('partnership_number').notNullable();
    table.integer('partnership_runs').defaultTo(0);
    table.integer('partnership_balls').defaultTo(0);
    table.decimal('partnership_run_rate', 6, 2).defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    table.index(['innings_id']);
  });

  // Over Summaries
  await knex.schema.createTable('over_summaries', (table) => {
    table.uuid('over_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('innings_id').notNullable().references('innings_id').inTable('innings').onDelete('CASCADE');
    table.integer('over_number').notNullable();
    table.uuid('bowler_id').notNullable().references('player_id').inTable('players');
    table.integer('legal_deliveries').defaultTo(0);
    table.integer('wides').defaultTo(0);
    table.integer('no_balls').defaultTo(0);
    table.integer('runs').defaultTo(0);
    table.integer('wickets').defaultTo(0);
    table.boolean('maiden').defaultTo(false);
    table.integer('cumulative_runs').nullable();
    table.integer('cumulative_wickets').nullable();
    table.timestamps(true, true);
    table.unique(['innings_id', 'over_number']);
    table.index(['innings_id']);
    table.index(['over_number']);
  });

  // Worm Graph
  await knex.schema.createTable('worm_graph', (table) => {
    table.uuid('worm_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('match_id').notNullable().references('match_id').inTable('matches').onDelete('CASCADE');
    table.integer('innings_number').notNullable();
    table.integer('over_number').notNullable();
    table.integer('cumulative_runs').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.unique(['match_id', 'innings_number', 'over_number']);
    table.index(['match_id']);
  });

  // Win Probability
  await knex.schema.createTable('win_probability', (table) => {
    table.uuid('wp_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('match_id').notNullable().references('match_id').inTable('matches').onDelete('CASCADE');
    table.uuid('batting_team_id').notNullable().references('team_id').inTable('teams');
    table.decimal('win_probability', 5, 2).notNullable();
    table.integer('over_number').nullable();
    table.integer('ball_number').nullable();
    table.timestamp('recorded_at').defaultTo(knex.fn.now());
    table.index(['match_id']);
    table.index(['recorded_at']);
  });

  // Users
  await knex.schema.createTable('users', (table) => {
    table.uuid('user_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('username', 100).notNullable().unique();
    table.string('email', 150).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.enum('role', ['viewer', 'scorer', 'admin']).notNullable();
    table.uuid('team_id').nullable().references('team_id').inTable('teams');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    table.index(['email']);
    table.index(['role']);
  });

  // Audit Logs
  await knex.schema.createTable('audit_logs', (table) => {
    table.uuid('log_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').nullable().references('user_id').inTable('users');
    table.string('action', 100).notNullable();
    table.string('entity_type', 50).nullable();
    table.uuid('entity_id').nullable();
    table.jsonb('changes').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index(['user_id']);
    table.index(['entity_type', 'entity_id']);
    table.index(['created_at']);
  });

  console.log('✓ All tables created successfully');
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('audit_logs');
  await knex.schema.dropTableIfExists('win_probability');
  await knex.schema.dropTableIfExists('worm_graph');
  await knex.schema.dropTableIfExists('over_summaries');
  await knex.schema.dropTableIfExists('partnerships');
  await knex.schema.dropTableIfExists('fall_of_wickets');
  await knex.schema.dropTableIfExists('balls');
  await knex.schema.dropTableIfExists('bowling_lineup');
  await knex.schema.dropTableIfExists('batting_lineup');
  await knex.schema.dropTableIfExists('innings');
  await knex.schema.dropTableIfExists('matches');
  await knex.schema.dropTableIfExists('career_stats');
  await knex.schema.dropTableIfExists('players');
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('teams');
  
  console.log('✓ All tables dropped successfully');
};
