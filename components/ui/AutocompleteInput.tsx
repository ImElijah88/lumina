import React, { useState, useEffect, useRef } from 'react';
import { getBibleSuggestions } from '../../utils/bibleSuggestions';
import { soundEngine } from '../../utils/soundUtils';

interface AutocompleteInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSuggestionSelect: (value: string) => void;
  icon?: React.ReactNode;
  wrapperClassName?: string;
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChange,
  onSuggestionSelect,
  icon,
  wrapperClassName = '',
  className = '',
  ...props
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const suggestionsListRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (value) {
      const newSuggestions = getBibleSuggestions(value);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setHighlightedIndex(-1);
  }, [value]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-scroll to highlighted item
  useEffect(() => {
    if (highlightedIndex >= 0 && suggestionsListRef.current) {
      const activeElement = suggestionsListRef.current.children[highlightedIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [highlightedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      soundEngine.playHover();
      setHighlightedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      soundEngine.playHover();
      setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        e.preventDefault();
        handleSelect(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSelect = (suggestion: string) => {
    soundEngine.playClick();
    onSuggestionSelect(suggestion);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };

  return (
    <div ref={wrapperRef} className={`relative group ${wrapperClassName}`}>
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
          {icon}
        </div>
      )}
      
      <input
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) setShowSuggestions(true);
        }}
        autoComplete="off"
        className={`${className} ${icon ? 'pl-11' : 'pl-4'}`}
        {...props}
      />

      {showSuggestions && suggestions.length > 0 && (
        <ul 
          ref={suggestionsListRef}
          className="absolute z-50 w-full mt-2 bg-[#0A0C10] border border-gray-800 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto animate-fade-in scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              onClick={() => handleSelect(suggestion)}
              onMouseEnter={() => {
                soundEngine.playHover();
                setHighlightedIndex(index);
              }}
              className={`px-4 py-3 cursor-pointer text-sm transition-colors duration-150 border-b border-gray-800/50 last:border-0
                ${index === highlightedIndex 
                  ? 'bg-blue-900/20 text-blue-300 border-l-2 border-l-blue-500 pl-[14px]' 
                  : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                }`}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};