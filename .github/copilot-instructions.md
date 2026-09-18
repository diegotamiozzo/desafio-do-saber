# Copilot instructions for Desafio do Saber

## Project overview

Desafio do Saber is a Portuguese-first, browser-based quiz game for two players. It is a Vite + React 19 + TypeScript frontend served by the same Express process that exposes the backend API. Production is one Render Web Service; the browser and API intentionally use the same origin.

The application has no database and no local question bank. Questions are generated only by Groq through the server. Do not add a frontend API-origin override, CORS-only deployment path, separate frontend service, Gemini integration, offline generator, or silent fallback questions.

## Commands

Install dependencies:

```bash
npm install
```

Run the Vite middleware and Express API locally:

```bash
npm run dev
```

The local app is available at `http://localhost:3000`. Create `.env` from `.env.example`; the server needs `GROQ_API_KEY`, `ADMIN_USER`, and `ADMIN_PASS` for the complete flow.

Type-check the project:

```bash
npm run lint
```

`lint` runs `tsc --noEmit`; there is no ESLint configuration.

Build the frontend and production server bundle:

```bash
npm run build
```

This runs `vite build` and bundles `server.ts` to `dist/server.cjs`. Run the production bundle with:

```bash
npm start
```

Preview only the built frontend with:

```bash
npm run preview
```

There is no test runner or test script in `package.json`, so there is no single-test command. Use `npm run lint` and `npm run build` as the available automated checks; exercise API/game behavior manually through the running app when needed.

## Architecture and data flow

- `src/App.tsx` defines the React Router routes and wraps protected screens with `AuthProvider`, `GameProvider`, and `ProtectedRoute`.
- `src/pages/` contains login, home, settings, and gameplay screens. `src/components/` contains the reusable UI for configuration, question display, timer, scores, results, and hardware status.
- `src/context/AuthContext.tsx` calls same-origin `POST /api/auth/login`, checks `GET /api/auth/session`, and logs out through `POST /api/auth/logout`. The server compares credentials only with runtime `ADMIN_USER` and `ADMIN_PASS`, then signs an HttpOnly session cookie; missing configuration must reject login.
- `src/context/GameContext.tsx` is the gameplay orchestrator. It loads/saves configuration and sound preferences, requests questions, handles button ownership, scores, answer history, the 30-second timer, round transitions, and saved match results.
- `src/services/questionService.ts` posts configuration to `/api/perguntas/gerar`, validates the response, and exposes Groq notices/errors to the UI. `server.ts` calls Groq, normalizes model output, and returns the shared question shape.
- `src/services/hardwareService.ts` provides keyboard fallback and optional Web Serial input. `1`/`2` keyboard presses remain available without an ESP32; serial input is read at 115200 baud.
- In development, `server.ts` mounts Vite middleware. In production, it serves `dist` and falls back to `dist/index.html` for SPA routes. The health endpoint is `GET /api/status`.

The relevant gameplay state transitions are `IDLE`, `GENERATING`, `READY`, `WAITING_BUTTON`, `ANSWERING`, `CORRECT`, `INCORRECT`, `TIMEOUT`, and `FINISHED`. Preserve these transitions and the 30-second answer countdown when changing generation, input, or answer-handling code.

## Domain and API contracts

Keep domain names and user-facing copy Portuguese-first: `tema`, `temaPersonalizado`, `contexto`, `dificuldade`, `perguntas`, `jogador1`, and `jogador2`.

The shared `Question` contract requires:

- exactly four alternatives with IDs `A`, `B`, `C`, and `D`;
- one valid `respostaCorreta`;
- a non-empty `pergunta` and `tema`;
- `dificuldade` equal to `facil`, `medio`, or `dificil`;
- child-safe question and alternative text.

The allowed batch sizes are 4, 8, and 12. Keep validation in `questionService.ts` aligned with the normalization and JSON contract in `server.ts`. Preserve API response fields `success`, `source`, `perguntas`, `error`, and `notice`; the successful source is currently `groq`. Backend/API failures must remain visible to the user rather than being replaced by hard-coded or locally generated questions.

`src/data/constants.ts` is the source for default game configuration, supported themes, difficulties, question counts, and player metadata. `src/types/index.ts` contains the shared domain types; update those types when changing contracts instead of duplicating string unions.

## Persistence and secrets

Configuration, sound preference, and up to 20 recent game results are stored in browser `localStorage` through the existing services and keys. Authentication is enforced by the server-side signed HttpOnly cookie, not by a client-controlled localStorage flag. Preserve the merge-with-defaults behavior when extending saved configuration.

Keep `GROQ_API_KEY`, `ADMIN_USER`, `ADMIN_PASS`, and `AUTH_SESSION_SECRET` server-side. Never put them in frontend code or `VITE_*` variables, and never commit `.env`. `POST /api/perguntas/gerar` requires an authenticated session; do not make it public or add a client-side credential bypass.

## Hardware behavior

The firmware in `hardware/esp32_desafio_saber.ino` uses buttons on GPIO 18 and 19 with `INPUT_PULLUP`, sends `BTN:1`/`BTN:2`, and debounces presses. The frontend also accepts `PLAYER:1`, `PLAYER:2`, `1`, and `2`, each terminated by a newline.

Web Serial requires a secure context and a browser with Web Serial support (Chrome or Edge). Keyboard input must continue to be ignored while typing in an input, textarea, or content-editable element.

## Deployment

Render runs the service as:

```text
Build: npm install && npm run build
Start: npm start
Health check: /api/status
```

The server uses `PORT` from the environment and defaults to 3000 locally. Keep the deployment single-origin: Express serves both the compiled SPA and API.
