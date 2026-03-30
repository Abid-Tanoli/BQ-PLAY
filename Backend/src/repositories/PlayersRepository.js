/**
 * Repository Layer - Players
 * CRUD and query operations for players and career stats
 */

const { getDB } = require('../utils/db');

class PlayersRepository {
  /**
   * Find all players
   */
  static async findAll(filters = {}) {
    const db = getDB();
    let query = db('players').join('career_stats', 'players.player_id', 'career_stats.player_id')
      .select(
        'players.*',
        'career_stats.batting_average',
        'career_stats.batting_strike_rate',
        'career_stats.batting_runs',
        'career_stats.batting_centuries',
        'career_stats.batting_fifties',
        'career_stats.bowling_average',
        'career_stats.bowling_economy',
        'career_stats.bowling_strike_rate',
        'career_stats.bowling_wickets'
      );

    if (filters.teamId) query = query.where('players.team_id', filters.teamId);
    if (filters.role) query = query.where('players.role', filters.role);
    if (filters.isActive !== undefined) query = query.where('players.is_captain', filters.isActive);

    return await query;
  }

  /**
   * Find player by ID
   */
  static async findById(playerId) {
    const db = getDB();
    const player = await db('players').where({ player_id: playerId }).first();
    if (!player) return null;

    const stats = await db('career_stats').where({ player_id: playerId }).first();
    return { ...player, stats };
  }

  /**
   * Find player with all career data
   */
  static async findWithStats(playerId) {
    const db = getDB();
    const player = await db('players').where({ player_id: playerId }).first();
    if (!player) return null;

    const stats = await db('career_stats').where({ player_id: playerId }).first();
    return { ...player, ...stats };
  }

  /**
   * Create player
   */
  static async create(playerData) {
    const db = getDB();
    const [playerId] = await db('players').insert(playerData).returning('player_id');
    
    // Create career stats record
    await db('career_stats').insert({
      stat_id: require('uuid').v4(),
      player_id: playerId,
      batting_matches: 0,
      bowling_matches: 0
    });

    return await this.findById(playerId);
  }

  /**
   * Update player
   */
  static async update(playerId, updates) {
    const db = getDB();
    await db('players').where({ player_id: playerId }).update({
      ...updates,
      updated_at: db.fn.now()
    });
    return await this.findById(playerId);
  }

  /**
   * Update career stats
   */
  static async updateStats(playerId, statUpdates) {
    const db = getDB();
    await db('career_stats').where({ player_id: playerId }).update({
      ...statUpdates,
      updated_at: db.fn.now()
    });
    return await this.findWithStats(playerId);
  }

  /**
   * Get players by role
   */
  static async getByRole(teamId, role) {
    const db = getDB();
    return await db('players')
      .where({ team_id: teamId, role })
      .join('career_stats', 'players.player_id', 'career_stats.player_id')
      .select('players.*', 'career_stats.batting_average', 'career_stats.bowling_average');
  }

  /**
   * Get all bowlers in team
   */
  static async getBowlers(teamId) {
    const db = getDB();
    return await db('players')
      .where('team_id', teamId)
      .whereIn('role', ['Pace Bowler', 'Spin Bowler', 'All-rounder'])
      .join('career_stats', 'players.player_id', 'career_stats.player_id')
      .select('players.*', 'career_stats.bowling_economy', 'career_stats.bowling_strike_rate');
  }

  /**
   * Get all batsmen in team
   */
  static async getBatsmen(teamId) {
    const db = getDB();
    return await db('players')
      .where('team_id', teamId)
      .whereIn('role', ['Top-order Batsman', 'Middle-order Batsman', 'Wicket-keeper Batsman', 'All-rounder'])
      .join('career_stats', 'players.player_id', 'career_stats.player_id')
      .select('players.*', 'career_stats.batting_average', 'career_stats.batting_strike_rate');
  }

  /**
   * Get wicket-keeper
   */
  static async getWicketKeeper(teamId) {
    const db = getDB();
    return await db('players')
      .where({ team_id: teamId, role: 'Wicket-keeper Batsman' })
      .first();
  }

  /**
   * Get player performance vs opponent
   */
  static async vsOpponent(playerId, opponentTeamId) {
    const db = getDB();
    return await db('balls')
      .join('innings', 'balls.innings_id', 'innings.innings_id')
      .join('matches', 'innings.match_id', 'matches.match_id')
      .where('balls.batsman_on_strike_id', playerId)
      .andWhere(function() {
        this.where('matches.team_home_id', opponentTeamId)
          .orWhere('matches.team_away_id', opponentTeamId);
      })
      .groupBy('matches.match_id')
      .select(
        'matches.match_id',
        db.raw('SUM(balls.runs_off_bat) as runs'),
        db.raw('COUNT(*) as balls'),
        db.raw('SUM(CASE WHEN balls.runs_off_bat = 4 THEN 1 ELSE 0 END) as fours'),
        db.raw('SUM(CASE WHEN balls.runs_off_bat = 6 THEN 1 ELSE 0 END) as sixes')
      );
  }

  /**
   * Delete player
   */
  static async delete(playerId) {
    const db = getDB();
    return await db('players').where({ player_id: playerId }).delete();
  }
}

module.exports = PlayersRepository;
