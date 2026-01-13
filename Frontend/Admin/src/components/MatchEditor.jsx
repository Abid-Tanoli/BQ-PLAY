import React, { useState } from 'react';
import { api } from '../services/api';

export default function MatchEditor({ match, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [commentaryText, setCommentaryText] = useState('');

  const sendUpdate = async ({ runs=0, wickets=0, balls=1, extras=0, commentary='' }) => {
    setLoading(true);
    try {
      await api.post(`/matches/${match._id}/score`, {
        inningsIndex: 0,
        runs,
        wickets,
        balls,
        extras,
        commentaryText: commentary
      });
      if (onUpdated) onUpdated();
    } catch (err) {
      console.error(err);
      alert('Error sending update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="match-editor">
      <h4>{match.title}</h4>
      <div className="score">
        {match.innings?.map((inn,i) => (
          <div key={i}>
            <strong>{match.teams[i]?.name || 'Team'}</strong>
            <div>{inn.runs}/{inn.wickets} ({inn.overs}.{inn.balls})</div>
          </div>
        ))}
      </div>
      <div className="controls">
        <button onClick={() => sendUpdate({ runs: 4, balls: 1, commentary: 'Boundary! 4 runs.' })} disabled={loading}>+4</button>
        <button onClick={() => sendUpdate({ runs: 6, balls: 1, commentary: 'SIX!' })} disabled={loading}>+6</button>
        <button onClick={() => sendUpdate({ runs: 1, balls: 1, commentary: '1 run.' })} disabled={loading}>+1</button>
        <button onClick={() => sendUpdate({ wickets: 1, balls: 1, commentary: 'WICKET!' })} disabled={loading}>W</button>
      </div>
      <div className="manual">
        <textarea value={commentaryText} onChange={e => setCommentaryText(e.target.value)} placeholder="Live commentary"></textarea>
        <button onClick={() => { sendUpdate({ runs:0, balls:1, commentary: commentaryText }); setCommentaryText(''); }} disabled={loading}>Send</button>
      </div>
    </div>
  );
}