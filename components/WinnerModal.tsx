import React from 'react';
import { Place } from '../types.ts';
import PlaceCard from './PlaceCard.tsx';

interface WinnerModalProps {
  winner: Place;
  onClose: () => void;
}

const BRAINROT_QUOTES = [
    "ABSOLUTE CINEMA ✋😐🤚",
    "NO CAP BUSSIN 🧢",
    "WINNER WINNER CHICKEN DINNER 🍗",
    "THE CHOSEN ONE ⚡",
    "MAIN CHARACTER ENERGY ✨",
    "WE ARE SO BACK 📈",
    "SHEEEEEESH 🥶",
    "GG EZ CLAP 👏",
];

const WinnerModal: React.FC<WinnerModalProps> = ({ winner, onClose }) => {
  const quote = BRAINROT_QUOTES[Math.floor(Math.random() * BRAINROT_QUOTES.length)];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fade-in">
        
        {/* Confetti Background (Simulated with CSS dots) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
                <div 
                    key={i}
                    className="absolute w-4 h-4 rounded-full animate-bounce"
                    style={{
                        backgroundColor: ['#ff0000', '#00ff00', '#0000ff', '#ffff00'][i % 4],
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDuration: `${Math.random() * 2 + 1}s`,
                        animationDelay: `${Math.random()}s`,
                    }}
                ></div>
            ))}
        </div>

        <div className="w-full max-w-lg relative flex flex-col items-center">
            
            {/* Header Text */}
            <h1 className="text-5xl md:text-6xl font-black text-center mb-2 text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 via-orange-500 to-red-600 drop-shadow-sm animate-pulse fun-font transform -rotate-3">
                VICTORY!
            </h1>
            <p className="text-white font-mono text-xl mb-8 animate-bounce tracking-widest">{quote}</p>

            {/* The Card */}
            <div className="w-full transform transition-all duration-500 hover:scale-105 hover:rotate-1">
                <PlaceCard place={winner} isWinner={true} />
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-4">
                <button
                    onClick={onClose}
                    className="px-8 py-4 bg-white text-black font-black text-lg rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)] hover:shadow-[0_0_40px_rgba(255,255,255,0.8)] transition-all transform hover:-translate-y-1 active:scale-95"
                >
                    LET'S EAT 🍴
                </button>
            </div>
        </div>
    </div>
  );
};

export default WinnerModal;
