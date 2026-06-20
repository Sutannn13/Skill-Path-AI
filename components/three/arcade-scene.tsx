'use client'

import { useRef } from 'react'
import { Canvas, useFrame, type ThreeElements } from '@react-three/fiber'
import { Float, RoundedBox, Outlines } from '@react-three/drei'
import * as THREE from 'three'

// ============================================================
// Arcade Quest — 3D Cabinet scene (neobrutalist WebGL)
// Flat / cel-shaded low-poly objects in the SkillPath palette,
// every solid wrapped in a hard black inverted-hull Outline.
// No glass, chrome, realistic PBR, or network HDR environment
// (DESIGN.md 3D material law). Explicit lights only.
// This module is loaded client-only via next/dynamic(ssr:false)
// from scene-frame.tsx — it never server-renders.
// ============================================================

const PALETTE = {
  yellow: '#FFD447',
  blue: '#7CC9FF',
  pink: '#FF8FAB',
  green: '#9BE564',
  orange: '#FFB86B',
  purple: '#B39DDB',
  ink: '#111111',
  // Cabinet surfaces — match the documented DESIGN.md tokens / globals.css
  // (--color-cabinet, --color-cabinet-soft) so the WebGL cabinet agrees with
  // the DOM HUD that overlays it.
  cabinet: '#1A1726',
  cabinetSoft: '#241F35',
  screen: '#0E1A33',
} as const

const OUTLINE = '#111111'

export type SceneAccent = 'yellow' | 'pink' | 'blue' | 'green' | 'purple'
export type SceneVariant = 'hero' | 'auth'

const accentHex: Record<SceneAccent, string> = {
  yellow: PALETTE.yellow,
  pink: PALETTE.pink,
  blue: PALETTE.blue,
  green: PALETTE.green,
  purple: PALETTE.purple,
}

// --- Solid helper: matte toon fill + hard black outline ---
function ToonSolid({
  color,
  emissive,
  emissiveIntensity = 0,
  outline = 0.045,
  children,
  ...props
}: {
  color: string
  emissive?: string
  emissiveIntensity?: number
  outline?: number
  children: React.ReactNode
} & ThreeElements['mesh']) {
  return (
    <mesh {...props}>
      {children}
      <meshToonMaterial color={color} emissive={emissive ?? '#000000'} emissiveIntensity={emissiveIntensity} />
      <Outlines thickness={outline} color={OUTLINE} />
    </mesh>
  )
}

