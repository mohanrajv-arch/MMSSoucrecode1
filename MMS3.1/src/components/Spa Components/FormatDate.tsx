// src/components/Spa Components/FormatDate.tsx
import React from 'react';

interface FormatDateProps {
  date: Date | string | null;
  format?: string;
}

const FormatDate: React.FC<FormatDateProps> = ({ date, format = 'dd/MM/yyyy' }) => {
  if (!date) return <span>-</span>;

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return <span>Invalid Date</span>;

  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear().toString();
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  const seconds = dateObj.getSeconds().toString().padStart(2, '0');
  const hours12 = (dateObj.getHours() % 12 || 12).toString().padStart(2, '0');
  const ampm = dateObj.getHours() >= 12 ? 'PM' : 'AM';

  const formatted = format
    .replace(/dd/g, day)
    .replace(/MM/g, month)
    .replace(/yyyy/g, year)
    .replace(/HH/g, hours)
    .replace(/hh/g, hours12)
    .replace(/mm/g, minutes)
    .replace(/ss/g, seconds)
    .replace(/a/g, ampm);

  return <span>{formatted}</span>;
};

export default FormatDate;