# Design Contract

## Current Direction — Cat Quest (Playful Mascot Neobrutalism)

SkillPath keeps neobrutalism as its structural base, fronted by a **friendly animated cat mascot** as the product's personality. The landing hero and the auth welcome panels are bright "cat stage" zones: a large animated SVG cat (blink, mood cycle, ear/tail motion, occasional wave) standing on an accent-tinted stage with floating confetti, a soft spotlight, and a hard neobrutalist frame. The cat is the guide/companion that cheers the learner on.

Build Lab discipline is retained: outside the stage the product stays on cream with bento grids, semantic status color, monospace metrics, and one clear primary action per view. The animated cat is decorative-but-friendly; all real information lives in DOM text / HUD beside it.

This is a **visual / composition / motion direction** over unchanged plumbing. Routing, Supabase data flow, the `brutal/*` primitive contracts, and `AuthFormLayout` + `AuthInput/PasswordToggle/AuthError` are preserved. The prior VHS/broadcast experiment is removed (no `<video>`, no CRT static) and three.js stays off the landing/auth critical path.

## Anchor

The SkillPath cat mascot on a spotlit stage — a friendly companion you "level up" with. Borrowed mechanic: a **reactive character** (mood + speech bubble respond to context, e.g. covering its eyes on a password field) that makes progress feel personal and playful, rendered as a flat SVG "sticker given life" with thick black outlines.

## Tokens

- **Typography**
  - Display: `Space Grotesk` (Black) — headlines. Body: `Inter`. Metric/mono: `JetBrains Mono` (tabular) — XP, levels, stats. HUD accent: `Silkscreen` (pixel) — short uppercase labels only (>=14px), never body.
  - Scale (base 16, ratio ~1.25): `display` 48/1.05, `display-sm` 36/1.1, `heading` 24/1.2, `heading-sm` 20/1.25, `body-lg` 18/1.5, `body` 16/1.5, `body-sm` 14/1.5, `caption` 12/1.4.
- **Colors** (hex; palette retained)
  - Palette: yellow `#FFD447`, blue `#7CC9FF`, pink `#FF8FAB`, green `#9BE564`, orange `#FFB86B`, purple `#B39DDB`, red `#FF6B6B`; cream bg `#FFF7E6`; cream-light `#FFFDF5`; ink `#111111`.
  - Stage backdrop: an accent-tinted vertical gradient on cream (e.g. `from-yellow/60 to-cream-light`) per `sceneAccent`; confetti uses the bright palette with 3px black borders.
  - Cabinet/dark surfaces `#1A1726` / `#241F35` remain available for dark sections (e.g. boss-battle band, footer) only.
  - Semantic text: `--text-primary` `#111111`; `--text-secondary` `#44464F`; `--text-tertiary` `#5C5F6B`. On dark: `--text-on-dark` `#FFFFFF`; `--text-on-dark-soft` `#C9CBD6`.
  - On-color rule: full-opacity `text-black` on yellow/blue/green/orange/pink/cream and all tints; `text-white` on red/purple/cabinet. No `text-black/60|70` or `text-gray-500|600` as body.
  - Semantic status (always color + icon + text): success=green, progress/info=blue, warning=orange, danger=red, active/xp=yellow, locked=`gray-300` + lock icon.
- **Cat-stage law** (binding for the mascot visual): the cat is a flat SVG with hard black outlines (no gradients-as-shading, no glossy/3D realism); it reuses the shared `AnimatedCatMascot` (one source of truth) inside `CatStage`. Confetti/spotlight/floor are decorative and `aria-hidden`. The stage carries no information that is not also in the DOM HUD/caption.
- **Spacing**: base 4px; scale 4/8/12/16/20/24/32/48. Card padding tiers: `compact` 16, `std` 20, `hero` 24.
- **Radius**: `sm` 8, `md` 12 (default `brutal-radius`), `lg` 16, `xl` 20.
- **Shadow** (hard offset, color `#111`): `subtle` 2px, `standard` 4px, `emphasis` 6px, `hero` 8px.
- **Motion**: durations micro 120ms / meso 220ms / macro 400ms; easing `cubic-bezier(0.2,0,0,1)`; press = translate to (0,0) + shadow collapse. Signatures: **level-up pop**, **ticked XP fill** (`steps()`), the cat's idle float/blink/wave, and gentle `cartoon-*` confetti drift. **Reduced motion disables the cat animation, confetti, and all decorative motion (the cat renders as a still pose), and state changes become instant.**

