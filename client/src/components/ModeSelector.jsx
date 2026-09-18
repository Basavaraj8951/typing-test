import React from 'react';

const TIME_OPTIONS = [15, 30, 60, 120];
const WORD_OPTIONS = [25, 50, 100];

export default function ModeSelector({
  testMode,
  timeDuration,
  wordCount,
  onChangeMode,
  onChangeTime,
  onChangeWords,
  disabled,
}) {
  return (
    <div className="mode-selector" role="group" aria-label="Test mode">
      <div className="mode-selector__group">
        <button
          type="button"
          className={`mode-pill ${testMode === 'time' ? 'is-active' : ''}`}
          onClick={() => onChangeMode('time')}
          disabled={disabled}
        >
          Time
        </button>
        <button
          type="button"
          className={`mode-pill ${testMode === 'words' ? 'is-active' : ''}`}
          onClick={() => onChangeMode('words')}
          disabled={disabled}
        >
          Words
        </button>
      </div>

      <span className="mode-selector__divider" aria-hidden="true" />

      {testMode === 'time' ? (
        <div className="mode-selector__group" aria-label="Test duration">
          {TIME_OPTIONS.map((seconds) => (
            <button
              key={seconds}
              type="button"
              className={`mode-chip ${timeDuration === seconds ? 'is-active' : ''}`}
              onClick={() => onChangeTime(seconds)}
              disabled={disabled}
            >
              {seconds}s
            </button>
          ))}
        </div>
      ) : (
        <div className="mode-selector__group" aria-label="Word count">
          {WORD_OPTIONS.map((count) => (
            <button
              key={count}
              type="button"
              className={`mode-chip ${wordCount === count ? 'is-active' : ''}`}
              onClick={() => onChangeWords(count)}
              disabled={disabled}
            >
              {count}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
