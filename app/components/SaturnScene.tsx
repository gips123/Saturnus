'use client';

import { Canvas } from '@react-three/fiber';
import { Stars, Sparkles } from '@react-three/drei';
import { Suspense } from 'react';
import SaturnPlanet from './SaturnPlanet';

interface SaturnSceneProps {
    theta: number;
    phi: number;
    radius: number;
    photoUrls: string[];
}

export default function SaturnScene({ theta, phi, radius, photoUrls }: SaturnSceneProps) {
    return (
        <Canvas
            camera={{ position: [0, 1.5, 5.5], fov: 42 }}
            style={{ width: '100%', height: '100%' }}
            gl={{ antialias: true, alpha: true }}
        >
            <directionalLight position={[-10, 4, 5]} intensity={4.0} color="#fff8e8" />
            <directionalLight position={[8, -2, -4]} intensity={0.35} color="#304870" />
            <ambientLight intensity={0.08} color="#1a1030" />
            <pointLight position={[0, 0, -6]} color="#a06820" intensity={0.8} distance={14} />
            <Stars radius={140} depth={90} count={7000} factor={4.5} saturation={0.7} fade speed={0.2} />
            <Sparkles count={60} scale={14} size={1.2} speed={0.15} opacity={0.35} color="#d0d8ff" />
            <Suspense fallback={null}>
                <SaturnPlanet theta={theta} phi={phi} radius={radius} photoUrls={photoUrls} />
            </Suspense>
        </Canvas>
    );
}
