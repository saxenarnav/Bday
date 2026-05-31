import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Globe, Sparkles, Cake } from 'lucide-react';
import { playJoyfulChime } from '../utils/audio';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isOver: boolean;
}

// target dates in absolute UTC epoch milliseconds
// May is 0-indexed month 4. May 31, 2026 18:30:00 UTC is June 1, 2026 00:00:00 IST
const TARGET_IST = Date.UTC(2026, 4, 31, 18, 30, 0);

// June is 0-indexed month 5. June 1, 2026 04:00:00 UTC is June 1, 2026 00:00:00 GMT-4
const TARGET_GMT4 = Date.UTC(2026, 5, 1, 4, 0, 0);

export default function CountdownBlock({
  onCelebrationStateChange,
}: {
  onCelebrationStateChange: (active: boolean) => void;
}) {
  const [istRemaining, setIstRemaining] = useState<TimeRemaining>({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: false });
  const [gmt4Remaining, setGmt4Remaining] = useState<TimeRemaining>({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: false });
  const [istTime, setIstTime] = useState<string>('');
  const [gmt4Time, setGmt4Time] = useState<string>('');
  const [hasCelebrated, setHasCelebrated] = useState({ ist: false, gmt4: false });

  // Update loop
  useEffect(() => {
    const calculateTime = () => {
      const now = Date.now();

      // IST Calculations
      const istDiff = TARGET_IST - now;
      if (istDiff <= 0) {
        setIstRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        if (!hasCelebrated.ist) {
          setHasCelebrated((prev) => ({ ...prev, ist: true }));
          onCelebrationStateChange(true);
          playJoyfulChime();
        }
      } else {
        const seconds = Math.floor((istDiff / 1000) % 60);
        const minutes = Math.floor((istDiff / 1000 / 60) % 60);
        const hours = Math.floor((istDiff / (1000 * 60 * 60)) % 24);
        const days = Math.floor(istDiff / (1000 * 60 * 60 * 24));
        setIstRemaining({ days, hours, minutes, seconds, isOver: false });
      }

      // GMT-4 Calculations
      const gmt4Diff = TARGET_GMT4 - now;
      if (gmt4Diff <= 0) {
        setGmt4Remaining({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        if (!hasCelebrated.gmt4) {
          setHasCelebrated((prev) => ({ ...prev, gmt4: true }));
          onCelebrationStateChange(true);
          playJoyfulChime();
        }
      } else {
        const seconds = Math.floor((gmt4Diff / 1000) % 60);
        const minutes = Math.floor((gmt4Diff / 1000 / 60) % 60);
        const hours = Math.floor((gmt4Diff / (1000 * 60 * 60)) % 24);
        const days = Math.floor(gmt4Diff / (1000 * 60 * 60 * 24));
        setGmt4Remaining({ days, hours, minutes, seconds, isOver: false });
      }

      // Live clocks
      try {
        setIstTime(
          new Date().toLocaleTimeString('en-US', {
            timeZone: 'Asia/Kolkata',
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        );
        setGmt4Time(
          new Date().toLocaleTimeString('en-US', {
            timeZone: 'America/New_York', // EDT is UTC-4 in June
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        );
      } catch (err) {
        // Fallback in case of environment limitation
        const utc = new Date();
        const istOffset = utc.getTime() + (5.5 * 60 * 60 * 1000);
        const gmt4Offset = utc.getTime() - (4 * 60 * 60 * 1000);
        setIstTime(new Date(istOffset).toUTCString().replace('GMT', 'IST'));
        setGmt4Time(new Date(gmt4Offset).toUTCString().replace('GMT', 'GMT-4'));
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [hasCelebrated, onCelebrationStateChange]);

  const renderTimerDigits = (num: number, label: string) => {
    const formatted = num.toString().padStart(2, '0');
    return (
      <div className="flex flex-col items-center mx-1 md:mx-2">
        <div className="relative rounded-xl bg-white text-neutral-800 font-mono text-xl sm:text-2xl md:text-3xl lg:text-4xl px-3 py-2 sm:px-4 sm:py-3 shadow-sm border border-neutral-100 flex items-center justify-center min-w-[3.2rem] sm:min-w-[4rem] md:min-w-[4.8rem] overflow-hidden">
          {formatted}
          {/* Subtle overlay dividing the top & bottom of the digit */}
          <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-neutral-100/80" />
        </div>
        <span className="text-[10px] md:text-xs font-medium uppercase text-neutral-500 tracking-wider mt-1">{label}</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto px-4 py-6">
      {/* Clock 1: IST */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="glassmorphism p-6 md:p-8 rounded-3xl relative overflow-hidden group shadow-lg shadow-brand-100/10"
      >
        {/* Abstract shape backdrop */}
        <div className="absolute -right-12 -top-12 w-32 h-32 bg-brand-100 rounded-full blur-3xl opacity-60 transition-transform group-hover:scale-125 duration-700" />
        <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-gold-100 rounded-full blur-3xl opacity-60" />

        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-100 text-brand-500 rounded-2xl">
              <Clock className="w-5 h-5 text-brand-500" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-neutral-800 text-lg sm:text-xl">Indian Standard Time</h3>
              <p className="text-xs text-neutral-500 font-medium">Asia / Kolkata • UTC+5:30</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-brand-50 text-brand-500 border border-brand-100 rounded-full font-mono text-xs font-semibold">
            IST
          </span>
        </div>

        {/* Live digital clock */}
        <div className="bg-neutral-50 p-3 rounded-2xl justify-between flex items-center border border-neutral-100/60 mb-6 font-mono text-sm tracking-wider text-neutral-600">
          <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" /> LIVE CLOCK:
          </span>
          <span className="text-neutral-700 font-semibold">{istTime || 'Loading...'}</span>
        </div>

        {/* Big countdown numbers */}
        <div className="py-4 flex justify-center items-center">
          <AnimatePresence mode="wait">
            {istRemaining.isOver ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                key="ist-celebrating"
                className="text-center py-6 flex flex-col items-center justify-center"
              >
                <div className="w-16 h-16 bg-brand-100 text-brand-500 rounded-full flex items-center justify-center mb-4 border border-brand-200 animate-bounce">
                  <Cake className="w-8 h-8" />
                </div>
                <h4 className="font-serif italic font-bold text-xl sm:text-2xl text-brand-500 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-gold-500 animate-pulse" /> Happy Birthday! <Sparkles className="w-6 h-6 text-gold-500 animate-pulse" />
                </h4>
                <p className="text-xs text-neutral-500 mt-2 font-medium">It's June 1st in India! Let the magical moments unfold.</p>
              </motion.div>
            ) : (
              <motion.div key="ist-counting" className="flex justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {renderTimerDigits(istRemaining.days, 'Days')}
                {renderTimerDigits(istRemaining.hours, 'Hours')}
                {renderTimerDigits(istRemaining.minutes, 'Mins')}
                {renderTimerDigits(istRemaining.seconds, 'Secs')}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom indicator */}
        <div className="mt-4 pt-4 border-t border-neutral-100/50 flex items-center justify-between text-xs text-neutral-400">
          <span>Target Destination: June 1, 00:00:00 IST</span>
          <span className="font-medium text-neutral-500">UTC+5:30</span>
        </div>
      </motion.div>

      {/* Clock 2: GMT-4 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="glassmorphism p-6 md:p-8 rounded-3xl relative overflow-hidden group shadow-lg shadow-gold-100/10"
      >
        {/* Abstract shape backdrop */}
        <div className="absolute -right-12 -top-12 w-32 h-32 bg-gold-100 rounded-full blur-3xl opacity-60 transition-transform group-hover:scale-125 duration-700" />
        <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-brand-100 rounded-full blur-3xl opacity-60" />

        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gold-100 text-gold-600 rounded-2xl">
              <Clock className="w-5 h-5 text-gold-600" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-neutral-800 text-lg sm:text-xl">GMT-4 (Atlantic/Eastern)</h3>
              <p className="text-xs text-neutral-500 font-medium">New York • Port of Spain • UTC-4:00</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-gold-50 text-gold-600 border border-gold-100 rounded-full font-mono text-xs font-semibold">
            GMT-4
          </span>
        </div>

        {/* Live digital clock */}
        <div className="bg-neutral-50 p-3 rounded-2xl justify-between flex items-center border border-neutral-100/60 mb-6 font-mono text-sm tracking-wider text-neutral-600">
          <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" /> LIVE CLOCK:
          </span>
          <span className="text-neutral-700 font-semibold">{gmt4Time || 'Loading...'}</span>
        </div>

        {/* Big countdown numbers */}
        <div className="py-4 flex justify-center items-center">
          <AnimatePresence mode="wait">
            {gmt4Remaining.isOver ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                key="gmt4-celebrating"
                className="text-center py-6 flex flex-col items-center justify-center"
              >
                <div className="w-16 h-16 bg-gold-100 text-gold-600 rounded-full flex items-center justify-center mb-4 border border-gold-200 animate-bounce">
                  <Cake className="w-8 h-8" />
                </div>
                <h4 className="font-serif italic font-bold text-xl sm:text-2xl text-gold-600 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-brand-500 animate-pulse" /> Happy Birthday! <Sparkles className="w-6 h-6 text-brand-500 animate-pulse" />
                </h4>
                <p className="text-xs text-neutral-500 mt-2 font-medium">It's June 1st in GMT-4! The celebrations are truly global.</p>
              </motion.div>
            ) : (
              <motion.div key="gmt4-counting" className="flex justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {renderTimerDigits(gmt4Remaining.days, 'Days')}
                {renderTimerDigits(gmt4Remaining.hours, 'Hours')}
                {renderTimerDigits(gmt4Remaining.minutes, 'Mins')}
                {renderTimerDigits(gmt4Remaining.seconds, 'Secs')}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom indicator */}
        <div className="mt-4 pt-4 border-t border-neutral-100/50 flex items-center justify-between text-xs text-neutral-400">
          <span>Target Destination: June 1, 00:00:00 GMT-4</span>
          <span className="font-medium text-neutral-500">UTC-4:00</span>
        </div>
      </motion.div>
    </div>
  );
}
