import React from 'react';

const Mascot: React.FC = () => {
  return (
    <div className="relative w-40 h-40 animate-bounce hover:rotate-3 cursor-pointer transition-all duration-500 group">
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-xl">
        {/* Buns Top */}
        <path d="M20 100C20 60 50 30 100 30C150 30 180 60 180 100H20Z" fill="#F59E0B" stroke="#D97706" strokeWidth="4"/>
        
        {/* Sesame Seeds */}
        <circle cx="60" cy="60" r="3" fill="#FEF3C7"/>
        <circle cx="100" cy="50" r="3" fill="#FEF3C7"/>
        <circle cx="140" cy="65" r="3" fill="#FEF3C7"/>
        <circle cx="80" cy="80" r="3" fill="#FEF3C7"/>
        <circle cx="120" cy="75" r="3" fill="#FEF3C7"/>

        {/* Lettuce */}
        <path d="M15 110C15 110 30 120 45 110C60 100 75 120 90 110C105 100 120 120 135 110C150 100 165 120 185 110" stroke="#22C55E" strokeWidth="12" strokeLinecap="round"/>
        
        {/* Cheese */}
        <path d="M20 120H180L170 135L150 120L130 135L110 120L90 135L70 120L50 135L30 120Z" fill="#FCD34D"/>

        {/* Meat */}
        <rect x="20" y="130" width="160" height="25" rx="10" fill="#78350F" stroke="#451A03" strokeWidth="4"/>

        {/* Bun Bottom */}
        <path d="M25 155H175C175 155 175 185 100 185C25 185 25 155 25 155Z" fill="#F59E0B" stroke="#D97706" strokeWidth="4"/>

        {/* Face */}
        <g className="group-hover:animate-pulse">
            {/* Eyes */}
            <circle cx="70" cy="90" r="8" fill="#1F2937"/>
            <circle cx="70" cy="88" r="3" fill="white"/>
            
            <circle cx="130" cy="90" r="8" fill="#1F2937"/>
            <circle cx="130" cy="88" r="3" fill="white"/>

            {/* Cheeks */}
            <circle cx="55" cy="100" r="6" fill="#FCA5A5" opacity="0.6"/>
            <circle cx="145" cy="100" r="6" fill="#FCA5A5" opacity="0.6"/>

            {/* Mouth */}
            <path d="M90 100Q100 110 110 100" stroke="#1F2937" strokeWidth="3" strokeLinecap="round"/>
        </g>
      </svg>
      
      {/* Speech Bubble */}
      <div className="absolute -top-4 -right-8 bg-white px-4 py-2 rounded-2xl shadow-lg border-2 border-gray-100 transform rotate-12 transition-transform group-hover:rotate-0 group-hover:scale-110">
        <p className="text-sm font-black text-gray-800 whitespace-nowrap">Let's Race! 🏁</p>
        <div className="absolute bottom-0 left-4 w-3 h-3 bg-white border-r-2 border-b-2 border-gray-100 transform rotate-45 translate-y-1/2"></div>
      </div>
    </div>
  );
};

export default Mascot;