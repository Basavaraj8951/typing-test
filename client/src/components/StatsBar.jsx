import React from 'react';

export default function StatsBar({
  liveWpm,
  liveAccuracy,
  incorrectChars,
  totalTyped,
  elapsedSeconds,
  onRestart,
}) {
  return (
    <div className="stats-bar">
      <div className="stats-bar__stats">
        <div className="stat">
          <span className="stat__value">{liveWpm}</span>
          <span className="stat__label">WPM</span>
        </div>
        <div className="stat">
          <span className="stat__value">{liveAccuracy}%</span>
          <span className="stat__label">Accuracy</span>
        </div>
        <div className="stat">
          <span className="stat__value">{incorrectChars}</span>
          <span className="stat__label">Errors</span>
        </div>
        <div className="stat">
          <span className="stat__value">{totalTyped}</span>
          <span className="stat__label">Characters</span>
        </div>
        <div className="stat">
          <span className="stat__value">{Math.round(elapsedSeconds)}s</span>
          <span className="stat__label">Time</span>
        </div>
      </div>

      <button type="button" className="btn btn--ghost" onClick={onRestart}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
          <path
            d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        New Text
      </button>
    </div>
  );
}
