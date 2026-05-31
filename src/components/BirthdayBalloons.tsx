import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playPopSound } from '../utils/audio';

interface Balloon {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  speed: number;
}

const BALLOON_COLORS = [
  'rgba(255, 99, 132, 0.75)',   // Candy Pink
  'rgba(255, 205, 86, 0.75)',   // Bright Gold
  'rgba(75, 192, 192, 0.75)',   // Mint Teal
  'rgba(54, 162, 235, 0.75)',   // Soft Blue
  'rgba(153, 102, 255, 0.75)',  // Lavender Purple
  'rgba(255, 159, 64, 0.75)'    // Sweet Coral
];

export default function BirthdayBalloons() {
  const [balloons, setBalloons] = useState<Balloon[]>([]);

  useEffect(() => {
    // Generate initial set
    const initial: Balloon[] = Array.from({ length: 12 }).map((_, i) => createBalloon(i));
    setBalloons(initial);

    // Periodically add new balloons
    const interval = setInterval(() => {
      setBalloons((prev) => {
        if (prev.length >= 20) return prev;
        return [...prev, createBalloon(Date.now())];
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const createBalloon = (id: number): Balloon => {
    return {
      id,
      x: 5 + Math.random() * 90, // percent across screen width/container boundaries
      color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
      size: 45 + Math.random() * 25, // width in pixels
      delay: Math.random() * 3,
      speed: 16 + Math.random() * 12 // seconds to float up
    };
  };

  const handlePop = (id: number) => {
    playPopSound();
    setBalloons((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      <AnimatePresence>
        {balloons.map((b) => (
          <motion.div
            key={b.id}
            initial={{ y: '110vh', x: `${b.x}vw`, opacity: 0 }}
            animate={{
              y: '-20vh',
              opacity: [0, 1, 1, 0.8, 0],
              x: [`${b.x}vw`, `${b.x + (Math.random() * 8 - 4)}vw`, `${b.x + (Math.random() * 8 - 4)}vw`],
            }}
            exit={{ scale: 0, opacity: 0, transition: { duration: 0.15 } }}
            transition={{
              duration: b.speed,
              delay: b.delay,
              ease: 'linear',
            }}
            className="absolute cursor-pointer pointer-events-auto flex flex-col items-center select-none"
            style={{ width: b.size }}
            onClick={() => handlePop(b.id)}
            whileHover={{ scale: 1.15, cursor: 'pointer' }}
          >
            {/* Balloon Body */}
            <div
              className="relative rounded-full"
              style={{
                width: b.size,
                height: b.size * 1.25,
                backgroundColor: b.color,
                boxShadow: 'inset -5px -8px 12px rgba(0,0,0,0.15), 0 6px 12px rgba(0,0,0,0.1)'
              }}
            >
              {/* Highlight */}
              <div className="absolute top-2 left-3 w-3 h-5 bg-white opacity-40 rounded-full rotate-12" />
            </div>

            {/* Tie Knot */}
            <div
              className="w-2 h-1 -mt-[1px]"
              style={{ borderBottom: `4px solid ${b.color}`, borderLeft: '3px solid transparent', borderRight: '3px solid transparent' }}
            />

            {/* String */}
            <svg className="w-4 h-16 text-neutral-400 opacity-60 overflow-visible" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M 8 0 Q 12 16, 4 32 T 8 64"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
