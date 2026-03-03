import { useState, useEffect } from 'react';
import { useAuth } from 'src/context/AuthContext';

interface Currency {
  pk: number;
  code: string;
  name: string;
  symbol: string;
}

interface CurrencyApiResponse {
  responseContents: Currency[];
}

export const useCurrency = () => {
  const { projectSettings, credentials } = useAuth();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [currentCurrency, setCurrentCurrency] = useState<Currency | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch currencies from API
  const fetchCurrencies = async (): Promise<Currency[]> => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://103.73.191.2:8778/payment-preparation-service/paymentPreparationController/docCurrency`,
        { 
          method: 'GET', 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data: CurrencyApiResponse = await response.json();
      
      if (data.responseContents && Array.isArray(data.responseContents)) {
        setCurrencies(data.responseContents);
        return data.responseContents;
      } else {
        console.warn('Unexpected API response structure for currencies:', data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching currencies:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Get current currency based on project settings or credentials
  const getCurrentCurrency = (currencyList: Currency[]): Currency | null => {
    if (!currencyList.length) return null;
    
    // First, try to find by project settings currencyFk
    if (projectSettings?.currencyFk) {
      const found = currencyList.find(curr => curr.pk === projectSettings.currencyFk);
      if (found) return found;
    }
    
    // Then try by project settings currency code
    if (projectSettings?.currency) {
      const found = currencyList.find(curr => curr.code === projectSettings.currency);
      if (found) return found;
    }
    
    // Finally, try by credentials currencyFk
    if (credentials?.currencyFk) {
      const found = currencyList.find(curr => curr.pk === credentials.currencyFk);
      if (found) return found;
    }
    
    // Default fallback
    return currencyList.find(curr => curr.code === 'SAR') || currencyList[0] || null;
  };

  useEffect(() => {
    const loadCurrencies = async () => {
      const fetchedCurrencies = await fetchCurrencies();
      const current = getCurrentCurrency(fetchedCurrencies);
      setCurrentCurrency(current);
    };
    
    loadCurrencies();
  }, []);

  // Update current currency when project settings change
  useEffect(() => {
    if (currencies.length > 0) {
      const current = getCurrentCurrency(currencies);
      setCurrentCurrency(current);
    }
  }, [projectSettings, credentials, currencies]);

  return {
    currencies,
    currentCurrency,
    isLoading,
    refetchCurrencies: fetchCurrencies
  };
};  