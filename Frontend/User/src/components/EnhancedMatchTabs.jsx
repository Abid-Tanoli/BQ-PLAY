import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import CricinfoScoreboard from './CricinfoScoreboard';
import CommentaryFeed from './CommentaryFeed';
import DetailedScorecard from './DetailedScorecard';
import ThemeToggle from './ThemeToggle';

// Enhanced Match Tabs - Cricinfo Style
// Professional tabbed interface for match viewing

const EnhancedMatchTabs = ({ match }) => {
  const [activeTab, setActiveTab] = useState('live');
  const { theme } = useTheme();

  if (!match) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading match data...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'live', label: 'Live', icon: '🏏' },
    { key: 'scorecard', label: 'Scorecard', icon: '📊' },
    { key: 'commentary', label: 'Commentary', icon: '📻' },
    { key: 'info', label: 'Info', icon: 'ℹ️' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'live':
        return (
          <div className="space-y-4">
            <CricinfoScoreboard match={match} />

            {/* Quick Commentary Preview */}
            {match.innings?.[match.currentInnings]?.oversHistory?.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow">
                <h4 className="font-bold text-sm mb-3">Last Few Balls</h4>
                <div className="space-y-2">
                  {match.innings[match.currentInnings].oversHistory
                    .slice(-2)
                    .flatMap(over => over.balls || [])
                    .slice(-5)
                    .reverse()
                    .map((ball, idx) => (
                      <div key={idx} className="flex items-start gap-3 pb-2 border-b dark:border-slate-700 last:border-b-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${ball.isWicket ? 'bg-red-500 text-white' :
                          ball.runs === 4 || ball.runs === 6 ? 'bg-green-500 text-white' :
                            ball.isWide || ball.isNoBall ? 'bg-orange-400 text-white' :
                              ball.runs === 0 ? 'bg-slate-300 text-slate-700' :
                                'bg-blue-100 text-blue-700'
                          }`}>
                          {ball.isWicket ? 'W' : ball.runs === 0 ? '•' : ball.runs}
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {(ball.commentary || '').split('\n')[0] || 'No commentary'}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'scorecard':
        return <DetailedScorecard match={match} />;

      case 'commentary':
        return <CommentaryFeed match={match} live={match.status === 'live'} />;

      case 'info':
        return (
          <div className="space-y-4">
            {/* Match Info */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4">Match Information</h3>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">Match</span>
                  <span className="font-semibold dark:text-white">
                    {match.teams?.[0]?.name} vs {match.teams?.[1]?.name}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">Match Type</span>
                  <span className="font-semibold dark:text-white">{match.matchType}</span>
                </div>

                <div className="flex justify-between py-2 border-b dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">Venue</span>
                  <span className="font-semibold dark:text-white">{match.venue || 'TBD'}</span>
                </div>

                <div className="flex justify-between py-2 border-b dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">Date</span>
                  <span className="font-semibold dark:text-white">
                    {new Date(match.startAt).toLocaleDateString()}
                  </span>
                </div>

                {match.tossWinner && (
                  <div className="flex justify-between py-2 border-b dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">Toss</span>
                    <span className="font-semibold dark:text-white">
                      {match.tossWinner.name} elected to {match.tossDecision}
                    </span>
                  </div>
                )}

                {match.umpires && match.umpires.length > 0 && (
                  <div className="flex justify-between py-2 border-b dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">Umpires</span>
                    <span className="font-semibold dark:text-white">
                      {match.umpires.map(u => u.name).join(', ')}
                    </span>
                  </div>
                )}

                {match.result?.description && match.status === 'completed' && (
                  <div className="bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700 p-4 rounded-lg mt-4">
                    <p className="text-center font-bold text-green-700 dark:text-green-300">
                      {match.result.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Squads */}
            {match.squad15 && match.squad15.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4">Squads</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {match.squad15.map((squad, idx) => (
                    <div key={idx} className="border dark:border-slate-700 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">{squad.team?.name || 'Team'}</h4>
                      {squad.captain && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Captain: {squad.captain.name}
                        </p>
                      )}
                      {squad.players && (
                        <div className="mt-2 text-sm">
                          <p className="text-slate-600 dark:text-slate-400 mb-1">Players:</p>
                          <div className="flex flex-wrap gap-1">
                            {squad.players.slice(0, 5).map((player, pIdx) => (
                              <span key={pIdx} className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs">
                                {player.name}
                              </span>
                            ))}
                            {squad.players.length > 5 && (
                              <span className="text-xs text-slate-500">+{squad.players.length - 5} more</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      {/* Tab Navigation */}
      <div className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b dark:border-slate-700 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex overflow-x-auto items-center justify-between">
            <div className="flex overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 min-w-[80px] px-4 py-3 text-sm font-semibold transition-all ${activeTab === tab.key
                    ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                >
                  <span className="mr-1">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="px-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl mx-auto p-4">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default EnhancedMatchTabs;
