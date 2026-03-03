import { Input, Switch } from '@headlessui/react';
import { Button, Label, Select, Tooltip, Checkbox } from 'flowbite-react';
import { useState, useContext, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { Card } from 'src/components/shadcn-ui/Default-Ui/card';
import { CustomizerContext } from 'src/context/CustomizerContext';
import { useCredentials } from 'src/context/AuthContext';
import SearchableSelect from 'src/components/Spa Components/DropdownSearch';
import { RefreshCw, Save, Search, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';

const UserRights = ({ className }) => {
  useEffect(() => {
    document.title = 'User Rights';
  });

  const { isCardShadow, isBorderRadius, isDark } = useContext(CustomizerContext);
  const credentials = useCredentials();

  const [users, setUsers] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [locations, setLocations] = useState([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCheckedFirst, setSortCheckedFirst] = useState(false);

  const navigate = useNavigate();

  // Generic fetch helper
  const apiFetch = async (url, options = {}) => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      setSessionExpired(true);
      throw new Error('No authentication token found. Please log in again.');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        setSessionExpired(true);
        throw new Error(response.status === 401 ? 'Session expired. Please log in again.' : 'Access forbidden. Please log in again.');
      }
      const errorText = await response.text();
      let data;
      try {
        data = JSON.parse(errorText);
        if (data.success === false && data.message === "Session expired or invalid. Please login again.") {
          setSessionExpired(true);
          throw new Error(data.message);
        }
      } catch (e) {
        // Ignore JSON parse error for non-JSON responses
      }
      throw new Error(`Server error occurred. Please try again. (Status: ${response.status})`);
    }

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error('Invalid response from server. Please try again.');
    }

    // Check for session expired
    if (data.success === false && data.message === "Session expired or invalid. Please login again.") {
      setSessionExpired(true);
      throw new Error(data.message);
    }

    return data;
  };

  // Session Expired Modal Component
  const SessionExpiredModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`rounded-2xl shadow-xl max-w-sm w-full p-6 text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Session Expired</h2>
        <p className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Your session has expired. Please log in again to continue.
        </p>
        <button
          onClick={() => {
            sessionStorage.removeItem('token');
            localStorage.removeItem('token');
            navigate('/');
          }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Go to Login
        </button>
      </div>
    </div>
  );

  // Success Modal
  const SuccessModal = () => (
    <Dialog open={showSuccessModal} onClose={() => setShowSuccessModal(false)} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className={`max-w-md rounded-2xl p-6 shadow-xl ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
          <DialogTitle className="flex items-center justify-center gap-2 text-lg font-bold text-green-600 mb-4">
            <CheckCircle className="h-6 w-6" />
            Success
          </DialogTitle>
          <p className="text-sm text-center mb-6">{modalMessage}</p>
          <div className="flex justify-center">
            <Button
              color="success"
              onClick={() => setShowSuccessModal(false)}
              className="px-6 py-2"
            >
              OK
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );

  // Error Modal
  const ErrorModal = () => (
    <Dialog open={showErrorModal} onClose={() => setShowErrorModal(false)} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className={`max-w-md rounded-2xl p-6 shadow-xl ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
          <DialogTitle className="flex items-center justify-center gap-2 text-lg font-bold text-red-600 mb-4">
            <AlertCircle className="h-6 w-6" />
            Warning
          </DialogTitle>
          <p className="text-sm text-center mb-6">{modalMessage}</p>
          <div className="flex justify-center">
            <Button
              color="failure"
              onClick={() => setShowErrorModal(false)}
              className="px-6 py-2"
            >
              OK
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await apiFetch(
          'https://kelvinmms.com:8443/api-gateway-mms/master-service/userController/userDropdownByLocatinRights',
        );
        if (data.success && data.data && data.data.length > 0) {
          setUsers(
            data.data.map((user) => ({
              id: user.pk,
              name: `${user.name} - ${user.code}`,
            })),
          );
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setModalMessage(error.message || 'Failed to load users. Please refresh the page.');
        setShowErrorModal(true);
      }
    };

    fetchUsers();
  }, []);

  // Fetch locations when selected user changes
  useEffect(() => {
    if (selectedUser) {
      fetchUserLocations(selectedUser);
    } else {
      // Reset locations when no user is selected
      setLocations([]);
      setSearchTerm('');
      setSortCheckedFirst(false);
    }
  }, [selectedUser]);

  const fetchUserLocations = async (userPk) => {
    setIsLoadingLocations(true);
    setModalMessage('');

    try {
      const data = await apiFetch(
        `https://kelvinmms.com:8443/api-gateway-mms/master-service/userController/userDropdownByLocatinRights/${userPk}`,
      );

      if (data.success && data.data && data.data.length > 0) {
        setLocations(data.data);
        setSortCheckedFirst(true);
      } else {
        // If no locations found, set empty array
        setLocations([]);
        setSortCheckedFirst(false);
      }
    } catch (error) {
      console.error('Error fetching user locations:', error);
      setModalMessage(error.message || 'Failed to load locations. Please select the user again.');
      setShowErrorModal(true);
      // Reset to empty on error
      setLocations([]);
      setSortCheckedFirst(false);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  const handleCheckboxChange = (pk, checked) => {
    setLocations(prev => prev.map(loc => loc.pk === pk ? {...loc, check: checked} : loc));
  };

  const saveLocationRights = async (locData, userPk) => {
    setIsProcessing(true);
    setModalMessage('');

    try {
      const requestBody = locData.map((loc) => ({
        locationFk: loc.pk,
        pkThree: userPk,
        check: loc.check,
      }));

      const data = await apiFetch(
        'https://kelvinmms.com:8443/api-gateway-mms/master-service/userController/saveLocationRights',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        },
      );

      if (data.success) {
        // Refetch locations to ensure data is updated
        await fetchUserLocations(userPk);
        setModalMessage(data.message);
        setShowSuccessModal(true);
      } else {
        setModalMessage(data.message || 'Failed to update location rights. Please try again.');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error saving location rights:', error);
      setModalMessage(error.message || 'Failed to update location rights. Please check your connection and try again.');
      setShowErrorModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!selectedUser) {
      errors.user = 'Please select a user';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || locations.length === 0) {
      setModalMessage('Please select a user and ensure locations are loaded before saving.');
      setShowErrorModal(true);
      return;
    }
    await saveLocationRights(locations, parseInt(selectedUser));
  };

  const handleClear = () => {
    setLocations([]);
    setSelectedUser('');
    setSearchTerm('');
    setValidationErrors({});
    setSortCheckedFirst(false);
  };

  const filteredLocations = locations
    .filter(loc =>
      loc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort(sortCheckedFirst ? (a, b) => b.check - a.check : (a, b) => 0);

  return (
    <>
      {sessionExpired && <SessionExpiredModal />}
      <SuccessModal />
      <ErrorModal />
      <div className={`max-w-7xl mx-auto p-4 space-y-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* User Rights Form */}
        <Card
          className={`${className} ${
            isCardShadow ? 'shadow-lg dark:shadow-xl' : 'shadow-none border'
          } p-0 dark:bg-gray-800 dark:border-gray-700 overflow-hidden`}
          style={{ borderRadius: `${isBorderRadius ? 12 : 0}px` }}
        >
          <div
            className={`px-4 pt-3 pb-2 ${
              isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <h5
                className={`text-lg font-bold ${
                  isDark
                    ? 'text-white'
                    : 'bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent'
                }`}
              >
                User Location Rights
              </h5>
              <div className="flex gap-2">
                {selectedUser && locations.length > 0 && (
                  <Tooltip content="Save all changes" placement="bottom">
                    <Button
                      color="success"
                      className={`w-9 h-9 rounded-full flex items-center justify-center p-0 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 ${
                        isDark ? 'bg-green-600 hover:bg-green-700' : ''
                      }`}
                      onClick={handleSave}
                      disabled={isProcessing || isLoadingLocations}
                    >
                      {isProcessing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                    </Button>
                  </Tooltip>
                )}
                <Tooltip content="Clear selection" placement="bottom">
                  <Button
                    color="warning"
                    className={`w-9 h-9 rounded-full flex items-center justify-center p-0 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 ${
                      isDark ? 'bg-yellow-600 hover:bg-yellow-700' : ''
                    }`}
                    onClick={handleClear}
                    disabled={isLoadingLocations}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* User Selection */}
          <div className="p-4 bg-white dark:bg-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-1">
                <div className="mb-2">
                  <Label
                    htmlFor="user"
                    className={`flex items-center font-semibold text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    Select User<span className="text-red-500 ml-1">*</span>
                  </Label>
                </div>
                <SearchableSelect
                  options={users}
                  value={selectedUser}
                  onChange={(value) => setSelectedUser(value)}
                  placeholder="Search and select a user"
                  displayKey="name"
                  valueKey="id"
                  error={!!validationErrors.user}
                  helperText={validationErrors.user}
                  className={isDark ? 'dark' : ''}
                  disabled={isLoadingLocations}
                />
                {isLoadingLocations && selectedUser && (
                  <div className="mt-1 flex items-center text-xs text-blue-600">
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent mr-1"></div>
                    Loading locations...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User validation errors */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="px-4 pb-3 bg-white dark:bg-gray-800">
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded-md border border-red-200 dark:border-red-800">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {Object.entries(validationErrors).map(([field, message]) => (
                  <span key={field}>{message}</span>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Locations Section - Only show when a user is selected */}
        {selectedUser && (
          <Card
            className={`${
              isCardShadow ? 'shadow-lg dark:shadow-xl' : 'shadow-none border'
            } p-0 dark:bg-gray-800 dark:border-gray-700 overflow-hidden`}
            style={{ borderRadius: `${isBorderRadius ? 12 : 0}px` }}
          >
            <div className="px-4 pt-3 pb-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <h3
                className={`text-base font-semibold flex items-center ${
                  isDark ? 'text-gray-200' : 'text-gray-800'
                }`}
              >
                <MapPin className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
                Location Rights for {users.find(u => u.id === selectedUser)?.name || 'Selected User'}
              </h3>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Check/uncheck locations below. Click Save to apply changes.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800">
              {/* Search Box */}
              <div className="mb-3">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 ${isDark ? 'text-gray-500' : ''}`} />
                  <Input
                    type="text"
                    placeholder="Search locations"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`border-2 border-blue-500 rounded-lg pl-10 pr-7 py-2 text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-blue-300 placeholder-gray-500'}`}
                  />
                </div>
              </div>

              {isLoadingLocations ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-500 border-t-transparent"></div>
                </div>
              ) : filteredLocations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredLocations.map((location) => (
                    <div
                      key={location.pk}
                      className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-sm ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                          : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      <label className="flex items-start space-x-2">
                        <Checkbox
                          color="blue"
                          checked={location.check}
                          onChange={(e) => handleCheckboxChange(location.pk, e.target.checked)}
                          className="mt-0.5 flex-shrink-0"
                          disabled={isProcessing}
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm truncate ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                            {location.code}
                          </p>
                          <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {location.name}
                          </p>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              ) : locations.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className={`mx-auto h-8 w-8 text-gray-400 ${isDark ? 'text-gray-500' : ''}`} />
                  <p className={`mt-2 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    No locations available for this user.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    No locations match "{searchTerm}". Clear search to view all.
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </>
  );
};

export default UserRights;