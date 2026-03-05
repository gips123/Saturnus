'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── helpers ─── */
function lighten(hex: string, amt: number): string {
    const n = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (n >> 16) + amt), g = Math.min(255, ((n >> 8) & 0xff) + amt), b = Math.min(255, (n & 0xff) + amt);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/* ─── Saturn surface texture ─── */
function createSaturnTexture(): THREE.CanvasTexture {
    const W = 2048, H = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#d4608a'; ctx.fillRect(0, 0, W, H);
    const bands: [number, number, string][] = [
        [0.00, 0.05, '#c04878'], [0.05, 0.04, '#e87aac'], [0.09, 0.06, '#b83870'], [0.15, 0.05, '#d45890'],
        [0.20, 0.08, '#f0a0c0'], [0.28, 0.06, '#a82860'], [0.34, 0.10, '#cc5888'], [0.44, 0.12, '#f4c0d4'],
        [0.56, 0.10, '#b83870'], [0.66, 0.06, '#d05888'], [0.72, 0.08, '#e898bc'], [0.80, 0.05, '#a02860'],
        [0.85, 0.06, '#cc5888'], [0.91, 0.05, '#d86898'], [0.96, 0.04, '#b04078'],
    ];
    bands.forEach(([y, h, color]) => {
        const y0 = y * H, y1 = (y + h) * H;
        const g = ctx.createLinearGradient(0, y0, 0, y1);
        g.addColorStop(0, color); g.addColorStop(0.5, lighten(color, 12)); g.addColorStop(1, color);
        ctx.fillStyle = g; ctx.fillRect(0, y0, W, y1 - y0);
    });
    for (let i = 0; i < 120; i++) {
        const sy = (0.05 + Math.random() * 0.9) * H;
        ctx.beginPath();
        ctx.moveTo(Math.random() * W, sy);
        ctx.lineTo(Math.random() * W + 60 + Math.random() * 350, sy + (Math.random() - 0.5) * 5);
        ctx.strokeStyle = `rgba(255,180,220,${0.04 + Math.random() * 0.10})`;
        ctx.lineWidth = 0.8 + Math.random() * 1.8; ctx.stroke();
    }
    return new THREE.CanvasTexture(canvas);
}

