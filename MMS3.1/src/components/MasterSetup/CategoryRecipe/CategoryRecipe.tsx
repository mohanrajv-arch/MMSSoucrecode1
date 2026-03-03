import React, { createContext, useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  Label,
  Button,
  Tooltip,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ToggleSwitch,
  TextInput,
} from 'flowbite-react';
import { Card as ShadcnCard } from 'src/components/shadcn-ui/Default-Ui/card';
import { useAuth } from 'src/context/AuthContext';
import { Input } from '@headlessui/react';
import { Edit2 } from 'lucide-react';
import AnimatedSearch from 'src/components/Spa Components/Search';
import Toastify, { showToast } from 'src/components/Spa Components/Toastify';

// Define interfaces
interface HistoryRecord {
  entryNo: string;
  status: string;
  lastActDate: string;
  categoryCode: string;
  categoryName: string;
  emailId: string;
  id?: number;
  select?: boolean;
  isToggling?: boolean;
  timestamp?: number;
}

// Customizer Context for Dark Mode
interface CustomizerContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isCardShadow: boolean;
  isBorderRadius: number;
}

const CustomizerContext = createContext<CustomizerContextType>({
  isDarkMode: false,
  toggleDarkMode: () => {},
  isCardShadow: true,
  isBorderRadius: 8,
});

type SortableField = keyof HistoryRecord;
type SortDirection = 'ascending' | 'descending';

