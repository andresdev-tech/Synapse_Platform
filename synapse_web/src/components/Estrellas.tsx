"use client";

import { Canvas } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";

export default function BackgroundStars() {
    return (
        <div className="absolute inset-0 pointer-events-none z-0 w-full h-full overflow-hidden">
            <Canvas
                camera={{ position: [0, 0, 8], fov: 60 }}
                gl={{ alpha: true, antialias: false }}
                style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
            >
                {/* Capa 1: Estrellitas blancas ultra visibles */}
                <Sparkles
                    count={100}
                    scale={[20, 20, 10]}
                    size={3.5}
                    speed={0.4}
                    opacity={0.9}
                    color="#ffffff"
                />

                {/* Capa 2: Destellos violetas/morados de la marca */}
                <Sparkles
                    count={60}
                    scale={[18, 18, 8]}
                    size={5.0}
                    speed={0.5}
                    opacity={0.8}
                    color="#c084fc"
                />

                {/* Capa 3: Destellos cian sutiles */}
                <Sparkles
                    count={40}
                    scale={[15, 15, 6]}
                    size={4.0}
                    speed={0.3}
                    opacity={0.7}
                    color="#38bdf8"
                />
            </Canvas>
        </div>
    );
}