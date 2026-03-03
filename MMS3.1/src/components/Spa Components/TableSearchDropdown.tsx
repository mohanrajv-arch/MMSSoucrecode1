import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, X } from 'lucide-react';

const TableSearchableSelect = ({
  options = [],
  value = '',
  onChange,
  placeholder = 'Please Select',
  disabled = false,
  className = '',
  error = false,
  helperText = '',
  loading = false,
  displayKey = 'name',
  valueKey = 'name',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState({ left: 0, top: 0, width: 0 });
  const wrapperRef = useRef(null);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const filteredOptions = options.filter((option) => {
    if (!option || !option[displayKey]) return false;
    const searchLower = searchTerm.toLowerCase();
    const displayValue = String(option[displayKey]).toLowerCase();
    const valueStr = String(option[valueKey]).toLowerCase();
    return displayValue.includes(searchLower) || valueStr.includes(searchLower);
  });

  const selectedOption = options.find((option) => String(option[valueKey]) === String(value));

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex][valueKey]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!disabled && !loading) {
      if (!isOpen) {
        // Calculate position relative to viewport for fixed positioning
        if (triggerRef.current) {
          const rect = triggerRef.current.getBoundingClientRect();
          setDropdownPosition({
            left: rect.left,
            top: rect.bottom,
            width: rect.width,
          });
        }
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
      setIsOpen(!isOpen);
    }
  };

  const handleClickOutside = (event) => {
    if (
      wrapperRef.current && !wrapperRef.current.contains(event.target) &&
      dropdownRef.current && !dropdownRef.current.contains(event.target)
    ) {
      setIsOpen(false);
      setSearchTerm('');
      setHighlightedIndex(-1);
    }
  };

  const handleScroll = (event) => {
    if (dropdownRef.current && dropdownRef.current.contains(event.target)) {
      return; // Don't close if scrolling inside the dropdown
    }
    setIsOpen(false);
  };

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPosition({
        left: rect.left,
        top: rect.bottom,
        width: rect.width,
      });
    }
  };

useEffect(() => {
  if (isOpen) {
    document.addEventListener('click', handleClickOutside);

    // FIX → Only track window scroll, not ALL scrolls (which includes dropdown's own scrolling)
    window.addEventListener('scroll', updatePosition, { passive: true });

    // Still update on resize
    window.addEventListener('resize', updatePosition);

    requestAnimationFrame(updatePosition);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }
}, [isOpen]);


  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const DropdownPortal = () => (
    isOpen && !disabled && !loading ? createPortal(
      (
        <div
          ref={dropdownRef}
          className="fixed z-[9999] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-xl dark:shadow-gray-900 max-h-60 overflow-hidden"
          style={{
            left: `${dropdownPosition.left}px`,
            top: `${dropdownPosition.top}px`,
            width: `${dropdownPosition.width}px`,
          }}
        >
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 sticky top-0 z-[9999]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-300 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search options..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-48">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm text-center">
                {searchTerm ? 'No results found' : 'No options available'}
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <button
                  key={`${option[valueKey]}-${index}`}
                  type="button"
                  onClick={() => handleSelect(option[valueKey])}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`
                    w-full px-3 py-2 text-left text-sm
                    transition-colors duration-200
                    ${
                      String(value) === String(option[valueKey])
                        ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                        : ''
                    }
                    ${
                      highlightedIndex === index
                        ? 'bg-blue-50 dark:bg-gray-700 text-blue-700 dark:text-blue-300'
                        : 'text-gray-900 dark:text-gray-100'
                    }
                    hover:bg-blue-50 dark:hover:bg-gray-700
                  `}
                >
                  {option[displayKey]}
                </button>
              ))
            )}
          </div>
        </div>
      ),
      document.body
    ) : null
  );

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      <div
        ref={triggerRef}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`
          w-full px-3 py-2 text-left bg-white dark:bg-gray-800 border rounded-md shadow-sm
          flex items-center justify-between cursor-pointer
          transition-colors duration-200
          ${disabled || loading ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'hover:border-gray-400 dark:hover:border-gray-500'}
          ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
          ${isOpen ? 'border-blue-500 dark:border-blue-400 ring-1 ring-blue-500 dark:ring-blue-400' : 'focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400'}
          h-10
        `}
      >
        <span
          className={`block truncate ${
            !selectedOption || loading ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'
          }`}
        >
          {loading ? 'Loading...' : (selectedOption ? selectedOption[displayKey] : placeholder)}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 dark:text-gray-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      <DropdownPortal />

      {helperText && (
        <p className={`mt-1 text-xs ${error ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default TableSearchableSelect;