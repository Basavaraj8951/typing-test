import React from 'react';

export default function SettingsPanel({ settings, onUpdate }) {
  return (
    <section className="panel">
      <h2 className="panel__title">Settings</h2>
      <p className="panel__subtitle">Preferences are saved automatically to this browser.</p>

      <div className="settings-grid">
        <div className="settings-row">
          <div>
            <span className="settings-row__label">Theme</span>
            <span className="settings-row__hint">Switch between dark and light interfaces.</span>
          </div>
          <div className="segmented" role="group" aria-label="Theme">
            <button
              type="button"
              className={settings.theme === 'dark' ? 'is-active' : ''}
              onClick={() => onUpdate('theme', 'dark')}
            >
              Dark
            </button>
            <button
              type="button"
              className={settings.theme === 'light' ? 'is-active' : ''}
              onClick={() => onUpdate('theme', 'light')}
            >
              Light
            </button>
          </div>
        </div>

        <div className="settings-row">
          <div>
            <span className="settings-row__label">Font size</span>
            <span className="settings-row__hint">Adjusts the size of the typing text.</span>
          </div>
          <div className="segmented" role="group" aria-label="Font size">
            {['small', 'medium', 'large'].map((size) => (
              <button
                key={size}
                type="button"
                className={settings.fontSize === size ? 'is-active' : ''}
                onClick={() => onUpdate('fontSize', size)}
              >
                {size[0].toUpperCase() + size.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="settings-row">
          <div>
            <span className="settings-row__label">Default test duration</span>
            <span className="settings-row__hint">Used the next time you start a Time mode test.</span>
          </div>
          <div className="segmented" role="group" aria-label="Default duration">
            {[15, 30, 60, 120].map((sec) => (
              <button
                key={sec}
                type="button"
                className={settings.duration === sec ? 'is-active' : ''}
                onClick={() => onUpdate('duration', sec)}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>

        <div className="settings-row">
          <div>
            <span className="settings-row__label">Caret style</span>
            <span className="settings-row__hint">How the current character is highlighted.</span>
          </div>
          <div className="segmented" role="group" aria-label="Caret style">
            {['block', 'line', 'underline'].map((style) => (
              <button
                key={style}
                type="button"
                className={settings.caretStyle === style ? 'is-active' : ''}
                onClick={() => onUpdate('caretStyle', style)}
              >
                {style[0].toUpperCase() + style.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="settings-row settings-row--toggle">
          <div>
            <span className="settings-row__label">Sound effects</span>
            <span className="settings-row__hint">Play a soft click on each keystroke.</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.soundEnabled}
            className={`switch ${settings.soundEnabled ? 'is-on' : ''}`}
            onClick={() => onUpdate('soundEnabled', !settings.soundEnabled)}
          >
            <span className="switch__thumb" />
          </button>
        </div>

        <div className="settings-row settings-row--toggle">
          <div>
            <span className="settings-row__label">Show keyboard</span>
            <span className="settings-row__hint">Display the virtual keyboard below the typing area.</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.showKeyboard}
            className={`switch ${settings.showKeyboard ? 'is-on' : ''}`}
            onClick={() => onUpdate('showKeyboard', !settings.showKeyboard)}
          >
            <span className="switch__thumb" />
          </button>
        </div>

        <div className="settings-row settings-row--toggle">
          <div>
            <span className="settings-row__label">Smooth animations</span>
            <span className="settings-row__hint">Enable transition and motion effects across the app.</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.smoothAnimations}
            className={`switch ${settings.smoothAnimations ? 'is-on' : ''}`}
            onClick={() => onUpdate('smoothAnimations', !settings.smoothAnimations)}
          >
            <span className="switch__thumb" />
          </button>
        </div>
      </div>
    </section>
  );
}
