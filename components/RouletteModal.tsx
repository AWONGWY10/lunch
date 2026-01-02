import React, { useEffect, useState, useRef } from 'react';
import { Place } from '../types';
import PlaceCard from './PlaceCard';

interface RouletteModalProps {
  places: Place[];
  onClose: () => void;
}

const RouletteModal: React.FC<RouletteModalProps> = ({ places, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(true);
  const [winner, setWinner] = useState<Place | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play a tick sound
  const playTick = () => {
    if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            audioContextRef.current = new AudioContextClass();
        }
    }
    const ctx = audioContextRef.current;
    if (!ctx) return;
    
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  const playWin = () => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
    
    osc.start();
    osc.stop(ctx.currentTime + 1);
  };

  useEffect(() => {
    let speed = 50;
    let timeoutId: ReturnType<typeof setTimeout>;
    const totalSpins = Math.floor(Math.random() * 10) + 30; // Random number of ticks between 30 and 40
    let currentSpinCount = 0;

    const spin = () => {
      setCurrentIndex((prev) => (prev + 1) % places.length);
      playTick();
      currentSpinCount++;

      if (currentSpinCount < totalSpins) {
        // Decelerate
        if (currentSpinCount > totalSpins - 10) {
           speed *= 1.2; 
        }
        timeoutId = setTimeout(spin, speed);
      } else {
        setIsSpinning(false);
        setWinner(places[(currentIndex + 1) % places.length]); // Determine winner based on where it landed
        playWin();
      }
    };

    timeoutId = setTimeout(spin, speed);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-3xl p-8 flex flex-col items-center shadow-2xl relative overflow-hidden">
        
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 animate-pulse"></div>

        <h2 className="text-3xl font-black text-center mb-8 fun-font text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
          {isSpinning ? "Fate is Deciding..." : "Bon Appétit!"}
        </h2>

        <div className="w-full h-64 relative flex items-center justify-center perspective-1000">
           {isSpinning ? (
               <div className="text-center transform transition-all duration-75 scale-110">
                   <div className="text-6xl mb-4">🎰</div>
                   <h3 className="text-2xl font-bold text-gray-700">{places[currentIndex].title}</h3>
               </div>
           ) : (
               winner && (
                   <div className="w-full transform transition-all duration-500 animate-bounce-in">
                        <PlaceCard place={winner} isWinner={true} />
                   </div>
               )
           )}
        </div>

        {!isSpinning && (
          <button
            onClick={onClose}
            className="mt-8 px-8 py-3 bg-gray-800 text-white font-bold rounded-full hover:bg-gray-700 transition-colors shadow-lg"
          >
            Awesome, Let's Go!
          </button>
        )}
      </div>
    </div>
  );
};

export default RouletteModal;