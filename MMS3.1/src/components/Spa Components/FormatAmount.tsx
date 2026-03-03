// src/components/shared/FormatAmount.tsx
import React from 'react';
import { useFormatAmount } from 'src/context/AuthContext';

interface FormatAmountProps {
  amount: number | string;
  decimalPlaces?: number;
  className?: string;
}

const FormatAmount: React.FC<FormatAmountProps> = ({ 
  amount, 
  decimalPlaces, 
  className = '' 
}) => {
  const formatAmount = useFormatAmount();
  
  return (
    <span className={className}>
      {formatAmount(amount, decimalPlaces)}
    </span>
  );
};

export default FormatAmount;