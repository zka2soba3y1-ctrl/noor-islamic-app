# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Fixed
- **CSP blocked SQLite WASM** — added `'wasm-unsafe-eval'` to `script-src` so the
  local database compiles under the hardened Content-Security-Policy.
- **Mobile header overflow** — header buttons (749px wide) broke small screens;
  the header now wraps cleanly (verified: 390px viewport, zero horizontal scroll).
- App footer is now always visible above the fixed bottom navigation
  (`pb-32/sm:pb-36` + `z-10`) on mobile and desktop.

### Changed
- **Dropped the Qwen / `b.ai` dependency entirely.** The app is now powered by
  **Google Gemini** alone as its primary AI engine (companion, vision, fatwa).
- Added an **optional, provider-agnostic OpenAI-compatible endpoint** via three
  new env vars (`CUSTOM_AI_BASE_URL`, `CUSTOM_AI_API_KEY`, `CUSTOM_AI_MODEL`).
  Fill all three to route AI requests through DeepSeek, Groq, OpenRouter,
  Ollama, or any OpenAI-compatible server. When unset, the app runs on Gemini
  only — nothing breaks.
- `fatwa-consultant` now reports the model that actually produced the answer
  (`modelUsed`) instead of a hardcoded string.
- `index.html` now uses local `/favicon.png` and `/apple-touch-icon.png` instead
  of a remote `i.ibb.co` URL (better privacy and reliability).

### Security
- **[CRITICAL]** Removed hardcoded API keys from `server.ts`. All secrets now come
  exclusively from environment variables (`GEMINI_API_KEY`, `CUSTOM_AI_API_KEY`).
  If you forked this project before this change, **rotate your keys immediately**.
- Added `helmet` for security headers (CSP, HSTS, X-Frame-Options, and more).
- Added `express-rate-limit`: global limiter (300 req / 15 min) and a stricter
  limiter for AI endpoints (20 req / min).

### Removed
- Cleaned up unused deployment artifacts: `deploy/README.md.old`,
  `deploy/nginx/`, and `deploy/windows/` (the Nginx + NSSM setup was retired in
  favor of the Cloudflare Tunnel architecture documented in `deploy/README.md`).
- Removed the `QWEN_BASE_URL` / `QWEN_API_KEY` / `QWEN_MODEL` env vars.

### Docs
- Added `README.md`, `SECURITY.md`, `CONTRIBUTING.md`, `CHANGELOG.md`.
- Added GitHub Issue templates and a CI workflow.

### License — re-dedicated to the public domain
- **Switched the license from MIT to CC0 1.0 Universal (public domain).** The
  project is now a fully open-source endowment: anyone may use, modify,
  publish, rename, rebrand, or monetize it — with or without attribution.
  The `README.md` now opens with this public-domain declaration, and the
  blueprint view ("Pitch Deck" tab in the app) gained an
  **"Open-Source Endowment"** section that communicates it to every visitor.

---

## [1.0.0] — Initial public release

### Added
- **Mushaf Al-Madinah** — full 604-page Quran with per-ayah audio recitation.
- **Noor Companion** — AI-powered voice assistant (Google Gemini) with natural
  Egyptian Arabic TTS, including emotional support conversation.
- **Basira Vision** — scene description for blind users via the device camera.
- **Prayer times** — accurate calculations by location, Qibla direction,
  multiple adhans (Egypt, Madinah, Al-Quds), and automatic silent mode.
- **Athkar & Hisn Al-Muslim** — morning/evening adhkar, hourly adhkar tracking,
  and the complete Hisn Al-Muslim collection with smart reminders.
- **Lectures & live streaming** — HLS live streams from the Two Holy Mosques.
- **Hijri calendar** — Islamic events and important Hijri dates.
- **Mosque finder** — nearby mosques with prayer times.
- **Zakat calculator** — accurate Zakat calculation for money, gold, and silver.
- **Achievements system** — daily worship tracking with motivational badges.
- **Dark / Light modes** with customizable Islamic wallpapers.
- **i18n** — Arabic (RTL) primary with multi-language support.
- **Sensory (blind) mode** — fully voice-driven interface with haptic feedback
  and shake-to-activate gestures.
- **PWA** — installable, offline-capable, with local SQLite WASM storage.
- **Zero ads, zero tracking, zero cost** — a perpetual endowment (Waqf) for the
  sake of Allah.

[Unreleased]: https://github.com/ahmed-genius/noor-islamic-app/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/ahmed-genius/noor-islamic-app/releases/tag/v1.0.0
