// src/utils/currencyUtils.ts
import { useCredentials } from 'src/context/AuthContext';

export const useCurrency = () => {
  const credentials = useCredentials();
  
  return {
    currencyFk: credentials.currencyFk,
    currencyCode: credentials.currencyCode,
    currencyName: credentials.currencyName,
  };
};

export const getCurrencyFromCredentials = (credentials: any) => {
  return {
    currencyFk: credentials.currencyFk,
    currencyCode: credentials.currencyCode,
    currencyName: credentials.currencyName,
    currencySymbol: credentials.currencySymbol
  };
};