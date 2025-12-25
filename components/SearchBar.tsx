'use client';

import { Search, X, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const discoveryPrompts = [
  "gifts for outdoor enthusiasts",
  "tech gadgets under $50",
  "sustainable home products",
  "minimalist desk setup",
  "cozy winter essentials",
  "fitness gear for beginners",
  "unique birthday gifts",
  "productivity tools"
];

export default function SearchBar({ onSearch, placeholder = "Search products..." }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState(0);

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
  };

  const handlePromptClick = (prompt: string) => {
    setQuery(prompt);
    onSearch(prompt);
  };

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="relative group">
        <div className={`absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-lg transition-all duration-500 ${isFocused ? 'opacity-60 blur-xl' : 'opacity-30'} group-hover:opacity-50`}></div>

        <div className="relative bg-white rounded-3xl shadow-2xl border-2 border-gray-100 transition-all duration-300 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4">
            <Search className={`w-5 h-5 smooth-transition flex-shrink-0 ${isFocused ? 'text-blue-600 scale-110' : 'text-gray-400'}`} />

            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder="Search for products..."
              className="flex-1 bg-transparent focus:outline-none text-base text-gray-900 placeholder:text-gray-400 font-medium"
            />

            {query && (
              <button
                onClick={clearSearch}
                className="p-1.5 hover:bg-gray-100 rounded-full smooth-transition flex-shrink-0"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}

            <button
              onClick={() => onSearch(query)}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black text-sm rounded-2xl hover:shadow-2xl hover:scale-105 smooth-transition flex items-center gap-2 button-press group/discover relative overflow-hidden flex-shrink-0"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 transform translate-x-full group-hover/discover:translate-x-0 transition-transform duration-500"></div>
              <Search className="w-4 h-4 group-hover/discover:scale-125 smooth-transition relative z-10" />
              <span className="relative z-10">Search</span>
            </button>
          </div>

          {isFocused && !query && (
            <div className="border-t border-gray-100 px-5 py-4 bg-gradient-to-b from-white to-gray-50/50 animate-fade-in-up">
              <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">🔥 Trending Searches</p>
              <div className="grid grid-cols-2 gap-2">
                {discoveryPrompts.slice(0, 4).map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handlePromptClick(prompt)}
                    className="px-3 py-2 bg-white hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-400 rounded-xl text-xs text-gray-700 hover:text-blue-700 smooth-transition text-left font-bold hover:scale-105 button-press animate-scale-in shadow-sm hover:shadow-md"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
