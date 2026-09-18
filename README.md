# TypingPro

A premium, modern typing speed test — React front end, Express back end.

Test your typing speed, accuracy and consistency with Time and Word modes, themed Practice
passages, a live virtual keyboard, persistent statistics, and a fully customizable dark/light
glassmorphism interface.

---

## Tech stack

- **Frontend:** React 18 + Vite (plain CSS, no UI framework)
- **Backend:** Node.js + Express (serves passages, persists statistics to a local JSON file)
- No database setup required — statistics are stored in `server/data/stats.json`, created
  automatically the first time the server runs.

## Project structure

```
typing-test/
├── client/                     React frontend (Vite)
│   ├── public/
│   │   └── logo.svg
│   ├── src/
│   │   ├── components/         Header, Hero, TypingArea, VirtualKeyboard, panels, etc.
│   │   ├── data/                Client-side fallback passages
│   │   ├── hooks/               useTypingTest, useSettings
│   │   ├── styles/index.css     All styling and design tokens
│   │   ├── utils/                Sound effects, word-stream generator
│   │   ├── api.js               Backend API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                      Express backend
│   ├── data/passages.json       Passage bank (general + practice categories)
│   ├── server.js
│   └── package.json
└── README.md
```

## Features

- **Time modes:** 15 / 30 / 60 / 120 seconds, with the word stream auto-extending so you never
  run out of text before the clock does.
- **Word modes:** 25 / 50 / 100 words.
- **Practice mode:** Easy, Medium, Hard, Programming, Quotes, and Technology categories, each
  pulling from a themed passage bank on the backend.
- **Live stats:** WPM, accuracy, errors, characters typed, and elapsed time, all updating in
  real time as you type.
- **Result screen:** Final WPM, accuracy, errors, correct/total characters, duration, and a
  performance rating, with **Restart Test** (same text) and **New Test** (fresh text) actions.
- **Persisted statistics:** Best WPM, best accuracy, tests completed, and running averages —
  saved on the backend and shown on the Statistics page, with a recent-tests history table.
- **Virtual keyboard:** Highlights the physical key you press and flashes green/red based on
  whether the keystroke was correct.
- **Settings:** Theme, font size, default test duration, caret style, sound effects, keyboard
  visibility, and animation toggle — saved to `localStorage`.
- **Anti-cheat:** Paste, copy, and right-click are disabled inside the typing field.
- **Accessible & responsive:** Semantic HTML, visible focus states, ARIA labels, and layouts
  tuned for desktop, tablet, and mobile.

---

## Running it in VS Code

### 1. Open the project

Open the `typing-test` folder in VS Code (`File → Open Folder…`).

### 2. Install dependencies

Open a terminal in VS Code (`` Ctrl+` ``) and install both the server and client dependencies:

```bash
cd server
npm install

cd ../client
npm install
```

### 3. Start the backend

In one terminal, from the `server` folder:

```bash
npm start
```

This runs the API at `http://localhost:4000`. It creates `server/data/stats.json` automatically
on first run.

### 4. Start the frontend

Open a **second** terminal (`Terminal → Split Terminal` or `Terminal → New Terminal`), then from
the `client` folder:

```bash
npm run dev
```

Vite will print a local URL, typically `http://localhost:5173`. Open it in your browser (or hold
Ctrl/Cmd and click the link in the VS Code terminal).

The frontend proxies all `/api/*` requests to the backend, so both need to be running for
statistics and passage fetching to work. If the backend isn't running, the app still works using
its built-in fallback passages — only the persisted statistics feature requires the server.

### 5. Start typing

Click into the typing card and start typing — the timer or progress counter starts
automatically on your first keystroke.

---

## Building for production

```bash
cd client
npm run build
```

This outputs a static `client/dist` folder that can be served by any static host. Keep the
`server` running (or deploy it separately) so the app can still save and load statistics —
otherwise the app falls back to local passages only.

## Notes

- No `eval()`, no external UI frameworks, and no build step is required beyond Vite's standard
  dev/build commands.
- Only one timer can ever run at a time — starting a new test always clears any existing
  interval first.
- All sound effects are generated live with the Web Audio API; no audio files are bundled.
