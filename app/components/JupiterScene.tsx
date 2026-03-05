'use client';

import { Canvas } from '@react-three/fiber';
import { Stars, Sparkles } from '@react-three/drei';
import { Suspense } from 'react';
import JupiterPlanet from './JupiterPlanet';

interface JupiterSceneProps {
    scrollProgress: number;
}

function SceneLights() {
    return (
        <>
            {/* Sun-like key light from the left */}
            <directionalLight
                position={[-8, 3, 4]}
                intensity={3.5}
                color="#fff5dd"
            />

            {/* Soft fill from right */}
            <directionalLight
                position={[6, -2, -4]}
                intensity={0.4}
                color="#3355aa"
            />

            {/* Ambient space glow */}
            <ambientLight intensity={0.12} color="#221133" />

            {/* Warm atmospheric backlight */}
            <pointLight position={[0, 0, -4]} color="#c86030" intensity={1.2} distance={12} />
        </>
    );
}

export default function JupiterScene({ scrollProgress }: JupiterSceneProps) {
    return (
        <Canvas
            camera={{ position: [0, 0, 4.5], fov: 38 }}
            style={{ width: '100%', height: '100%' }}
            gl={{ antialias: true, alpha: true }}
        >
            <SceneLights />

            {/* Deep starfield */}
            <Stars radius={120} depth={80} count={6000} factor={4} saturation={0.8} fade speed={0.3} />

            {/* Subtle galaxy sparkles */}
            <Sparkles count={80} scale={12} size={1.5} speed={0.2} opacity={0.4} color="#aaccff" />

            <Suspense fallback={null}>
                <JupiterPlanet scrollProgress={scrollProgress} />
            </Suspense>
        </Canvas>
    );
}