// --- The arcade cabinet: chunky low-poly, marquee + CRT + controls ---
function ArcadeCabinet({ accent }: { accent: SceneAccent }) {
  const group = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.getElapsedTime()
    group.current.rotation.y = Math.sin(t * 0.45) * 0.12
    group.current.position.y = -0.25 + Math.sin(t * 0.9) * 0.05
  })

  const accentColor = accentHex[accent]

  return (
    <group ref={group} position={[0, -0.25, 0]}>
      {/* Marquee header */}
      <ToonSolid color={accentColor} position={[0, 1.78, 0.18]}>
        <boxGeometry args={[2.5, 0.55, 1.05]} />
      </ToonSolid>

      {/* Cabinet body — cabinet-soft so it stands off the darker frame bg */}
      <ToonSolid color={PALETTE.cabinetSoft} position={[0, 0.1, 0]}>
        <boxGeometry args={[2.3, 3.3, 1.5]} />
      </ToonSolid>

      {/* Side glow strips */}
      <ToonSolid color={PALETTE.pink} emissive={PALETTE.pink} emissiveIntensity={0.35} outline={0.03} position={[-1.18, 0.3, 0.2]}>
        <boxGeometry args={[0.08, 2.6, 0.9]} />
      </ToonSolid>
      <ToonSolid color={PALETTE.blue} emissive={PALETTE.blue} emissiveIntensity={0.35} outline={0.03} position={[1.18, 0.3, 0.2]}>
        <boxGeometry args={[0.08, 2.6, 0.9]} />
      </ToonSolid>

      {/* Screen bezel */}
      <ToonSolid color={PALETTE.ink} position={[0, 0.85, 0.78]}>
        <boxGeometry args={[1.8, 1.35, 0.12]} />
      </ToonSolid>

      {/* CRT screen (emissive, no outline) */}
      <mesh position={[0, 0.85, 0.86]}>
        <planeGeometry args={[1.5, 1.08]} />
        <meshBasicMaterial color={PALETTE.screen} toneMapped={false} />
      </mesh>
      {/* On-screen quest nodes — lit/unlit progression */}
      <ScreenQuestRow accent={accentColor} />

      {/* Control deck — darker cabinet recess */}
      <ToonSolid color={PALETTE.cabinet} position={[0, -0.75, 0.62]} rotation={[-0.55, 0, 0]}>
        <boxGeometry args={[2.0, 0.7, 0.55]} />
      </ToonSolid>

      {/* Joystick */}
      <group position={[-0.55, -0.62, 0.92]} rotation={[-0.55, 0, 0]}>
        <ToonSolid color={PALETTE.ink} outline={0.03} position={[0, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.2, 0.12, 16]} />
        </ToonSolid>
        <ToonSolid color={PALETTE.ink} outline={0.03} position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.42, 12]} />
        </ToonSolid>
        <ToonSolid color={PALETTE.pink} emissive={PALETTE.pink} emissiveIntensity={0.3} outline={0.035} position={[0, 0.46, 0]}>
          <sphereGeometry args={[0.13, 16, 16]} />
        </ToonSolid>
      </group>

      {/* Buttons */}
      {[
        { x: 0.35, c: PALETTE.yellow },
        { x: 0.62, c: PALETTE.green },
        { x: 0.5, y: 0.16, c: PALETTE.blue },
      ].map((b, i) => (
        <ToonSolid
          key={i}
          color={b.c}
          emissive={b.c}
          emissiveIntensity={0.3}
          outline={0.03}
          position={[b.x, -0.66 + (b.y ?? 0), 0.95]}
          rotation={[-0.55, 0, 0]}
        >
          <cylinderGeometry args={[0.11, 0.11, 0.08, 16]} />
        </ToonSolid>
      ))}

      {/* Base / legs */}
      <ToonSolid color={PALETTE.ink} position={[0, -1.7, 0]}>
        <boxGeometry args={[2.1, 0.3, 1.4]} />
      </ToonSolid>
    </group>
  )
}

// On-screen lit/unlit quest nodes (the "earned progression" mechanic).
function ScreenQuestRow({ accent }: { accent: string }) {
  const nodes = [
    { x: -0.5, lit: true, c: PALETTE.green },
    { x: -0.17, lit: true, c: PALETTE.green },
    { x: 0.17, lit: true, c: accent },
    { x: 0.5, lit: false, c: '#3A4560' },
  ]
  return (
    <group position={[0, 0.85, 0.88]}>
      {nodes.map((n, i) => (
        <mesh key={i} position={[n.x, 0, 0]}>
          <boxGeometry args={[0.18, 0.18, 0.02]} />
          <meshBasicMaterial color={n.c} toneMapped={false} />
        </mesh>
      ))}
      {/* connectors */}
      {[-0.335, 0, 0.335].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]}>
          <boxGeometry args={[0.13, 0.03, 0.01]} />
          <meshBasicMaterial color={i < 2 ? PALETTE.green : '#3A4560'} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

// --- Collectibles ---
function Coin({ position, color = PALETTE.yellow }: { position: [number, number, number]; color?: string }) {
  const spin = useRef<THREE.Group>(null)
  useFrame((s) => {
    if (spin.current) spin.current.rotation.y = s.clock.getElapsedTime() * 1.6
  })
  return (
    <Float speed={2.2} rotationIntensity={0.3} floatIntensity={1.3}>
      <group ref={spin} position={position}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.34, 0.34, 0.09, 28]} />
          <meshToonMaterial color={color} emissive={color} emissiveIntensity={0.3} />
          <Outlines thickness={0.05} color={OUTLINE} />
        </mesh>
      </group>
    </Float>
  )
}

