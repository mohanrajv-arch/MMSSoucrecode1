import React, { useState } from 'react';
import { useCredentials } from 'src/context/AuthContext';

interface FormattedNumberInputProps {
  value: number | string;
  onChange: (value: string) => void;
  min?: number;
  step?: number;
  className?: string;
  placeholder?: string;
}

const FormattedNumberInput: React.FC<FormattedNumberInputProps> = ({
  value,
  onChange,
  min = 0,
  step = 0.01,
  className = '',
  placeholder = ''
}) => {
  const credentials = useCredentials();
  const [inputValue, setInputValue] = useState<string>(String(value));

  const formatNumber = (num: number): string => {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: credentials.costDecimal ?? 2,
      maximumFractionDigits: credentials.costDecimal ?? 2
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const numericValue = parseFloat(e.target.value.replace(/,/g, '')) || 0;
    const formattedValue = formatNumber(numericValue);
    setInputValue(formattedValue);
    onChange(formattedValue);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Remove formatting when focused for editing
    const numericValue = parseFloat(e.target.value.replace(/,/g, '')) || 0;
    setInputValue(numericValue.toString());
  };

  return (
    <input
      type="text"
      className={`w-full text-center bg-transparent border border-gray-300 rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600 ${className}`}
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      placeholder={placeholder}
    />
  );
};

export default FormattedNumberInput;