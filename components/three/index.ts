// Arcade Quest — 3D Cabinet (current direction).
// SceneFrame is the only public surface; it isolates three.js behind a
// dynamic(ssr:false) import. We deliberately do NOT eagerly re-export
// ArcadeScene here — a value re-export would statically link three.js into
// any module that imports this barrel and defeat the SSR isolation. Import
// ArcadeScene directly from './arcade-scene' (only scene-frame does, lazily).
export { SceneFrame } from './scene-frame'
export type { SceneAccent, SceneVariant } from './arcade-scene'

// CSS-only fallback scene + capability hook
export { CSSAnimatedScene, use3DSupport } from './css-animated-scene'
