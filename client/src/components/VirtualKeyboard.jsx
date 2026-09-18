import React, { useEffect, useState } from 'react';

const ROWS = [
  ['ESC', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

function normalizeKey(e) {
  if (e.key === 'Escape') return 'ESC';
  if (e.key === ' ') return 'SPACE';
  if (e.key.length === 1) return e.key.toUpperCase();
  return null;
}

export default function VirtualKeyboard({ lastKey }) {
  const [pressed, setPressed] = useState(null); // key currently held down physically
  const [feedback, setFeedback] = useState(null); // { key, correct } briefly flashed

  useEffect(() => {
    function handleDown(e) {
      const key = normalizeKey(e);
      if (key) setPressed(key);
    }
    function handleUp(e) {
      const key = normalizeKey(e);
      if (key) setPressed((prev) => (prev === key ? null : prev));
    }
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
    };
  }, []);

  useEffect(() => {
    if (!lastKey) return undefined;
    const label = lastKey.key === ' ' ? 'SPACE' : lastKey.key.toUpperCase();
    setFeedback({ key: label, correct: lastKey.correct });
    const timeout = setTimeout(() => setFeedback(null), 150);
    return () => clearTimeout(timeout);
  }, [lastKey]);

  function keyClass(label) {
    const classes = ['key'];
    if (label === 'SPACE') classes.push('key--space');
    if (label === 'ESC') classes.push('key--esc');
    if (pressed === label) classes.push('is-pressed');
    if (feedback && feedback.key === label) {
      classes.push(feedback.correct ? 'is-correct' : 'is-incorrect');
    }
    return classes.join(' ');
  }

  return (
    <div className="virtual-keyboard" aria-hidden="true">
      {ROWS.map((row, i) => (
        <div className="keyboard-row" key={i}>
          {row.map((label) => (
            <span key={label} className={keyClass(label)}>
              {label}
            </span>
          ))}
        </div>
      ))}
      <div className="keyboard-row">
        <span className={keyClass('SPACE')}>SPACE</span>
      </div>
    </div>
  );
}
