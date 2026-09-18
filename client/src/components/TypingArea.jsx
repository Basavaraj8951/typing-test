import React, { useEffect, useRef } from 'react';

function formatTime(totalSeconds) {
  const clamped = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function TypingArea({
  text,
  charStates,
  currentIndex,
  typedValue,
  onType,
  status,
  timeLeft,
  testMode,
  practiceCategory,
  liveWpm,
  liveAccuracy,
  caretStyle,
  fontSize,
  onFocusField,
}) {
  const inputRef = useRef(null);
  const textRef = useRef(null);
  // Keep the current character visible while typing
useEffect(() => {
  if (status === 'finished' || !textRef.current) return;

  const container = textRef.current;
  const currentChar = container.querySelector('.char.is-current');

  if (!currentChar) return;

  const containerRect = container.getBoundingClientRect();
  const charRect = currentChar.getBoundingClientRect();

  const charTop = charRect.top - containerRect.top;
  const charBottom = charRect.bottom - containerRect.top;

  // Move down when the current character goes below the visible area
  if (charBottom > container.clientHeight) {
    container.scrollTop += charBottom - container.clientHeight + 20;
  }

  // Move up when the current character goes above the visible area
  else if (charTop < 0) {
    container.scrollTop += charTop - 20;
  }
}, [currentIndex, status, text]);

  // Keep the typing surface focused so keystrokes are always captured.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (status !== 'finished') {
      inputRef.current?.focus();
    }
  }, [status, text]);

  function handleFocusClick() {
    inputRef.current?.focus();
    onFocusField?.();
  }

  return (
    <section className="typing-card glass-card" aria-label="Typing test">
      <div className="typing-card__readout">
        <span className="readout__label">
          {practiceCategory ? `Practice · ${practiceCategory}` : testMode === 'time' ? 'Time Left' : 'Progress'}
        </span>
        <span className="readout__value">
          {testMode === 'time' && !practiceCategory ? formatTime(timeLeft) : `${currentIndex}/${text.length}`}
        </span>
      </div>

      <div className="typing-card__live-stats" aria-live="polite">
        <div className="live-stat">
          <span className="live-stat__value">{liveWpm}</span>
          <span className="live-stat__label">WPM</span>
        </div>
        <div className="live-stat">
          <span className="live-stat__value">{liveAccuracy}%</span>
          <span className="live-stat__label">Accuracy</span>
        </div>
      </div>

      <div
        className={`text-display text-display--${fontSize}`}
        data-caret-style={caretStyle}
        ref={textRef}
        onClick={handleFocusClick}
        role="presentation"
      >
        {text.split('').map((char, i) => {
          const state = charStates[i] || 'pending';
          const isCurrent = i === currentIndex && status !== 'finished';
          const classNames = ['char', `is-${state}`, isCurrent ? 'is-current' : '']
            .filter(Boolean)
            .join(' ');
          return (
            <span key={i} className={classNames}>
              {char}
            </span>
          );
        })}
      </div>

      <label className="sr-only" htmlFor="typing-input">
        Typing input — start typing to begin the test
      </label>
      <input
        id="typing-input"
        ref={inputRef}
        className="typing-input"
        type="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        value={typedValue}
        disabled={status === 'finished'}
        onChange={(e) => onType(e.target.value)}
        onPaste={(e) => e.preventDefault()}
        onCopy={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
        aria-describedby="typing-instructions"
      />
      <p id="typing-instructions" className="sr-only">
        Start typing to begin the test. Pasting is disabled.
      </p>

      {status === 'idle' && (
        <p className="typing-card__hint">Click here and start typing to begin</p>
      )}
    </section>
  );
}
