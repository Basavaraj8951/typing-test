import React from 'react';

const CATEGORIES = [
  { id: 'easy', label: 'Easy', description: 'Short, simple sentences to build confidence.' },
  { id: 'medium', label: 'Medium', description: 'Everyday vocabulary with more complex structure.' },
  { id: 'hard', label: 'Hard', description: 'Long words and formal, technical phrasing.' },
  { id: 'programming', label: 'Programming', description: 'Code snippets with symbols and syntax.' },
  { id: 'quotes', label: 'Quotes', description: 'Short, memorable lines to type for fun.' },
  { id: 'technology', label: 'Technology', description: 'Passages about software, hardware and the web.' },
];

export default function PracticePanel({ activeCategory, onSelectCategory }) {
  return (
    <section className="panel">
      <h2 className="panel__title">Practice</h2>
      <p className="panel__subtitle">Choose a category to focus your practice on a specific style of text.</p>

      <div className="practice-grid">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`practice-card ${activeCategory === cat.id ? 'is-active' : ''}`}
            onClick={() => onSelectCategory(cat.id)}
          >
            <span className="practice-card__label">{cat.label}</span>
            <span className="practice-card__description">{cat.description}</span>
          </button>
        ))}
      </div>

      {activeCategory && (
        <button type="button" className="btn btn--ghost practice-exit" onClick={() => onSelectCategory(null)}>
          Exit practice mode
        </button>
      )}
    </section>
  );
}
