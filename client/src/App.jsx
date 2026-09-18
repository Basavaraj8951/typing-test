import React, { useState } from 'react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import ModeSelector from './components/ModeSelector.jsx';
import TypingArea from './components/TypingArea.jsx';
import StatsBar from './components/StatsBar.jsx';
import VirtualKeyboard from './components/VirtualKeyboard.jsx';
import ResultModal from './components/ResultModal.jsx';
import PracticePanel from './components/PracticePanel.jsx';
import StatisticsPanel from './components/StatisticsPanel.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import { useSettings } from './hooks/useSettings.js';
import { useTypingTest } from './hooks/useTypingTest.js';
import { resetStats } from './api.js';

export default function App() {
  const { settings, updateSetting, toggleTheme } = useSettings();
  const [activeView, setActiveView] = useState('test');

  const test = useTypingTest(settings, settings.soundEnabled);

  function handleSelectPracticeCategory(category) {
    test.changePracticeCategory(category);
    setActiveView('test');
  }

  async function handleResetStats() {
    const confirmed = window.confirm('Reset all saved statistics? This cannot be undone.');
    if (!confirmed) return;
    try {
      await resetStats();
      test.loadStatistics();
    } catch (err) {
      console.warn('Could not reset statistics:', err);
    }
  }

  return (
    <div className="app-shell">
      <Header
        activeView={activeView}
        onNavigate={setActiveView}
        theme={settings.theme}
        onToggleTheme={toggleTheme}
      />

      <main className="app-main">
        {activeView === 'test' && (
          <>
            <Hero />

            <ModeSelector
              testMode={test.testMode}
              timeDuration={test.timeDuration}
              wordCount={test.wordCount}
              onChangeMode={test.changeTestMode}
              onChangeTime={test.changeTimeDuration}
              onChangeWords={test.changeWordCount}
              disabled={test.status === 'running' || Boolean(test.practiceCategory)}
            />

            {test.practiceCategory && (
              <p className="practice-banner">
                Practicing: <strong>{test.practiceCategory}</strong>
                <button type="button" className="link-btn" onClick={() => test.changePracticeCategory(null)}>
                  Exit practice
                </button>
              </p>
            )}

            <TypingArea
              text={test.text}
              charStates={test.charStates}
              currentIndex={test.currentIndex}
              typedValue={test.typedValue}
              onType={test.handleTyping}
              status={test.status}
              timeLeft={test.timeLeft}
              testMode={test.testMode}
              practiceCategory={test.practiceCategory}
              liveWpm={test.liveWpm}
              liveAccuracy={test.liveAccuracy}
              caretStyle={settings.caretStyle}
              fontSize={settings.fontSize}
            />

            <StatsBar
              liveWpm={test.liveWpm}
              liveAccuracy={test.liveAccuracy}
              incorrectChars={test.incorrectChars}
              totalTyped={test.totalTyped}
              elapsedSeconds={test.elapsedSeconds}
              onRestart={test.startNewTest}
            />

            {settings.showKeyboard && <VirtualKeyboard lastKey={test.lastKey} />}
          </>
        )}

        {activeView === 'practice' && (
          <PracticePanel
            activeCategory={test.practiceCategory}
            onSelectCategory={handleSelectPracticeCategory}
          />
        )}

        {activeView === 'statistics' && (
          <StatisticsPanel stats={test.aggregateStats} onReset={handleResetStats} />
        )}

        {activeView === 'settings' && (
          <SettingsPanel settings={settings} onUpdate={updateSetting} />
        )}
      </main>

      {test.status === 'finished' && test.result && (
        <ResultModal
          result={test.result}
          onRestartSame={test.retrySameText}
          onNewTest={test.startNewTest}
        />
      )}

      <footer className="site-footer">
        <p>TypingPro — built with React, Vite &amp; Express.</p>
      </footer>
    </div>
  );
}
