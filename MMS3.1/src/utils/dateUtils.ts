// src/utils/dateUtils.ts
export const getTodayDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateForApi = (dateString: string): string => {
  return dateString; // input type="date" already provides YYYY-MM-DD format
};

export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

export const isFutureDate = (dateString: string): boolean => {
  const today = new Date(getTodayDate());
  const inputDate = new Date(dateString);
  return inputDate > today;
};