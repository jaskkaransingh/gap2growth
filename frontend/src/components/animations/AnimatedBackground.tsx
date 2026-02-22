import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Sparkles, Stars } from '@react-three/drei';
import * as THREE from 'three';

const AnimatedShape = () => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
        }
    });

    return (
        <Float speed={1.5} rotationIntensity={1.5} floatIntensity={2}>
            <mesh ref={meshRef}>
                <icosahedronGeometry args={[1, 1]} />
                <meshPhysicalMaterial
                    color="#4F46E5"
                    wireframe
                    transparent
                    opacity={0.15}
                    roughness={0}
                    metalness={1}
                />
            </mesh>
        </Float>
    );
};

const GlowingBlob = ({ position, color, size, speed, distort }: any) => {
    return (
        <Float speed={speed} rotationIntensity={1} floatIntensity={2}>
            <Sphere args={[size, 64, 64]} position={position}>
                <MeshDistortMaterial
                    color={color}
                    envMapIntensity={1}
                    clearcoat={1}
                    clearcoatRoughness={0}
                    metalness={0.9}
                    roughness={0.1}
                    distort={distort}
                    speed={speed}
                    transparent
                    opacity={0.4}
                />
            </Sphere>
        </Float>
    );
};

export const AnimatedBackground = () => {
    return (
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} color="#4F46E5" />
                <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#7C3AED" />
                <pointLight position={[0, 0, 0]} intensity={2} color="#3B82F6" />

                {/* Soft floating background particles/sparkles */}
                <Sparkles count={100} scale={12} size={2} speed={0.4} opacity={0.3} color="#FFFFFF" />
                {/* Subtle extremely distant stars, no flashy blinking */}
                <Stars radius={20} depth={50} count={500} factor={1.5} saturation={0} fade speed={0.5} />

                {/* Floating gradient blobs/orbs */}
                <GlowingBlob position={[-3, 2, -2]} color="#4F46E5" size={2} speed={1.5} distort={0.4} />
                <GlowingBlob position={[3, -2, -3]} color="#7C3AED" size={2.5} speed={1.2} distort={0.5} />

                {/* Floating geometric tech shapes */}
                <group position={[4, 1, 0]} scale={1.5}>
                    <AnimatedShape />
                </group>

                <group position={[-4, -2, -1]} scale={1.2}>
                    <AnimatedShape />
                </group>

            </Canvas>
        </div>
    );
};