const CategoryMaster: React.FC = () => {
  useEffect(() => {
    document.title = 'Category';
  }, []);

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // State declarations
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isTableLoading, setIsTableLoading] = useState<boolean>(false);
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Filter states
  const [sortConfig, setSortConfig] = useState<{
    key: SortableField;
    direction: SortDirection;
  } | null>(null);


  // Modal states
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [modifyModalOpen, setModifyModalOpen] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    categoryCode: '',
    categoryName: '',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const { credentials, projectSettings } = useAuth();

  // Code validation states
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [codeValidationStatus, setCodeValidationStatus] = useState<
    'valid' | 'invalid' | 'unchecked'
  >('unchecked');
  const [codeExists, setCodeExists] = useState(false);
  const [codeValidationError, setCodeValidationError] = useState('');


    
  
  
   
  // Refs for focusing inputs
  const addCategoryCodeRef = useRef<HTMLInputElement>(null);
  const addCategoryNameRef = useRef<HTMLInputElement>(null);
  const modifyCategoryNameRef = useRef<HTMLInputElement>(null);

  // Helper function to format date according to project settings
  const formatDateTime = (date: Date, formatStr: string): string => {
    if (isNaN(date.getTime())) {
      return '';
    }
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



   //Session Modal 

  const [sessionExpired, setSessionExpired] = useState<boolean>(false);
  const navigate = useNavigate()

     const SessionExpiredModal = () => (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Session Expired</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Your session has expired. Please login again to continue.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('token');
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





  // Function to fetch category data
  const fetchCategoryData = async () => {
    setIsTableLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        const msg = 'No authentication token found. Please log in.';
        showToast(msg, 'error');
        setIsTableLoading(false);
        setSessionExpired(true);
        return;
      }
      const response = await fetch(
        'https://kelvinmms.com:8443/api-gateway-mms/master-service/mMSMasterController/categoryMasterList',
        {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        setSessionExpired(true)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      if (data.data && Array.isArray(data.data)) {
        const defaultFormat = 'dd-MM-yyyy HH:mm:ss';
        const dateTimeFormat = projectSettings?.dateTimeFormat || defaultFormat;
        const mappedRecords: HistoryRecord[] = data.data.map(
          (item: any, index: number) => {
            const displayStatus = item.statusStr || (item.status === 'A' ? 'Active' : 'In-Active');
            const dateObj = item.updatedDate ? new Date(item.updatedDate) : null;
            const lastActDate = dateObj ? formatDateTime(dateObj, dateTimeFormat) : '';

            return {
              entryNo: (index + 1).toString(),
              status: displayStatus,
              lastActDate: lastActDate,
              categoryCode: item.categoryCode || '',
              categoryName: item.categoryName || '',
              emailId: item.userEmail || '',
              id: item.id,
              select: false,
              isToggling: false,
              timestamp: dateObj ? dateObj.getTime() : 0,
            };
          },
        );
        setHistoryRecords(mappedRecords);
      } else {
        const msg = 'No category records found in the response.';
        showToast(msg, 'error');
        setSessionExpired(true);
      }
    } catch (error: any) {
      console.error('Error loading category records:', error);
      showToast(error.message || 'Failed to load category records', 'error');
      setSessionExpired(true)
    } finally {
      setIsTableLoading(false);
    }
  };

  // Fetch initial category data on mount
  useEffect(() => {
    fetchCategoryData();
  }, []);

  // Filtered and sorted records
  const sortedAndFilteredRecords = useMemo(() => {
    let filtered = historyRecords;

    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((record) =>
        Object.values(record).some((value) => String(value).toLowerCase().includes(term)),
      );
    }

    // Apply sort
    if (!sortConfig) return filtered;

    // Helper functions for sorting
    const compareIdOrEntryNo = (a: HistoryRecord, b: HistoryRecord, key: SortableField, direction: SortDirection) => {
      const numA = key === 'id' ? a.id ?? 0 : parseInt(a.entryNo);
      const numB = key === 'id' ? b.id ?? 0 : parseInt(b.entryNo);
      return direction === 'ascending' ? numA - numB : numB - numA;
    };

    const compareLastActDate = (a: HistoryRecord, b: HistoryRecord, direction: SortDirection) => {
      return direction === 'ascending' ? (a.timestamp || 0) - (b.timestamp || 0) : (b.timestamp || 0) - (a.timestamp || 0);
    };

    const compareStringField = (a: HistoryRecord, b: HistoryRecord, key: SortableField, direction: SortDirection) => {
      const valueA = String(a[key] ?? '').toLowerCase();
      const valueB = String(b[key] ?? '').toLowerCase();
      if (valueA < valueB) return direction === 'ascending' ? -1 : 1;
      if (valueA > valueB) return direction === 'ascending' ? 1 : -1;
      return 0;
    };

    return [...filtered].sort((a, b) => {
      if (!sortConfig) return 0;
      const { key, direction } = sortConfig;

      if (a[key] == null) return direction === 'ascending' ? 1 : -1;
      if (b[key] == null) return direction === 'ascending' ? -1 : 1;

      if (key === 'id' || key === 'entryNo') {
        return compareIdOrEntryNo(a, b, key, direction);
      }

      if (key === 'lastActDate') {
        return compareLastActDate(a, b, direction);
      }

      return compareStringField(a, b, key, direction);
    });
  }, [historyRecords, searchTerm, sortConfig]);

  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedAndFilteredRecords.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedAndFilteredRecords, currentPage, itemsPerPage]);

  // Sort table headers
  const requestSort = (key: SortableField) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
    }
    setSortConfig({ key, direction });
  };

  // Render sortable table header
  const renderTableHeader = (key: SortableField, label: string) => {
    const isSorted = sortConfig?.key === key;
    const sortDirection = isSorted ? sortConfig.direction : null;

    return (
      <th
        className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-indigo-700 transition-colors"
        onClick={() => requestSort(key)}
      >
        <div className="flex items-center">
          {label}
          <span className="ml-1">
            {
              (() => {
                let arrow = '↕';
                if (isSorted) {
                  arrow = sortDirection === 'ascending' ? '↑' : '↓';
                }
                return arrow;
              })()
            }
          </span>
        </div>
      </th>
    );
  };

  // Handlers for modals
  const handleAddClick = () => {
    setFormData({
      categoryCode: '',
      categoryName: '',
    });
    setAddModalOpen(true);
    setValidationErrors({});
    setCodeValidationStatus('unchecked');
    setCodeExists(false);
    setCodeValidationError('');
  };

  const handleModifyRecord = async (record: HistoryRecord) => {
    setIsFetching(true);
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setSessionExpired(true);
        throw new Error('No authentication token found.');
      }
      const response = await fetch(
        `https://kelvinmms.com:8443/api-gateway-mms/master-service/mMSMasterController/categoryViewById/${record.id}`,
        {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        setSessionExpired(true);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      if (data.data) {
        setFormData({
          categoryCode: data.data.categoryCode || '',
          categoryName: data.data.categoryName || '',
        });
        setSelectedRecord({ ...record, id: data.data.id });
        setModifyModalOpen(true);
        setValidationErrors({});
      } else {
        throw new Error('No data found for the record.');
      }
    } catch (error: any) {
      console.error('Error fetching category details:', error);
      showToast(error.message || 'Failed to fetch category details', 'error');
      setSessionExpired(true);
    } finally {
      setIsFetching(false);
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement> | { name: string; value: string },
  ) => {
    const { name, value } = 'target' in e ? e.target : e;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name === 'categoryCode') {
      setCodeValidationStatus('unchecked');
      setCodeExists(false);
      setCodeValidationError('');
    }
  };

  const checkCategoryCode = async () => {
    if (!formData.categoryCode.trim()) return;

    setIsValidatingCode(true);
    setCodeValidationStatus('unchecked');

    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setSessionExpired(true);
        throw new Error('No authentication token found.');
      }

      const payload = { categoryCode: formData.categoryCode.trim() };
      const bodyStr = JSON.stringify(payload);
      console.log('Validating category code:', formData.categoryCode.trim());
      console.log('Payload:', payload);
      console.log('Body string:', bodyStr);

      const response = await fetch(
        'https://kelvinmms.com:8443/api-gateway-mms/master-service/mMSMasterController/checkByCategoryCode',
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: bodyStr,
        },
      );
      console.log("checkCategoryCode :",response);

      if (!response.ok) {
        setSessionExpired(true);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API response data:', data);

      if (data.success === false) {
        setCodeValidationStatus('invalid');
        setCodeExists(true);
        setCodeValidationError(data.message || 'Category Code already exists');
        setFormData((prev) => ({ ...prev, categoryCode: '' }));
        addCategoryCodeRef.current?.focus();
        showToast('Category Code already exists. Enter different category code', 'error');
      } else if (data.success === true) {
        setCodeValidationStatus('valid');
        setCodeExists(false);
        setCodeValidationError('');
        showToast('Category Code is available', 'success');
        addCategoryNameRef.current?.focus();
      }
    } catch (error) {
      console.error('Error validating category code:', error);
      setCodeValidationStatus('unchecked');
      showToast('Error validating category code', 'error');
      addCategoryCodeRef.current?.focus();
      setSessionExpired(true);
    } finally {
      setIsValidatingCode(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.categoryCode.trim()) errors.categoryCode = 'Category Code is required';
    if (codeExists) errors.categoryCode = codeValidationError || 'Category Code already exists';
    if (!formData.categoryName.trim()) errors.categoryName = 'Category Name is required';

    setValidationErrors(errors);

    // Focus on first error field
    if (errors.categoryCode && addModalOpen) {
      addCategoryCodeRef.current?.focus();
    } else if (errors.categoryName && addModalOpen) {
      addCategoryNameRef.current?.focus();
    } else if (errors.categoryName && modifyModalOpen) {
      modifyCategoryNameRef.current?.focus();
    }

    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async () => {
    if (!validateForm()) {
      showToast('Please fix the validation errors before saving', 'error');
      return;
    }

    if (addModalOpen && codeValidationStatus !== 'valid') {
      showToast('Please validate the Category Code before saving', 'error');
      addCategoryCodeRef.current?.focus();
      return;
    }

    let payload: any = {};
    let endpoint = '';

    if (selectedRecord) {
      // Modify
      endpoint = 'https://kelvinmms.com:8443/api-gateway-mms/master-service/mMSMasterController/categoryMasterModify';
      payload = {
        id: selectedRecord.id,
        categoryName: formData.categoryName,
        updatedBy: credentials.userId,
      };
    } else {
      // Add
      endpoint = 'https://kelvinmms.com:8443/api-gateway-mms/master-service/mMSMasterController/catagoryMasterSave';
      payload = {
        categoryCode: formData.categoryCode,
        categoryName: formData.categoryName,
        createdBy: credentials.userId,
      };
    }

    try {
      setIsFetching(true);
      const token = sessionStorage.getItem('token');
      if (!token) {
        setSessionExpired(true);
        throw new Error('No authentication token found.');
      }
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setSessionExpired(true)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      const isSuccess = data.success === true;

      if (!isSuccess && data.message?.includes('Session expired')) {
        setSessionExpired(true);
      }

      const message = data.message || (isSuccess ? (selectedRecord ? 'Category updated successfully' : 'Category added successfully') : 'Failed to save category');
      showToast(message, isSuccess ? 'success' : 'error');

      if (isSuccess) {
        await fetchCategoryData();
        setAddModalOpen(false);
        setModifyModalOpen(false);
        setSelectedRecord(null);
      }
    } catch (error: any) {
      console.error('Error saving category:', error);
      showToast(error.message || 'Failed to save category', 'error');
      setSessionExpired(true)
    } finally {
      setIsFetching(false);
    }
  };

  const handleToggleStatus = async (record: HistoryRecord) => {
    if (!record.id) {
      showToast('No id provided for the selected record.', 'error');
      return;
    }

    const newDisplayStatus = record.status === 'Active' ? 'In-Active' : 'Active';
    const newApiStatus = newDisplayStatus === 'Active' ? 'A' : 'I';

    setHistoryRecords((prev) =>
      prev.map((item) => (item.entryNo === record.entryNo ? { ...item, isToggling: true } : item)),
    );

    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setSessionExpired(true);
        throw new Error('No authentication token found.');
      }
      const payload = {
        id: record.id,
        status: newApiStatus,
      };

      const response = await fetch(
        'https://kelvinmms.com:8443/api-gateway-mms/master-service/mMSMasterController/categoryStatusUpdate',
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        setSessionExpired(true)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      const isSuccess = data.success === true;

      if (!isSuccess && data.message?.includes('Session expired')) {
        setSessionExpired(true);
      }

      if (isSuccess) {
        await fetchCategoryData();
        showToast(`Category status updated to ${newDisplayStatus}`, 'success');
      } else {
        const message = data.message || 'Failed to update status';
        showToast(message, 'error');
        setHistoryRecords((prev) =>
          prev.map((item) =>
            item.entryNo === record.entryNo ? { ...item, isToggling: false } : item,
          ),
        );
      }
    } catch (error: any) {
      console.error('Error updating category status:', error);
      showToast(error.message || 'Failed to update category status', 'error');
      setHistoryRecords((prev) =>
        prev.map((item) =>
          item.entryNo === record.entryNo ? { ...item, isToggling: false } : item,
        ),
      );
      setSessionExpired(true)
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'In-Active':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };



  const showErrorMessage = (message: string) => {
    showToast(message, 'error');
  };


  const renderPagination = () => {
    const totalPages = Math.ceil(sortedAndFilteredRecords.length / itemsPerPage);

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">Items per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {[5, 10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-300">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
          {Math.min(currentPage * itemsPerPage, sortedAndFilteredRecords.length)} of{' '}
          {sortedAndFilteredRecords.length} records
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md text-sm ${
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
            className={`px-3 py-1 rounded-md text-sm ${
              currentPage === 1
                ? 'text-gray-400 cursor-not-allowed dark:text-gray-500'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            title="Previous Page"
          >
            ‹
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNumber: number;
            if (currentPage <= 3) {
              pageNumber = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + i;
            } else {
              pageNumber = currentPage - 2 + i;
            }

            if (pageNumber < 1 || pageNumber > totalPages) return null;

            return (
              <button
                key={pageNumber}
                onClick={() => setCurrentPage(pageNumber)}
                className={`w-8 h-8 rounded-md flex items-center justify-center text-sm ${
                  currentPage === pageNumber
                    ? 'bg-indigo-600 text-white dark:bg-indigo-700'
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
            className={`px-3 py-1 rounded-md text-sm ${
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
            className={`px-3 py-1 rounded-md text-sm ${
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

  const customizerContextValue = useMemo(
    () => ({
      isDarkMode,
      toggleDarkMode,
      isCardShadow: true,
      isBorderRadius: 8,
    }),
    [isDarkMode, toggleDarkMode]
  );

  return (
    <CustomizerContext.Provider
      value={customizerContextValue}
    >
      <ShadcnCard
        className={`card mx-auto max-w-[1050px] ${
          isDarkMode ? 'dark:shadow-dark-md shadow-md p-0' : 'shadow-md p-0'
        } rounded-lg overflow-hidden`}
        style={{ borderRadius: '8px' }}
      >
        <div className="px-6 pt-4 pb-2 dark:border-gray-700">
          {sessionExpired && <SessionExpiredModal />}
          <div className="flex items-center justify-between">
            <h6 className="text-xl font-semibold bg-gradient-to-r from-[#3949AB] to-[#2F3D8F] bg-clip-text text-transparent dark:from-[#7857FF] dark:to-[#5E3CFF]">
              Category Creation
            </h6>
            <Tooltip content="Add new category" placement="bottom">
              <Button
                color="blue"
                className="w-8 h-8 rounded-full flex items-center justify-center p-0 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-indigo-500"
                onClick={handleAddClick}
                disabled={isFetching}
              >
                {isFetching ? (
                  <div className="animate-spin">⏳</div>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                )}
              </Button>
            </Tooltip>
          </div>
        </div>

        <div className="p-6">

          <div className="flex justify-end mb-4">
            <AnimatedSearch
              value={searchTerm}
              onInputChange={setSearchTerm}
              onSearch={() => console.log('Explicit search:', searchTerm)}
              placeholder="Filter records..."
            />
          </div>

          {isTableLoading ? (
            <div className="text-center py-8">
              <Spinner size="xl" className="text-indigo-600" />
              <p className="text-gray-500 dark:text-gray-400 mt-2">Loading category records...</p>
            </div>
          ) : (
            <>
              <div className="bg-white border border-gray-200 shadow-sm overflow-hidden dark:bg-gray-800 dark:border-gray-700 rounded-lg">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gradient-to-r from-[#3949AB] to-[#2F3D8F] dark:from-[#7857FF] dark:to-[#5E3CFF]">
                      <tr>
                        {renderTableHeader('entryNo', 'S.No.')}
                        {renderTableHeader('categoryCode', 'Category Code')}
                        {renderTableHeader('categoryName', 'Category Name')}
                        {renderTableHeader('status', 'Status')}
                        {renderTableHeader('lastActDate', 'User Detail')}
                        <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                          Modify
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                      {sortedAndFilteredRecords.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                          >
                            <div className="flex flex-col items-center">
                              <svg
                                className="w-12 h-12 text-gray-300 mb-4 dark:text-gray-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              <p className="text-sm font-medium dark:text-gray-300">
                                No records found
                              </p>
                              <p className="text-xs text-gray-400 mt-1 dark:text-gray-500">
                                Try adjusting your search criteria
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedRecords.map((record, index) => (
                          <tr
                            key={`${record.entryNo}-${index}`}
                            className="hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors duration-150"
                          >
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200 font-medium">
                              {record.entryNo}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/50 px-2.5 py-1 rounded-md">
                                {record.categoryCode}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200 font-medium">
                              {record.categoryName}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                  record.status,
                                )}`}
                              >
                                {record.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 font-medium">
                              <div>{record.emailId}</div>
                              <div>{record.lastActDate}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-left">
                              <button
                                onClick={() => handleModifyRecord(record)}
                                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 p-1.5 rounded-full hover:bg-green-100 dark:hover:bg-green-900 transition-colors duration-150"
                                title="Modify Record"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center">
                              <ToggleSwitch
                                checked={record.status === 'Active'}
                                onChange={() => handleToggleStatus(record)}
                                disabled={record.isToggling}
                                color={record.status === 'Active' ? 'success' : 'failure'}
                                className="transition-all duration-300 ease-in-out"
                              />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {sortedAndFilteredRecords.length > 0 && renderPagination()}
            </>
          )}
        </div>

        <Modal show={addModalOpen} size="lg" onClose={() => setAddModalOpen(false)} popup>
          <ModalHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Add New Category
            </h3>
          </ModalHeader>
          <ModalBody className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="add-categoryCode" className="text-sm font-medium">
                      Category Code <span className="text-red-500">*</span>
                    </Label>
                  </div>
                  <TextInput
                    id="add-categoryCode"
                    name="categoryCode"
                    placeholder='Enter Category Code'
                    value={formData.categoryCode}
                    maxLength={30}
                    onChange={handleFormChange}
                    onBlur={checkCategoryCode}
                    ref={addCategoryCodeRef}
                    className="rounded-md py-2.5 px-3 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    color={
                      validationErrors.categoryCode || codeValidationError ? 'failure' : 'gray'
                    }
                    helperText={validationErrors.categoryCode || codeValidationError}
                  />
                  <div className="text-right">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {30 - formData.categoryCode.length} characters remaining
                    </span>
                  </div>
                </div>

                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="add-categoryName" className="text-sm font-medium">
                      Category Name <span className="text-red-500">*</span>
                    </Label>
                  </div>
                  <TextInput
                    id="add-categoryName"
                    name="categoryName"
                    placeholder='Enter Category Name'
                    maxLength={30}
                    value={formData.categoryName}
                    onChange={handleFormChange}
                    ref={addCategoryNameRef}
                    className="rounded-md py-2.5 px-3 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    color={validationErrors.categoryName ? 'failure' : 'gray'}
                    helperText={validationErrors.categoryName}
                  />
                  <div className="text-right">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {30 - formData.categoryName.length} characters remaining
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  color="gray" 
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 text-sm rounded-md bg-gray-600 hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </Button>
                <Button 
                  color="green" 
                  onClick={handleFormSubmit} 
                  disabled={isFetching || codeValidationStatus !== 'valid'}
                  className="px-4 py-2 text-sm rounded-md focus:ring-2 focus:ring-green-500"
                >
                  {isFetching ? (
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
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </Button>
              </div>
            </div>
          </ModalBody>
        </Modal>

        <Modal show={modifyModalOpen} size="lg" onClose={() => setModifyModalOpen(false)} popup>
          <ModalHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Modify Category</h3>
          </ModalHeader>
          <ModalBody className="p-6">
            {isFetching ? (
              <div className="flex justify-center items-center py-8">
                <Spinner size="xl" className="text-indigo-600" />
                <span className="ml-3 text-gray-600 dark:text-gray-300 text-sm">
                  Loading record details...
                </span>
              </div>
            ) : (
              <div className="space-y-6">

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <div className="mb-2 block">
                      <Label htmlFor="modify-categoryCode" className="text-sm font-medium">
                        Category Code <span className="text-red-500">*</span>
                      </Label>
                    </div>
                    <Input
                      id="modify-categoryCode"
                      name="categoryCode"
                      value={formData.categoryCode}
                      maxLength={30}
                      onChange={handleFormChange}
                      disabled={true}
                      readOnly
                      className="rounded-md py-2.5 px-3 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-gray-100 cursor-not-allowed"
                      color={validationErrors.categoryCode ? 'failure' : 'gray'}
                      helperText={validationErrors.categoryCode}
                    />
                  </div>

                  <div>
                    <div className="mb-2 block">
                      <Label htmlFor="modify-categoryName" className="text-sm font-medium">
                        Category Name <span className="text-red-500">*</span>
                      </Label>
                    </div>
                    <Input
                      id="modify-categoryName"
                      name="categoryName"
                      placeholder='Enter Category Name'
                      maxLength={30}
                      value={formData.categoryName}
                      onChange={handleFormChange}
                      ref={modifyCategoryNameRef}
                      className="rounded-md py-2.5 px-3 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      color={validationErrors.categoryName ? 'failure' : 'gray'}
                      helperText={validationErrors.categoryName}
                    />
                    <div className="text-right">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {30 - formData.categoryName.length} characters remaining
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    color="gray" 
                    onClick={() => setModifyModalOpen(false)}
                    className="px-4 py-2 text-sm rounded-md bg-gray-600 hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button 
                    color="green" 
                    onClick={handleFormSubmit} 
                    disabled={isFetching}
                    className="px-4 py-2 text-sm rounded-md focus:ring-2 focus:ring-green-500"
                  >
                    {isFetching ? (
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
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </ModalBody>
        </Modal>
        <Toastify />
      </ShadcnCard>
    </CustomizerContext.Provider>
  );
};

export default CategoryMaster;