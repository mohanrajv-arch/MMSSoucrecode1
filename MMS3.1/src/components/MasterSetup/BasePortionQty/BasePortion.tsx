import React, { createContext, useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  Label,
  Button,
  Tooltip,
  Alert,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ToggleSwitch,
  TextInput,
} from 'flowbite-react';
import { Card as ShadcnCard } from 'src/components/shadcn-ui/Default-Ui/card';
import { useAuth, useCredentials, useFormatAmount, useFormatDate, useFormatQuantity } from 'src/context/AuthContext';
import { Dialog, DialogPanel, DialogTitle, Input } from '@headlessui/react';
import { CheckCircle, XCircle, Edit2 } from 'lucide-react';
import AnimatedSearch from 'src/components/Spa Components/Search';
import Toastify, { showToast } from 'src/components/Spa Components/Toastify';

// Define interfaces
interface HistoryRecord {
  entryNo: string;
  status: string;
  lastActDate: string;
  quantity: string;
  emailId: string;
  id?: number;
  select?: boolean;
  isToggling?: boolean;
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

const BasePortion: React.FC = () => {
  useEffect(() => {
    document.title = 'Base Portion Quantity';
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
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);

  
    
      const formatDate = useFormatDate();
      const formatAmount = useFormatAmount();
      const formatQuantity = useFormatQuantity();

  // Form state
  const [formData, setFormData] = useState({
    quantity: '',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

    const { credentials, projectSettings } = useAuth();

  // Code validation states
  const [isValidatingQuantity, setIsValidatingQuantity] = useState(false);
  const [quantityValidationStatus, setQuantityValidationStatus] = useState<
    'valid' | 'invalid' | 'unchecked'
  >('unchecked');
  const [quantityExists, setQuantityExists] = useState(false);
  const [quantityValidationError, setQuantityValidationError] = useState('');


  //Session modal
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);

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
  
   const SessionExpiredModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Session Expired</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Your session has expired. Please login again to continue.
        </p>
        <button
          onClick={() => {
            localStorage.removeItem('LoginToken');
            sessionStorage.removeItem('LoginToken');
            navigate('/');
          }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Go to Login
        </button>
      </div>
    </div>
  );

const navigate = useNavigate()
  // Refs for focusing inputs
  const addQuantityRef = useRef<HTMLInputElement>(null);

  // Helper function to format date from API response
  const formatDateFromApi = (apiDate: string): string => {
    if (!apiDate) return '';

    try {
      const dateObj = new Date(apiDate);
      if (isNaN(dateObj.getTime())) {
        throw new Error('Invalid date');
      }

      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = dateObj.getFullYear();
      const hours = String(dateObj.getHours()).padStart(2, '0');
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      const seconds = String(dateObj.getSeconds()).padStart(2, '0');

      return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return apiDate;
    }
  };

  // Function to fetch base portion quantity data
  const fetchBasePortionQuantityData = async () => {
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
        'https://kelvinmms.com:8443/api-gateway-mms/master-service/mMSMasterController/basePortionQuantityMasterList',
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
              quantity: item.quantity?.toString() || '',
              emailId: item.emailId || '',
              id: item.id,
              select: false,
              isToggling: false,
            };
          },
        );
        setHistoryRecords(mappedRecords);
      } else {
        const msg = 'No base portion quantity records found in the response.';
        showToast(msg, 'error');
        setSessionExpired(true);
      }
    } catch (error: any) {
      console.error('Error loading base portion quantity records:', error);
      showToast(error.message || 'Failed to load base portion quantity records', 'error');
      setSessionExpired(true)
    } finally {
      setIsTableLoading(false);
    }
  };

  // Fetch initial base portion quantity data on mount
  useEffect(() => {
    fetchBasePortionQuantityData();
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
      const parseDate = (dateStr: string) => {
        // Assumes format "dd-mm-yyyy hh:mm:ss"
        const [datePart, timePart] = dateStr.split(' ');
        if (!datePart || !timePart) return 0;
        const [day, month, year] = datePart.split('-').map(Number);
        const [hours, minutes, seconds] = timePart.split(':').map(Number);
        return new Date(year, month - 1, day, hours, minutes, seconds).getTime();
      };
      const dateA = parseDate(a.lastActDate);
      const dateB = parseDate(b.lastActDate);
      return direction === 'ascending' ? dateA - dateB : dateB - dateA;
    };

    const compareStringField = (a: HistoryRecord, b: HistoryRecord, key: SortableField, direction: SortDirection) => {
      const valueA = String(a[key] ?? '').toLowerCase();
      const valueB = String(b[key] ?? '').toLowerCase();
      if (valueA < valueB) return direction === 'ascending' ? -1 : 1;
      if (valueA > valueB) return direction === 'ascending' ? 1 : -1;
      return 0;
    };

    const compareQuantity = (a: HistoryRecord, b: HistoryRecord, direction: SortDirection) => {
      const numA = parseFloat(a.quantity || '0');
      const numB = parseFloat(b.quantity || '0');
      return direction === 'ascending' ? numA - numB : numB - numA;
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

      if (key === 'quantity') {
        return compareQuantity(a, b, direction);
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
      quantity: '',
    });
    setAddModalOpen(true);
    setValidationErrors({});
    setQuantityValidationStatus('unchecked');
    setQuantityExists(false);
    setQuantityValidationError('');
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

    if (name === 'quantity') {
      setQuantityValidationStatus('unchecked');
      setQuantityExists(false);
      setQuantityValidationError('');
    }
  };

  const checkQuantity = async () => {
    const qtyValue = parseFloat(formData.quantity);
    if (!formData.quantity.trim() || isNaN(qtyValue)) return;

    setIsValidatingQuantity(true);
    setQuantityValidationStatus('unchecked');

    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setSessionExpired(true);
        throw new Error('No authentication token found.');
      }
      const response = await fetch(
        'https://kelvinmms.com:8443/api-gateway-mms/master-service/mMSMasterController/checkQty',
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity: qtyValue }),
        },
      );

      if (!response.ok) {
        setSessionExpired(true);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success === false) {
        setQuantityValidationStatus('invalid');
        setQuantityExists(true);
        setQuantityValidationError(data.message || 'Quantity already exists');
        setFormData((prev) => ({ ...prev, quantity: '' }));
        addQuantityRef.current?.focus();
        showToast('Quantity already exists. Enter different quantity', 'error');
      } else if (data.success === true) {
        setQuantityValidationStatus('valid');
        setQuantityExists(false);
        setQuantityValidationError('');
        showToast('Quantity is available', 'success');
      }
    } catch (error) {
      console.error('Error validating quantity:', error);
      setQuantityValidationStatus('unchecked');
      showToast('Error validating quantity', 'error');
      setSessionExpired(true);
      addQuantityRef.current?.focus();
    } finally {
      setIsValidatingQuantity(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.quantity.trim()) errors.quantity = 'Quantity is required';
    if (quantityExists) errors.quantity = quantityValidationError || 'Quantity already exists';

    setValidationErrors(errors);

    // Focus on first error field
    if (errors.quantity && addModalOpen) {
      addQuantityRef.current?.focus();
    }

    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async () => {
    if (!validateForm()) {
      showToast('Please fix the validation errors before saving', 'error');
      return;
    }

    const qtyValue = parseFloat(formData.quantity);
    if (isNaN(qtyValue)) {
      showToast('Invalid quantity value', 'error');
      return;
    }

    if (addModalOpen && quantityValidationStatus !== 'valid') {
      showToast('Please validate the Quantity before saving', 'error');
      addQuantityRef.current?.focus();
      return;
    }

    let payload: any = {};
    let endpoint = '';

    if (selectedRecord) {
      // Modify
      endpoint = 'https://kelvinmms.com:8443/api-gateway-mms/master-service/mMSMasterController/basePortionQuantityModify';
      payload = {
        id: selectedRecord.id,
        quantity: qtyValue,
        updatedBy: credentials.userId,
      };
    } else {
      // Add
      endpoint = 'https://kelvinmms.com:8443/api-gateway-mms/master-service/mMSMasterController/saveBasePortionQuantityMaster';
      payload = {
        quantity: qtyValue,
        createdBy: credentials.userId,
      };
    }

    try {
      setIsFetching(true);
      const token = sessionStorage.getItem('token');
      if (!token) {
        setSessionExpired(true)
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

      const message = data.message || (isSuccess ? (selectedRecord ? 'Base portion quantity updated successfully' : 'Base portion quantity added successfully') : 'Failed to save base portion quantity');
      showToast(message, isSuccess ? 'success' : 'error');

      if (isSuccess) {
        await fetchBasePortionQuantityData();
        setAddModalOpen(false);
        setSelectedRecord(null);
      }
    } catch (error: any) {
      console.error('Error saving base portion quantity:', error);
      showToast(error.message || 'Failed to save base portion quantity', 'error');
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
        'https://kelvinmms.com:8443/api-gateway-mms/master-service/mMSMasterController/basePortionQuantityStatusUpdate',
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
        await fetchBasePortionQuantityData();
        showToast(`Base portion quantity status updated to ${newDisplayStatus}`, 'success');
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
      console.error('Error updating base portion quantity status:', error);
      showToast(error.message || 'Failed to update base portion quantity status', 'error');
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
              Base Portion Quantity Creation
            </h6>
            <Tooltip content="Add new base portion quantity" placement="bottom">
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
              <p className="text-gray-500 dark:text-gray-400 mt-2">Loading base portion quantity records...</p>
            </div>
          ) : (
            <>
              <div className="bg-white border border-gray-200 shadow-sm overflow-hidden dark:bg-gray-800 dark:border-gray-700 rounded-lg">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gradient-to-r from-[#3949AB] to-[#2F3D8F] dark:from-[#7857FF] dark:to-[#5E3CFF]">
                      <tr>
                        {renderTableHeader('entryNo', 'S.No.')}
                        {renderTableHeader('quantity', 'Quantity')}
                        {renderTableHeader('status', 'Status')}
                        {renderTableHeader('lastActDate', 'User Detail')}
                        <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                      {sortedAndFilteredRecords.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
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
                                {formatQuantity(record.quantity || 0, projectSettings?.quantityDecimalPlaces || 2)}
                              </span>
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
              Add New Base Portion Quantity
            </h3>
          </ModalHeader>
          <ModalBody className="p-6">
            <div className="space-y-6">
              {/* {Object.keys(validationErrors).length > 0 && (
                <Alert color="failure" className="mb-4 rounded-md">
                  <div className="flex flex-col gap-1 text-sm">
                    {Object.entries(validationErrors).map(([field, message]) => (
                      <span key={field}>• {message}</span>
                    ))}
                  </div>
                </Alert>
              )} */}

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="add-quantity" className="text-sm font-medium">
                      Quantity <span className="text-red-500">*</span>
                    </Label>
                  </div>
                  <div className="relative">
                    <TextInput
                      id="add-quantity"
                      name="quantity"
                      placeholder='Enter the quantity'
                      value={formData.quantity}
                      onChange={handleFormChange}
                      onBlur={checkQuantity}
                      ref={addQuantityRef}
                      className="rounded-md py-2.5 px-3 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      color={
                        validationErrors.quantity || quantityValidationError ? 'failure' : 'gray'
                      }
                      helperText={validationErrors.quantity || quantityValidationError}
                    />
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
                  disabled={isFetching || quantityValidationStatus !== 'valid'}
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

        <Toastify />
      </ShadcnCard>
    </CustomizerContext.Provider>
  );
};

export default BasePortion;