/* ─── Placeholder circular photo texture ─── */
function createPlaceholderTexture(hue: number): THREE.CanvasTexture {
    const S = 128;
    const canvas = document.createElement('canvas');
    canvas.width = S; canvas.height = S;
    const ctx = canvas.getContext('2d')!;
    const cx = S / 2, cy = S / 2, r = S / 2;
    const grad = ctx.createRadialGradient(cx - 10, cy - 10, 4, cx, cy, r);
    grad.addColorStop(0, `hsl(${hue},55%,85%)`);
    grad.addColorStop(0.6, `hsl(${hue},45%,60%)`);
    grad.addColorStop(1, `hsl(${hue},35%,30%)`);
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = grad; ctx.fill();
    // crater / surface detail
    for (let i = 0; i < 5; i++) {
        const px = 20 + Math.random() * 88, py = 20 + Math.random() * 88;
        const pr = 3 + Math.random() * 8;
        ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,0,0,0.18)`; ctx.fill();
    }
    // circular mask
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    return new THREE.CanvasTexture(canvas);
}

/* ─── Ring particle positions ─── */
// Ring bands: [innerRadius, outerRadius, density 0-1]
const RING_BANDS = [
    { inner: 1.30, outer: 1.52, density: 0.18 }, // C-ring (faint)
    { inner: 1.52, outer: 1.94, density: 1.00 }, // B-ring (bright, densest)
    { inner: 1.94, outer: 2.01, density: 0.02 }, // Cassini division (gap)
    { inner: 2.01, outer: 2.38, density: 0.75 }, // A-ring
    { inner: 2.40, outer: 2.48, density: 0.12 }, // F-ring (narrow)
];

function sampleRingRadius(): number {
    // Weighted random sample from bands
    const total = RING_BANDS.reduce((s, b) => s + (b.outer - b.inner) * b.density, 0);
    let rnd = Math.random() * total;
    for (const band of RING_BANDS) {
        const w = (band.outer - band.inner) * band.density;
        if (rnd < w) return band.inner + (rnd / band.density);
        rnd -= w;
    }
    return 2.0;
}

/* ─── Photo Ring via InstancedMesh per texture ─── */
interface PhotoRingProps {
    textures: THREE.Texture[];
    instancesPerTex: number;
}

function PhotoRing({ textures, instancesPerTex }: PhotoRingProps) {
    const groupRef = useRef<THREE.Group>(null);

    // Pre-generate positions & sizes for all instances
    const configs = useMemo(() => {
        return textures.map(() => {
            const positions: THREE.Matrix4[] = [];
            for (let i = 0; i < instancesPerTex; i++) {
                const angle = Math.random() * Math.PI * 2;
                const r = sampleRingRadius();
                const x = r * Math.cos(angle);
                const z = r * Math.sin(angle);
                const y = (Math.random() - 0.5) * 0.03; // very slight vertical scatter
                const size = 0.055 + Math.random() * 0.065; // particle size
                const rot = Math.random() * Math.PI * 2;   // random face rotation

                const mat = new THREE.Matrix4();
                mat.compose(
                    new THREE.Vector3(x, y, z),
                    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rot, 0)),
                    new THREE.Vector3(size, size, size)
                );
                positions.push(mat);
            }
            return positions;
        });
    }, [textures, instancesPerTex]);

    // Slow differential rotation of rings
    useFrame(() => {
        if (groupRef.current) groupRef.current.rotation.y += 0.0008;
    });

    return (
        <group ref={groupRef}>
            {textures.map((tex, ti) => (
                <InstancedPhotoMesh key={ti} texture={tex} matrices={configs[ti]} />
            ))}
        </group>
    );
}

function InstancedPhotoMesh({ texture, matrices }: { texture: THREE.Texture; matrices: THREE.Matrix4[] }) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const count = matrices.length;

    useEffect(() => {
        if (!meshRef.current) return;
        matrices.forEach((mat, i) => meshRef.current!.setMatrixAt(i, mat));
        meshRef.current.instanceMatrix.needsUpdate = true;
    }, [matrices]);

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
                map={texture}
                transparent
                side={THREE.DoubleSide}
                alphaTest={0.05}
                depthWrite={false}
            />
        </instancedMesh>
    );
}

/* ─── Camera controller ─── */
interface CameraProps { theta: number; phi: number; radius: number; }
function CameraController({ theta, phi, radius }: CameraProps) {
    const { camera } = useThree();
    const target = useRef(new THREE.Vector3());
    useFrame(() => {
        const x = radius * Math.sin(phi) * Math.sin(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.cos(theta);
        target.current.set(x, y, z);
        camera.position.lerp(target.current, 0.08);
        camera.lookAt(0, 0, 0);
    });
    return null;
}

/* ─── Main export ─── */
interface SaturnPlanetProps extends CameraProps { photoUrls: string[]; }

export default function SaturnPlanet({ theta, phi, radius, photoUrls }: SaturnPlanetProps) {
    const planetRef = useRef<THREE.Mesh>(null);
    const saturnTex = useMemo(() => createSaturnTexture(), []);

    // Load textures from URLs, fallback to placeholders
    const textures = useMemo(() => {
        const loader = new THREE.TextureLoader();
        const PLACEHOLDER_HUES = [30, 200, 120, 270, 50, 160, 330, 90];
        if (photoUrls.length === 0) {
            return PLACEHOLDER_HUES.slice(0, 8).map(h => createPlaceholderTexture(h));
        }
        return photoUrls.map(url => {
            const tex = loader.load(url);
            tex.colorSpace = THREE.SRGBColorSpace;
            return tex;
        });
    }, [photoUrls]);

    // More instances when fewer unique textures (so ring stays dense)
    const instancesPerTex = Math.max(30, Math.floor(600 / textures.length));

    useFrame(() => {
        if (!planetRef.current) return;
        planetRef.current.rotation.y += 0.003;
        planetRef.current.rotation.z = 0.466;
    });

    return (
        <>
            <CameraController theta={theta} phi={phi} radius={radius} />
            <group>
                {/* Planet sphere — pink, smaller */}
                <mesh ref={planetRef}>
                    <sphereGeometry args={[0.85, 128, 64]} />
                    <meshStandardMaterial map={saturnTex} metalness={0.05} roughness={0.80} />
                </mesh>
                {/* Pink atmosphere glow */}
                <mesh scale={1.04}>
                    <sphereGeometry args={[0.85, 32, 16]} />
                    <meshStandardMaterial color="#ff60a8" transparent opacity={0.12}
                        blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide} />
                </mesh>
                {/* Outer hot-pink haze */}
                <mesh scale={1.14}>
                    <sphereGeometry args={[0.85, 16, 8]} />
                    <meshStandardMaterial color="#ff2080" transparent opacity={0.05}
                        blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide} />
                </mesh>
                {/* Photo ring particles */}
                <PhotoRing textures={textures} instancesPerTex={instancesPerTex} />
                {/* Ring shadow (matches smaller planet) */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
                    <ringGeometry args={[0.6, 0.86, 64]} />
                    <meshBasicMaterial color="#000000" transparent opacity={0.20}
                        side={THREE.DoubleSide} depthWrite={false} />
                </mesh>
            </group>
        </>
    );
}
