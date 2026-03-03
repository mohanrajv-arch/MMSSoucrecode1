import { useContext, useState, useEffect, useMemo } from 'react';
import { Button, Label, Select, Tooltip, Spinner } from 'flowbite-react';
import { CustomizerContext } from 'src/context/CustomizerContext';
import { Card } from 'src/components/shadcn-ui/Default-Ui/card';
import { Input } from '@headlessui/react';
import { useNavigate } from 'react-router';
import { HiEye, HiEyeOff, HiX } from 'react-icons/hi';
import { Edit3, Eye, Plus } from 'lucide-react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { LuSquarePen } from "react-icons/lu";
import { useCredentials } from 'src/context/AuthContext';
import { FaFileExcel } from "react-icons/fa6";
import Toastify, { showToast } from 'src/components/Spa Components/Toastify';

const ViewDetails = ({ className }) => {
  useEffect(() => {
    document.title = 'View Details';
  }, []);

  const baseUrl = 'https://kelvinmms.com:8443/api-gateway-mms/master-service/userController';
  const { isCardShadow, isBorderRadius } = useContext(CustomizerContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedViewUser, setSelectedViewUser] = useState(null);
  const [selectedPasswordUser, setSelectedPasswordUser] = useState(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    userType: 1,
    status: 'A', 
    userPk: 0,
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(''); 

  const [showViewPassword, setShowViewPassword] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  const [sessionExpired, setSessionExpired] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const [sortConfig, setSortConfig] = useState({
    key: '',
    direction: 'ascending',
  });
  const credentials = useCredentials();
  const userPk = credentials?.userId;

  const navigate = useNavigate();

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

  const apiFetch = async (url, options = {}) => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      setSessionExpired(true);
      showToast('No authentication token found. Please log in.', 'error');
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
        showToast('Session expired or invalid. Please login again.', 'error');
        throw new Error('Session expired or invalid. Please login again.');
      }
      const errorText = await response.text();
      showToast(errorText || 'An error occurred', 'error');
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      showToast('Invalid JSON response from server', 'error');
      throw new Error('Invalid JSON response from server');
    }

    if (data.success === false && data.message === "Session expired or invalid. Please login again.") {
      setSessionExpired(true);
      showToast(data.message, 'error');
      throw new Error(data.message);
    }

    return data;
  };

  const handleDownloadExcel = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      setSessionExpired(true);
      showToast('No authentication token found. Please log in.', 'error');
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/download/user-master/${userPk}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setSessionExpired(true);
          showToast('Session expired or invalid. Please login again.', 'error');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'user-master.xls';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Excel file downloaded successfully', 'success');
    } catch (err) {
      console.error('Download error:', err);
      showToast('Error downloading Excel file', 'error');
    }
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getUserTypeStr = (type) => {
    const map = {1: 'Admin', 2: "Location's User", 3: 'Super User'};
    return map[type] || 'Unknown';
  };

  const getStatusStr = (status) => {
    return status === 'A' ? 'Active' : 'Inactive';
  };

  const getStatusDisplay = (status) => {
    return status === 'A' ? 'Active' : 'Inactive';
  };

  const sortedAndFilteredUsers = useMemo(() => {
    const filtered = users.filter(
      (user) =>
        user && 
        (`${user.firstName || ''} ${user.lastName || ''} ${user.emailId || ''} ${user.userTypeStr || ''}`)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );

    // Hide the current user from the list
    const filteredCurrent = filtered.filter(user => user.userPk !== userPk);

    if (!sortConfig.key) return filteredCurrent;

    return [...filteredCurrent].sort((a, b) => {
      let valueA = a[sortConfig.key];
      let valueB = b[sortConfig.key];

      if (valueA == null) return sortConfig.direction === 'ascending' ? 1 : -1;
      if (valueB == null) return sortConfig.direction === 'ascending' ? -1 : 1;

      if (sortConfig.key === 'firstName') {
        valueA = `${a.firstName || ''} ${a.lastName || ''}`;
        valueB = `${b.firstName || ''} ${b.lastName || ''}`;
      }

      if (sortConfig.key === 'createdDate') {
        const dateA = new Date(valueA);
        const dateB = new Date(valueB);
        if (isNaN(dateA.getTime())) return sortConfig.direction === 'ascending' ? 1 : -1;
        if (isNaN(dateB.getTime())) return sortConfig.direction === 'ascending' ? -1 : 1;
        return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
      }

      valueA = String(valueA).toLowerCase();
      valueB = String(valueB).toLowerCase();

      if (valueA < valueB) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [users, searchTerm, sortConfig, userPk]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalPages = Math.ceil(sortedAndFilteredUsers.length / itemsPerPage);
  const paginatedUsers = sortedAndFilteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await apiFetch(`${baseUrl}/listOfUserMaster`, { method: 'GET' });
        if (data.success) {
          setUsers((data.data.userDetailsList || []).filter(user => user !== null && user !== undefined));
        } else {
          showToast('Failed to fetch users', 'error');
        }
      } catch (err) {
        showToast('Error fetching users', 'error');
        setSessionExpired(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const renderPagination = () => {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">Show:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring focus:border-blue-500"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-600 dark:text-gray-300">entries</span>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-300">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
          {Math.min(currentPage * itemsPerPage, sortedAndFilteredUsers.length)} of{' '}
          {sortedAndFilteredUsers.length} records
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-md ${
              currentPage === 1
                ? 'text-gray-400 cursor-not-allowed dark:text-gray-500'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            title="First Page"
          >
            «
          </button>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`p-2 rounded-md ${
              currentPage === 1
                ? 'text-gray-400 cursor-not-allowed dark:text-gray-500'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            title="Previous Page"
          >
            ‹
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNumber =
              currentPage <= 3
                ? i + 1
                : currentPage >= totalPages - 2
                ? totalPages - 4 + i
                : currentPage - 2 + i;

            if (pageNumber < 1 || pageNumber > totalPages) return null;

            return (
              <button
                key={pageNumber}
                onClick={() => setCurrentPage(pageNumber)}
                className={`w-8 h-8 rounded-md flex items-center justify-center text-sm ${
                  currentPage === pageNumber
                    ? 'bg-blue-600 text-white dark:bg-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className={`p-2 rounded-md ${
              currentPage === totalPages || totalPages === 0
                ? 'text-gray-400 cursor-not-allowed dark:text-gray-500'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            title="Next Page"
          >
            ›
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages || totalPages === 0}
            className={`p-2 rounded-md ${
              currentPage === totalPages || totalPages === 0
                ? 'text-gray-400 cursor-not-allowed dark:text-gray-500'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            title="Last Page"
          >
            »
          </button>
        </div>
      </div>
    );
  };

  const handleView = async (user) => {
    try {
      const data = await apiFetch(`${baseUrl}/viewOfUserMaster/${user.userPk}`, { method: 'GET' });
      if (data.success && data.data) {
        setSelectedViewUser(data.data);
        setShowViewModal(true);
        showToast('User details loaded successfully', 'success');
      } else {
        showToast('Failed to fetch user details', 'error');
      }
    } catch (err) {
      showToast('Error fetching user details', 'error');
      setSessionExpired(true);
    }
  };

  const handleModify = async (user) => {
    try {
      const data = await apiFetch(`${baseUrl}/viewOfUserMaster/${user.userPk}`, { method: 'GET' });
      if (data.success && data.data) {
        const userData = data.data;
        setSelectedUser(userData);
        setEditForm({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          userType: userData.roleFk || 1,
          status: userData.status || 'A',
          userPk: userData.userPk || 0,
        });
        setShowEditModal(true);
      } else {
        showToast(data.message || 'Failed to fetch user details', 'error');
      }
    } catch (err) {
      showToast(err.message || 'An error occurred while fetching user details', 'error');
      setSessionExpired(true);
    }
  };

  const handlePasswordUpdate = (user) => {
    setSelectedPasswordUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setConfirmError('');
    setPasswordStrength('');
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setShowPasswordModal(true);
  };

  const handleAddUser = () => {
    navigate('/userMaster/userCreations');
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: name === 'userType' ? parseInt(value) : value,
    }));
  };

  const handleStatusToggle = async () => {
    if (isTogglingStatus) return;
    
    setIsTogglingStatus(true);
    try {
      const newStatus = editForm.status === 'A' ? 'I' : 'A';
      
      const statusData = {
        userPk: editForm.userPk,
        status: newStatus
      };

      const data = await apiFetch(`${baseUrl}/statusUpdateOfUser`, {
        method: 'POST',
        body: JSON.stringify(statusData),
      });

      if (data.success) {
        setEditForm(prev => ({ ...prev, status: newStatus }));
        
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user && user.userPk === editForm.userPk 
              ? { ...user, status: newStatus === 'A' ? 'Active' : 'In-active' }
              : user
          ).filter(u => u !== null && u !== undefined)
        );

        const action = newStatus === 'A' ? 'activated' : 'deactivated';
        showToast(`User ${action} successfully!`, 'success');
      } else {
        showToast('Failed to update status', 'error');
      }
    } catch (err) {
      showToast('Error updating status', 'error');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  useEffect(() => {
    if (newPassword) {
      let score = 0;
      if (newPassword.length >= 8) score++;
      if (/[A-Z]/.test(newPassword)) score++;
      if (/[a-z]/.test(newPassword)) score++;
      if (/[0-9]/.test(newPassword)) score++;
      if (/[^A-Za-z0-9]/.test(newPassword)) score++;

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
    setPasswordError('');
    setConfirmError('');
  }, [newPassword]);

  useEffect(() => {
    if (confirmPassword && confirmPassword !== newPassword) {
      setConfirmError('Passwords do not match');
    } else {
      setConfirmError('');
    }
  }, [confirmPassword, newPassword]);

  const handleSavePassword = async () => {
    setPasswordError('');
    setConfirmError('');

    if (!newPassword) {
      setPasswordError('Password is required');
      showToast('Password is required', 'error');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      showToast('Password must be at least 8 characters', 'error');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError('Password must contain at least one uppercase letter');
      showToast('Password must contain at least one uppercase letter', 'error');
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      setPasswordError('Password must contain at least one lowercase letter');
      showToast('Password must contain at least one lowercase letter', 'error');
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setPasswordError('Password must contain at least one number');
      showToast('Password must contain at least one number', 'error');
      return;
    }
    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      setPasswordError('Password must contain at least one special character');
      showToast('Password must contain at least one special character', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      setConfirmError('Passwords do not match');
      showToast('Passwords do not match', 'error');
      return;
    }

    try {
      const data = {
        userPk: selectedPasswordUser.userPk,
        lastActBy: userPk,
        password: newPassword,
      };

      const response = await apiFetch(`${baseUrl}/userPasswordUpdateByAdmin`, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (response.success) {
        showToast('Password updated successfully', 'success');
        setShowPasswordModal(false);
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast('Failed to update password', 'error');
      }
    } catch (err) {
      showToast('Error updating password', 'error');
    }
  };

  const handleSaveEdit = async () => {
    try {
      const modifyData = {
        userPk: editForm.userPk,
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        userType: editForm.userType,
      };

      const data = await apiFetch(`${baseUrl}/modifyOfUserMaster`, {
        method: 'POST',
        body: JSON.stringify(modifyData),
      });

      if (data.success) {
        showToast('User updated successfully', 'success');

        setUsers(
          users.map((user) =>
            user && user.userPk === editForm.userPk
              ? {
                  ...user,
                  firstName: editForm.firstName,
                  lastName: editForm.lastName,
                  userType: editForm.userType,
                  userTypeStr: getUserTypeStr(editForm.userType),
                }
              : user,
          ).filter(u => u !== null && u !== undefined),
        );

        setShowEditModal(false);
      } else {
        showToast(
          data.message || 'Failed to update user. Please check the data and try again.',
          'error'
        );
      }
    } catch (err) {
      showToast('An error occurred while updating the user. Please try again.', 'error');
    }
  };

  const closeModals = () => {
    setShowEditModal(false);
    setShowViewModal(false);
    setShowPasswordModal(false);
    setSelectedUser(null);
    setSelectedViewUser(null);
    setSelectedPasswordUser(null);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setConfirmError('');
    setPasswordStrength('');
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setShowViewPassword(false);
    setSuccessMessage('');
    setIsTogglingStatus(false);
  };

  const renderTableHeader = (key, label) => {
    const isSorted = sortConfig?.key === key;
    const sortDirection = isSorted ? sortConfig.direction : null;

    return (
      <th
        className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-blue-700 transition-colors"
        onClick={() => requestSort(key)}
      >
        <div className="flex items-center justify-between">
          {label}
          {isSorted && (
            <span className="ml-2">
              {sortDirection === 'ascending' ? '↑' : '↓'}
            </span>
          )}
        </div>
      </th>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <>
      {sessionExpired && <SessionExpiredModal />}
      <Card
        className={`card ${className} ${
          isCardShadow ? 'dark:shadow-dark-md shadow-md p-0' : 'shadow-none border border-ld p-0'
        } dark:bg-gray-800 dark:border-gray-700`}
        style={{
          borderRadius: `${isBorderRadius}px`,
        }}
      >
        <div className="p-6 dark:bg-gray-800">
          <div className="mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="w-full lg:w-auto">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">User Management</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">View and manage all users in the system</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <HiX className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Tooltip content="Download Excel" placement="bottom">
                  <button 
                    onClick={handleDownloadExcel}
                    className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <FaFileExcel size={18} />
                    <span className="hidden sm:inline"></span>
                  </button>
                </Tooltip>
                <Tooltip content="Add New User" placement="bottom">
                  <button 
                    onClick={handleAddUser}
                    className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Plus size={18} />
                    <span className="hidden sm:inline"></span>
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* User Table - Now properly aligned without horizontal scroll */}
          <div className="overflow-x-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider w-1/4">
                    User Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider w-1/4">
                  Email & Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider w-1/4">
                    Account Info
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider w-1/4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-lg font-medium text-gray-600 dark:text-gray-300">No users found</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {searchTerm ? 'Try adjusting your search terms' : 'Add your first user to get started'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user, index) => (
                    user ? (
                      <tr 
                        key={user.userPk} 
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                          index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'
                        }`}
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 dark:text-blue-300 font-semibold">
                                {(user.firstName?.[0] || '').toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                ID: {user.userPk}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-900 dark:text-white">
                              <span className="font-medium">Email:</span> {user.emailId || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              <span className="font-medium">Type:</span> {user.userTypeStr || 'Unknown'}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              <span className="font-medium">Created:</span>{' '}
                              {user.createdDate ? new Date(user.createdDate).toLocaleDateString() : 'N/A'}
                            </div>
                            <div className="flex items-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                (user.status || '') === 'Active'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                  (user.status || '') === 'Active'
                                    ? 'bg-green-500 dark:bg-green-400'
                                    : 'bg-red-500 dark:bg-red-400'
                                }`} />
                                {user.status || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-2">
                            <Tooltip content="View Details" placement="top">
                              <button
                                onClick={() => handleView(user)}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </Tooltip>
                            <Tooltip content="Edit User" placement="top">
                              <button
                                onClick={() => handleModify(user)}
                                className="p-2 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            </Tooltip>
                            <Tooltip content="Update Password" placement="top">
                              <button
                                onClick={() => handlePasswordUpdate(user)}
                                className="p-2 text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                              >
                                <LuSquarePen className="w-4 h-4" />
                              </button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ) : null
                  ))
                )}
              </tbody>
            </table>
          </div>

          {sortedAndFilteredUsers.length > 0 && (
            <>
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Total: {sortedAndFilteredUsers.length} user(s) found
              </div>
              {renderPagination()}
            </>
          )}
        </div>
      </Card>

      {/* Edit Modal - Keep existing */}
      <Dialog open={showEditModal} onClose={closeModals} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="max-w-md rounded-lg bg-white dark:bg-gray-800 p-6 shadow-2xl w-full">
            <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex justify-between items-center">
              Edit User
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white">
                <HiX className="w-5 h-5" />
              </button>
            </DialogTitle>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={editForm.firstName}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={editForm.lastName}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="userType" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  User Type
                </Label>
                <Select
                  id="userType"
                  name="userType"
                  value={editForm.userType}
                  onChange={handleEditFormChange}
                  className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value={1}>Admin</option>
                  <option value={2}>Location's User</option>
                  <option value={3}>Super User</option>
                </Select>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </Label>
                <button
                  onClick={handleStatusToggle}
                  disabled={isTogglingStatus}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    editForm.status === 'A'
                      ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800'
                      : 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800'
                  } ${isTogglingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isTogglingStatus ? 'Updating...' : getStatusDisplay(editForm.status)}
                </button>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={closeModals}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Password Modal - Keep existing */}
      <Dialog open={showPasswordModal} onClose={closeModals} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="max-w-md rounded-lg bg-white dark:bg-gray-800 p-6 shadow-2xl w-full">
            <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex justify-between items-center">
              Update Password
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white">
                <HiX className="w-5 h-5" />
              </button>
            </DialogTitle>
            <div className="space-y-4">
              <div>
                <Label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-10"
                  />
                  <button
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showNewPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
                {passwordStrength && (
                  <div className={`text-sm mt-1 ${
                    passwordStrength === 'strong' ? 'text-green-600' :
                    passwordStrength === 'medium' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    Strength: {passwordStrength}
                  </div>
                )}
              </div>
              <div>
                <Label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-10"
                  />
                  <button
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showConfirmPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                  </button>
                </div>
                {confirmError && <p className="text-red-500 text-sm mt-1">{confirmError}</p>}
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={closeModals}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePassword}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 rounded-lg"
              >
                Update Password
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* View Modal - Keep existing */}
      <Dialog open={showViewModal} onClose={closeModals} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="max-w-md rounded-lg bg-white dark:bg-gray-800 p-6 shadow-2xl w-full">
            <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex justify-between items-center">
              User Details
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white">
                <HiX className="w-5 h-5" />
              </button>
            </DialogTitle>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</Label>
                  <div className="mt-1 text-gray-900 dark:text-white">{selectedViewUser?.firstName || 'N/A'}</div>
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</Label>
                  <div className="mt-1 text-gray-900 dark:text-white">{selectedViewUser?.lastName || 'N/A'}</div>
                </div>
              </div>
              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
                <div className="mt-1 text-gray-900 dark:text-white">{selectedViewUser?.emailId || 'N/A'}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">User Type</Label>
                  <div className="mt-1 text-gray-900 dark:text-white">{getUserTypeStr(selectedViewUser?.roleFk)}</div>
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</Label>
                  <div className="mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedViewUser?.status === 'A'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {getStatusStr(selectedViewUser?.status)}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</Label>
                <div className="relative mt-1">
                  <Input
                    type={showViewPassword ? 'text' : 'password'}
                    value={selectedViewUser?.password || ''}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg pr-10"
                  />
                  <button
                    onClick={() => setShowViewPassword(!showViewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showViewPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={closeModals}
                className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-800 rounded-lg"
              >
                Close
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      <Toastify />
    </>
  );
};

export default ViewDetails;