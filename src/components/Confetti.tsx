import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  shape: 'circle' | 'square' | 'triangle' | 'star';
  speed: number;
}

const COLORS = [
  '#FF3344', // Brand crimson
  '#E5BF26', // Gold
  '#4ECDC4', // Mint
  '#FF6B6B', // Peach
  '#FFE66D', // Yellow
  '#D4A5FF', // Lavender
  '#85E3FF', // Sky Blue
];

const SHAPES: Array<'circle' | 'square' | 'triangle' | 'star'> = [
  'circle',
  'square',
  'triangle',
  'star',
];

export default function ConfettiSystem({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const initialParticles: Particle[] = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage
      y: -20 - Math.random() * 50, // above screen
      size: Math.random() * 10 + 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      speed: Math.random() * 4 + 2,
    }));
    setParticles(initialParticles);

    // Continuous regeneration
    const interval = setInterval(() => {
      setParticles((prev) => {
        // Filter out particles that have fallen too far
        const remaining = prev.filter((p) => p.y < 120);
        // Add new ones to maintain count
        const needed = 80 - remaining.length;
        if (needed <= 0) return remaining;

        const newParticles: Particle[] = Array.from({ length: needed }).map((_, i) => ({
          id: Date.now() + i,
          x: Math.random() * 100,
          y: -10,
          size: Math.random() * 10 + 6,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          rotation: Math.random() * 360,
          shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
          speed: Math.random() * 3 + 2,
        }));
        return [...remaining, ...newParticles];
      });
    }, 500);

    return () => clearInterval(interval);
  }, [active]);

  // Update loop for fallback movement
  useEffect(() => {
    if (!active) return;

    let animFrame: number;
    const update = () => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          y: p.y + p.speed * 0.15,
          rotation: p.rotation + p.speed * 0.4,
          x: p.x + Math.sin(p.y * 0.05 + p.id) * 0.08,
        }))
      );
      animFrame = requestAnimationFrame(update);
    };

    animFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animFrame);
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            transform: `rotate(${p.rotation}deg)`,
            transition: 'transform 0.05s linear',
          }}
        >
          {p.shape === 'circle' && (
            <div
              className="rounded-full w-full h-full"
              style={{ backgroundColor: p.color }}
            />
          )}
          {p.shape === 'square' && (
            <div
              className="w-full h-full"
              style={{ backgroundColor: p.color }}
            />
          )}
          {p.shape === 'triangle' && (
            <div
              className="w-0 h-0 border-l-transparent border-r-transparent"
              style={{
                borderLeftWidth: `${p.size / 2}px`,
                borderRightWidth: `${p.size / 2}px`,
                borderBottomWidth: `${p.size}px`,
                borderBottomColor: p.color,
              }}
            />
          )}
          {p.shape === 'star' && (
            <div
              className="w-full h-full clip-star"
              style={{
                backgroundColor: p.color,
                clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
