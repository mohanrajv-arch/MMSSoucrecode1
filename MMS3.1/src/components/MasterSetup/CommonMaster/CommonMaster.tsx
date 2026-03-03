// Updated ProjectSettingsConfiguration.tsx
import React, { useState, useEffect } from 'react';
import { Calendar, Settings, DollarSign, Hash, Globe, Clock, RefreshCw, Image, ToggleRight, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useAuth } from 'src/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SearchableSelect from 'src/components/Spa Components/DropdownSearch';

interface ProjectSettings {
  dateFormat: string;
  dateTimeFormat: string;
  timeFormat: string;
  decimalPlaces: number;
  costDecimalPlaces: number;
  quantityDecimalPlaces: number;
  currency: string;
  currencyFk: number;
  currencySymbol?: string;
  useCommaSeparator: boolean;
  screenLogo?: string;
  reportLogo?: string;
  screenLogoFile?: File | null;
  reportLogoFile?: File | null;
  recipeModify?: number;
}

interface Currency {
  pk: number;
  code: string;
  name: string;
  symbol: string;
}

interface CurrencyApiResponse {
  responseContents: Currency[];
}

interface CommonAdminResponse {
  success: boolean;
  message: string;
  data: {
    pk: number;
    entityFk: number;
    dateFormat: string;
    dateTimeFormat: string;
    timeZone: string | null;
    currency: string;
    status: string | null;
    fileUpload: string | null;
    qtyDecimal: number;
    costDecimal: number;
    numberFormat: string;
    screenLogo: string | null;
    reportLogo: string | null;
    lastActBy: number;
    recipeModify?: number;
  };
}

