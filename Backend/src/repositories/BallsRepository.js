/**
 * Repository Layer - Balls
 * Operations for recording and retrieving delivery data
 */

const { getDB } = require('../utils/db');

class BallsRepository {
  /**
   * Record a new ball
   */
  static async recordBall(ballData) {
    const db = getDB();
    const [ballId] = await db('balls').insert(ballData).returning('ball_id');
    return await this.findById(ballId);
  }

  /**
   * Find ball by ID
   */
  static async findById(ballId) {
    const db = getDB();
    return await db('balls').where({ ball_id: ballId }).first();
  }

  /**
   * Get balls in an over
   */
  static async getOverBalls(inningsId, overNumber) {
    const db = getDB();
    return await db('balls')
      .where({ innings_id: inningsId, over_number: overNumber })
      .orderBy('ball_in_over');
  }

  /**
   * Get all balls in innings
   */
  static async getInningsBalls(inningsId) {
    const db = getDB();
    return await db('balls')
      .where({ innings_id: inningsId })
      .orderBy('ball_sequence');
  }

  /**
   * Get balls bowled by a bowler in an innings
   */
  static async getBowlerBalls(inningsId, bowlerId) {
    const db = getDB();
    return await db('balls')
      .where({ innings_id: inningsId, bowler_id: bowlerId })
      .orderBy('ball_sequence');
  }

  /**
   * Get balls faced by a batsman
   */
  static async getBatsmantBalls(inningsId, batsmantId) {
    const db = getDB();
    return await db('balls')
      .where({ innings_id: inningsId })
      .andWhere(function() {
        this.where('batsman_on_strike_id', batsmantId)
          .orWhere('non_striker_id', batsmantId);
      })
      .orderBy('ball_sequence');
  }

  /**
   * Get wicket balls
   */
  static async getWickets(inningsId) {
    const db = getDB();
    return await db('balls')
      .where({ innings_id: inningsId, is_wicket: true })
      .join('players', 'balls.dismissed_player_id', 'players.player_id')
      .select('balls.*', 'players.name as dismissed_player_name');
  }

  /**
   * Get last N balls (for live commentary)
   */
  static async getLastBalls(inningsId, count = 6) {
    const db = getDB();
    return await db('balls')
      .where({ innings_id: inningsId })
      .orderBy('ball_sequence', 'DESC')
      .limit(count)
      .then(balls => balls.reverse());
  }

  /**
   * Get current over balls
   */
  static async getCurrentOverBalls(inningsId) {
    const db = getDB();
    const lastBall = await db('balls')
      .where({ innings_id: inningsId })
      .orderBy('ball_sequence', 'DESC')
      .first();

    if (!lastBall) return [];

    return await this.getOverBalls(inningsId, lastBall.over_number);
  }

  /**
   * Calculate runs in over
   */
  static async getOverRuns(inningsId, overNumber) {
    const db = getDB();
    const result = await db('balls')
      .where({ innings_id: inningsId, over_number: overNumber })
      .sum('total_runs as runs')
      .count('* as deliveries')
      .first();
    
    return result;
  }

  /**
   * Get batsman stats for innings
   */
  static async getBatsmantStats(inningsId, batsmantId) {
    const db = getDB();
    const balls = await db('balls')
      .where({ innings_id: inningsId, batsman_on_strike_id: batsmantId });

    const stats = {
      balls_faced: balls.length,
      runs: balls.reduce((sum, b) => sum + (b.runs_off_bat || 0), 0),
      fours: balls.filter(b => b.runs_off_bat === 4).length,
      sixes: balls.filter(b => b.runs_off_bat === 6).length,
      dots: balls.filter(b => b.runs_off_bat === 0 && !b.is_wide && !b.is_no_ball).length,
      strike_rate: 0
    };

    if (stats.balls_faced > 0) {
      stats.strike_rate = ((stats.runs / stats.balls_faced) * 100).toFixed(2);
    }

    return stats;
  }

  /**
   * Get bowler stats for innings
   */
  static async getBowlerStats(inningsId, bowlerId) {
    const db = getDB();
    const balls = await db('balls')
      .where({ innings_id: inningsId, bowler_id: bowlerId });

    const legalBalls = balls.filter(b => !b.is_wide && !b.is_no_ball);
    const stats = {
      overs_bowled: Math.floor(legalBalls.length / 6),
      balls_bowled: legalBalls.length,
      maidens: 0,
      runs_conceded: balls.reduce((sum, b) => sum + (b.runs_off_bat || 0), 0),
      wickets: balls.filter(b => b.is_wicket).length,
      extras_conceded: balls.filter(b => b.is_wide || b.is_no_ball).length,
      economy: 0,
      strike_rate: 0
    };

    if (stats.overs_bowled > 0) {
      stats.economy = (stats.runs_conceded / stats.overs_bowled).toFixed(2);
    }

    if (stats.wickets > 0) {
      stats.strike_rate = (stats.balls_bowled / stats.wickets).toFixed(2);
    }

    return stats;
  }

  /**
   * Update ball commentary
   */
  static async updateCommentary(ballId, commentary) {
    const db = getDB();
    await db('balls').where({ ball_id: ballId }).update({
      commentary,
      updated_at: db.fn.now()
    });
    return await this.findById(ballId);
  }

  /**
   * Delete ball (for undo functionality)
   */
  static async deleteBall(ballId) {
    const db = getDB();
    return await db('balls').where({ ball_id: ballId }).delete();
  }

  /**
   * Get partnership data
   */
  static async getPartnershipData(inningsId, batsman1Id, batsman2Id) {
    const db = getDB();
    return await db('balls')
      .where({ innings_id: inningsId })
      .andWhere(function() {
        this.where(function() {
          this.where('batsman_on_strike_id', batsman1Id)
            .where('non_striker_id', batsman2Id);
        }).orWhere(function() {
          this.where('batsman_on_strike_id', batsman2Id)
            .where('non_striker_id', batsman1Id);
        });
      })
      .orderBy('ball_sequence');
  }
}

module.exports = BallsRepository;
