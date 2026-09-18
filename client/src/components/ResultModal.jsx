import React, { useEffect, useRef } from 'react';

export default function ResultModal({ result, onRestartSame, onNewTest }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onNewTest();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onNewTest]);

  if (!result) return null;

  return (
    <div className="modal-overlay" role="presentation">
      <div
        className="modal glass-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="result-title"
        tabIndex={-1}
        ref={dialogRef}
      >
        <p className="modal__rating" id="result-title">{result.rating.label}</p>
        <p className="modal__rating-detail">{result.rating.detail}</p>

        <div className="modal__headline">
          <span className="modal__wpm">{result.wpm}</span>
          <span className="modal__wpm-label">WPM</span>
        </div>

        <div className="modal__grid">
          <div className="modal__stat">
            <span className="modal__stat-value">{result.accuracy}%</span>
            <span className="modal__stat-label">Accuracy</span>
          </div>
          <div className="modal__stat">
            <span className="modal__stat-value">{result.errors}</span>
            <span className="modal__stat-label">Errors</span>
          </div>
          <div className="modal__stat">
            <span className="modal__stat-value">{result.correctChars}</span>
            <span className="modal__stat-label">Correct chars</span>
          </div>
          <div className="modal__stat">
            <span className="modal__stat-value">{result.totalChars}</span>
            <span className="modal__stat-label">Total chars</span>
          </div>
          <div className="modal__stat">
            <span className="modal__stat-value">{result.duration}s</span>
            <span className="modal__stat-label">Duration</span>
          </div>
        </div>

        <div className="modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onRestartSame}>
            Restart Test
          </button>
          <button type="button" className="btn btn--primary" onClick={onNewTest}>
            New Test
          </button>
        </div>
      </div>
    </div>
  );
}
