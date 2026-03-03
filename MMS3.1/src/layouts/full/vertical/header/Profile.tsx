import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { Button, Dropdown, DropdownItem } from 'flowbite-react';
import * as profileData from './Data';
// @ts-ignore
import SimpleBar from 'simplebar-react';
import user1 from '/src/assets//images/profile/userIcon1.png';
import { Link, useNavigate } from 'react-router-dom';
import { useCredentials } from 'src/context/AuthContext';
const Profile = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const credentials = useCredentials();
  // Function to get user data from window.userData or localStorage fallback
  const getUserData = () => {
    // Try to get from window.userData first
    if (window.userData) {
      return window.userData;
    }
    // Fallback to localStorage
    const storedSession = localStorage.getItem('userSession');
    if (storedSession) {
      try {
        return JSON.parse(storedSession);
      } catch (error) {
        console.error('Error parsing stored session:', error);
        return null;
      }
    }
    return null;
  };
  // Function to fetch user details by email if not already available
  const fetchUserDetailsByEmail = async (email) => {
    try {
      const response = await fetch(
        'http://103.73.191.2:8080/masters-service/masterController/listOfUserMaster',
      );
      const data = await response.json();
      if (data.statusCode === 1025 && data.responseContents) {
        const user = data.responseContents.find(
          (user) => user.mailId.toLowerCase() === email.toLowerCase(),
        );
        return user || null;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  };
  // Function to get current user info
  const getCurrentUserInfo = async () => {
    const userData = getUserData();
    if (!userData) {
      console.error('No user data found');
      return {
        email: credentials.emailId || 'user@example.com',
        userName: 'Unknown User',
        userType: 'User',
        userId: null,
        resultPK: null,
      };
    }
    // If userDetails are already available, use them
    if (userData.userDetails) {
      return {
        email: userData.email || credentials.emailId || 'user@example.com',
        userName: userData.userDetails.userName || userData.userName || 'Unknown User',
        userType: userData.userDetails.userTypeStr || userData.userType || 'User',
        userId: userData.userId,
        resultPK: userData.resultPK,
        firstName: userData.userDetails.firstName || userData.firstName || '',
        lastName: userData.userDetails.lastName || userData.lastName || '',
      };
    }
    // If userDetails are not available, fetch them
    if (userData.email) {
      const userDetails = await fetchUserDetailsByEmail(userData.email);
      if (userDetails) {
        // Update window.userData with the fetched details
        window.userData = {
          ...userData,
          userDetails: userDetails,
          userName: userDetails.userName,
          firstName: userDetails.firstName || '',
          lastName: userDetails.lastName || '',
          userType: userDetails.userTypeStr || 'User',
        };
        return {
          email: userData.email,
          userName: userDetails.userName || 'Unknown User',
          userType: userDetails.userTypeStr || 'User',
          userId: userData.userId,
          firstName: userDetails.firstName || '',
          lastName: userDetails.lastName || '',
        };
      }
    }
    // Return default values if everything fails, prefer context
    return {
      email: credentials.emailId || userData.email || 'user@example.com',
      userName: credentials.firstName + ' ' + credentials.lastName || userData.userName || 'Unknown User',
      userType: credentials.userType === 0 ? 'Super User' : credentials.userType === 1 ? 'Admin' : credentials.userType === 2 ? 'Location User' : (userData.userType || 'User'),
      userId: userData.userId,
      resultPK: userData.resultPK,
      firstName: credentials.firstName || userData.firstName || '',
      lastName: credentials.lastName || userData.lastName || '',
    };
  };
  const handleLogout = async () => {
    setIsLoggingOut(true);
    console.log('🔍 Logout Process Started');
    console.log('🧹 Proceeding with local cleanup...');
    // Call logout API
    const token = sessionStorage.getItem('token');
    const credentialsStr = sessionStorage.getItem('userCredentials');
    let auditPk = credentials.auditPk;
    if (!auditPk && credentialsStr) {
      try {
        const creds = JSON.parse(credentialsStr);
        auditPk = creds.auditPk;
      } catch (error) {
        console.error('Error parsing credentials:', error);
      }
    }
    let success = false;
    if (token && auditPk) {
      try {
        console.log('📡 Calling logout API...');
        const response = await fetch('https://kelvinmms.com:8443/login-service-mms/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: `Bearer ${token}`,
            auditTrailId: auditPk,
          }),
        });
        if (response.ok) {
          const result = await response.json();
          if (result.success === true && result.message === 'Logout successful') {
            success = true;
            setMessage('Logout successful');
            setShowMessage(true);
            console.log('✅ Logout API successful');
          } else {
            console.error('Logout API response not successful:', result);
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Logout API failed:', errorData);
        }
      } catch (error) {
        console.error('Logout API error:', error);
      }
    } else {
      console.warn('⚠️ Missing token or auditPk for logout API');
      success = true; // Proceed with cleanup even if API call fails
    }
    // If success, show message and redirect after 1s; else, still cleanup and redirect
    if (success) {
      setTimeout(() => {
        handleLogoutCleanup();
        setIsLoggingOut(false);
        setShowMessage(false);
      }, 1000);
    } else {
      // If not success, still cleanup and redirect immediately
      handleLogoutCleanup();
      setIsLoggingOut(false);
    }
  };
  const handleLogoutCleanup = () => {
    console.log('🧹 === STARTING SESSION CLEANUP ===');
    // Clear localStorage
    localStorage.removeItem('userSession');
    console.log('✅ User session removed from localStorage');
    // Clear sessionStorage (align with AuthContext)
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('userCredentials');
    sessionStorage.removeItem('projectSettings');
    sessionStorage.removeItem('token');
    console.log('✅ SessionStorage cleared');
    // Clear window.userData
    if (window.userData) {
      console.log('📋 Window.userData before cleanup:', window.userData);
      delete window.userData;
      console.log('✅ Window.userData cleared');
    } else {
      console.log('ℹ️ No window.userData to clear');
    }
    console.log('🧹 === SESSION CLEANUP COMPLETED ===');
    console.log('🔄 Redirecting to login page...');
    // Redirect to login page
    window.location.href = '/';
  };
  // Get current user info for display
  const [userInfo, setUserInfo] = useState({
    email: 'Loading...',
    userName: 'Loading...',
    userType: 'User',
    firstName: '',
    lastName: '',
  });
  // Load user info on component mount
  React.useEffect(() => {
    const loadUserInfo = async () => {
      const info = await getCurrentUserInfo();
      setUserInfo(info);
    };
    loadUserInfo();
  }, []);
  // Handle menu item click
 const handleMenuItemClick = (path) => {
    navigate(path);
  };
  // Custom profile data with icons and paths (updated paths, removed Change Password title to Update Password if needed, but kept as Change Password)
  const customProfileData = [
    {
      title: "Change Password",
      icon: "solar:lock-password-line-duotone",
      bgcolor: "bg-lightprimary",
      color: "text-primary",
      path: "/userMaster/ViewUserDetails"
    },
    {
      title: "User Rights",
      icon: "solar:user-id-line-duotone",
      bgcolor: "bg-lightwarning",
      color: "text-warning",
      path: "/userMaster/userRights"
    }
  ];
  // Filter based on userType (show only for 0 and 1)
  const filteredProfileData = credentials.userType < 2 ? customProfileData : [];
  return (
    <div className="relative group/menu">
      {/* Success Message Toast */}
      {showMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
          {message}
        </div>
      )}
      <Dropdown
        label=""
        className="w-screen sm:w-[360px] py-6 rounded-sm"
        dismissOnClick={false}
        renderTrigger={() => (
          <span className="h-10 w-10 hover:text-primary hover:bg-lightprimary rounded-full flex justify-center items-center cursor-pointer group-hover/menu:bg-lightprimary group-hover/menu:text-primary">
            <img src={user1} alt="logo" height="30" width="30" className="rounded-full" />
          </span>
        )}
      >
        <div className="px-6">
          <h3 className="text-lg font-semibold text-ld">User Profile</h3>
          <div className="flex items-center gap-6 pb-5 border-b dark:border-darkborder mt-5 mb-3">
            <img src={user1} alt="logo" height="80" width="80" className="rounded-full" />
            <div>
              <h5 className="card-title">{`${credentials.firstName || ''} ${credentials.lastName || ''}`.trim() || userInfo.userName}</h5>
              <span className="card-subtitle">{credentials.userType === 0 ? 'Super User' : credentials.userType === 1 ? 'Admin' : credentials.userType === 2 ? 'Location User' : userInfo.userType}</span>
              <p className="card-subtitle mb-0 mt-1 flex items-center">
                <Icon icon="solar:mailbox-line-duotone" className="text-base me-1" />
                {credentials.emailId || userInfo.email}
              </p>
            </div>
          </div>
        </div>
        <SimpleBar>
          {filteredProfileData.map((items, index) => (
            <DropdownItem
              as="div"
              onClick={() => handleMenuItemClick(items.path)}
              className="px-6 py-3 flex justify-between items-center bg-hover group/link w-full cursor-pointer"
              key={index}
            >
              <div className="flex items-center w-full">
                <div
                  className={`h-11 w-11 flex-shrink-0 rounded-md flex justify-center items-center ${items.bgcolor}`}
                >
                  <Icon icon={items.icon} height={20} className={items.color} />
                </div>
                <div className="ps-4 flex justify-between w-full">
                  <div className="w-3/4">
                    <h5 className="mb-1 text-sm group-hover/link:text-primary">{items.title}</h5>
                  </div>
                </div>
              </div>
            </DropdownItem>
          ))}
        </SimpleBar>
        <div className="pt-6 px-6">
          <Button
            color={'failure'}
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 focus:ring-red-300"
          >
            {isLoggingOut ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Logging out...
              </>
            ) : (
              'Logout'
            )}
          </Button>
        </div>
      </Dropdown>
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
export default Profile;