// Cricket API Controller
// Handles requests for live cricket data from external APIs

import cricketApi from '../services/cricketApi.js';

// Get all live matches
export const getLiveMatches = async (req, res) => {
  try {
    console.log('[Controller] Fetching live matches...');
    const matches = await cricketApi.getLiveMatches();
    
    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Controller] Error in getLiveMatches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch live matches',
      error: error.message,
      fallback: true,
    });
  }
};

// Get upcoming matches
export const getUpcomingMatches = async (req, res) => {
  try {
    console.log('[Controller] Fetching upcoming matches...');
    const matches = await cricketApi.getUpcomingMatches();
    
    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Controller] Error in getUpcomingMatches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming matches',
      error: error.message,
    });
  }
};

// Get completed matches
export const getCompletedMatches = async (req, res) => {
  try {
    console.log('[Controller] Fetching completed matches...');
    const matches = await cricketApi.getCompletedMatches();
    
    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Controller] Error in getCompletedMatches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch completed matches',
      error: error.message,
    });
  }
};

// Get all matches (live + upcoming + recent)
export const getAllMatches = async (req, res) => {
  try {
    console.log('[Controller] Fetching all matches...');
    const matches = await cricketApi.getAllMatches();
    
    // Group by status
    const grouped = {
      live: matches.filter(m => m.status === 'live'),
      upcoming: matches.filter(m => m.status === 'upcoming'),
      completed: matches.filter(m => m.status === 'completed'),
    };
    
    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches,
      grouped,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Controller] Error in getAllMatches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch matches',
      error: error.message,
    });
  }
};

// Get specific match details
export const getMatchDetails = async (req, res) => {
  try {
    const { matchId } = req.params;
    console.log('[Controller] Fetching match details for:', matchId);
    
    const match = await cricketApi.getMatchInfo(matchId);
    
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: match,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Controller] Error in getMatchDetails:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch match details',
      error: error.message,
    });
  }
};

// Get match scorecard
export const getScorecard = async (req, res) => {
  try {
    const { matchId } = req.params;
    console.log('[Controller] Fetching scorecard for:', matchId);
    
    const scorecard = await cricketApi.getScorecard(matchId);
    
    if (!scorecard) {
      return res.status(404).json({
        success: false,
        message: 'Scorecard not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: scorecard,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Controller] Error in getScorecard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scorecard',
      error: error.message,
    });
  }
};

// Get ball-by-ball commentary
export const getCommentary = async (req, res) => {
  try {
    const { matchId } = req.params;
    console.log('[Controller] Fetching commentary for:', matchId);
    
    const commentary = await cricketApi.getCommentary(matchId);
    
    if (!commentary) {
      return res.status(404).json({
        success: false,
        message: 'Commentary not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: commentary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Controller] Error in getCommentary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch commentary',
      error: error.message,
    });
  }
};

// Clear API cache
export const clearCache = async (req, res) => {
  try {
    cricketApi.clearCache();
    
    res.status(200).json({
      success: true,
      message: 'Cache cleared successfully',
    });
  } catch (error) {
    console.error('[Controller] Error clearing cache:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache',
      error: error.message,
    });
  }
};
