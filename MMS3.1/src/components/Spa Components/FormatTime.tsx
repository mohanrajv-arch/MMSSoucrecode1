// src/components/Spa Components/FormatTime.tsx
import React from 'react';
import { useFormatTime } from 'src/context/AuthContext';

interface FormatTimeProps {
  time: string | Date | null;
  format?: string;
  className?: string;
  fallback?: string;
}

const FormatTime: React.FC<FormatTimeProps> = ({ 
  time, 
  format, 
  className = '',
  fallback = 'Invalid Time'
}) => {
  const formatTime = useFormatTime();
  
  if (!time) return <span className={className}>{fallback}</span>;
  
  const formattedTime = formatTime(time, format) || fallback;
  
  return (
    <span className={className}>
      {formattedTime}
    </span>
  );
};

export default FormatTime;