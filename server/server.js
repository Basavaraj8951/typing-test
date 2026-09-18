// server.js
// TypingPro backend — Express API for practice passages and persisted statistics.
// No database required: results are stored in a local JSON file (data/stats.json).

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const DATA_FILE = path.join(__dirname, 'data', 'stats.json');

app.use(cors());
app.use(express.json());

// ---------- Passage bank ----------
// 20+ general passages plus category sets for Practice mode.
const passages = require('./data/passages.json');

// ---------- Persistence helpers ----------
function ensureDataFile() {
  if (!fs.existsSync(path.dirname(DATA_FILE))) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const initial = {
      bestWpm: 0,
      bestAccuracy: 0,
      testsCompleted: 0,
      totalWpm: 0,
      totalAccuracy: 0,
      history: [],
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
  }
}

function loadStats() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read stats file, resetting.', err);
    const fresh = {
      bestWpm: 0,
      bestAccuracy: 0,
      testsCompleted: 0,
      totalWpm: 0,
      totalAccuracy: 0,
      history: [],
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(fresh, null, 2));
    return fresh;
  }
}

function saveStats(stats) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(stats, null, 2));
}

function sanitizeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

// ---------- Routes ----------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Get a random passage, optionally filtered by category
app.get('/api/passages/random', (req, res) => {
  const category = req.query.category;
  let pool = passages.general;

  if (category && passages.categories[category]) {
    pool = passages.categories[category];
  }

  if (!pool || pool.length === 0) {
    return res.status(404).json({ error: 'No passages found for that category.' });
  }

  const passage = pool[Math.floor(Math.random() * pool.length)];
  res.json({ passage, category: category || 'general' });
});

// List available practice categories
app.get('/api/passages/categories', (req, res) => {
  res.json({ categories: Object.keys(passages.categories) });
});

// Get aggregate + historical stats
app.get('/api/stats', (req, res) => {
  const stats = loadStats();
  const avgWpm = stats.testsCompleted > 0 ? Math.round(stats.totalWpm / stats.testsCompleted) : 0;
  const avgAccuracy = stats.testsCompleted > 0
    ? Math.round((stats.totalAccuracy / stats.testsCompleted) * 10) / 10
    : 0;

  res.json({
    bestWpm: stats.bestWpm,
    bestAccuracy: stats.bestAccuracy,
    testsCompleted: stats.testsCompleted,
    averageWpm: avgWpm,
    averageAccuracy: avgAccuracy,
    history: stats.history.slice(-20).reverse(),
  });
});

// Save a completed test result
app.post('/api/stats', (req, res) => {
  const { wpm, accuracy, errors, correctChars, totalChars, duration } = req.body || {};

  const safeWpm = sanitizeNumber(wpm);
  const safeAccuracy = Math.min(100, sanitizeNumber(accuracy));
  const safeErrors = sanitizeNumber(errors);
  const safeCorrectChars = sanitizeNumber(correctChars);
  const safeTotalChars = sanitizeNumber(totalChars);
  const safeDuration = sanitizeNumber(duration);

  const stats = loadStats();

  stats.testsCompleted += 1;
  stats.totalWpm += safeWpm;
  stats.totalAccuracy += safeAccuracy;
  stats.bestWpm = Math.max(stats.bestWpm, safeWpm);
  stats.bestAccuracy = Math.max(stats.bestAccuracy, safeAccuracy);

  stats.history.push({
    wpm: safeWpm,
    accuracy: safeAccuracy,
    errors: safeErrors,
    correctChars: safeCorrectChars,
    totalChars: safeTotalChars,
    duration: safeDuration,
    timestamp: new Date().toISOString(),
  });

  // Keep history from growing unbounded
  if (stats.history.length > 200) {
    stats.history = stats.history.slice(-200);
  }

  saveStats(stats);

  const avgWpm = Math.round(stats.totalWpm / stats.testsCompleted);
  const avgAccuracy = Math.round((stats.totalAccuracy / stats.testsCompleted) * 10) / 10;

  res.status(201).json({
    bestWpm: stats.bestWpm,
    bestAccuracy: stats.bestAccuracy,
    testsCompleted: stats.testsCompleted,
    averageWpm: avgWpm,
    averageAccuracy: avgAccuracy,
  });
});

// Reset stats (used by the "Reset statistics" control in Settings)
app.delete('/api/stats', (req, res) => {
  const fresh = {
    bestWpm: 0,
    bestAccuracy: 0,
    testsCompleted: 0,
    totalWpm: 0,
    totalAccuracy: 0,
    history: [],
  };
  saveStats(fresh);
  res.json({ ok: true });
});
// ---------- Serve React production build ----------
const CLIENT_DIST = path.join(__dirname, '..', 'client', 'dist');

app.use(express.static(CLIENT_DIST));

app.get('*', (req, res) => {
  res.sendFile(path.join(CLIENT_DIST, 'index.html'));
});

app.listen(PORT, () => {
  ensureDataFile();
  console.log(`TypingPro API running at http://localhost:${PORT}`);
});
