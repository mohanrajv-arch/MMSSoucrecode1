import React from 'react';
import { useFormatDate } from 'src/context/AuthContext';
import FormatDate from './FormatDate';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  max?: string;
  min?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  placeholder?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  max,
  min,
  disabled = false,
  className = '',
  id,
  placeholder = 'Select date'
}) => {
  const formatDate = useFormatDate();

  // Check if a date string is valid
  const isValidDate = (dateStr: string): boolean => {
    if (!dateStr) return false;
    
    // Check if it's in DD-MM-YYYY format
    if (dateStr.includes('-') && dateStr.split('-')[0].length === 2) {
      const [day, month, year] = dateStr.split('-').map(Number);
      if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
      if (month < 1 || month > 12) return false;
      if (day < 1 || day > 31) return false;
      if (year < 1000 || year > 9999) return false;
      
      // Check for valid date (e.g., not Feb 30)
      const date = new Date(year, month - 1, day);
      return date.getFullYear() === year && 
             date.getMonth() === month - 1 && 
             date.getDate() === day;
    }
    
    // Check if it's in YYYY-MM-DD format (HTML5 date input)
    if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
      const [year, month, day] = dateStr.split('-').map(Number);
      if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
      if (month < 1 || month > 12) return false;
      if (day < 1 || day > 31) return false;
      
      const date = new Date(year, month - 1, day);
      return date.getFullYear() === year && 
             date.getMonth() === month - 1 && 
             date.getDate() === day;
    }
    
    return false;
  };

  // Convert from DD-MM-YYYY to YYYY-MM-DD for input type="date"
  const formatForInput = (dateStr: string): string => {
    if (!dateStr || !isValidDate(dateStr)) return '';
    
    if (dateStr.includes('-') && dateStr.split('-')[0].length === 2) {
      const [day, month, year] = dateStr.split('-');
      return `${year}-${month}-${day}`;
    }
    
    return dateStr;
  };

  // Convert from YYYY-MM-DD to DD-MM-YYYY for storage
  const formatForStorage = (dateStr: string): string => {
    if (!dateStr || !isValidDate(dateStr)) return '';
    
    if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
      const [year, month, day] = dateStr.split('-');
      return `${day}-${month}-${year}`;
    }
    
    return dateStr;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue) {
      const formattedDate = formatForStorage(inputValue);
      if (formattedDate && isValidDate(formattedDate)) {
        onChange(formattedDate);
      } else {
        onChange('');
      }
    } else {
      onChange('');
    }
  };

  const displayValue = formatForInput(value);
  const isValidCurrentDate = isValidDate(value);

  return (
    <div className="relative">
      <input
        id={id}
        type="date"
        value={displayValue}
        onChange={handleChange}
        max={max ? formatForInput(max) : undefined}
        min={min ? formatForInput(min) : undefined}
        disabled={disabled}
        className={`ui-form-control rounded-md py-2.5 px-3 w-full ${className} ${
          value && !isValidCurrentDate ? 'border-red-500' : ''
        }`}
        placeholder={placeholder}
      />
      
      {value && isValidCurrentDate && (
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <FormatDate 
            date={value} 
            className="text-xs text-gray-500 bg-white px-1 rounded"
          />
        </div>
      )}
      
      {value && !isValidCurrentDate && (
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <span className="text-xs text-red-500 bg-white px-1 rounded">
            Invalid
          </span>
        </div>
      )}
    </div>
  );
};

export default DatePicker;