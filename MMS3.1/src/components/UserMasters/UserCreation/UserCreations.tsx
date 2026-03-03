import { useContext, useEffect, useState } from 'react';
import { Button, Label, Select, Alert, Tooltip } from 'flowbite-react';
import { CustomizerContext } from 'src/context/CustomizerContext';
import { Card } from 'src/components/shadcn-ui/Default-Ui/card';
import { Input } from '@headlessui/react';
import { useNavigate } from 'react-router';
import { useCredentials } from 'src/context/AuthContext';
import { RefreshCw, Save, CheckCircle, XCircle, List, InfoIcon } from 'lucide-react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { FaRegEye,FaRegEyeSlash } from "react-icons/fa6";
import Toastify, { showToast } from 'src/components/Spa Components/Toastify';

const UserCreation = ({ className }) => {
  useEffect(() => {
    document.title = 'User Creation';
  });

  const { isCardShadow, isBorderRadius } = useContext(CustomizerContext);
  const credentials = useCredentials();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 1,
    mobileNo: '',
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // Clear form function
  const clearForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      userType: 1,
      mobileNo: '',
    });
    setValidationErrors({});
    setPasswordStrength('');
  };

  // Generic fetch helper
  const apiFetch = async (url, options = {}) => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      setSessionExpired(true);
      throw new Error('No authentication token found. Please log in.');
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
      if (response.status === 401) {
        setSessionExpired(true);
        throw new Error('Session expired or invalid. Please login again.');
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
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error('Invalid JSON response from server');
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Session Expired</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Your session has expired. Please login again to continue.
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

  // Success Modal Component
  const SuccessModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Success</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          {successMessage}
        </p>
        <button
          onClick={() => {
            setShowSuccessModal(false);
            navigate('/userMaster/ViewUserDetails');
          }}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Go to User List
        </button>
      </div>
    </div>
  );

  // Error Modal Component
  const ErrorModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Message</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          {errorMessage}
        </p>
        <button
          onClick={() => setShowErrorModal(false)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          OK
        </button>
      </div>
    </div>
  );

  const handleEmailBlur = async () => {
    if (!formData.email.trim()) 
      return;

    try {
      const data = await apiFetch('https://kelvinmms.com:8443/api-gateway-mms/master-service/userController/checkMailId', {
        method: 'POST',
        body: JSON.stringify({ emailId: formData.email }),
      });

      console.log('Email check response:', data);

      if (data.success) {
        showToast('Email is available', 'success');
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.emailDuplicate;
          return newErrors;
        });
      } else {
        // Email already exists, clear input and show toast
        showToast('Email already exists', 'error');
        setFormData((prev) => ({ ...prev, email: '' }));
        setValidationErrors((prev) => ({
          ...prev,
          email:'Please enter a different email address',
        }));
      }
    } catch (err) {
      showToast(err.message || 'Error checking email availability', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Strict validation for mobile number - only allow numbers and limit to 10 digits
    if (name === 'mobileNo') {
      if (!/^\d{0,10}$/.test(value)) return;
    }
    // Restrict email to lowercase
    if (name === 'email') {
      setFormData((prev) => ({
        ...prev,
        [name]: value.toLowerCase(),
      }));
    } else if (name === 'userType') {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    if (name === 'email') {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    }
  };

  // Real-time validation for email
  useEffect(() => {
    if (formData.email.trim()) {
      if (!validateEmail()) {
        setValidationErrors(prev => ({
          ...prev,
          email: 'Enter valid email'
        }));
      } else if (validationErrors.email) {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.email;
          return newErrors;
        });
      }
    }
  }, [formData.email]);
  
  useEffect(() => {
    if (formData.password) {
      let score = 0;
      if (formData.password.length >= 8) score++;
      if (/[A-Z]/.test(formData.password)) score++;
      if (/[a-z]/.test(formData.password)) score++;
      if (/[0-9]/.test(formData.password)) score++;
      if (/[^A-Za-z0-9]/.test(formData.password)) score++;

      if (score < 3) {
        setPasswordStrength('weak');
      } else if (score < 5) {
        setPasswordStrength('medium');
      } else {
        setPasswordStrength('strong');
      }
    } else {
      setPasswordStrength('');
    }
    // Reset errors when password changes
    if (validationErrors.password) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.password;
        return newErrors;
      });
    }
    if (validationErrors.confirmPassword) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.confirmPassword;
        return newErrors;
      });
    }
  }, [formData.password]);

  // Real-time validation for confirm password
  useEffect(() => {
    if (formData.confirmPassword && formData.confirmPassword !== formData.password) {
      setValidationErrors(prev => ({
        ...prev,
        confirmPassword: 'Passwords do not match'
      }));
    } else if (formData.confirmPassword && validationErrors.confirmPassword) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.confirmPassword;
        return newErrors;
      });
    }
  }, [formData.confirmPassword, formData.password]);

  const handleViewDetails = () => {
    navigate('/userMaster/ViewUserDetails');
  };

  const validateEmail = () => {
    if (!formData.email.trim()) {
      return false;
    }
    // Allow general lowercase emails
    return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(formData.email);
  };

  const validateForm = () => {
    const errors = {};
    // First Name validation
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    // Last Name validation
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail()) {
      errors.email = 'Email should contain @ and .com or .in';
    }
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(formData.password)) {
      errors.password = 'Password must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      errors.password = 'Password must contain at least one number';
    } else if (!/[^A-Za-z0-9]/.test(formData.password)) {
      errors.password = 'Password must contain at least one special character';
    }
    // Confirm Password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirm password is required';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    // User Type validation
    if (![1, 2, 3].includes(formData.userType)) {
      errors.userType = 'Please select a valid user type';
    }
    // Mobile number validation
    if (formData.mobileNo && !/^\d{10}$/.test(formData.mobileNo)) {
      errors.mobileNo = 'Mobile number must be exactly 10 digits';
    }
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      const requestData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        emailId: formData.email,
        password: formData.password,
        mobileNo: formData.mobileNo || '',
        userType: formData.userType,
        createdBy: credentials.userId,
      };
      const result = await apiFetch(
        'https://kelvinmms.com:8443/api-gateway-mms/master-service/userController/saveUserMaster',
        {
          method: 'POST',
          body: JSON.stringify(requestData),
        },
      );

      if (result.message === "success") {
        setSuccessMessage('User created successfully!');
        setShowSuccessModal(true);
        clearForm();
      } else {
        setErrorMessage(result.message || 'Failed to create user');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error saving user:', error);
      setErrorMessage(error.message || 'Failed to save user. Please try again.');
      setShowErrorModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearAll = () => {
    clearForm();
  };

  const handleOtherFieldFocus = (fieldName) => {
    if (!validateEmail() && formData.email.trim() && fieldName !== 'email') {
      setValidationErrors((prev) => ({
        ...prev,
        email: 'Email should contain @ and .com or .in',
      }));
      return false;
    }
    return true;
  };

  return (
    <>
      {sessionExpired && <SessionExpiredModal />}
      {showSuccessModal && <SuccessModal />}
      {showErrorModal && <ErrorModal />}
      <Card
        className={`card ${className} ${
          isCardShadow ? 'dark:shadow-dark-md shadow-md p-0' : 'shadow-none border border-ld p-0'
        } transition-all duration-300 hover:shadow-lg`}
        style={{
          borderRadius: `${isBorderRadius}px`,
        }}
      >
        <div className="px-6 pt-3 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h6 className="card-title text-md font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              User Creation
            </h6>
            <div className="flex gap-3">
              <Tooltip content="Save user" placement="bottom">
                <Button
                  color="green"
                  className="w-10 h-10 rounded-full flex items-center justify-center p-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  onClick={handleSave}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <div className="animate-spin">⏳</div>
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                </Button>
              </Tooltip>
              <Tooltip content="Clear All" placement="bottom">
                <Button
                  color="warning"
                  className="w-10 h-10 rounded-full flex items-center justify-center p-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  onClick={handleClearAll}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </Tooltip>
              <Tooltip content="View User List" placement="bottom">
                <Button
                  color="blue"
                  className="w-10 h-10 rounded-full flex items-center justify-center p-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  onClick={handleViewDetails}
                  title="Go to User List"
                >
                  <List className="w-4 h-4" />
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-6 p-6">
          <div className="col-span-12 md:col-span-3">
            <div className="mb-3">
              <Label htmlFor="firstName" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                First Name<span className="text-red-500 ml-1">*</span>
              </Label>
            </div>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              maxLength={30}
              placeholder="Enter first name"
              value={formData.firstName}
              onChange={handleInputChange}
              onFocus={() => handleOtherFieldFocus('firstName')}
              className={`ui-form-control rounded-lg py-3 px-4 w-full transition-colors duration-200 focus:ring-2 focus:ring-blue-500 ${
                validationErrors.firstName ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.firstName && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <XCircle className="w-4 h-4" /> {validationErrors.firstName}
              </p>
            )}
          </div>
          <div className="col-span-12 md:col-span-3">
            <div className="mb-3">
              <Label htmlFor="lastName" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                Last Name<span className="text-red-500 ml-1">*</span>
              </Label>
            </div>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              maxLength={30}
              placeholder="Enter last name"
              value={formData.lastName}
              onChange={handleInputChange}
              onFocus={() => handleOtherFieldFocus('lastName')}
              className={`ui-form-control rounded-lg py-3 px-4 w-full transition-colors duration-200 focus:ring-2 focus:ring-blue-500 ${
                validationErrors.lastName ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.lastName && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <XCircle className="w-4 h-4" /> {validationErrors.lastName}
              </p>
            )}
          </div>
          <div className="col-span-6">
            <div className="mb-3">
              <Label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                Email<span className="text-red-500 ml-1">*</span>
              </Label>
            </div>
            <Input
              id="email"
              name="email"
              type="email"
              maxLength={50}
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleEmailBlur}
              onFocus={() => handleOtherFieldFocus('email')}
              className={`ui-form-control rounded-lg py-3 px-4 w-full transition-colors duration-200 focus:ring-2 focus:ring-blue-500 ${
                validationErrors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <XCircle className="w-4 h-4" /> {validationErrors.email}
              </p>
            )}
          </div>
          <div className="col-span-12 md:col-span-6">
            <div className="mb-3">
              <Label htmlFor="password" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                Password<span className="text-red-500 ml-1">*</span>
                <Tooltip
                  content="Password must contain: At least 8 characters, one uppercase, one lowercase, one number, one special character"
                  placement="right"
                  className="max-w-xs"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-1 text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </Tooltip>
              </Label>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter secure password"
                maxLength={50}
                value={formData.password}
                onChange={handleInputChange}
                onFocus={() => handleOtherFieldFocus('password')}
                className={`ui-form-control rounded-lg py-3 px-4 w-full transition-colors duration-200 focus:ring-2 focus:ring-blue-500 pr-10 ${
                  validationErrors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <FaRegEyeSlash className="w-5 h-5" />
                ) : (
                  <FaRegEye className="w-5 h-5" />
                )}
              </button>
            </div>
            {validationErrors.password && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <XCircle className="w-4 h-4" /> {validationErrors.password}
              </p>
            )}
            {passwordStrength && (
              <div className={`text-sm mt-1 ${
                passwordStrength === 'strong' ? 'text-green-600' :
                passwordStrength === 'medium' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                Password strength: {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
              </div>
            )}
          </div>
          <div className="col-span-12 md:col-span-6">
            <div className="mb-3">
              <Label htmlFor="confirmPassword" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password<span className="text-red-500 ml-1">*</span>
              </Label>
            </div>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                maxLength={50}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onFocus={() => handleOtherFieldFocus('confirmPassword')}
                className={`ui-form-control rounded-lg py-3 px-4 w-full transition-colors duration-200 focus:ring-2 focus:ring-blue-500 pr-10 ${
                  validationErrors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <FaRegEyeSlash className="w-5 h-5" />
                ) : (
                  <FaRegEye className="w-5 h-5" />
                )}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <XCircle className="w-4 h-4" /> {validationErrors.confirmPassword}
              </p>
            )}
          </div>
          <div className="col-span-12 md:col-span-6">
            <div className="mb-3">
              <Label htmlFor="userType" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                User Type<span className="text-red-500 ml-1">*</span>
              </Label>
            </div>
            <Select
              id="userType"
              name="userType"
              value={formData.userType}
              onChange={handleInputChange}
              onFocus={() => handleOtherFieldFocus('userType')}
              className="select-md rounded-lg py-3 px-4 w-full transition-colors duration-200 focus:ring-2
               focus:border-blue-500 border-gray-300"
            >
              <option value={1}>Admin</option>
              <option value={2}>Location's User</option>
              <option value={3}>Super User</option>
            </Select>
            {validationErrors.userType && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <XCircle className="w-4 h-4" /> {validationErrors.userType}
              </p>
            )}
          </div>
          <div className="col-span-12 md:col-span-6">
            <div className="mb-3">
              <Label htmlFor="mobileNo" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Mobile No
              </Label>
            </div>
            <Input
              id="mobileNo"
              name="mobileNo"
              type="text"
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
              value={formData.mobileNo}
              onChange={handleInputChange}
              onFocus={() => handleOtherFieldFocus('mobileNo')}
              className={`ui-form-control rounded-lg py-3 px-4 w-full transition-colors duration-200 focus:ring-2 focus:ring-blue-500 ${
                validationErrors.mobileNo ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
              }`}
              inputMode="numeric"
            />
            {validationErrors.mobileNo && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <XCircle className="w-4 h-4" /> {validationErrors.mobileNo}
              </p>
            )}
          </div>
        </div>
      </Card>
      <Toastify />
    </>
  );
};

export default UserCreation;