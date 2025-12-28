'use client';

import { Search, X } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = "Search for products..." }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto px-2 md:px-0">
      <div className={`flex bg-white border-2 transition-all duration-300 ${isFocused ? 'border-primary ring-4 ring-primary/5' : 'border-border'}`}>
        {/* Search Icon - Leading */}
        <div className="flex items-center pl-3 md:pl-5 pr-1 md:pr-2">
          <Search className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${isFocused ? 'text-primary' : 'text-foreground/30'}`} />
        </div>

        {/* Input Field */}
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search for Mobiles, TVs..."
          className="w-full py-2.5 md:py-4 bg-transparent focus:outline-none text-[13px] md:text-[15px] font-medium text-foreground placeholder:text-foreground/30"
        />

        {/* Actions inside input */}
        <div className="flex items-center gap-1 md:gap-2 pr-1 md:pr-2">
          {query && (
            <button
              onClick={clearSearch}
              className="p-1 md:p-1.5 hover:bg-secondary rounded-full transition-colors"
            >
              <X className="w-3.5 h-3.5 md:w-4 md:h-4 text-foreground/30" />
            </button>
          )}

          <button
            onClick={() => onSearch(query)}
            className="bg-primary text-white h-[36px] md:h-[44px] px-3 md:px-8 font-bold text-[11px] md:text-sm uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-3.5 h-3.5 md:hidden" />
            <span className="hidden md:inline">Search</span>
          </button>
        </div>
      </div>

      {/* Quick Links below Search */}
      <div className="mt-3 flex overflow-x-auto no-scrollbar pb-1 md:pb-0 md:flex-wrap md:justify-center items-center gap-x-4 md:gap-x-6 gap-y-2 px-1">
        <span className="text-[9px] font-bold text-foreground/30 uppercase tracking-[1.5px] whitespace-nowrap">Suggestions:</span>
        {["OLED TV", "iPhone 15", "AirPods", "MacBook", "Gaming"].map((item) => (
          <button
            key={item}
            onClick={() => handleSearch(item)}
            className="text-[10px] md:text-[11px] font-bold text-foreground/50 hover:text-primary transition-all relative group whitespace-nowrap"
          >
            {item}
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all group-hover:w-full"></span>
          </button>
        ))}
      </div>
    </div>
  );
}
