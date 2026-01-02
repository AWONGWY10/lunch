import React, { useEffect, useState, useRef } from 'react';
import { Place } from '../types';

interface BattleArenaProps {
  candidates: Place[];
  onClose: () => void;
  onFinish: (winner: Place) => void;
}

// Meme Avatars
const MEME_AVATARS = [
  '🐶', // Doge-ish
  '🐸', // Pepe-ish
  '😺', // Nyan-ish
  '👽', // Alien
  '🦄', // Unicorn
  '🤡', // Clown
  '🤖', // Bot
  '💩', // Poop
];

const EVENTS = [
    "tripped on a banana!",
    "stopped to post a TikTok.",
    "is literally mogging everyone.",
    "got distracted by a squirrel.",
    "activated turbo mode!",
    "is cooking (literally).",
    "forgot the stove was on.",
    "saw a ghost!",
];

const BattleArena: React.FC<BattleArenaProps> = ({ candidates, onClose, onFinish }) => {
  const [progress, setProgress] = useState<number[]>(new Array(candidates.length).fill(0));
  const [countdown, setCountdown] = useState<number | null>(3);
  const [commentary, setCommentary] = useState("Summoning the racers...");
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [avatars] = useState(() => candidates.map(() => MEME_AVATARS[Math.floor(Math.random() * MEME_AVATARS.length)]));
  
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    
    // Countdown Logic
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setCountdown(null); // Start race
      setCommentary("🔥 LET HIM COOK! GO! 🔥");
      startRace();
    }
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  const startRace = () => {
    const updateRace = () => {
      setProgress((prevProgress) => {
        const newProgress = [...prevProgress];
        let raceFinished = false;

        // Move each racer
        for (let i = 0; i < newProgress.length; i++) {
            // Chaos RNG
            const chaos = Math.random();
            let speed = Math.random() * 0.5 + 0.2; 
            
            // Random Events
            if (chaos > 0.98) {
                speed = 3.0; // Mega boost
                setCommentary(`${candidates[i].title} goes SUPER SAIYAN! ⚡`);
            } else if (chaos < 0.02) {
                speed = -0.5; // Trip
                setCommentary(`${candidates[i].title} ${EVENTS[Math.floor(Math.random() * EVENTS.length)]}`);
            }

            newProgress[i] = Math.max(0, Math.min(100, newProgress[i] + speed));
            
            if (newProgress[i] >= 100 && !raceFinished) {
                raceFinished = true;
                setWinnerIndex(i);
                setCommentary(`👑 ${candidates[i].title} IS THE GOAT! 👑`);
                // Delay slightly before showing winner modal
                setTimeout(() => onFinish(candidates[i]), 1500);
            }
        }

        if (!raceFinished) {
            requestRef.current = requestAnimationFrame(updateRace);
        }
        
        return newProgress;
      });
    };
    
    requestRef.current = requestAnimationFrame(updateRace);
  };

  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-5xl bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border-4 border-yellow-400 relative">
        
        {/* Top Bar */}
        <div className="bg-gray-800 p-6 flex justify-between items-center border-b border-gray-700">
           <div>
               <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500 italic tracking-wider uppercase transform -skew-x-12 animate-pulse">
                   CHAOS CIRCUIT 🏁
               </h2>
               <p className="text-yellow-200 font-mono text-sm mt-1 animate-bounce">{commentary}</p>
           </div>
           
           <div className="text-6xl font-black text-white w-24 text-center drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]">
              {countdown !== null ? countdown : ""}
           </div>
           
           <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">✕</button>
        </div>

        {/* Track Area */}
        <div className="p-8 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] bg-gray-900 relative min-h-[400px] flex flex-col justify-center gap-8">
            
            {/* Start/Finish Lines */}
            <div className="absolute top-0 bottom-0 left-24 w-1 bg-white/20 border-r border-dashed border-white/50 z-0"></div>
            <div className="absolute top-0 bottom-0 right-24 w-12 bg-checkered z-0 opacity-80 shadow-[0_0_30px_rgba(255,255,255,0.4)]"></div>

            {candidates.map((place, index) => (
                <div key={index} className="relative z-10">
                    
                    {/* Lane Info */}
                    <div className="absolute -top-6 left-0 flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Player {index + 1}</span>
                        <span className="text-xs font-bold text-white truncate max-w-[200px]">{place.title}</span>
                    </div>

                    {/* The Track Lane */}
                    <div className="h-14 bg-gray-800/50 rounded-full border border-gray-700 relative overflow-visible shadow-inner">
                        
                        {/* The Racer */}
                        <div 
                            className="absolute top-1/2 -translate-y-1/2 transition-transform duration-75 ease-linear will-change-transform flex flex-col items-center"
                            style={{ 
                                left: `calc(${progress[index]}% - 20px)`, 
                                zIndex: 50 + index
                            }}
                        >
                             <div className={`relative transition-transform duration-300 ${winnerIndex === index ? 'scale-150 rotate-12' : 'hover:scale-110'}`}>
                                <div className="text-4xl filter drop-shadow-lg transform -scale-x-100">
                                    {avatars[index]}
                                </div>
                                
                                {/* Rainbow Trail for the winner or random */}
                                {progress[index] > 50 && (
                                    <div className="absolute top-1/2 right-8 h-2 w-24 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 opacity-50 blur-sm rounded-full -z-10 animate-pulse"></div>
                                )}

                                {/* Crown if winner */}
                                {winnerIndex === index && (
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-3xl animate-bounce">👑</div>
                                )}
                             </div>
                        </div>

                    </div>
                </div>
            ))}
        </div>

        <style>{`
            .bg-checkered {
                background-image: linear-gradient(45deg, #eee 25%, transparent 25%), 
                                  linear-gradient(-45deg, #eee 25%, transparent 25%), 
                                  linear-gradient(45deg, transparent 75%, #eee 75%), 
                                  linear-gradient(-45deg, transparent 75%, #eee 75%);
                background-size: 20px 20px;
                background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
            }
        `}</style>
      </div>
    </div>
  );
};

export default BattleArena;