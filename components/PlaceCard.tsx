import React from 'react';
import { Place } from '../types';

interface PlaceCardProps {
  place: Place;
  isWinner?: boolean;
  onToggleBattle?: (place: Place) => void;
  isSelectedForBattle?: boolean;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ 
  place, 
  isWinner = false, 
  onToggleBattle,
  isSelectedForBattle = false
}) => {
  // Defensive check: ensure these are strings
  const title = typeof place.title === 'string' ? place.title : String(place.title || "Unknown Place");
  const description = typeof place.description === 'string' ? place.description : String(place.description || "");
  const distance = typeof place.distance === 'string' ? place.distance : String(place.distance || "");

  return (
    <div 
      className={`relative p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between h-full group ${
        isWinner 
          ? 'bg-gradient-to-br from-yellow-300 to-orange-400 shadow-2xl scale-105 border-4 border-white transform z-10' 
          : isSelectedForBattle
            ? 'bg-purple-50 border-2 border-purple-500 shadow-lg scale-[1.02]'
            : 'bg-white shadow-sm hover:shadow-xl border border-gray-100 hover:border-orange-200'
      }`}
    >
      {/* Badges */}
      {isWinner && (
        <div className="absolute -top-4 -right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-bounce z-20">
          WINNER!
        </div>
      )}
      
      {isSelectedForBattle && !isWinner && (
         <div className="absolute -top-3 -right-3 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm z-20">
           ⚔️ READY
         </div>
      )}

      {/* Distance Badge */}
      {distance && (
          <div className={`absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded-md ${isWinner ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
              📍 {distance}
          </div>
      )}
      
      <div className="mb-4 pr-12">
        <h4 className={`font-black text-lg mb-2 leading-tight ${isWinner ? 'text-white drop-shadow-md' : 'text-gray-800'}`}>
          {title}
        </h4>
        
        {description && (
             <p className={`text-sm mb-3 leading-relaxed ${isWinner ? 'text-white/90' : 'text-gray-500 italic'}`}>
                 "{description}"
             </p>
        )}
        
        {place.rating && (
           <div className="flex items-center gap-1">
             <span className="text-yellow-500">★</span>
             <span className={`text-sm font-bold ${isWinner ? 'text-white' : 'text-gray-700'}`}>{place.rating}</span>
           </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100/20">
        <div className="">
            {place.uri ? (
              <a
                href={place.uri}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center text-xs font-bold uppercase tracking-wider ${
                  isWinner ? 'text-white hover:text-gray-100 underline' : 'text-blue-500 hover:text-blue-700 hover:underline'
                }`}
              >
                View Map ↗
              </a>
            ) : (
              <span className="text-xs text-gray-400">No link</span>
            )}
        </div>

        {onToggleBattle && !isWinner && (
          <button 
            onClick={() => onToggleBattle(place)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 transform active:scale-95 ${
              isSelectedForBattle 
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-purple-100 text-purple-600 hover:bg-purple-200 opacity-0 group-hover:opacity-100'
            }`}
          >
            {isSelectedForBattle ? 'Remove' : '⚔️ Battle'}
          </button>
        )}
      </div>
    </div>
  );
};

export default PlaceCard;
