import React, { useState, useRef, useEffect } from 'react';

interface AnimatedSearchProps {
  onSearch?: (query: string) => void;
  onInputChange?: (query: string) => void;
  placeholder?: string;
  className?: string;
  value?: string;
}

const AnimatedSearch: React.FC<AnimatedSearchProps> = ({
  onSearch,
  onInputChange,
  placeholder = "Search...",
  className = "",
  value = "",
}) => {
  const [searchQuery, setSearchQuery] = useState(value);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync with external value changes
  useEffect(() => {
    setSearchQuery(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onInputChange?.(value);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch?.(searchQuery.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleIconClick = () => {
    if (isExpanded) {
      handleSearch();
    } else {
      setIsExpanded(true);
      inputRef.current?.focus();
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        if (!searchQuery) {
          setIsExpanded(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchQuery]);

  return (
    <div
      ref={wrapperRef}
      className={`relative flex items-center ${className}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => {
        if (!searchQuery && !inputRef.current?.matches(':focus')) {
          setIsExpanded(false);
        }
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        onFocus={() => setIsExpanded(true)}
        className={`
          h-10 pr-10 rounded-full transition-all duration-300
          bg-blue-600 text-black placeholder-gray-200 shadow-md
          focus:outline-none focus:ring-2 focus:ring-blue-400
          ${isExpanded ? 'w-64 bg-white pl-4 focus:ring-2 focus:ring-blue-400 text-black placeholder-gray-500' : 'w-10'}
        `}
        placeholder={isExpanded ? placeholder : ''}
      />
      
      <button
        type="button"
        onClick={handleIconClick}
        className={`
          absolute right-0 flex items-center justify-center
          h-10 w-10 rounded-full focus:outline-none
          ${isExpanded ? 'text-blue-600 hover:text-blue-800' : 'text-white'}
        `}
        aria-label="Search"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>
    </div>
  );
};

export default AnimatedSearch;