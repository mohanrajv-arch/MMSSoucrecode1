// utils/screenCapture.ts
import axios from 'axios';

// Add a flag to prevent multiple simultaneous requests
let isRequestInProgress = false;

export const logScreenCapture = async (screenUrl: string, timeSpentInSeconds: number) => {
  // Skip if another request is already in progress
  if (isRequestInProgress) {
    console.warn('Screen capture request already in progress');
    return;
  }

  try {
    isRequestInProgress = true;

    // Get token from sessionStorage
    const token = sessionStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    // Validate user data exists
    if (!window.userData) {
      throw new Error('User data not available');
    }

    const userData = window.userData;

    // Validate required fields
    if (typeof timeSpentInSeconds !== 'number' || timeSpentInSeconds <= 0) {
      throw new Error('Invalid timeSpentInSeconds');
    }

    // Prepare payload with data from AuthLogin
    const now = new Date();
    const login = new Date(now.getTime() - timeSpentInSeconds * 1000).toISOString();
    const logout = now.toISOString();

    const payload = {
      auditPk: userData.resultPK || null,
      userFk: userData.userId || null,
      login: login,
      logout: logout,
      screenUrl: screenUrl,
      totalSpendTime: timeSpentInSeconds * 1000, // Convert seconds to milliseconds
    };

    console.log('Request payload:', payload);

    // Make the API call with timeout and capture response
    const response = await axios.post(
      'http://43.254.31.234:9070/api-gateway-mms/master-service/userController/screenCapture',
      payload,
      { 
        timeout: 5000, // 5 second timeout
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      },
    );

    // Log the response data
    console.log('API Response:', response.data);
    console.log('Screen capture logged successfully');
  } catch (error) {
    console.error('Error logging screen capture:', error);
    // If the error has a response, log that too
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Session expired. Please log in again.');
      }
      console.error('Error response data:', error.response?.data);
    }
    // Consider adding error reporting or retry logic here
  } finally {
    isRequestInProgress = false;
  }
};