'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function createJupiterTexture(): THREE.CanvasTexture {
    const size = 2048;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size / 2;
    const ctx = canvas.getContext('2d')!;

    // Band definitions: [yNorm 0-1, height, color]
    const bands: [number, number, string][] = [
        [0.00, 0.04, '#8B6B3D'],
        [0.04, 0.06, '#C97F4A'],
        [0.10, 0.04, '#E8C17A'],
        [0.14, 0.06, '#B87040'],
        [0.20, 0.03, '#D4A96A'],
        [0.23, 0.07, '#A0582E'],
        [0.30, 0.04, '#C8935A'],
        [0.34, 0.08, '#E8C88A'],  // Equatorial Zone (bright)
        [0.42, 0.10, '#C87840'],  // NEB
        [0.52, 0.08, '#E8D4A0'],  // EZ bright center
        [0.60, 0.10, '#B86830'],  // SEB
        [0.70, 0.06, '#D4A870'],
        [0.76, 0.05, '#A05830'],
        [0.81, 0.07, '#C89060'],
        [0.88, 0.06, '#8B5A2B'],
        [0.94, 0.06, '#C07040'],
    ];

    const h = canvas.height;
    const w = canvas.width;

    // Paint bands
    bands.forEach(([y, height, color]) => {
        const yStart = y * h;
        const yEnd = (y + height) * h;
        const grad = ctx.createLinearGradient(0, yStart, 0, yEnd);
        grad.addColorStop(0, color);
        grad.addColorStop(0.5, lighten(color, 15));
        grad.addColorStop(1, color);
        ctx.fillStyle = grad;
        ctx.fillRect(0, yStart, w, yEnd - yStart);
    });

    // Add turbulence / wavy edges using sine waves
    for (let pass = 0; pass < 3; pass++) {
        const freq = 3 + pass * 2;
        const amp = 6 + pass * 4;
        const yBase = 0.3 + pass * 0.18;
        ctx.beginPath();
        ctx.moveTo(0, yBase * h);
        for (let x = 0; x <= w; x += 4) {
            const y = (yBase + Math.sin((x / w) * Math.PI * freq) * (amp / h)) * h;
            ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(80,40,15,0.25)`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Wispy cloud streaks
    for (let i = 0; i < 80; i++) {
        const sx = Math.random() * w;
        const sy = (0.1 + Math.random() * 0.8) * h;
        const len = 40 + Math.random() * 200;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + len, sy + (Math.random() - 0.5) * 6);
        ctx.strokeStyle = `rgba(240,210,150,${0.04 + Math.random() * 0.1})`;
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.stroke();
    }

    // Great Red Spot (GRS) — oval, south equatorial belt region (~y=0.63)
    const grsX = w * 0.55;
    const grsY = h * 0.65;
    const grsW = 120;
    const grsH = 55;

    // Outer dark ring
    const grsOuter = ctx.createRadialGradient(grsX, grsY, grsH * 0.3, grsX, grsY, grsH);
    grsOuter.addColorStop(0, 'rgba(180,50,20,0.0)');
    grsOuter.addColorStop(0.6, 'rgba(120,30,10,0.5)');
    grsOuter.addColorStop(1, 'rgba(80,20,5,0.4)');
    ctx.save();
    ctx.translate(grsX, grsY);
    ctx.scale(grsW / grsH, 1);
    ctx.beginPath();
    ctx.arc(0, 0, grsH, 0, Math.PI * 2);
    ctx.fillStyle = grsOuter;
    ctx.fill();
    ctx.restore();

    // Inner swirl
    const grsGrad = ctx.createRadialGradient(grsX, grsY, 0, grsX, grsY, grsH * 0.7);
    grsGrad.addColorStop(0, 'rgba(255,100,50,0.9)');
    grsGrad.addColorStop(0.4, 'rgba(200,60,20,0.75)');
    grsGrad.addColorStop(1, 'rgba(150,30,10,0)');
    ctx.save();
    ctx.translate(grsX, grsY);
    ctx.scale(grsW / grsH * 0.85, 1);
    ctx.beginPath();
    ctx.arc(0, 0, grsH * 0.7, 0, Math.PI * 2);
    ctx.fillStyle = grsGrad;
    ctx.fill();
    ctx.restore();

    // GRS highlight
    ctx.save();
    ctx.translate(grsX - 15, grsY - 10);
    ctx.scale(0.6, 0.4);
    ctx.beginPath();
    ctx.arc(0, 0, grsH * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,180,120,0.25)';
    ctx.fill();
    ctx.restore();

    // Oval BA (smaller red storm south of GRS)
    const baX = w * 0.25;
    const baY = h * 0.70;
    const baW = 45;
    const baH = 22;
    const baGrad = ctx.createRadialGradient(baX, baY, 0, baX, baY, baH);
    baGrad.addColorStop(0, 'rgba(200,80,40,0.8)');
    baGrad.addColorStop(1, 'rgba(150,50,20,0)');
    ctx.save();
    ctx.translate(baX, baY);
    ctx.scale(baW / baH, 1);
    ctx.beginPath();
    ctx.arc(0, 0, baH, 0, Math.PI * 2);
    ctx.fillStyle = baGrad;
    ctx.fill();
    ctx.restore();

    return new THREE.CanvasTexture(canvas);
}

function createAtmosphereTexture(): THREE.CanvasTexture {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createRadialGradient(size / 2, size / 2, size * 0.35, size / 2, size / 2, size * 0.5);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.6, 'rgba(180,100,40,0.0)');
    grad.addColorStop(0.8, 'rgba(200,120,50,0.3)');
    grad.addColorStop(1, 'rgba(220,140,60,0.6)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
}

function lighten(hex: string, amount: number): string {
    const num = parseInt(hex.slice(1), 16);
    const r = Math.min(255, (num >> 16) + amount);
    const g = Math.min(255, ((num >> 8) & 0xff) + amount);
    const b = Math.min(255, (num & 0xff) + amount);
    return `rgb(${r},${g},${b})`;
}

interface JupiterPlanetProps {
    scrollProgress: number;
}

export default function JupiterPlanet({ scrollProgress }: JupiterPlanetProps) {
    const planetRef = useRef<THREE.Mesh>(null);
    const atmosphereRef = useRef<THREE.Mesh>(null);

    const jupiterTexture = useMemo(() => createJupiterTexture(), []);
    const atmosphereTexture = useMemo(() => createAtmosphereTexture(), []);

    useFrame((state) => {
        if (!planetRef.current) return;
        const time = state.clock.getElapsedTime();

        // Scroll drives the Y rotation (full turn over full page scroll)
        planetRef.current.rotation.y = scrollProgress * Math.PI * 2 + time * 0.04;

        // Slight axial tilt (Jupiter has ~3.1° tilt, but we exaggerate for effect)
        planetRef.current.rotation.z = 0.055;

        if (atmosphereRef.current) {
            atmosphereRef.current.rotation.y = scrollProgress * Math.PI * 2 + time * 0.04;
            atmosphereRef.current.rotation.z = 0.055;
        }
    });

    return (
        <group>
            {/* Equatorial ring glow (subtle) */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[1.55, 0.015, 4, 80]} />
                <meshStandardMaterial
                    color="#c87040"
                    transparent
                    opacity={0.15}
                    emissive="#a05020"
                    emissiveIntensity={0.5}
                />
            </mesh>

            {/* Main Jupiter sphere */}
            <mesh ref={planetRef}>
                <sphereGeometry args={[1.4, 128, 64]} />
                <meshStandardMaterial
                    map={jupiterTexture}
                    metalness={0.0}
                    roughness={0.85}
                />
            </mesh>

            {/* Atmosphere glow overlay */}
            <mesh ref={atmosphereRef} scale={1.02}>
                <sphereGeometry args={[1.4, 64, 32]} />
                <meshStandardMaterial
                    map={atmosphereTexture}
                    transparent
                    opacity={1}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    side={THREE.FrontSide}
                />
            </mesh>

            {/* Outer atmosphere haze */}
            <mesh scale={1.08}>
                <sphereGeometry args={[1.4, 32, 16]} />
                <meshStandardMaterial
                    color="#d4844a"
                    transparent
                    opacity={0.08}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    side={THREE.BackSide}
                />
            </mesh>
        </group>
    );
}
