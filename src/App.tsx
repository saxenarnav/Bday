import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Sparkles, Volume2, VolumeX, Check, Heart, Cake, HeartHandshake, Lock, Unlock, Eye, EyeOff } from 'lucide-react';
import BirthdayBalloons from './components/BirthdayBalloons';
import ConfettiSystem from './components/Confetti';
import CountdownBlock from './components/CountdownBlock';
import CelebrationWishes from './components/CelebrationWishes';
import { playChimeSound, playSparkleSound, playJoyfulChime } from './utils/audio';

export default function App() {
  const sisterName = 'Ishani';
  const sisterAge = '25';

  const [unlocked, setUnlocked] = useState(() => {
    return localStorage.getItem('birthday_unlocked') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [celebrationActive, setCelebrationActive] = useState(false);

  // Helper function to calculate SHA-256 hash of string securely
  const sha256 = async (text: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Compare secure SHA-256 cryptographic hash of 'ishani2026'
    const inputHash = await sha256(passwordInput.toLowerCase().trim());
    if (inputHash === '2e8f2d35d9cfd45e3341712c4b134091ac6d711309f659d6e510ee5570fe187e') {
      localStorage.setItem('birthday_unlocked', 'true');
      setUnlocked(true);
      playSparkleSound();
      playJoyfulChime();
    } else {
      setPasswordError(true);
      playChimeSound();
      setTimeout(() => setPasswordError(false), 600);
    }
  };

  const handleManualCelebration = () => {
    setCelebrationActive(true);
    playJoyfulChime();
    setTimeout(() => {
      setCelebrationActive(false);
    }, 8000);
  };

  const handleLockAgain = () => {
    localStorage.removeItem('birthday_unlocked');
    setUnlocked(false);
    setPasswordInput('');
  };

  // 1. Password Gateway Interface
  if (!unlocked) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-[#FAF8F5] px-4 py-16 overflow-hidden">
        {/* Decorative backdrop blobs */}
        <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-brand-100/30 via-gold-50/20 to-transparent pointer-events-none" />
        <div className="absolute -left-32 -bottom-32 w-80 h-80 bg-brand-200/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-32 -top-32 w-80 h-80 bg-gold-200/15 rounded-full blur-3xl pointer-events-none" />

        <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
          <BirthdayBalloons />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-white border border-neutral-100 rounded-3xl p-8 shadow-2xl shadow-brand-100/10 z-20 text-center"
        >
          {/* Heart star design */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-brand-50 text-brand-500 rounded-2xl border border-brand-100 relative animate-pulse">
              <Lock className="w-6 h-6 text-brand-500" />
            </div>
          </div>

          <span className="px-3 py-1 bg-gold-50 text-gold-600 rounded-full font-bold text-[10px] uppercase tracking-widest inline-flex items-center gap-1 mb-4 select-none">
            <Sparkles className="w-3 h-3" /> PRIVATE GATEWAY
          </span>

          <h1 className="font-serif italic font-extrabold text-neutral-900 text-3xl sm:text-4xl mb-3">
            Birthday Celebration
          </h1>
          
          <p className="font-sans font-medium text-neutral-500 text-xs sm:text-sm leading-relaxed mb-6">
            This private celebration portal is passcode-protected. Please enter the invitation key below to unlock the countdown & presentation.
          </p>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter passcode..."
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (passwordError) setPasswordError(false);
                }}
                className={`w-full pl-4 pr-11 py-3 bg-neutral-50 border rounded-xl font-mono text-sm outline-none transition-all ${
                  passwordError 
                    ? 'border-brand-400 focus:ring-2 focus:ring-brand-50 animate-shake' 
                    : 'border-neutral-200 focus:border-brand-300 focus:ring-2 focus:ring-brand-50'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {passwordError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-brand-500 font-semibold"
              >
                Passcode is incorrect. Try again!
              </motion.p>
            )}

            <button
              type="submit"
              className="w-full bg-neutral-800 hover:bg-neutral-900 text-white font-semibold text-xs uppercase tracking-widest py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-neutral-800/10"
            >
              <Unlock className="w-4 h-4 text-brand-400" /> Unlock Celebration
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // 2. Unlocked Celebration Application
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#FAF8F5] pb-24 text-neutral-800">
      
      {/* Background soft ambient accents */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-brand-100/40 via-gold-50/30 to-transparent pointer-events-none" />
      <div className="absolute top-[20%] -left-48 w-96 h-96 bg-brand-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[50%] -right-48 w-96 h-96 bg-gold-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Sparkle/Balloon Poppers & Confetti overlay */}
      <ConfettiSystem active={celebrationActive} />
      <BirthdayBalloons />

      {/* Elegant Header Area */}
      <header className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between sticky top-0 z-40 bg-[#FAF8F5]/80 backdrop-blur-md border-b border-neutral-100/60">
        <div className="flex items-center gap-2 select-none group" onClick={playChimeSound}>
          <div className="p-2.5 bg-brand-100 text-brand-500 rounded-xl transition-transform group-hover:scale-110 duration-300">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif italic font-extrabold text-[#1a1510] text-lg tracking-tight">Celebration Hub</span>
            <div className="h-[2px] bg-gradient-to-r from-brand-400 to-gold-400 w-0 group-hover:w-full transition-all duration-500" />
          </div>
        </div>

        {/* Floating Utility Controls */}
        <div className="flex items-center gap-3">
          {/* Sound enable button */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              playChimeSound();
            }}
            className={`p-2.5 rounded-xl border transition-all ${
              soundEnabled
                ? 'bg-gold-50 border-gold-200 text-gold-600 hover:bg-gold-100'
                : 'bg-neutral-50 border-neutral-200 text-neutral-400 hover:bg-neutral-100'
            }`}
            title={soundEnabled ? 'Chimes enabled' : 'Mute chimes'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Trigger confetti manually button */}
          <button
            onClick={handleManualCelebration}
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-500/10 cursor-pointer transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 animate-bounce" /> Celebrate!
          </button>

          {/* Portal re-lock option */}
          <button
            onClick={handleLockAgain}
            className="p-2.5 text-neutral-400 hover:text-brand-500 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-all ml-1"
            title="Lock access"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 mt-8 md:mt-12 text-center relative z-20">
        
        {/* Decorative Badge indicating locked mode is online */}
        <div className="mb-6 max-w-2xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-1.5 rounded-full border border-green-200/50 select-none shadow-xs">
            <Unlock className="w-3.5 h-3.5 text-green-600" />
            <span className="text-[11px] font-bold text-green-700 tracking-wide uppercase">
              Securely Authenticated
            </span>
          </div>
        </div>

        {/* Hero Display Typography */}
        <section className="mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            {/* Visual badge */}
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#ca9e14] mb-3 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-gold-500" /> CELEBRATING HER MAJESTY <Sparkles className="w-3.5 h-3.5 text-gold-500" />
            </span>

            {/* Giant name heading */}
            <h1 className="font-serif italic font-extrabold text-neutral-900 text-5xl md:text-7xl lg:text-8xl tracking-tight leading-none mb-4">
              {sisterName}’s Birthday
            </h1>

            {/* Sub-quote statement */}
            <p className="font-sans font-medium text-neutral-500 text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              Tracking the seconds of anticipation in Delhi and New York as we usher in 1 June with absolute festive grandeur.
            </p>
          </motion.div>
        </section>

        {/* Countdown component block */}
        <section className="mb-14">
          <CountdownBlock onCelebrationStateChange={(act) => setCelebrationActive(act)} />
        </section>

        {/* Guest Video Wish Wall Section */}
        <section className="border-t border-neutral-100/80 pt-10">
          <CelebrationWishes />
        </section>

        {/* Cohesive Loving Footer */}
        <footer className="mt-20 pt-10 border-t border-neutral-100 max-w-4xl mx-auto text-center select-none">
          <div className="flex flex-col items-center gap-2">
            <HeartHandshake className="w-10 h-10 text-brand-400 animate-pulse duration-1000 mb-1" />
            <span className="font-serif italic text-base md:text-lg font-extrabold text-neutral-800">
              Happy Birthday, {sisterName}!
            </span>
            <p className="text-neutral-400 text-xs font-medium max-w-sm">
              An elegant tribute crafted by your brother. Pop some balloons, play localized bells, and watch the celebration video!
            </p>
            <span className="text-[10px] text-neutral-300 font-mono tracking-widest uppercase mt-4">
              © 2026 Celebration Hub • All Rights Reserved
            </span>
          </div>
        </footer>

      </main>
    </div>
  );
}
