import React, { useState, useEffect } from 'react';
import { Coordinates, BudgetLevel, SearchFilters, Place } from './types';
import { findRestaurants } from './services/geminiService';
import FilterPanel from './components/FilterPanel';
import PlaceCard from './components/PlaceCard';
import RouletteModal from './components/RouletteModal';
import Mascot from './components/Mascot';
import BattleArena from './components/BattleArena';
import WinnerModal from './components/WinnerModal';

const App: React.FC = () => {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    radius: 500,
    budget: BudgetLevel.MODERATE,
  });
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Modals
  const [showRoulette, setShowRoulette] = useState(false);
  const [showBattle, setShowBattle] = useState(false);
  const [battleWinner, setBattleWinner] = useState<Place | null>(null);
  
  // Battle State
  const [battleCandidates, setBattleCandidates] = useState<Place[]>([]);

  // Get user location on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          console.error("Geolocation Error:", err);
          const msg = err.message ? String(err.message) : "Location access denied. Please enable GPS! 📍";
          setError(msg);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser. Big L.");
    }
  }, []);

  const handleSearch = async () => {
    if (!coords) return;
    setLoading(true);
    setError(null);
    setPlaces([]);
    setBattleCandidates([]); 

    try {
      const result = await findRestaurants(coords, filters);
      if (result.places && result.places.length > 0) {
        setPlaces(result.places);
      } else {
        setError("No spots found in this radius. Try walking a bit further? 🏃‍♂️");
      }
    } catch (err: any) {
      console.error("Search Handler Error:", err);
      const errorMsg = typeof err === 'string' ? err : (err.message ? String(err.message) : "The Lunch Bot fumbled the bag.");
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const toggleBattleCandidate = (place: Place) => {
    if (battleCandidates.find(p => p.title === place.title)) {
      setBattleCandidates(battleCandidates.filter(p => p.title !== place.title));
    } else {
      if (battleCandidates.length >= 4) {
        alert("Maximum 4 fighters allowed in the arena!");
        return;
      }
      setBattleCandidates([...battleCandidates, place]);
    }
  };

  const handleBattleFinish = (winner: Place) => {
      setShowBattle(false);
      setBattleWinner(winner);
  };

  return (
    <div className="min-h-screen pb-32 bg-orange-50 bg-[url('https://www.transparenttextures.com/patterns/food.png')] bg-fixed">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b border-orange-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🍔</span>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight fun-font">
              Lunch<span className="text-orange-500">Roulette</span>
            </h1>
          </div>
          {battleCandidates.length > 0 && (
             <div 
               className="text-sm font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-full animate-pulse cursor-pointer" 
               onClick={() => setShowBattle(true)}
             >
                {battleCandidates.length} Fighters Ready
             </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 flex flex-col items-center relative">
        <div className="mb-6 z-10">
            <Mascot />
        </div>

        {!places.length && !loading && (
          <div className="text-center mb-10 max-w-lg animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 fun-font leading-tight">
              Hungry? <br/> Let's Race for Food.
            </h2>
            <p className="text-gray-600 text-lg">
              Find restaurants, pick your favorites, and watch them battle to the death (for your wallet).
            </p>
          </div>
        )}

        <FilterPanel 
          filters={filters} 
          onChange={setFilters} 
          disabled={loading} 
        />

        <div className="w-full flex justify-center mb-12">
          {loading ? (
             <button disabled className="px-8 py-4 bg-gray-200 text-gray-500 rounded-full font-bold text-lg flex items-center gap-3 cursor-not-allowed shadow-inner">
               <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
               Scouting Area...
             </button>
          ) : (
            <button 
              onClick={handleSearch}
              disabled={!coords}
              className={`px-10 py-4 rounded-full font-black text-xl shadow-xl transform transition-all hover:scale-105 active:scale-95 flex items-center gap-3 ${
                coords 
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-orange-200' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {coords ? "FIND FOOD 🔎" : "Locating You..."}
            </button>
          )}
        </div>

        {error && (
          <div className="p-6 bg-red-100 text-red-700 border-4 border-red-200 rounded-3xl mb-8 text-center max-w-md font-black italic shadow-lg animate-bounce">
            {String(error)}
          </div>
        )}

        {places.length > 0 && !loading && (
          <div className="w-full animate-fade-in pb-24">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
               <h3 className="text-2xl font-black text-gray-800 fun-font italic">Found {places.length} Contenders</h3>
               <div className="flex gap-3">
                 <button 
                   onClick={() => setShowRoulette(true)}
                   className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full font-bold shadow-lg flex items-center gap-2 transform transition-transform hover:-translate-y-1"
                 >
                   <span>🎲</span> Quick Spin
                 </button>
               </div>
            </div>
            
            <p className="text-center text-sm text-gray-500 mb-6 bg-white/60 py-2 rounded-lg border border-white">
                💡 Pick 2+ restaurants for a <strong>Battle Race!</strong>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {places.map((place, index) => (
                <PlaceCard 
                    key={index} 
                    place={place} 
                    onToggleBattle={toggleBattleCandidate}
                    isSelectedForBattle={battleCandidates.some(c => c.title === place.title)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {battleCandidates.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur shadow-[0_-4px_20px_rgba(0,0,0,0.1)] p-4 z-40 border-t border-purple-100 animate-slide-up">
              <div className="max-w-4xl mx-auto flex items-center justify-between">
                  <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
                      <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-400 uppercase">Arena</span>
                          <span className="font-bold text-purple-600 whitespace-nowrap">{battleCandidates.length} Fighters</span>
                      </div>
                      <div className="h-8 w-px bg-gray-200 mx-2"></div>
                      <div className="flex gap-2">
                          {battleCandidates.map((place, i) => (
                              <div key={i} className="bg-purple-50 border border-purple-200 text-purple-700 px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap shadow-sm">
                                  {place.title}
                              </div>
                          ))}
                      </div>
                  </div>
                  
                  <button
                    onClick={() => {
                        if (battleCandidates.length < 2) {
                            alert("Pick at least 2 restaurants for a battle!");
                        } else {
                            setShowBattle(true);
                        }
                    }}
                    className={`ml-4 px-6 py-3 rounded-xl font-black text-white shadow-xl transition-all flex items-center gap-2 ${
                        battleCandidates.length >= 2 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 shadow-purple-200' 
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                      🏁 START RACE
                  </button>
              </div>
          </div>
      )}

      {showRoulette && places.length > 0 && (
        <RouletteModal 
          places={places} 
          onClose={() => setShowRoulette(false)} 
        />
      )}
      
      {showBattle && (
          <BattleArena 
            candidates={battleCandidates}
            onClose={() => setShowBattle(false)}
            onFinish={handleBattleFinish}
          />
      )}

      {battleWinner && (
          <WinnerModal 
            winner={battleWinner}
            onClose={() => setBattleWinner(null)}
          />
      )}
    </div>
  );
};

export default App;