const ProjectSettingsConfiguration: React.FC = () => {
  const { credentials, saveProjectSettings, updateProjectSettings } = useAuth();
  const navigate = useNavigate();
  const [localSettings, setLocalSettings] = useState<ProjectSettings | null>(null);
  const [originalSettings, setOriginalSettings] = useState<ProjectSettings | null>(null);
  const [validationErrors, setValidationErrors] = useState<Partial<ProjectSettings>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [imageVersion, setImageVersion] = useState(0);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [generalModal, setGeneralModal] = useState({ isOpen: false, type: 'success' as 'success' | 'error', message: '' });

  // Date format options - Updated to use MM for month
  const dateFormatOptions = [
    { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY' },
    { value: 'dd-MM-yyyy', label: 'DD-MM-YYYY' },
    { value: 'yyyy/MM/dd', label: 'YYYY/MM/DD' },
    { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD' },
    { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY' },
    { value: 'MM-dd-yyyy', label: 'MM-DD-YYYY' },
  ];

  const dateTimeFormatOptions = [
    { value: 'dd/MM/yyyy HH:mm:ss', label: 'DD/MM/YYYY HH:MM:SS' },
    { value: 'dd-MM-yyyy HH:mm:ss', label: 'DD-MM-YYYY HH:MM:SS' },
    { value: 'yyyy/MM/dd HH:mm:ss', label: 'YYYY/MM/DD HH:MM:SS' },
    { value: 'yyyy-MM-dd HH:mm:ss', label: 'YYYY-MM-DD HH:MM:SS' },
    { value: 'MM/dd/yyyy hh:mm:ss a', label: 'MM/DD/YYYY HH:MM:SS AM/PM' },
    { value: 'MM-dd-yyyy hh:mm:ss a', label: 'MM-DD-YYYY HH:MM:SS AM/PM' },
  ];

  const decimalOptions = [
    { value: 1, label: '1 decimal place' },
    { value: 2, label: '2 decimal places' },
    { value: 3, label: '3 decimal places' },
    { value: 4, label: '4 decimal places' }
  ];

  const commaSeparatorOptions = [
    { value: true, label: 'Yes' },
    { value: false, label: 'No' }
  ];

  // Local formatting functions for immediate preview
  const formatDateExample = (date: Date, formatStr: string): string => {
    if (!localSettings) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return formatStr
      .replace(/dd/g, day)
      .replace(/MM/g, month)
      .replace(/yyyy/g, year);
  };

  const formatDateTimeExample = (date: Date, formatStr: string): string => {
    if (!localSettings) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const hours12 = (date.getHours() % 12 || 12).toString().padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    return formatStr
      .replace(/dd/g, day)
      .replace(/MM/g, month)
      .replace(/yyyy/g, year)
      .replace(/HH/g, hours)
      .replace(/hh/g, hours12)
      .replace(/mm/g, minutes)
      .replace(/ss/g, seconds)
      .replace(/a/g, ampm);
  };

  const formatAmountExample = (value: number): string => {
    if (!localSettings) return value.toString();
    // Use costDecimalPlaces specifically for amounts
    const decimals = localSettings.costDecimalPlaces;
    if (localSettings.useCommaSeparator) {
      return value.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    } else {
      return value.toFixed(decimals);
    }
  };

  const formatQuantityExample = (value: number): string => {
    if (!localSettings) return value.toString();
    
    // FIX: Use quantityDecimalPlaces instead of costDecimalPlaces
    const decimals = localSettings.quantityDecimalPlaces; // This was the main issue
    
    if (localSettings.useCommaSeparator) {
      return value.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    } else {
      return value.toFixed(decimals);
    }
  };

  // Generic API fetch helper with proper token handling
  const apiFetch = async (url: string, options: RequestInit = {}): Promise<any> => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      setSessionExpired(true);
      throw new Error('No authentication token found. Please log in again.');
    }
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };
    if (!(options.body instanceof FormData) && !options.headers?.['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    const response = await fetch(url, {
      ...options,
      headers,
    });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        setSessionExpired(true);
        throw new Error('Session expired or invalid. Please login again.');
      }
    
      const errorText = await response.text();
      throw new Error(`Server error occurred. Please try again. (Status: ${response.status}) ${errorText}`);
    }
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error('Invalid response from server. Please try again.');
    }
    if (!data.success) {
      if (data.message?.includes('Session expired')) {
        setSessionExpired(true);
      }
      throw new Error(data.message || 'API request failed.');
    }
    return data;
  };

  // Session Expired Modal
  const SessionExpiredModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Session Expired</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Your session has expired. Please login again to continue.
        </p>
        <button
          onClick={() => {
            sessionStorage.removeItem('token');
            navigate('/');
          }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Go to Login
        </button>
      </div>
    </div>
  );

  // General Status Modal
  const GeneralStatusModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
        <div className="flex justify-center mb-4">
          {generalModal.type === 'success' ? (
            <CheckCircle className="h-12 w-12 text-green-500" />
          ) : (
            <AlertCircle className="h-12 w-12 text-red-500" />
          )}
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {generalModal.type === 'success' ? 'Success!' : 'Error!'}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{generalModal.message}</p>
        <button
          onClick={() => setGeneralModal({ isOpen: false, type: 'success', message: '' })}
          className={`px-4 py-2 text-white rounded-lg hover:opacity-90 transition ${
            generalModal.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          OK
        </button>
      </div>
    </div>
  );

  // Fetch common admin settings
  const fetchCommonAdmin = async (): Promise<ProjectSettings | null> => {
    try {
      const result: CommonAdminResponse = await apiFetch(
        'https://kelvinmms.com:8443/api-gateway-mms/master-service/userController/viewCommonAdmin/1',
        {
          method: 'GET'
        }
      );

      if (result.data) {
        const data = result.data;
        const settings: ProjectSettings = {
          dateFormat: data.dateFormat || 'dd-MM-yyyy',
          dateTimeFormat: data.dateTimeFormat || 'dd-MM-yyyy HH:mm:ss',
          timeFormat: 'HH:mm:ss',
          decimalPlaces: data.costDecimal || 2,
          // FIX: Map costDecimal to costDecimalPlaces
          costDecimalPlaces: data.costDecimal || 2,
          // FIX: Map qtyDecimal to quantityDecimalPlaces  
          quantityDecimalPlaces: data.qtyDecimal || 2,
          currency: data.currency || 'INR',
          currencyFk: credentials?.currencyFk || 22,
          useCommaSeparator: data.numberFormat === 'US',
          screenLogo: data.screenLogo || undefined,
          reportLogo: data.reportLogo || undefined,
          screenLogoFile: null,
          reportLogoFile: null,
          recipeModify: data.recipeModify || 0,
        };
        
        console.log('Fetched decimals - Cost:', settings.costDecimalPlaces, 'Quantity:', settings.quantityDecimalPlaces);
        console.log('Fetched recipeModify:', settings.recipeModify);
        return settings;
      } else {
        throw new Error('No settings data received from server');
      }
    } catch (error: any) {
      console.error('Error fetching common admin settings:', error);
      setGeneralModal({ isOpen: true, type: 'error', message: error.message || 'Failed to load settings' });
      return null;
    }
  };

  // Initialize settings
  useEffect(() => {
    const initSettings = async () => {
      setIsLoadingSettings(true);
      try {
        const settings = await fetchCommonAdmin();
        if (settings) {
          setLocalSettings(settings);
          setOriginalSettings(settings);
          updateProjectSettings(settings);
        } else {
          setGeneralModal({ isOpen: true, type: 'error', message: 'Failed to initialize settings' });
        }
      } catch (error: any) {
        console.error('Initialization error:', error);
        setGeneralModal({ isOpen: true, type: 'error', message: error.message || 'Initialization failed' });
      } finally {
        setIsLoadingSettings(false);
      }
    };
    initSettings();
  }, [credentials]);

  // Validation
  const validateSettings = (): boolean => {
    if (!localSettings) return false;
  
    const errors: Partial<ProjectSettings> = {};
  
    if (!localSettings.dateFormat) {
      errors.dateFormat = 'Date format is required';
    }
  
    if (!localSettings.dateTimeFormat) {
      errors.dateTimeFormat = 'Date time format is required';
    }
  
    if (!localSettings.currency) {
      errors.currency = 'Currency is required';
    }
  
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Create empty blob for FormData
  const createEmptyBlob = (): Blob => {
    return new Blob([], { type: 'application/octet-stream' });
  };

  // Save settings
  const handleSaveSettings = async () => {
    if (!localSettings || !validateSettings()) return;

    setIsSaving(true);
    try {
      const saveData = {
        pk: 1,
        currency: localSettings.currency,
        dateFormat: localSettings.dateFormat,
        dateTimeFormat: localSettings.dateTimeFormat,
        // FIX: Ensure both decimals are saved separately
        qtyDecimal: localSettings.quantityDecimalPlaces,  // Quantity decimals
        costDecimal: localSettings.costDecimalPlaces,     // Cost decimals
        numberFormat: localSettings.useCommaSeparator ? 'US' : 'EU',
        recipeModify: localSettings.recipeModify || 0,    // Recipe modify toggle value
        lastActBy: credentials?.userId || 0
      };
      
      console.log('Saving decimals - Cost:', saveData.costDecimal, 'Quantity:', saveData.qtyDecimal);
      console.log('Saving recipeModify:', saveData.recipeModify);
      
      // Console the request values
      console.log('Save request JSON data:', JSON.stringify(saveData, null, 2));
      
      const formData = new FormData();
      const jsonBlob = new Blob([JSON.stringify(saveData)], { type: 'application/json' });
      formData.append('data', jsonBlob, 'data.json');
      
      // FIXED: Proper logo handling to prevent NullPointerException
      // Always append both logo fields, but use empty blobs when no new file is uploaded
      // This ensures the backend always receives file fields and doesn't get null

      // Handle screenlogo field
      if (localSettings.screenLogoFile instanceof File) {
        formData.append('screenlogo', localSettings.screenLogoFile);
        console.log('Appending new screen logo file:', localSettings.screenLogoFile.name);
      } else {
        // Append empty blob to prevent null on backend
        formData.append('screenlogo', createEmptyBlob(), 'empty.txt');
        console.log('Appending empty blob for screenlogo (keeping existing logo)');
      }

      // Handle reportLogo field
      if (localSettings.reportLogoFile instanceof File) {
        formData.append('reportLogo', localSettings.reportLogoFile);
        console.log('Appending new report logo file:', localSettings.reportLogoFile.name);
      } else {
        // Append empty blob to prevent null on backend
        formData.append('reportLogo', createEmptyBlob(), 'empty.txt');
        console.log('Appending empty blob for reportLogo (keeping existing logo)');
      }
      
      // Console FormData entries for debugging
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(key, '-> File:', value.name, value.size, value.type);
        } else {
          console.log(key, '->', value);
        }
      }
      
      const result = await apiFetch(
        'https://kelvinmms.com:8443/api-gateway-mms/master-service/userController/saveCommonAdmin',
        {
          method: 'POST',
          body: formData
        }
      );
      
      console.log('API Response:', result);
      
      // Refetch to update with new data
      const updatedSettings = await fetchCommonAdmin();
      if (updatedSettings) {
        const clearedFiles = {
          ...updatedSettings,
          screenLogoFile: null,   // Critical: clear pending file
          reportLogoFile: null,   // Critical: clear pending file
        };
        setLocalSettings(clearedFiles);
        setOriginalSettings(clearedFiles);
        await saveProjectSettings(clearedFiles);
        // Update image version to bust cache for new images
        setImageVersion(prev => prev + 1);
        setGeneralModal({ isOpen: true, type: 'success', message: 'Settings saved successfully!' });
      } else {
        throw new Error('Failed to refresh settings after save');
      }
    } catch (error: any) {
      console.error('Error saving settings:', error);
      setGeneralModal({ isOpen: true, type: 'error', message: error.message || 'Failed to save settings' });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to original settings
  const handleResetSettings = () => {
    if (originalSettings) {
      const resetWithClearedFiles = { ...originalSettings, screenLogoFile: null, reportLogoFile: null };
      setLocalSettings(resetWithClearedFiles);
      updateProjectSettings(originalSettings);
      setValidationErrors({});
      setGeneralModal({ isOpen: true, type: 'success', message: 'Settings reset to original values.' });
    }
  };

  // File change handlers
  const handleScreenLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (localSettings && e.target.files?.[0]) {
      setLocalSettings({ ...localSettings, screenLogoFile: e.target.files[0] });
    }
  };

  const handleReportLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (localSettings && e.target.files?.[0]) {
      setLocalSettings({ ...localSettings, reportLogoFile: e.target.files[0] });
    }
  };

  // Recipe Modify toggle handler
  const handleRecipeModifyChange = (checked: boolean) => {
    if (localSettings) {
      const value = checked ? 1 : 0;
      const updatedSettings = { ...localSettings, recipeModify: value };
      setLocalSettings(updatedSettings);
      updateProjectSettings({ recipeModify: value });
    }
  };

  // Change handlers - Update both local and global for immediate effect
  const handleDateFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (localSettings) {
      const value = e.target.value;
      setLocalSettings({ ...localSettings, dateFormat: value });
      updateProjectSettings({ dateFormat: value });
    }
  };

  const handleDateTimeFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (localSettings) {
      const value = e.target.value;
      setLocalSettings({ ...localSettings, dateTimeFormat: value });
      updateProjectSettings({ dateTimeFormat: value });
    }
  };

  const handleCostDecimalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (localSettings) {
      const value = parseInt(e.target.value);
      // Only update costDecimalPlaces, don't touch quantityDecimalPlaces
      const updatedSettings = { 
        ...localSettings, 
        costDecimalPlaces: value,
        // Keep decimalPlaces for backward compatibility if needed
        decimalPlaces: value 
      };
      setLocalSettings(updatedSettings);
      updateProjectSettings({ 
        costDecimalPlaces: value,
        decimalPlaces: value 
      });
    }
  };

  const handleQuantityDecimalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (localSettings) {
      const value = parseInt(e.target.value);
      // Only update quantityDecimalPlaces, don't touch costDecimalPlaces
      const updatedSettings = { ...localSettings, quantityDecimalPlaces: value };
      setLocalSettings(updatedSettings);
      updateProjectSettings({ quantityDecimalPlaces: value });
    }
  };

  const handleCommaSeparatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (localSettings) {
      const value = e.target.value === 'true';
      setLocalSettings({ ...localSettings, useCommaSeparator: value });
      updateProjectSettings({ useCommaSeparator: value });
    }
  };

  const handleCurrencyChange = (selectedCurrencyCode: string) => {
    if (localSettings) {
      const updatedSettings = {
        ...localSettings,
        currency: selectedCurrencyCode,
      };
      setLocalSettings(updatedSettings);
      updateProjectSettings({
        currency: selectedCurrencyCode,
      });
    }
  };

  if (isLoadingSettings || !localSettings) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
        <div className="text-center">Loading settings...</div>
      </div>
    );
  }

  const now = new Date();

  return (
    <>
      {sessionExpired && <SessionExpiredModal />}
      {generalModal.isOpen && <GeneralStatusModal />}
      <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Project Settings Configuration
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Configure common settings that will be applied across your entire project.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date Format Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Date Format</h2>
            </div>
          
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Date Format <span className="text-red-500">*</span>
              </label>
              <select
                value={localSettings.dateFormat}
                onChange={handleDateFormatChange}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                  validationErrors.dateFormat ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {dateFormatOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {validationErrors.dateFormat && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.dateFormat}</p>
              )}
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Preview: {formatDateExample(now, localSettings.dateFormat)}
              </div>
            </div>
          </div>
          {/* Date Time Format Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Date Time Format</h2>
            </div>
          
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Date Time Format <span className="text-red-500">*</span>
              </label>
              <select
                value={localSettings.dateTimeFormat}
                onChange={handleDateTimeFormatChange}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                  validationErrors.dateTimeFormat ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {dateTimeFormatOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {validationErrors.dateTimeFormat && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.dateTimeFormat}</p>
              )}
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Preview: {formatDateTimeExample(now, localSettings.dateTimeFormat)}
              </div>
            </div>
          </div>
          {/* Quantity Decimal Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Hash className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Quantity Decimal</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quantity Decimal Places
              </label>
              <select
                value={localSettings.quantityDecimalPlaces}
                onChange={handleQuantityDecimalChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                {decimalOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Preview: {formatQuantityExample(45.6789)}
              </p>
            </div>
          </div>

          {/* Cost Decimal Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Hash className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Cost Decimal</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cost Decimal Places
              </label>
              <select
                value={localSettings.costDecimalPlaces}
                onChange={handleCostDecimalChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                {decimalOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Preview: {formatAmountExample(45.6789)}
              </p>
            </div>
          </div>

          {/* Recipe Modify Toggle Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <ToggleRight className="w-5 h-5 text-green-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recipe Modify</h2>
            </div>

            <div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.recipeModify === 1}
                  onChange={(e) => handleRecipeModifyChange(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                  Enable Recipe Modification
                </span>
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Toggle to allow recipe modifications in the system.
              </p>
            </div>
          </div>

          {/* Screen Logo Upload */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Image className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Screen Logo</h2>
            </div>
          
            <div className="space-y-2">
              {localSettings.screenLogo && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Logo</label>
                  <img 
                    src={`${localSettings.screenLogo}?v=${imageVersion}`} 
                    alt="Current Screen Logo" 
                    className="w-32 h-32 object-cover rounded border" 
                  />
                </div>
              )}
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload New Screen Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleScreenLogoChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              {localSettings.screenLogoFile && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Preview:</p>
                  <img src={URL.createObjectURL(localSettings.screenLogoFile)} alt="Preview Screen Logo" className="w-32 h-32 object-cover rounded border mt-1" />
                </div>
              )}
            </div>
          </div>
          {/* Report Logo Upload */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Image className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Report Logo</h2>
            </div>
          
            <div className="space-y-2">
              {localSettings.reportLogo && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Logo</label>
                  <img 
                    src={`${localSettings.reportLogo}?v=${imageVersion}`} 
                    alt="Current Report Logo" 
                    className="w-32 h-32 object-cover rounded border" 
                  />
                </div>
              )}
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload New Report Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleReportLogoChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              {localSettings.reportLogoFile && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Preview:</p>
                  <img src={URL.createObjectURL(localSettings.reportLogoFile)} alt="Preview Report Logo" className="w-32 h-32 object-cover rounded border mt-1" />
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Settings Preview */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Current Settings Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Date Format:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {formatDateExample(now, localSettings.dateFormat)}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Date Time Format:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {formatDateTimeExample(now, localSettings.dateTimeFormat)}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Time Format:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {formatDateTimeExample(now, localSettings.timeFormat)}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Currency:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">{localSettings.currency}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Cost Format:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {formatAmountExample(123.456789)}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Quantity Format:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {formatQuantityExample(45.6789)}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">General Decimals:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {localSettings.decimalPlaces} places
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Comma Separator:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {localSettings.useCommaSeparator ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Recipe Modify:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {localSettings.recipeModify === 1 ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
        {/* Save and Reset Buttons */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={handleResetSettings}
            className="px-6 py-2 rounded-lg font-medium transition-colors bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 flex items-center gap-2"
            disabled={isSaving}
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              isSaving
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </>
  );
};

export default ProjectSettingsConfiguration;