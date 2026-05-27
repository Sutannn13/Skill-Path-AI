'use client'

import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Environment } from '@react-three/drei'
import * as THREE from 'three'

interface ThreeFloatingSceneProps {
  className?: string
  showLaptop?: boolean
  showBadge?: boolean
  showBook?: boolean
}

export function ThreeFloatingScene({
  className = 'h-96',
  showLaptop = true,
  showBadge = true,
  showBook = true,
}: ThreeFloatingSceneProps) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} color="#FFD447" />

          {/* Background shapes */}
          <BackgroundShapes />

          {/* Floating objects */}
          {showLaptop && <FloatingLaptop />}
          {showBadge && <FloatingBadge />}
          {showBook && <FloatingBook />}

          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  )
}

function BackgroundShapes() {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([])

  const shapes = useMemo(
    () => [
      { position: [-3, 2, -2] as [number, number, number], color: '#FFD447', scale: 0.5 },
      { position: [4, -1, -3] as [number, number, number], color: '#7CC9FF', scale: 0.4 },
      { position: [-2, -2, -1] as [number, number, number], color: '#FF8FAB', scale: 0.3 },
      { position: [3, 3, -2] as [number, number, number], color: '#9BE564', scale: 0.6 },
    ],
    []
  )

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    meshRefs.current.forEach((mesh, i) => {
      if (mesh) {
        mesh.rotation.x = time * 0.2 + i
        mesh.rotation.y = time * 0.3 + i
      }
    })
  })

  return (
    <>
      {shapes.map((shape, i) => (
        <Float key={i} speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <mesh
            ref={(el) => { meshRefs.current[i] = el }}
            position={shape.position}
            scale={shape.scale}
          >
            <icosahedronGeometry args={[1, 0]} />
            <MeshDistortMaterial color={shape.color} speed={2} distort={0.2} />
          </mesh>
        </Float>
      ))}
    </>
  )
}

function FloatingLaptop() {
  const meshRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2
      meshRef.current.rotation.x = Math.cos(state.clock.getElapsedTime() * 0.3) * 0.1
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={meshRef} position={[0, 0, 0]} scale={0.8}>
        {/* Laptop base */}
        <mesh position={[0, -0.3, 0]}>
          <boxGeometry args={[2, 0.1, 1.4]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        {/* Laptop screen */}
        <mesh position={[0, 0.3, -0.5]}>
          <boxGeometry args={[2, 1.4, 0.05]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        {/* Screen glow */}
        <mesh position={[0, 0.3, -0.47]}>
          <planeGeometry args={[1.8, 1.2]} />
          <meshBasicMaterial color="#7CC9FF" opacity={0.8} transparent />
        </mesh>
      </group>
    </Float>
  )
}

function FloatingBadge() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.getElapsedTime() * 0.5
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={[2.5, 1.5, 1]}>
        <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
        <meshStandardMaterial color="#FFD447" metalness={0.8} roughness={0.2} />
      </mesh>
    </Float>
  )
}

function FloatingBook() {
  const meshRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.4) * 0.3
    }
  })

  return (
    <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.8}>
      <group ref={meshRef} position={[-2, -1, 1]} scale={0.6}>
        {/* Book cover */}
        <mesh>
          <boxGeometry args={[1.5, 2, 0.3]} />
          <meshStandardMaterial color="#B39DDB" />
        </mesh>
        {/* Book pages */}
        <mesh position={[0.05, 0, 0]}>
          <boxGeometry args={[1.4, 1.9, 0.2]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
      </group>
    </Float>
  )
}
