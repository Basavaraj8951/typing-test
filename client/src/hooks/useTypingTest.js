import { useCallback, useEffect, useRef, useState } from 'react';
import { generateTimeText, generateWords, extendWords } from '../utils/textGenerator';
import { randomCategoryPassage } from '../data/passages';
import { fetchRandomPassage, fetchStats, submitResult } from '../api';
import { playKeySound, playErrorSound, playFinishSound } from '../utils/sound';

const TIME_TEXT_BUFFER_WORDS = { 15: 60, 30: 110, 60: 200, 120: 380 };

function ratingFor(wpm) {
  if (wpm >= 100) return { label: 'Blazing!', detail: "You're typing faster than 97% of typists." };
  if (wpm >= 80) return { label: 'Excellent!', detail: "You're faster than 90% of typists." };
  if (wpm >= 60) return { label: 'Great job!', detail: "You're faster than 75% of typists." };
  if (wpm >= 40) return { label: 'Good work!', detail: "You're faster than 50% of typists." };
  if (wpm >= 20) return { label: 'Keep practicing!', detail: "You're building solid habits." };
  return { label: 'Nice start!', detail: 'Practice a little every day to build speed.' };
}

export function calculateWPM(correctChars, elapsedSeconds) {
  if (elapsedSeconds <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  return Math.round(correctChars / 5 / minutes);
}

export function calculateAccuracy(correctChars, totalTyped) {
  if (totalTyped <= 0) return 100;
  return Math.round((correctChars / totalTyped) * 1000) / 10;
}

export function useTypingTest(settings, soundEnabled) {
  const [testMode, setTestMode] = useState('time'); // 'time' | 'words'
  const [timeDuration, setTimeDuration] = useState(settings.duration || 30);
  const [wordCount, setWordCount] = useState(25);
  const [practiceCategory, setPracticeCategory] = useState(null); // null = normal test

  const [text, setText] = useState('');
  const [charStates, setCharStates] = useState([]); // 'correct' | 'incorrect' | 'pending'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedValue, setTypedValue] = useState('');

  const [status, setStatus] = useState('idle'); // 'idle' | 'running' | 'finished'
  const [timeLeft, setTimeLeft] = useState(timeDuration);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [correctChars, setCorrectChars] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState(0);
  const [totalTyped, setTotalTyped] = useState(0);

  const [liveWpm, setLiveWpm] = useState(0);
  const [liveAccuracy, setLiveAccuracy] = useState(100);

  const [result, setResult] = useState(null);
  const [lastKey, setLastKey] = useState(null); // { key, correct }
  const [aggregateStats, setAggregateStats] = useState({
    bestWpm: 0,
    bestAccuracy: 0,
    testsCompleted: 0,
    averageWpm: 0,
    averageAccuracy: 0,
    history: [],
  });

  const intervalRef = useRef(null);
  const startTimestampRef = useRef(null);

  // ---------- Statistics persistence ----------

  const loadStatistics = useCallback(async () => {
    try {
      const stats = await fetchStats();
      setAggregateStats(stats);
    } catch (err) {
      console.warn('Could not load statistics from backend:', err);
    }
  }, []);

  const saveStatistics = useCallback(async (finalResult) => {
    try {
      const updated = await submitResult({
        wpm: finalResult.wpm,
        accuracy: finalResult.accuracy,
        errors: finalResult.errors,
        correctChars: finalResult.correctChars,
        totalChars: finalResult.totalChars,
        duration: finalResult.duration,
      });
      setAggregateStats((prev) => ({ ...prev, ...updated }));
    } catch (err) {
      console.warn('Could not save statistics to backend:', err);
    }
  }, []);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  // ---------- Text loading ----------

  const loadRandomText = useCallback(
    async (opts = {}) => {
      const mode = opts.mode ?? testMode;
      const category = opts.category !== undefined ? opts.category : practiceCategory;
      const words = opts.wordCount ?? wordCount;
      const duration = opts.timeDuration ?? timeDuration;

      let newText;

      if (category) {
        try {
          const data = await fetchRandomPassage(category);
          newText = data.passage;
        } catch {
          newText = randomCategoryPassage(category);
        }
      } else if (mode === 'words') {
        newText = generateWords(words);
      } else {
        newText = generateTimeText(TIME_TEXT_BUFFER_WORDS[duration] || 200);
      }

      setText(newText);
      setCharStates(new Array(newText.length).fill('pending'));
      setCurrentIndex(0);
      setTypedValue('');
      setCorrectChars(0);
      setIncorrectChars(0);
      setTotalTyped(0);
      setLiveWpm(0);
      setLiveAccuracy(100);
      setTimeLeft(duration);
      setElapsedSeconds(0);
      setResult(null);
      setStatus('idle');
    },
    [testMode, practiceCategory, wordCount, timeDuration]
  );

  // Load an initial passage on mount
  useEffect(() => {
    loadRandomText();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Timer ----------

  const clearRunningTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const finishTest = useCallback(
    (finalCorrect, finalIncorrect, finalTotal, finalElapsedSeconds) => {
      clearRunningTimer();
      const wpm = calculateWPM(finalCorrect, finalElapsedSeconds || 1);
      const accuracy = calculateAccuracy(finalCorrect, finalTotal);
      const rating = ratingFor(wpm);

      const finalResult = {
        wpm,
        accuracy,
        errors: finalIncorrect,
        correctChars: finalCorrect,
        totalChars: finalTotal,
        duration: Math.round(finalElapsedSeconds),
        rating,
      };

      setResult(finalResult);
      setStatus('finished');
      if (soundEnabled) playFinishSound();
      saveStatistics(finalResult);
    },
    [clearRunningTimer, saveStatistics, soundEnabled]
  );

  const startTimer = useCallback(() => {
    clearRunningTimer(); // never allow two timers to run at once
    startTimestampRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimestampRef.current) / 1000;
      setElapsedSeconds(elapsed);

      if (testMode === 'time' && !practiceCategory) {
        const remaining = Math.max(0, Math.ceil(timeDuration - elapsed));
        setTimeLeft(remaining);
        if (remaining <= 0) {
          setCorrectChars((cc) => {
            setIncorrectChars((ic) => {
              setTotalTyped((tt) => {
                finishTest(cc, ic, tt, timeDuration);
                return tt;
              });
              return ic;
            });
            return cc;
          });
        }
      }
    }, 200);
  }, [clearRunningTimer, finishTest, practiceCategory, testMode, timeDuration]);

  const startTest = useCallback(() => {
    setStatus('running');
    startTimer();
  }, [startTimer]);

  useEffect(() => clearRunningTimer, [clearRunningTimer]);

  // ---------- Typing handling ----------

  const handleTyping = useCallback(
    (rawValue) => {
      if (status === 'finished') return;

      // Ignore pastes / huge jumps — one char (or a deletion) at a time only.
      if (Math.abs(rawValue.length - typedValue.length) > 1) return;

      if (status === 'idle') {
        startTest();
      }

      let workingText = text;

      // Extend the pool for Time mode if the typist is nearing the end.
      if (testMode === 'time' && !practiceCategory && rawValue.length > text.length - 30) {
        workingText = extendWords(text, 80);
        setText(workingText);
        setCharStates((prev) => [...prev, ...new Array(workingText.length - text.length).fill('pending')]);
      }

      const prevLength = typedValue.length;
      const newLength = rawValue.length;

      setTypedValue(rawValue);
      setCurrentIndex(newLength);

      if (newLength > prevLength) {
        // A character was typed
        const idx = newLength - 1;
        const typedChar = rawValue[idx];
        const targetChar = workingText[idx];
        const isCorrect = typedChar === targetChar;

        setCharStates((prev) => {
          const next = [...prev];
          next[idx] = isCorrect ? 'correct' : 'incorrect';
          return next;
        });

        setCorrectChars((c) => c + (isCorrect ? 1 : 0));
        setIncorrectChars((c) => c + (isCorrect ? 0 : 1));
        setTotalTyped((t) => t + 1);

        setLastKey({ key: targetChar, correct: isCorrect });
        if (soundEnabled) {
          isCorrect ? playKeySound() : playErrorSound();
        }
      } else if (newLength < prevLength) {
        // Backspace: clear the state of the removed character
        setCharStates((prev) => {
          const next = [...prev];
          for (let i = newLength; i < prevLength; i += 1) {
            next[i] = 'pending';
          }
          return next;
        });
      }

      // Word mode / Practice mode: finish once the whole text is typed
      const isBoundedMode = testMode === 'words' || Boolean(practiceCategory);
      if (isBoundedMode && newLength >= workingText.length) {
        const elapsed = (Date.now() - (startTimestampRef.current || Date.now())) / 1000;
        setCorrectChars((cc) => {
          setIncorrectChars((ic) => {
            setTotalTyped((tt) => {
              finishTest(cc, ic, tt, Math.max(elapsed, 0.5));
              return tt;
            });
            return ic;
          });
          return cc;
        });
      }
    },
    [status, typedValue, text, testMode, practiceCategory, startTest, finishTest, soundEnabled]
  );

  // ---------- Live stats ----------

  useEffect(() => {
    if (status !== 'running') return;
    setLiveWpm(calculateWPM(correctChars, elapsedSeconds || 1));
    setLiveAccuracy(calculateAccuracy(correctChars, totalTyped));
  }, [correctChars, totalTyped, elapsedSeconds, status]);

  // ---------- Reset ----------

  const resetTest = useCallback(() => {
    clearRunningTimer();
    loadRandomText();
  }, [clearRunningTimer, loadRandomText]);

  const startNewTest = useCallback(() => {
    clearRunningTimer();
    loadRandomText();
  }, [clearRunningTimer, loadRandomText]);

  // Retry the exact same text (used by the "Restart Test" action)
  const retrySameText = useCallback(() => {
    clearRunningTimer();
    setCharStates(new Array(text.length).fill('pending'));
    setCurrentIndex(0);
    setTypedValue('');
    setCorrectChars(0);
    setIncorrectChars(0);
    setTotalTyped(0);
    setLiveWpm(0);
    setLiveAccuracy(100);
    setTimeLeft(timeDuration);
    setElapsedSeconds(0);
    setResult(null);
    setStatus('idle');
  }, [clearRunningTimer, text, timeDuration]);

  // ---------- Mode setters that also reset the current test ----------

  const changeTestMode = useCallback(
    (mode) => {
      setTestMode(mode);
      setPracticeCategory(null);
      clearRunningTimer();
      loadRandomText({ mode, category: null });
    },
    [clearRunningTimer, loadRandomText]
  );

  const changeTimeDuration = useCallback(
    (duration) => {
      setTimeDuration(duration);
      clearRunningTimer();
      loadRandomText({ mode: 'time', category: null, timeDuration: duration });
    },
    [clearRunningTimer, loadRandomText]
  );

  const changeWordCount = useCallback(
    (count) => {
      setWordCount(count);
      clearRunningTimer();
      loadRandomText({ mode: 'words', category: null, wordCount: count });
    },
    [clearRunningTimer, loadRandomText]
  );

  const changePracticeCategory = useCallback(
    (category) => {
      setPracticeCategory(category);
      clearRunningTimer();
      loadRandomText({ category });
    },
    [clearRunningTimer, loadRandomText]
  );

  return {
    // config
    testMode,
    timeDuration,
    wordCount,
    practiceCategory,
    changeTestMode,
    changeTimeDuration,
    changeWordCount,
    changePracticeCategory,

    // text + typing state
    text,
    charStates,
    currentIndex,
    typedValue,
    handleTyping,
    lastKey,

    // status
    status,
    timeLeft,
    elapsedSeconds,

    // stats
    correctChars,
    incorrectChars,
    totalTyped,
    liveWpm,
    liveAccuracy,
    result,
    aggregateStats,
    loadStatistics,

    // actions
    resetTest,
    startNewTest,
    retrySameText,
  };
}
