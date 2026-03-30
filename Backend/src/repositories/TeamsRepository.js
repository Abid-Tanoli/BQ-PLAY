/**
 * Repository Layer - Teams
 * CRUD and query operations for teams
 */

const { getDB } = require('../utils/db');

class TeamsRepository {
  /**
   * Find all teams
   */
  static async findAll() {
    const db = getDB();
    return await db('teams').select('*');
  }

  /**
   * Find team by ID
   */
  static async findById(teamId) {
    const db = getDB();
    return await db('teams').where({ team_id: teamId }).first();
  }

  /**
   * Find team with players
   */
  static async findWithPlayers(teamId) {
    const db = getDB();
    const team = await db('teams').where({ team_id: teamId }).first();
    if (!team) return null;

    const players = await db('players').where({ team_id: teamId });
    return { ...team, players };
  }

  /**
   * Find team by short code
   */
  static async findByShortCode(shortCode) {
    const db = getDB();
    return await db('teams').where({ short_code: shortCode }).first();
  }

  /**
   * Create team
   */
  static async create(teamData) {
    const db = getDB();
    const [teamId] = await db('teams').insert(teamData).returning('team_id');
    return await this.findById(teamId);
  }

  /**
   * Update team
   */
  static async update(teamId, updates) {
    const db = getDB();
    await db('teams').where({ team_id: teamId }).update({
      ...updates,
      updated_at: db.fn.now()
    });
    return await this.findById(teamId);
  }

  /**
   * Delete team
   */
  static async delete(teamId) {
    const db = getDB();
    return await db('teams').where({ team_id: teamId }).delete();
  }

  /**
   * Get team squad (all players)
   */
  static async getSquad(teamId) {
    const db = getDB();
    return await db('players')
      .where({ team_id: teamId })
      .join('career_stats', 'players.player_id', 'career_stats.player_id')
      .select(
        'players.*',
        'career_stats.batting_average',
        'career_stats.batting_strike_rate',
        'career_stats.bowling_average',
        'career_stats.bowling_economy',
        'career_stats.bowling_strike_rate'
      );
  }
}

module.exports = TeamsRepository;
