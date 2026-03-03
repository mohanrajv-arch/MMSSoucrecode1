// context/ScreenTimeContext.js
import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const ScreenTimeContext = createContext();

export const useScreenTime = () => {
  const context = useContext(ScreenTimeContext);
  if (!context) {
    throw new Error('useScreenTime must be used within a ScreenTimeProvider');
  }
  return context;
};

export const ScreenTimeProvider = ({ children }) => {
  const location = useLocation();
  const currentScreenRef = useRef(null);
  const startTimeRef = useRef(null);
  const isTrackingRef = useRef(false);
  const sessionDataRef = useRef(new Map());

  // API endpoint - make sure this is correct and accessible
  const API_ENDPOINT = 'http://103.73.191.2:8080/masters-service/masterController/screenCapture';

  // Get user data from window.userData
  const getUserData = useCallback(() => {
    if (!window.userData) {
      console.error('window.userData is not defined');
      return null;
    }

    console.log('Available userData:', window.userData);

    // Try all possible variations
    const auditFk =
      window.userData.resultPK ||
      window.userData.resultPK ||
      window.userData.sessionData?.resultPK ||
      window.userData.userDetails?.resultPK ||
      window.userData.userId; // Fallback to userId if nothing else works

    if (!auditFk) {
      console.error('Could not find auditFk in:', window.userData);
      return null;
    }

    return {
      userFk: window.userData.userId,
      auditFk: auditFk,
    };
  }, []);
  // Format time to ISO string without milliseconds
  const formatTime = useCallback((date) => {
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }, []);

  // Calculate total spend time in minutes
  const calculateTotalSpendTime = useCallback((startTime, endTime) => {
    const diffInMs = endTime - startTime;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    return Math.max(diffInMinutes, 1); // Minimum 1 minute
  }, []);

  // Prepare screen data object

  const prepareScreenData = useCallback(
    (startTime, endTime, screenUrl) => {
      const userData = getUserData();
      if (!userData?.auditFk) {
        console.error('auditFk is missing - cannot track screen time');
        return null;
      }
      return {
        inTime: formatTime(startTime),
        outTime: formatTime(endTime),
        screenUrl: screenUrl,
        totalSpendTime: calculateTotalSpendTime(startTime, endTime),
        userFk: userData?.userFk || null,
        auditFk: userData?.auditFk || null,
      };
    },
    [formatTime, calculateTotalSpendTime, getUserData],
  );

  // Send screen time data to API with retry logic
  const sendScreenTimeData = useCallback(async (screenData) => {
    // Validate required fields
    if (!screenData.userFk || !screenData.auditFk) {
      console.warn('User data not available for screen time tracking');
      return { success: false, error: 'Missing user data' };
    }

    console.log('Attempting to send screen time data:', screenData);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(screenData),
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('Screen time data sent successfully:', result);
      return { success: true, data: result };
    } catch (error) {
      console.error('Error sending screen time data:', error);

      // Store failed request for later retry
      sessionDataRef.current.set(screenData.screenUrl, {
        ...screenData,
        retryCount: (sessionDataRef.current.get(screenData.screenUrl)?.retryCount || 0) + 1,
        lastError: error.message,
      });

      return { success: false, error: error.message };
    }
  }, []);

  // Track screen exit
  const trackScreenExit = useCallback(
    async (newScreenUrl = null) => {
      if (currentScreenRef.current && startTimeRef.current) {
        const endTime = new Date();
        const screenData = prepareScreenData(
          startTimeRef.current,
          endTime,
          currentScreenRef.current,
        );

        // Store session data
        sessionDataRef.current.set(currentScreenRef.current, screenData);

        // Immediately attempt to send data
        const result = await sendScreenTimeData(screenData);

        console.log(`Screen exit tracking for ${currentScreenRef.current}`, result);

        return { ...screenData, ...result };
      }
      return null;
    },
    [prepareScreenData, sendScreenTimeData],
  );

  // Track screen entry
  const trackScreenEntry = useCallback(
    (screenUrl) => {
      startTimeRef.current = new Date();
      currentScreenRef.current = screenUrl;
      isTrackingRef.current = true;

      console.log('Screen entry tracked:', {
        screen: screenUrl,
        startTime: formatTime(startTimeRef.current),
      });

      return {
        screenUrl,
        entryTime: startTimeRef.current,
      };
    },
    [formatTime],
  );

  // Handle route changes - MAIN SCREEN TRANSITION TRIGGER
  useEffect(() => {
    const currentPath = location.pathname;

    if (currentScreenRef.current !== currentPath) {
      console.log(
        `Screen transition detected: ${currentScreenRef.current || 'none'} -> ${currentPath}`,
      );

      const handleTransition = async () => {
        // Track exit from previous screen if tracking is active
        if (isTrackingRef.current && currentScreenRef.current) {
          console.log(`Tracking exit from ${currentScreenRef.current}`);
          await trackScreenExit(currentPath);
        }

        // Track entry to new screen
        console.log(`Tracking entry to ${currentPath}`);
        trackScreenEntry(currentPath);
      };

      handleTransition();
    }
  }, [location.pathname, trackScreenEntry, trackScreenExit]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (isTrackingRef.current) {
          console.log('Page hidden - tracking screen exit');
          trackScreenExit();
          isTrackingRef.current = false;
        }
      } else {
        if (currentScreenRef.current) {
          console.log('Page visible again - tracking screen entry');
          trackScreenEntry(currentScreenRef.current);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [trackScreenEntry, trackScreenExit]);

  // Handle page unload
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (isTrackingRef.current) {
        console.log('Page unloading - tracking final screen exit');
        const screenData = prepareScreenData(
          startTimeRef.current,
          new Date(),
          currentScreenRef.current,
        );

        // Try to send via fetch with keepalive flag first
        try {
          const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(screenData),
            keepalive: true, // This ensures the request completes during page unload
          });

          console.log('Unload request status:', response.status);
        } catch (error) {
          console.error('Unload request failed, falling back to sendBeacon:', error);

          // Fallback to sendBeacon
          const userData = getUserData();
          if (userData) {
            const data = new Blob([JSON.stringify(screenData)], { type: 'application/json' });
            navigator.sendBeacon(API_ENDPOINT, data);
          }
        }

        await trackScreenExit();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [trackScreenExit, prepareScreenData, getUserData]);

  // ... rest of the code remains the same ...

  const value = {
    currentScreen: currentScreenRef.current,
    isTracking: isTrackingRef.current,
    trackScreenExit,
    trackScreenEntry,
    getSessionData: () => Array.from(sessionDataRef.current.values()),
    sendBatchData: async () => {
      const results = [];
      for (const data of sessionDataRef.current.values()) {
        const result = await sendScreenTimeData(data);
        results.push(result);
      }
      return results;
    },
    clearSessionData: () => sessionDataRef.current.clear(),
    getCurrentTrackingStatus: () => ({
      currentScreen: currentScreenRef.current,
      startTime: startTimeRef.current,
      isTracking: isTrackingRef.current,
    }),
    sessionDataCount: sessionDataRef.current.size,
  };

  return <ScreenTimeContext.Provider value={value}>{children}</ScreenTimeContext.Provider>;
};
