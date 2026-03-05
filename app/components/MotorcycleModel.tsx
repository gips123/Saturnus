'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MotorcycleModelProps {
  scrollProgress: number;
}

export default function MotorcycleModel({ scrollProgress }: MotorcycleModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    // Rotate based on scroll progress: 0 to 2*PI (full rotation)
    groupRef.current.rotation.y = scrollProgress * Math.PI * 2;
    // Subtle hover/float animation
    groupRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.05;
  });

  // Shared materials
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: '#cc1c1c',
    metalness: 0.6,
    roughness: 0.2,
  });

  const chromeMaterial = new THREE.MeshStandardMaterial({
    color: '#d4d4d4',
    metalness: 1.0,
    roughness: 0.05,
  });

  const blackMaterial = new THREE.MeshStandardMaterial({
    color: '#111111',
    metalness: 0.4,
    roughness: 0.5,
  });

  const tireMaterial = new THREE.MeshStandardMaterial({
    color: '#1a1a1a',
    metalness: 0.0,
    roughness: 0.9,
  });

  const rimMaterial = new THREE.MeshStandardMaterial({
    color: '#c0c0c0',
    metalness: 0.9,
    roughness: 0.1,
  });

  const engineMaterial = new THREE.MeshStandardMaterial({
    color: '#333333',
    metalness: 0.7,
    roughness: 0.3,
  });

  const glassMaterial = new THREE.MeshStandardMaterial({
    color: '#88aacc',
    metalness: 0.1,
    roughness: 0.0,
    transparent: true,
    opacity: 0.5,
  });

  const exhaustMaterial = new THREE.MeshStandardMaterial({
    color: '#b8a040',
    metalness: 0.9,
    roughness: 0.15,
  });

  const seatMaterial = new THREE.MeshStandardMaterial({
    color: '#222222',
    metalness: 0.0,
    roughness: 0.8,
  });

  return (
    <group ref={groupRef} position={[0, -0.3, 0]} scale={1}>
      {/* ================================ */}
      {/* MAIN FRAME / BODY                */}
      {/* ================================ */}

      {/* Main frame tube (top) */}
      <mesh material={blackMaterial} position={[0, 0.45, 0]}>
        <boxGeometry args={[1.4, 0.07, 0.08]} />
      </mesh>

      {/* Down tube */}
      <mesh material={blackMaterial} position={[0.35, 0.15, 0]} rotation={[0, 0, Math.PI / 5]}>
        <boxGeometry args={[0.8, 0.07, 0.08]} />
      </mesh>

      {/* Seat tube */}
      <mesh material={blackMaterial} position={[-0.25, 0.2, 0]} rotation={[0, 0, -Math.PI / 12]}>
        <boxGeometry args={[0.5, 0.07, 0.08]} />
      </mesh>

      {/* ================================ */}
      {/* FUEL TANK                        */}
      {/* ================================ */}
      <mesh material={bodyMaterial} position={[0.15, 0.6, 0]}>
        <boxGeometry args={[0.6, 0.22, 0.28]} />
      </mesh>
      {/* Tank front curve */}
      <mesh material={bodyMaterial} position={[0.43, 0.56, 0]}>
        <boxGeometry args={[0.08, 0.18, 0.26]} />
      </mesh>

      {/* ================================ */}
      {/* FAIRING / BODY PANELS            */}
      {/* ================================ */}

      {/* Front upper fairing */}
      <mesh material={bodyMaterial} position={[0.6, 0.62, 0]}>
        <boxGeometry args={[0.22, 0.28, 0.32]} />
      </mesh>

      {/* Headlight housing */}
      <mesh material={blackMaterial} position={[0.72, 0.62, 0]}>
        <boxGeometry args={[0.06, 0.2, 0.28]} />
      </mesh>

      {/* Headlight lens */}
      <mesh material={glassMaterial} position={[0.76, 0.62, 0]}>
        <boxGeometry args={[0.04, 0.16, 0.22]} />
      </mesh>

      {/* Side fairing left */}
      <mesh material={bodyMaterial} position={[0.1, 0.38, 0.18]}>
        <boxGeometry args={[0.5, 0.18, 0.06]} />
      </mesh>

      {/* Side fairing right */}
      <mesh material={bodyMaterial} position={[0.1, 0.38, -0.18]}>
        <boxGeometry args={[0.5, 0.18, 0.06]} />
      </mesh>

      {/* ================================ */}
      {/* SEAT                             */}
      {/* ================================ */}
      <mesh material={seatMaterial} position={[-0.25, 0.58, 0]}>
        <boxGeometry args={[0.55, 0.08, 0.24]} />
      </mesh>
      {/* Seat rear hump */}
      <mesh material={bodyMaterial} position={[-0.52, 0.62, 0]}>
        <boxGeometry args={[0.15, 0.14, 0.22]} />
      </mesh>
      {/* Tail piece */}
      <mesh material={bodyMaterial} position={[-0.65, 0.56, 0]}>
        <boxGeometry args={[0.1, 0.08, 0.18]} />
      </mesh>

      {/* ================================ */}
      {/* ENGINE BLOCK                     */}
      {/* ================================ */}
      <mesh material={engineMaterial} position={[0.1, 0.1, 0]}>
        <boxGeometry args={[0.45, 0.38, 0.28]} />
      </mesh>
      {/* Engine fins */}
      {[-0.05, 0.02, 0.09, 0.16].map((y, i) => (
        <mesh key={i} material={engineMaterial} position={[0.1, 0.22 + y, 0]}>
          <boxGeometry args={[0.42, 0.025, 0.32]} />
        </mesh>
      ))}
      {/* Cylinder head */}
      <mesh material={engineMaterial} position={[0.22, 0.35, 0]}>
        <boxGeometry args={[0.22, 0.2, 0.22]} />
      </mesh>

      {/* ================================ */}
      {/* EXHAUST PIPE                     */}
      {/* ================================ */}
      <mesh material={exhaustMaterial} position={[0.2, -0.02, 0.16]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.45, 8]} />
      </mesh>
      <mesh material={exhaustMaterial} position={[-0.08, -0.05, 0.18]} rotation={[Math.PI / 12, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.05, 0.55, 8]} />
      </mesh>
      {/* Muffler */}
      <mesh material={exhaustMaterial} position={[-0.35, -0.08, 0.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.055, 0.045, 0.38, 10]} />
      </mesh>

      {/* ================================ */}
      {/* FRONT FORK / SUSPENSION          */}
      {/* ================================ */}
      {/* Left fork */}
      <mesh material={chromeMaterial} position={[0.62, -0.1, 0.1]} rotation={[0, 0, Math.PI / 12]}>
        <cylinderGeometry args={[0.025, 0.025, 0.65, 8]} />
      </mesh>
      {/* Right fork */}
      <mesh material={chromeMaterial} position={[0.62, -0.1, -0.1]} rotation={[0, 0, Math.PI / 12]}>
        <cylinderGeometry args={[0.025, 0.025, 0.65, 8]} />
      </mesh>
      {/* Fork bracket top */}
      <mesh material={blackMaterial} position={[0.56, 0.28, 0]}>
        <boxGeometry args={[0.12, 0.06, 0.28]} />
      </mesh>
      {/* Fork bracket bottom */}
      <mesh material={blackMaterial} position={[0.68, -0.28, 0]}>
        <boxGeometry args={[0.1, 0.06, 0.26]} />
      </mesh>

      {/* ================================ */}
      {/* HANDLEBAR                        */}
      {/* ================================ */}
      <mesh material={chromeMaterial} position={[0.5, 0.82, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.55, 8]} />
      </mesh>
      {/* Handlebar left grip */}
      <mesh material={blackMaterial} position={[0.5, 0.82, 0.27]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.08, 8]} />
      </mesh>
      {/* Handlebar right grip */}
      <mesh material={blackMaterial} position={[0.5, 0.82, -0.27]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.08, 8]} />
      </mesh>
      {/* Instrument cluster */}
      <mesh material={blackMaterial} position={[0.47, 0.78, 0]}>
        <boxGeometry args={[0.1, 0.06, 0.16]} />
      </mesh>

      {/* ================================ */}
      {/* FRONT WHEEL                      */}
      {/* ================================ */}
      <group position={[0.72, -0.38, 0]}>
        {/* Tyre */}
        <mesh material={tireMaterial} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.28, 0.08, 12, 32]} />
        </mesh>
        {/* Rim */}
        <mesh material={rimMaterial} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.2, 0.02, 8, 24]} />
        </mesh>
        {/* Hub */}
        <mesh material={rimMaterial} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.08, 16]} />
        </mesh>
        {/* Spokes */}
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh
            key={i}
            material={rimMaterial}
            rotation={[Math.PI / 2, 0, (i * Math.PI) / 3]}
          >
            <cylinderGeometry args={[0.008, 0.008, 0.38, 4]} />
          </mesh>
        ))}
        {/* Front disc brake */}
        <mesh material={chromeMaterial} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.05]}>
          <torusGeometry args={[0.16, 0.015, 6, 20]} />
        </mesh>
      </group>

      {/* Front fender */}
      <mesh material={bodyMaterial} position={[0.72, -0.12, 0]} rotation={[0, 0, Math.PI / 12]}>
        <boxGeometry args={[0.1, 0.22, 0.3]} />
      </mesh>

      {/* ================================ */}
      {/* REAR WHEEL                       */}
      {/* ================================ */}
      <group position={[-0.62, -0.38, 0]}>
        {/* Tyre */}
        <mesh material={tireMaterial} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.3, 0.09, 12, 32]} />
        </mesh>
        {/* Rim */}
        <mesh material={rimMaterial} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.21, 0.02, 8, 24]} />
        </mesh>
        {/* Hub */}
        <mesh material={rimMaterial} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.08, 16]} />
        </mesh>
        {/* Spokes */}
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh
            key={i}
            material={rimMaterial}
            rotation={[Math.PI / 2, 0, (i * Math.PI) / 3]}
          >
            <cylinderGeometry args={[0.009, 0.009, 0.42, 4]} />
          </mesh>
        ))}
        {/* Rear disc */}
        <mesh material={chromeMaterial} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.05]}>
          <torusGeometry args={[0.17, 0.016, 6, 20]} />
        </mesh>
      </group>

      {/* Rear fender */}
      <mesh material={bodyMaterial} position={[-0.62, -0.14, 0]}>
        <boxGeometry args={[0.12, 0.24, 0.3]} />
      </mesh>

      {/* ================================ */}
      {/* SWING ARM                        */}
      {/* ================================ */}
      <mesh material={blackMaterial} position={[-0.26, -0.3, 0.1]}>
        <boxGeometry args={[0.72, 0.05, 0.04]} />
      </mesh>
      <mesh material={blackMaterial} position={[-0.26, -0.3, -0.1]}>
        <boxGeometry args={[0.72, 0.05, 0.04]} />
      </mesh>

      {/* ================================ */}
      {/* FOOTREST / PEGS                  */}
      {/* ================================ */}
      <mesh material={chromeMaterial} position={[0.05, -0.1, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.14, 6]} />
      </mesh>
      <mesh material={chromeMaterial} position={[0.05, -0.1, -0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.14, 6]} />
      </mesh>

      {/* ================================ */}
      {/* TAIL LIGHT                       */}
      {/* ================================ */}
      <mesh position={[-0.7, 0.62, 0]}>
        <boxGeometry args={[0.04, 0.06, 0.14]} />
        <meshStandardMaterial color="#ff3333" emissive="#ff0000" emissiveIntensity={0.8} />
      </mesh>

      {/* ================================ */}
      {/* SIDE STAND                       */}
      {/* ================================ */}
      <mesh material={blackMaterial} position={[-0.05, -0.25, 0.14]} rotation={[0.3, 0, 0.4]}>
        <boxGeometry args={[0.04, 0.35, 0.04]} />
      </mesh>
    </group>
  );
}
