import React, { useEffect, useState, useRef } from 'react';
import { Place } from '../types';
import PlaceCard from './PlaceCard';

interface RouletteModalProps {
  places: Place[];
  onClose: () => void;
}

const BRAINROT_LOADING = [
    "Cooking the results...",
    "Querying the vibe council...",
    "Checking if it's bussing...",
    "Mogging the menu...",
    "Consulting the lunch oracle...",
];

const RouletteModal: React.FC<RouletteModalProps> = ({ places, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(true);
  const [winner, setWinner] = useState<Place | null>(null);
  const [loadingText, setLoadingText] = useState(BRAINROT_LOADING[0]);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playTick = () => {
    if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) audioContextRef.current = new AudioContextClass();
    }
    const ctx = audioContextRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start(); osc.stop(ctx.currentTime + 0.1);
  };

  useEffect(() => {
    if (places.length === 0) return;

    let speed = 60;
    let currentSpinCount = 0;
    const totalSpins = 30 + Math.floor(Math.random() * 20);
    
    const spin = () => {
      setCurrentIndex((prev) => (prev + 1) % places.length);
      playTick();
      currentSpinCount++;

      if (currentSpinCount % 5 === 0) {
          setLoadingText(BRAINROT_LOADING[Math.floor(Math.random() * BRAINROT_LOADING.length)]);
      }

      if (currentSpinCount < totalSpins) {
        // Slow down toward the end
        if (currentSpinCount > totalSpins - 10) speed *= 1.25;
        setTimeout(spin, speed);
      } else {
        // FINISHED - Strictly set winner AFTER spinning logic
        const finalWinner = places[currentIndex];
        setTimeout(() => {
            setIsSpinning(false);
            setWinner(finalWinner);
        }, 300);
      }
    };

    const timeoutId = setTimeout(spin, speed);
    return () => clearTimeout(timeoutId);
  }, [places]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
      <div className={`w-full max-w-lg bg-white rounded-[2rem] p-10 flex flex-col items-center shadow-2xl transition-all duration-500 border-8 ${isSpinning ? 'border-orange-500' : 'border-green-500'}`}>
        
        <div className="text-center mb-10">
            <h2 className="text-4xl font-black mb-2 fun-font tracking-tighter uppercase italic">
                {isSpinning ? "🎰 DECIDING FATE" : "🔥 THE VERDICT"}
            </h2>
            <p className="text-gray-500 font-mono text-sm animate-pulse">{isSpinning ? loadingText : "NO CAP, THIS IS THE ONE."}</p>
        </div>

        <div className="w-full min-h-[250px] flex items-center justify-center">
           {isSpinning ? (
               <div className="text-center py-10 animate-bounce">
                   <div className="text-7xl mb-6 drop-shadow-lg">🎲</div>
                   <div className="px-6 py-3 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                        <h3 className="text-2xl font-black text-gray-800 tracking-tight">{places[currentIndex]?.title}</h3>
                   </div>
               </div>
           ) : (
               winner && (
                   <div className="w-full animate-winner-reveal">
                        <PlaceCard place={winner} isWinner={true} />
                   </div>
               )
           )}
        </div>

        {!isSpinning && (
          <button
            onClick={onClose}
            className="mt-10 w-full py-5 bg-black text-white font-black text-xl rounded-2xl hover:bg-gray-800 transition-all transform hover:scale-105 active:scale-95 shadow-xl"
          >
            SQUAD, LET'S ROLL 🤝
          </button>
        )}
      </div>

      <style>{`
        @keyframes winner-reveal {
            0% { transform: scale(0.5) rotate(-20deg); opacity: 0; }
            70% { transform: scale(1.1) rotate(5deg); }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .animate-winner-reveal {
            animation: winner-reveal 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default RouletteModal;