## Layout System

- **Cat stage zones**: landing hero-right, and the login / register / forgot-password welcome column (lg+ only, so mobile auth stays light). Each frames the animated cat with a **readable foreground HUD / caption** (Level / XP / current quest, or a short caption) so the zone carries information, not just spectacle.
- **Bento grids** for dashboard, GitHub, projects, skills: one primary tile (2x) + supporting tiles; one clear primary action.
- **Quest node-map** for roadmap: weeks as connected nodes with unlocked/locked gates; current node emphasized.
- **Shared primitives**: `CatStage` (the mascot stage) + `AnimatedCatMascot`. Plus `AuthFormLayout`, `BrutalCard`, `BrutalButton`, `StatTile`, `XPBar`, `LevelChip`, `StickerBadge`, `brutal-input`, and `CartoonBackground` for the playful page backdrop.

## Constraints

- **WCAG 2.2 AA is the hard floor.** The animated cat + confetti + spotlight are decorative: `aria-hidden` (or the mascot is `role="img"` + label where meaningful), and all of its information is duplicated as DOM text / HUD. Every interactive element gets `.focus-brutal-ring`; targets >=44px; no color-only meaning; status containers use `aria-live`.
- **Motion + performance gates**: the cat animation and confetti are pure SVG/CSS + framer-motion (no WebGL, no `<video>`); `prefers-reduced-motion` freezes them to a static pose; mobile auth (<lg) renders no stage at all (the form alone), keeping it light.
- **Anti-patterns (max 3)**: (1) glossy / 3D-realistic / gradient-shaded mascot (betrays the flat neobrutalist sticker look); (2) dark "broken-TV" / heavy-glitch surfaces under body / long-form content; (3) the stage as the *only* carrier of state or info (must be duplicated in the DOM HUD).

## Operational Rules (binding, preserved)

- **Confirmation dialogs**: never native `alert/confirm/prompt`. Use the shared neobrutalist modal — solid accent header, black border, hard shadow, explicit primary/cancel, Escape, focus trap + restore, scroll lock, destructive-impact copy, disabled dismissal while loading.
- **Bilingual learning resources**: one video player at a time; open on `1/2 English`, `Berikutnya` -> `2/2 Bahasa Indonesia` (label English fallback when none); require one video + one doc, not both languages; controls keyboard-accessible, visibly disabled at boundary, >=44px; no autoplay on language change.
- **Role surfaces**: user dashboard = personal readiness/sprint/skills/jobs/GitHub with mobile bottom nav; admin = operational density, no mobile bottom nav, same tokens. Never show static XP/streak/progress as if owned by the authenticated user.
- **Components**: reuse `AppShell`, `DashboardHeader`, `BrutalCard`, `BrutalButton`, `CatStage`, `AnimatedCatMascot`; Lucide icons for actions/status; keep client boundaries small; no new UI/animation library (framer-motion already shipped).

## Previous Directions (redesign blocklist)

- Phase 1 — Cartoon Neobrutalism: developer planner with sticky tabs, roadmap checkpoints, mascot scenes.
- Phase 2 — Arcade Quest (2D): neobrutalism + retro game HUD on flat cards (cabinet surfaces, ticked XP bars, stat tiles, lit/unlit quest states).
- Phase 3 — Arcade Quest 3D Cabinet: real-time WebGL low-poly arcade cabinet (React Three Fiber) in the landing hero + auth welcome panels, flat toon shading + black inverted-hull outlines.
- Phase 4 — Signal & Static (VHS / live-broadcast): degraded-VHS viewfinder with CRT static, scanlines, REC/timecode chrome, chromatic-split headlines. Removed in favor of the friendly cat mascot; do not reintroduce the broken-TV / heavy-glitch surface as the landing/auth chrome.