function QuestTile({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <Float speed={1.6} rotationIntensity={0.5} floatIntensity={1.1}>
      <RoundedBox args={[0.7, 0.7, 0.18]} radius={0.08} smoothness={3} position={position} rotation={[0.2, 0.4, 0.1]}>
        <meshToonMaterial color={color} />
        <Outlines thickness={0.04} color={OUTLINE} />
      </RoundedBox>
    </Float>
  )
}

function Gem({ position, color = PALETTE.purple }: { position: [number, number, number]; color?: string }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = s.clock.getElapsedTime() * 0.9
  })
  return (
    <Float speed={2} rotationIntensity={0.6} floatIntensity={1.4}>
      <mesh ref={ref} position={position}>
        <octahedronGeometry args={[0.42, 0]} />
        <meshToonMaterial color={color} emissive={color} emissiveIntensity={0.25} />
        <Outlines thickness={0.05} color={OUTLINE} />
      </mesh>
    </Float>
  )
}

// --- Pointer parallax wrapper (whole scene leans toward the cursor) ---
function ParallaxRig({ children }: { children: React.ReactNode }) {
  const rig = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (!rig.current) return
    const tx = state.pointer.x * 0.22
    const ty = -state.pointer.y * 0.12
    rig.current.rotation.y += (tx - rig.current.rotation.y) * 0.05
    rig.current.rotation.x += (ty - rig.current.rotation.x) * 0.05
  })
  return <group ref={rig}>{children}</group>
}

function Lights({ accent }: { accent: SceneAccent }) {
  return (
    <>
      <ambientLight intensity={0.85} />
      <hemisphereLight args={['#ffffff', '#241F35', 0.5]} />
      <directionalLight position={[5, 8, 6]} intensity={1.0} />
      <pointLight position={[-4, 1, 4]} intensity={0.7} color={PALETTE.pink} distance={20} decay={0} />
      <pointLight position={[4, 2, 3]} intensity={0.6} color={accentHex[accent]} distance={20} decay={0} />
    </>
  )
}

function SceneContents({ variant, accent }: { variant: SceneVariant; accent: SceneAccent }) {
  return (
    <ParallaxRig>
      <ArcadeCabinet accent={accent} />
      <Coin position={[-2.3, 1.5, 0.4]} color={PALETTE.yellow} />
      <Gem position={[2.4, 1.2, 0.2]} color={PALETTE.purple} />
      {variant === 'hero' && (
        <>
          <QuestTile position={[2.5, -0.6, 0.6]} color={PALETTE.green} />
          <QuestTile position={[-2.6, -0.7, 0.3]} color={PALETTE.blue} />
          <Coin position={[2.0, 2.2, -0.6]} color={PALETTE.yellow} />
        </>
      )}
    </ParallaxRig>
  )
}

export function ArcadeScene({
  variant = 'hero',
  accent = 'yellow',
  onContextLost,
}: {
  variant?: SceneVariant
  accent?: SceneAccent
  // Fired on async WebGL context loss (GPU reset, too many contexts) so the
  // host can swap to the static poster — React error boundaries cannot catch
  // this DOM event.
  onContextLost?: () => void
}) {
  return (
    <Canvas
      flat
      dpr={[1, 1.5]}
      camera={variant === 'hero' ? { position: [0, 0.4, 7.6], fov: 40 } : { position: [0, 0.3, 8.2], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%' }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener(
          'webglcontextlost',
          (event) => {
            event.preventDefault()
            onContextLost?.()
          },
          { once: true }
        )
      }}
    >
      <Lights accent={accent} />
      <SceneContents variant={variant} accent={accent} />
    </Canvas>
  )
}

export default ArcadeScene
