// textGenerator.js
// Builds the text a test will use. Time and Word modes draw from a shuffled
// pool of everyday words (so the stream can be as long as it needs to be).
// Practice mode uses full, themed passages instead.

const WORD_BANK = [
  'time', 'people', 'year', 'way', 'day', 'thing', 'world', 'life', 'hand', 'part',
  'child', 'eye', 'place', 'work', 'week', 'case', 'point', 'number', 'group', 'room',
  'water', 'money', 'story', 'fact', 'month', 'book', 'system', 'game', 'family', 'idea',
  'body', 'music', 'field', 'level', 'office', 'door', 'health', 'art', 'history', 'party',
  'result', 'change', 'reason', 'city', 'school', 'word', 'business', 'issue', 'side', 'kind',
  'head', 'house', 'friend', 'father', 'power', 'hour', 'game', 'line', 'end', 'member',
  'law', 'car', 'city', 'community', 'name', 'president', 'team', 'minute', 'idea', 'body',
  'information', 'back', 'parent', 'face', 'others', 'level', 'office', 'door', 'health', 'person',
  'act', 'fact', 'street', 'inch', 'lot', 'study', 'value', 'wall', 'piece', 'student',
  'front', 'american', 'answer', 'letter', 'mind', 'science', 'force', 'light', 'thought', 'window',
  'quick', 'brown', 'jump', 'lazy', 'bright', 'green', 'quiet', 'strong', 'gentle', 'clear',
  'simple', 'happy', 'early', 'late', 'small', 'large', 'open', 'close', 'fast', 'slow',
  'read', 'write', 'speak', 'listen', 'learn', 'teach', 'build', 'grow', 'move', 'stay',
  'begin', 'finish', 'create', 'design', 'plan', 'solve', 'think', 'dream', 'travel', 'explore',
];

function shuffled(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Generate `count` random words joined by single spaces.
 */
export function generateWords(count) {
  const words = [];
  while (words.length < count) {
    words.push(...shuffled(WORD_BANK));
  }
  return words.slice(0, count).join(' ');
}

/**
 * Generate a long stream suitable for Time mode. `minWords` should be sized
 * generously for the selected duration so a fast typist never runs out.
 */
export function generateTimeText(minWords = 250) {
  return generateWords(minWords);
}

/**
 * Append more words to an existing Time-mode stream (called when the typist
 * is approaching the end of the current text).
 */
export function extendWords(existingText, extraCount = 60) {
  return `${existingText} ${generateWords(extraCount)}`;
}
