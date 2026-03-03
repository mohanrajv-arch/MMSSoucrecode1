// Updated AuthContext.tsx
import { createContext, useContext, ReactNode, useState } from 'react';
import SessionModal from 'src/components/Login/SessionModal';

interface LoginCredentials {
  entityId: number;
  businessFk: number;
  userId: number;
  sessionId?: string;
  userType?: number;
  auditPk?: number;
  emailId?: string;
  firstName?: string;
  lastName?: string;
  costDecimal?: number;
  qtyDecimal?: number;
  currencyFk?: number;
  countryFk?: number;
  imageLogo?: string;
  dateFormat?: string;
  dateTimeFormat?: string;
  recipeModify?: number;  
}

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
  recipeModify?: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  credentials: LoginCredentials | null;
  projectSettings: ProjectSettings | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateProjectSettings: (settings: Partial<ProjectSettings>) => void;
  saveProjectSettings: (settings: ProjectSettings) => Promise<void>;
  verifyToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('isAuthenticated') === 'true';
  });

  const [credentials, setCredentials] = useState<LoginCredentials | null>(() => {
    const storedCredentials = sessionStorage.getItem('userCredentials');
    if (storedCredentials) {
      return JSON.parse(storedCredentials);
    }
    return null;
  });

  const [projectSettings, setProjectSettings] = useState<ProjectSettings | null>(() => {
    const storedSettings = sessionStorage.getItem('projectSettings');
    if (storedSettings) {
      return JSON.parse(storedSettings);
    }
    return null;
  });

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const getSystemInfo = () => {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;

    let browser = 'Unknown';
    let browserVersion = '';

    if (userAgent.includes('Chrome')) {
      const chromeMatch = userAgent.match(/Chrome\/(\d+\.\d+)/);
      browser = 'Chrome';
      browserVersion = chromeMatch ? chromeMatch[1] : '';
    } else if (userAgent.includes('Firefox')) {
      const firefoxMatch = userAgent.match(/Firefox\/(\d+\.\d+)/);
      browser = 'Firefox';
      browserVersion = firefoxMatch ? firefoxMatch[1] : '';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      const safariMatch = userAgent.match(/Version\/(\d+\.\d+)/);
      browser = 'Safari';
      browserVersion = safariMatch ? safariMatch[1] : '';
    } else if (userAgent.includes('Edg')) {
      const edgeMatch = userAgent.match(/Edg\/(\d+\.\d+)/);
      browser = 'Edge';
      browserVersion = edgeMatch ? edgeMatch[1] : '';
    } else if (userAgent.includes('OPR') || userAgent.includes('Opera')) {
      const operaMatch = userAgent.match(/(OPR|Opera)\/(\d+\.\d+)/);
      browser = 'Opera';
      browserVersion = operaMatch ? operaMatch[2] : '';
    } else if (userAgent.includes('Trident') || userAgent.includes('MSIE')) {
      browser = 'Internet Explorer';
      browserVersion = '11.0';
    }

    let os = 'Unknown';
    if (platform.includes('Win')) {
      os = 'Windows';
      if (userAgent.includes('Windows NT 10.0')) os = 'Windows 10';
      else if (userAgent.includes('Windows NT 6.3')) os = 'Windows 8.1';
      else if (userAgent.includes('Windows NT 6.2')) os = 'Windows 8';
      else if (userAgent.includes('Windows NT 6.1')) os = 'Windows 7';
    } else if (platform.includes('Mac')) {
      os = 'macOS';
    } else if (platform.includes('Linux')) {
      os = 'Linux';
    }

    return {
      browser: browserVersion ? `${browser} ${browserVersion}` : browser,
      os: os,
    };
  };

  const getIpAddress = async () => {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      return data.ip;
    } catch (error) {
      return 'unknown';
    }
  };

  const login = async (username: string, password: string) => {
    const systemInfo = getSystemInfo();
    const ipAddress = await getIpAddress();

    const requestBody = {
      email: username,
      password,
      ipAddress,
      browserDetails: systemInfo.browser,
      osDetails: systemInfo.os,
    };

    const response = await fetch('https://kelvinmms.com:8443/login-service-mms/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Login failed');
    }

    const data = result.data;
    sessionStorage.setItem('token', data.token);

    const sessionData = {
      entityId: data.appPreference.aP_AEN_ENTITY_FK,
      businessFk: 1, // Default value, adjust if available in response
      userId: data.userId,
      sessionId: data.token,
      emailId: data.emailId,
      userType: data.userType,
      auditPk: data.auditPk,
      firstName: data.firstName,
      lastName: data.lastName,
      costDecimal: data.appPreference.dECIMAL_TO_VALUE,
      qtyDecimal: data.appPreference.dECIMAL_TO_QTY,
      currencyFk: 22, // Default value, adjust if mapping available
      countryFk: 199, // Default value, adjust if available
      dateFormat: data.appPreference.aP_DATE_FORMAT.replace(/-/g, '/').replace(/mm(?=\/)/g, 'MM'),
      dateTimeFormat: data.appPreference.aP_DATE_TIME_FORMAT.replace(/-/g, '/').replace(/mm(?=\/)/g, 'MM'),
      recipeModify: data.appPreference.recipeModify,  // Add this

    };

    const loginCredentials: LoginCredentials = {
      entityId: sessionData.entityId,
      businessFk: sessionData.businessFk,
      userId: sessionData.userId,
      sessionId: sessionData.sessionId,
      emailId: sessionData.emailId,
      firstName: sessionData.firstName,
      lastName: sessionData.lastName,
      userType: sessionData.userType,
      auditPk: sessionData.auditPk,
      costDecimal: sessionData.costDecimal,
      qtyDecimal: sessionData.qtyDecimal,
      currencyFk: sessionData.currencyFk,
      countryFk: sessionData.countryFk,
      dateFormat: sessionData.dateFormat,
      dateTimeFormat: sessionData.dateTimeFormat,
      recipeModify: sessionData.recipeModify,  // Add this
    };

    setCredentials(loginCredentials);
    sessionStorage.setItem('userCredentials', JSON.stringify(loginCredentials));

    const newProjectSettings: ProjectSettings = {
      dateFormat: sessionData.dateFormat || 'dd/MM/yyyy',
      dateTimeFormat: sessionData.dateTimeFormat || 'dd/MM/yyyy HH:mm:ss',
      timeFormat: 'HH:mm:ss',
      decimalPlaces: 2,
      costDecimalPlaces: sessionData.costDecimal || 2,
      quantityDecimalPlaces: sessionData.qtyDecimal || 2,
      currency: data.appPreference.aP_CURRENCY,
      currencyFk: sessionData.currencyFk || 22,
      currencySymbol: '',
      useCommaSeparator: data.appPreference.nUMBER_FORMAT === 'US',
      recipeModify: sessionData.recipeModify,  // Add this

    };

    setProjectSettings(newProjectSettings);
    sessionStorage.setItem('projectSettings', JSON.stringify(newProjectSettings));

    sessionStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);

    console.log('Authenticated:', true);
    console.log('Credentials:', loginCredentials);
    console.log('Project Settings:', newProjectSettings);
  };

  const verifyToken = async () => {
    const token = sessionStorage.getItem('token');
    return !!token;
  };

  const logout = () => {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('userCredentials');
    sessionStorage.removeItem('projectSettings');
    sessionStorage.removeItem('token');
    setIsAuthenticated(false);
    setCredentials(null);
    setProjectSettings(null);
    if (window.userData) {
      delete window.userData;
    }
  };

  const updateProjectSettings = (settings: Partial<ProjectSettings>) => {
    if (projectSettings) {
      const updatedSettings = { ...projectSettings, ...settings } as ProjectSettings;
      setProjectSettings(updatedSettings);
      sessionStorage.setItem('projectSettings', JSON.stringify(updatedSettings));
    }
  };

  const saveProjectSettings = async (settings: ProjectSettings) => {
    try {
      setProjectSettings(settings);
      sessionStorage.setItem('projectSettings', JSON.stringify(settings));
      
      if (credentials) {
        const updatedCredentials = {
          ...credentials,
          costDecimal: settings.costDecimalPlaces,
          qtyDecimal: settings.quantityDecimalPlaces,
          currencyFk: settings.currencyFk,
          dateFormat: settings.dateFormat,
          dateTimeFormat: settings.dateTimeFormat,
        };
        setCredentials(updatedCredentials);
        sessionStorage.setItem('userCredentials', JSON.stringify(updatedCredentials));
      }
    } catch (error) {
      console.error('Error saving project settings:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      credentials, 
      projectSettings,
      login, 
      logout, 
      updateProjectSettings,
      saveProjectSettings,
      verifyToken
    }}>
      {children}
      {showLogoutModal && <SessionModal />}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useCredentials = (): LoginCredentials => {
  const { credentials } = useAuth();

  if (!credentials) {
    return {
      entityId: 8,
      businessFk: 1,
      userId: 659,
    };
  }

  return credentials;
};

// Updated formatting functions with proper separation
export const useFormatDate = () => {
  const { projectSettings } = useAuth();
  
  return (date: string | Date | null, customFormat?: string) => {
    if (!date) return '';
    
    const format = customFormat || projectSettings?.dateFormat || 'dd/MM/yyyy';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear().toString();
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const seconds = dateObj.getSeconds().toString().padStart(2, '0');
    const hours12 = (dateObj.getHours() % 12 || 12).toString().padStart(2, '0');
    const ampm = dateObj.getHours() >= 12 ? 'PM' : 'AM';
    
    return format
      .replace(/dd/g, day)
      .replace(/MM/g, month)  // MM for month
      .replace(/yyyy/g, year)
      .replace(/HH/g, hours)
      .replace(/hh/g, hours12)
      .replace(/mm/g, minutes)  // mm for minutes
      .replace(/ss/g, seconds)
      .replace(/a/g, ampm);
  };
};

export const useFormatDateTime = () => {
  const { projectSettings } = useAuth();
  
  return (date: string | Date | null, customFormat?: string) => {
    if (!date) return '';
    
    const format = customFormat || projectSettings?.dateTimeFormat || 'dd/MM/yyyy HH:mm:ss';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear().toString();
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const seconds = dateObj.getSeconds().toString().padStart(2, '0');
    const hours12 = (dateObj.getHours() % 12 || 12).toString().padStart(2, '0');
    const ampm = dateObj.getHours() >= 12 ? 'PM' : 'AM';
    
    return format
      .replace(/dd/g, day)
      .replace(/MM/g, month)  // MM for month
      .replace(/yyyy/g, year)
      .replace(/HH/g, hours)
      .replace(/hh/g, hours12)
      .replace(/mm/g, minutes)  // mm for minutes
      .replace(/ss/g, seconds)
      .replace(/a/g, ampm);
  };
};

export const useFormatAmount = () => {
  const { projectSettings } = useAuth();
  
  return (amount: number | string, customDecimals?: number, useComma?: boolean) => {
    // Use costDecimalPlaces specifically for amounts
    const decimals = customDecimals ?? projectSettings?.costDecimalPlaces ?? 2;
    const shouldUseComma = useComma ?? projectSettings?.useCommaSeparator ?? true;
    const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount;
    
    if (isNaN(numAmount)) return '0.00';
    
    if (shouldUseComma) {
      return numAmount.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    } else {
      return numAmount.toFixed(decimals);
    }
  };
};

export const useFormatQuantity = () => {
  const { projectSettings } = useAuth();
  
  return (quantity: number | string, customDecimals?: number, useComma?: boolean) => {
    // Use quantityDecimalPlaces specifically for quantities
    const decimals = customDecimals ?? projectSettings?.quantityDecimalPlaces ?? 2;
    const shouldUseComma = useComma ?? projectSettings?.useCommaSeparator ?? true;
    const numQuantity = typeof quantity === 'string' ? parseFloat(quantity.replace(/,/g, '')) : quantity;
    
    if (isNaN(numQuantity)) return '0.00';
    
    if (shouldUseComma) {
      return numQuantity.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    } else {
      return numQuantity.toFixed(decimals);
    }
  };
};