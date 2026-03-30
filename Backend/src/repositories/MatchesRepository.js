/**
 * Repository Layer - Matches
 * CRUD and query operations for matches and innings
 */

const { getDB } = require('../utils/db');

class MatchesRepository {
  /**
   * Get all matches
   */
  static async findAll(filters = {}) {
    const db = getDB();
    let query = db('matches')
      .join('teams as home', 'matches.team_home_id', 'home.team_id')
      .join('teams as away', 'matches.team_away_id', 'away.team_id')
      .select(
        'matches.*',
        db.raw('home.name as home_team_name, home.short_code as home_team_code'),
        db.raw('away.name as away_team_name, away.short_code as away_team_code')
      );

    if (filters.status) query = query.where('matches.status', filters.status);
    if (filters.format) query = query.where('matches.format', filters.format);

    return await query.orderBy('matches.match_date', 'DESC');
  }

  /**
   * Find match by ID
   */
  static async findById(matchId) {
    const db = getDB();
    return await db('matches').where({ match_id: matchId }).first();
  }

  /**
   * Find match with full details
   */
  static async findFullMatch(matchId) {
    const db = getDB();
    const match = await this.findById(matchId);
    if (!match) return null;

    const innings = await db('innings').where({ match_id: matchId });
    const inningsDetails = await Promise.all(
      innings.map(async (inning) => {
        const batting = await db('batting_lineup').where({ innings_id: inning.innings_id });
        const bowling = await db('bowling_lineup').where({ innings_id: inning.innings_id });
        const balls = await db('balls').where({ innings_id: inning.innings_id });
        return { ...inning, batting, bowling, balls };
      })
    );

    return { ...match, innings: inningsDetails };
  }

  /**
   * Create match
   */
  static async create(matchData) {
    const db = getDB();
    const [matchId] = await db('matches').insert(matchData).returning('match_id');
    return await this.findById(matchId);
  }

  /**
   * Update match
   */
  static async update(matchId, updates) {
    const db = getDB();
    await db('matches').where({ match_id: matchId }).update({
      ...updates,
      updated_at: db.fn.now()
    });
    return await this.findById(matchId);
  }

  /**
   * Get innings
   */
  static async getInnings(matchId, inningsNumber) {
    const db = getDB();
    return await db('innings')
      .where({ match_id: matchId, innings_number: inningsNumber })
      .first();
  }

  /**
   * Get all innings for a match
   */
  static async getAllInnings(matchId) {
    const db = getDB();
    return await db('innings').where({ match_id: matchId });
  }

  /**
   * Create innings
   */
  static async createInnings(inningsData) {
    const db = getDB();
    const [inningsId] = await db('innings').insert(inningsData).returning('innings_id');
    return await db('innings').where({ innings_id: inningsId }).first();
  }

  /**
   * Update innings
   */
  static async updateInnings(inningsId, updates) {
    const db = getDB();
    await db('innings').where({ innings_id: inningsId }).update({
      ...updates,
      updated_at: db.fn.now()
    });
    return await db('innings').where({ innings_id: inningsId }).first();
  }

  /**
   * Get batting lineup for innings
   */
  static async getBattingLineup(inningsId) {
    const db = getDB();
    return await db('batting_lineup')
      .where({ innings_id: inningsId })
      .join('players', 'batting_lineup.player_id', 'players.player_id')
      .select('batting_lineup.*', 'players.name as player_name')
      .orderBy('batting_lineup.batting_position');
  }

  /**
   * Get bowling lineup for innings
   */
  static async getBowlingLineup(inningsId) {
    const db = getDB();
    return await db('bowling_lineup')
      .where({ innings_id: inningsId })
      .join('players', 'bowling_lineup.player_id', 'players.player_id')
      .select('bowling_lineup.*', 'players.name as player_name');
  }

  /**
   * Get all balls in innings
   */
  static async getBalls(inningsId, overNumber = null) {
    const db = getDB();
    let query = db('balls').where({ innings_id: inningsId });

    if (overNumber !== null) {
      query = query.where({ over_number: overNumber });
    }

    return await query.orderBy('ball_sequence');
  }

  /**
   * Get fall of wickets
   */
  static async getFallOfWickets(inningsId) {
    const db = getDB();
    return await db('fall_of_wickets')
      .where({ innings_id: inningsId })
      .orderBy('wicket_number');
  }

  /**
   * Get active matches
   */
  static async getActive() {
    const db = getDB();
    return await db('matches').where({ status: 'live' });
  }

  /**
   * Get recent matches
   */
  static async getRecent(limit = 10) {
    const db = getDB();
    return await db('matches')
      .where({ status: 'completed' })
      .orderBy('match_date', 'DESC')
      .limit(limit);
  }

  /**
   * Delete match (cascades to innings, balls, etc.)
   */
  static async delete(matchId) {
    const db = getDB();
    return await db('matches').where({ match_id: matchId }).delete();
  }
}

module.exports = MatchesRepository;
