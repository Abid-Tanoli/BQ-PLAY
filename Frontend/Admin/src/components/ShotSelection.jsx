import React, { useState } from 'react';
import FieldingPositions from './FieldingPositions';

/**
 * Shot Selection Component
 * Combines fielding position selector with auto-commentary generation
 */
export default function ShotSelection({ onSelectShot, selectedShot, ballRuns = 0 }) {
  const [fieldingZone, setFieldingZone] = useState(null);
  const [shotType, setShotType] = useState('');
  const [generatedCommentary, setGeneratedCommentary] = useState('');

  // Shot types based on runs
  const shotTypes = {
    0: ['Defended', 'Blocked', 'Left alone', 'Missed', 'Beaten'],
    1: ['Pushed', 'Tapped', 'Worked', 'Guided', 'Nudged'],
    2: ['Driven', 'Flicked', 'Clipped', 'Punched', 'Steered'],
    3: ['Driven hard', 'Flicked away', 'Punched through', 'Lofted'],
    4: ['Driven through covers', 'Cut away', 'Pulled to boundary', 'Flicked to fence', 'Punched past'],
    6: ['Lofted over', 'Slogged', 'Swung over', 'Smashed', 'Launched']
  };

  // Commentary templates
  const commentaryTemplates = {
    0: [
      "{batsman} defends it back to the {fielder}",
      "{batsman} blocks it to {fielder}",
      "{batsman} leaves it alone",
      "{batsman} gets beaten!"
    ],
    1: [
      "{batsman} taps it to {fielder} for a quick single",
      "{batsman} works it to {fielder} for one",
      "{batsman} guides it to {fielder}, they take a single"
    ],
    2: [
      "{batsman} drives it to {fielder}, comes back for two",
      "{batsman} flicks it to {fielder}, good running between wickets",
      "{batsman} punches it to {fielder}, they push hard for two"
    ],
    3: [
      "{batsman} drives it hard to {fielder}, excellent running! Three runs!",
      "{batsman} lofts it over {fielder}, they run hard for three"
    ],
    4: [
      "{batsman} drives it beautifully through {fielder} for FOUR!",
      "{batsman} cuts it past {fielder} to the boundary!",
      "{batsman} flicks it to the {fielder} fence for FOUR!",
      "{batsman} punches it past {fielder}, no chance! FOUR!"
    ],
    6: [
      "{batsman} SMASHES it over {fielder} for a MASSIVE SIX!",
      "{batsman} launches it over {fielder} for SIX!",
      "{batsman} lofts it cleanly over {fielder} - what a hit! SIX!",
      "{batsman} slog sweeps it over {fielder} for SIX!"
    ]
  };

  const handleFieldSelect = (fieldData) => {
    setFieldingZone(fieldData);
    generateCommentary(fieldData, shotType);
    
    if (onSelectShot) {
      onSelectShot({
        runs: ballRuns,
        fieldingZone: fieldData.zone,
        fieldingPosition: fieldData.name,
        region: fieldData.region,
        shotType: shotType,
        commentary: generatedCommentary
      });
    }
  };

  const handleShotTypeSelect = (type) => {
    setShotType(type);
    generateCommentary(fieldingZone, type);
    
    if (onSelectShot && fieldingZone) {
      onSelectShot({
        runs: ballRuns,
        fieldingZone: fieldingZone.zone,
        fieldingPosition: fieldingZone.name,
        region: fieldingZone.region,
        shotType: type,
        commentary: generatedCommentary
      });
    }
  };

  const generateCommentary = (field, shot) => {
    if (!field) return;
    
    const templates = commentaryTemplates[ballRuns] || commentaryTemplates[0];
    const template = templates[Math.floor(Math.random() * templates.length)];
    const commentary = template
      .replace('{batsman}', 'Batsman')
      .replace('{fielder}', field.name.toLowerCase());
    
    setGeneratedCommentary(commentary);
  };

  const getRandomCommentary = () => {
    const templates = commentaryTemplates[ballRuns] || commentaryTemplates[0];
    const template = templates[Math.floor(Math.random() * templates.length)];
    const fielderName = fieldingZone?.name?.toLowerCase() || 'fielder';
    return template
      .replace('{batsman}', 'Batsman')
      .replace('{fielder}', fielderName);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800">Shot Selection</h3>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">
          {ballRuns} runs
        </span>
      </div>

      {/* Fielding Positions Diagram */}
      <FieldingPositions
        onSelectField={handleFieldSelect}
        selectedZone={fieldingZone?.zone}
        showLabels={true}
      />

      {/* Shot Type Selector */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Shot Type (Optional)
        </label>
        <div className="flex flex-wrap gap-2">
          {(shotTypes[ballRuns] || shotTypes[0]).map((type) => (
            <button
              key={type}
              onClick={() => handleShotTypeSelect(type)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                shotType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Generated Commentary Preview */}
      {(fieldingZone || shotType) && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-600 uppercase">
              Commentary Preview
            </label>
            <button
              onClick={() => {
                const newCommentary = getRandomCommentary();
                setGeneratedCommentary(newCommentary);
              }}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Regenerate
            </button>
          </div>
          <p className="text-sm text-slate-700 italic">
            {generatedCommentary || 'Select a fielding position to generate commentary...'}
          </p>
        </div>
      )}

      {/* Selected Info */}
      {fieldingZone && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
          <p className="text-green-800">
            <span className="font-semibold">Selected:</span> {fieldingZone.name} ({fieldingZone.region} side)
          </p>
        </div>
      )}
    </div>
  );
}
