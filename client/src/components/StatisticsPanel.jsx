import React from 'react';

export default function StatisticsPanel({ stats, onReset }) {
  return (
    <section className="panel">
      <h2 className="panel__title">Statistics</h2>
      <p className="panel__subtitle">Your personal bests and averages, saved automatically after every test.</p>

      <div className="stats-grid">
        <div className="stats-card glass-card">
          <span className="stats-card__value">{stats.bestWpm}</span>
          <span className="stats-card__label">Best WPM</span>
        </div>
        <div className="stats-card glass-card">
          <span className="stats-card__value">{stats.bestAccuracy}%</span>
          <span className="stats-card__label">Best Accuracy</span>
        </div>
        <div className="stats-card glass-card">
          <span className="stats-card__value">{stats.testsCompleted}</span>
          <span className="stats-card__label">Tests Completed</span>
        </div>
        <div className="stats-card glass-card">
          <span className="stats-card__value">{stats.averageWpm}</span>
          <span className="stats-card__label">Average WPM</span>
        </div>
        <div className="stats-card glass-card">
          <span className="stats-card__value">{stats.averageAccuracy}%</span>
          <span className="stats-card__label">Average Accuracy</span>
        </div>
      </div>

      <div className="history-block">
        <h3 className="history-block__title">Recent tests</h3>
        {stats.history && stats.history.length > 0 ? (
          <table className="history-table">
            <thead>
              <tr>
                <th scope="col">WPM</th>
                <th scope="col">Accuracy</th>
                <th scope="col">Errors</th>
                <th scope="col">Duration</th>
              </tr>
            </thead>
            <tbody>
              {stats.history.map((entry, i) => (
                <tr key={i}>
                  <td>{entry.wpm}</td>
                  <td>{entry.accuracy}%</td>
                  <td>{entry.errors}</td>
                  <td>{entry.duration}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="history-block__empty">Complete a test to see your history here.</p>
        )}
      </div>

      <button type="button" className="btn btn--ghost" onClick={onReset}>
        Reset statistics
      </button>
    </section>
  );
}
