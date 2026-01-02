import React from 'react';
import { BudgetLevel, SearchFilters } from '../types';

interface FilterPanelProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  disabled: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onChange, disabled }) => {
  
  const handleBudgetChange = (budget: BudgetLevel) => {
    onChange({ ...filters, budget });
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, radius: parseInt(e.target.value, 10) });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-orange-100 mb-8 w-full max-w-md">
      <h3 className="text-xl font-bold text-gray-800 mb-4 fun-font">Lunch Parameters</h3>
      
      {/* Radius Slider */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Walking Distance: <span className="text-orange-600 font-bold">{filters.radius}m</span>
        </label>
        <input
          type="range"
          min="100"
          max="3000"
          step="100"
          value={filters.radius}
          onChange={handleRadiusChange}
          disabled={disabled}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Lazy (100m)</span>
          <span>Athlete (3km)</span>
        </div>
      </div>

      {/* Budget Selection */}
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-600 mb-2">Budget Vibe</label>
        <div className="flex gap-2">
          {Object.values(BudgetLevel).map((budget) => (
            <button
              key={budget}
              onClick={() => handleBudgetChange(budget)}
              disabled={disabled}
              className={`flex-1 py-2 px-1 text-sm font-semibold rounded-lg transition-all transform active:scale-95 ${
                filters.budget === budget
                  ? 'bg-orange-500 text-white shadow-md ring-2 ring-orange-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {budget}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;