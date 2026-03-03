// FormatDateTime component
import React from 'react';
import { useFormatDateTime } from 'src/context/AuthContext';

interface FormatDateTimeProps {
  date: string | Date | null;
  format?: string;
  className?: string;
  fallback?: string;
}

const FormatDateTime: React.FC<FormatDateTimeProps> = ({ 
  date, 
  format, 
  className = '',
  fallback = 'Invalid Date/Time'
}) => {
  const formatDateTime = useFormatDateTime();
  
  if (!date) return <span className={className}>{fallback}</span>;
  
  const formattedDateTime = formatDateTime(date, format) || fallback;
  
  return (
    <span className={className}>
      {formattedDateTime}
    </span>
  );
};

export default FormatDateTime;