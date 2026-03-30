import React, { useState } from 'react';

export default function PlayerOfMatchAwards({ match }) {
  const [activeTab, setActiveTab] = useState('player-of-match');

  if (!match) return null;

  return (
    <div className="space-y-6">
      {/* Player of the Match */}
      {match.playerOfMatch && (
        <div className="bg-gradient-to-br from-[#031d44] to-[#003d66] rounded-lg shadow-lg overflow-hidden text-white">
          <div className="relative p-8 pb-12">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20" />

            <div className="relative z-10">
              <h2 className="text-sm font-black uppercase tracking-widest text-blue-200 mb-4">PLAYER OF THE MATCH</h2>

              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                {/* Player Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full flex items-center justify-center text-white font-black text-5xl shadow-lg border-4 border-white/20">
                    {match.playerOfMatch.name?.charAt(0)}
                  </div>
                </div>

                {/* Player Info */}
                <div className="flex-1">
                  <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2">
                    {match.playerOfMatch.name}
                  </h3>
                  <p className="text-blue-200 font-medium mb-6">{match.playerOfMatch.teamName}</p>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {match.playerOfMatch.runs !== undefined && (
                      <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                        <p className="text-blue-200 text-xs font-black uppercase tracking-wider">Runs</p>
                        <p className="text-2xl font-black">{match.playerOfMatch.runs}</p>
                      </div>
                    )}
                    {match.playerOfMatch.wickets !== undefined && (
                      <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                        <p className="text-blue-200 text-xs font-black uppercase tracking-wider">Wickets</p>
                        <p className="text-2xl font-black">{match.playerOfMatch.wickets}</p>
                      </div>
                    )}
                    {match.playerOfMatch.balls !== undefined && (
                      <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                        <p className="text-blue-200 text-xs font-black uppercase tracking-wider">Balls</p>
                        <p className="text-2xl font-black">{match.playerOfMatch.balls}</p>
                      </div>
                    )}
                    {match.playerOfMatch.strikeRate && (
                      <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                        <p className="text-blue-200 text-xs font-black uppercase tracking-wider">SR</p>
                        <p className="text-2xl font-black">{match.playerOfMatch.strikeRate}</p>
                      </div>
                    )}
                  </div>

                  {/* Quote */}
                  {match.playerOfMatch.quote && (
                    <p className="text-blue-100 italic text-sm">"{match.playerOfMatch.quote}"</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Impact Rankings */}
      <div className="bg-white rounded-lg shadow-md border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 px-6 py-4">
          <h3 className="text-sm font-black uppercase text-slate-800 tracking-wide">🏏 Impact Player Rankings</h3>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {match.impactRankings && match.impactRankings.length > 0 ? (
              match.impactRankings.slice(0, 5).map((player, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="font-black text-2xl text-[#031d44] w-8">{idx + 1}</div>
                    <div>
                      <p className="font-bold text-slate-800">{player.name}</p>
                      <p className="text-xs text-slate-500">{player.team || player.teamName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-xl text-[#031d44]">{player.points || player.impact || '-'}</p>
                    <p className="text-xs text-slate-500 font-medium">pts</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 py-6">No impact rankings yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Fan Rating Card */}
      {match.fanRating && (
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg shadow-md border border-orange-100 p-6">
          <h3 className="text-sm font-black uppercase text-orange-900 tracking-wide mb-4">⭐ Fan Rating</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-3xl font-black text-orange-600">{match.fanRating.average || '-'}/10</p>
              <p className="text-xs text-orange-700 font-medium mt-1">{match.fanRating.totalVotes || 0} votes</p>
            </div>
            {match.fanRating.distribution && (
              <div className="flex-1 flex gap-1">
                {[5, 4, 3, 2, 1].map(rating => (
                  <div key={rating} className="flex-1 flex flex-col-reverse gap-1">
                    <span className="text-xs text-orange-600 font-bold text-center">{rating}</span>
                    <div
                      className="bg-orange-400 rounded transition-all"
                      style={{
                        height: `${Math.max(20, (match.fanRating.distribution[rating] || 0) * 100)}px`
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Awards/Achievements */}
      {match.awards && match.awards.length > 0 && (
        <div className="bg-white rounded-lg shadow-md border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 px-6 py-4">
            <h3 className="text-sm font-black uppercase text-slate-800 tracking-wide">🏆 Awards & Achievements</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {match.awards.map((award, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🏅</span>
                  <div>
                    <p className="font-black text-slate-800 text-sm uppercase">{award.title}</p>
                    <p className="font-bold text-slate-700 mt-1">{award.playerName}</p>
                    <p className="text-xs text-slate-500">{award.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
