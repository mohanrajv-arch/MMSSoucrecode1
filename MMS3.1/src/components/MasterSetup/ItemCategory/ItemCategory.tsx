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
import { useAuth, useCredentials } from 'src/context/AuthContext';
import { Dialog, DialogPanel, DialogTitle, Input } from '@headlessui/react';
import { CheckCircle, XCircle, Edit2 } from 'lucide-react';
import AnimatedSearch from 'src/components/Spa Components/Search';
import Toastify, { showToast } from 'src/components/Spa Components/Toastify';


// Define interfaces
interface HistoryRecord {
  entryNo: string;
  status: string;
  lastActDate: string;
  itemCode: string;
  itemName: string;
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

const ItemCategory: React.FC = () => {
  useEffect(() => {
    document.title = 'Item Category';
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
    itemCode: '',
    itemName: '',
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
  const addItemCodeRef = useRef<HTMLInputElement>(null);
  const addItemNameRef = useRef<HTMLInputElement>(null);
  const modifyItemNameRef = useRef<HTMLInputElement>(null);

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

  // Function to fetch item category data
  const fetchItemCategoryData = async () => {
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
        'https://kelvinmms.com:8443/api-gateway-mms/master-service/mMSMasterController/itemCategoryMasterList',
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
              itemCode: item.itemCode || '',
              itemName: item.itemName || '',
              emailId: item.userEmail || '',
              id: item.id,
              select: false,
              isToggling: false,
            };
          },
        );
        setHistoryRecords(mappedRecords);
      } else {
        showToast('No item category records found in the response', 'error');
        setSessionExpired(true);
      }
    } catch (error: any) {
      console.error('Error loading item category records:', error);
      showToast(error.message || 'Failed to load item category records', 'error');
      setSessionExpired(true)
    } finally {
      setIsTableLoading(false);
    }
  };

  // Fetch initial item category data on mount
  useEffect(() => {
    fetchItemCategoryData();
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
      itemCode: '',
      itemName: '',
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
        `https://kelvinmms.com:8443/api-gateway-mms/master-service/mMSMasterController/itemCategoryViewById/${record.id}`,
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
          itemCode: data.data.itemCode || '',
          itemName: data.data.itemName || '',
        });
        setSelectedRecord({ ...record, id: data.data.id });
        setModifyModalOpen(true);
        setValidationErrors({});
      } else {
        throw new Error('No data found for the record.');
      }
    } catch (error: any) {
      console.error('Error fetching item category details:', error);
      showToast(error.message || 'Failed to fetch item category details', 'error');
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

    if (name === 'itemCode') {
      setCodeValidationStatus('unchecked');
      setCodeExists(false);
      setCodeValidationError('');
    }
  };

  const checkItemCode = async () => {
    if (!formData.itemCode.trim()) return;

    setIsValidatingCode(true);
    setCodeValidationStatus('unchecked');

    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setSessionExpired(true);
        throw new Error('No authentication token found.');
      }

      const payload = { itemCode: formData.itemCode.trim() };
      const bodyStr = JSON.stringify(payload);
      console.log('Request Body for Code Validation:', bodyStr);

      const response = await fetch(
        'https://kelvinmms.com:8443/api-gateway-mms/master-service/mMSMasterController/checkByCode',
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: bodyStr,
        },
      );
      console.log('Response Status for Code Validation:', response);

      if (!response.ok) {
        setSessionExpired(true);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success === false) {
        setCodeValidationStatus('invalid');
        setCodeExists(true);
        setCodeValidationError(data.message || 'Item Code already exists');
        setFormData((prev) => ({ ...prev, itemCode: '' }));
        addItemCodeRef.current?.focus();
        showToast('Item Code already exists. Enter different item code', 'error');
      } else if (data.success === true) {
        setCodeValidationStatus('valid');
        setCodeExists(false);
        setCodeValidationError('');
        showToast('Item Code is available', 'success');
        addItemNameRef.current?.focus();
      }
    } catch (error) {
      console.error('Error validating item code:', error);
      setCodeValidationStatus('unchecked');
      showToast('Error validating item code', 'error');
      addItemCodeRef.current?.focus();
      setSessionExpired(true);
    } finally {
      setIsValidatingCode(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.itemCode.trim()) errors.itemCode = 'Item Code is required';
    if (codeExists) errors.itemCode = codeValidationError || 'Item Code already exists';
    if (!formData.itemName.trim()) errors.itemName = 'Item Name is required';

    setValidationErrors(errors);

    // Focus on first error field
    if (errors.itemCode && addModalOpen) {
      addItemCodeRef.current?.focus();
    } else if (errors.itemName && addModalOpen) {
      addItemNameRef.current?.focus();
    } else if (errors.itemName && modifyModalOpen) {
      modifyItemNameRef.current?.focus();
    }

    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async () => {
    if (!validateForm()) {
      showToast('Please fix the validation errors before saving', 'error');
      return;
    }

    if (addModalOpen && codeValidationStatus !== 'valid') {
      showToast('Please validate the Item Code before saving', 'error');
      addItemCodeRef.current?.focus();
      return;
    }

    let payload: any = {};
    let endpoint = '';

    if (selectedRecord) {
      // Modify
      endpoint = 'https://kelvinmms.com:8443/api-gateway-mms/master-service/mMSMasterController/itemCategoryMasterModify';
      payload = {
        id: selectedRecord.id,
        itemName: formData.itemName,
        updatedBy: credentials.userId,
      };
    } else {
      // Add
      endpoint = 'https://kelvinmms.com:8443/api-gateway-mms/master-service/mMSMasterController/itemCatagoryMasterSave';
      payload = {
        itemCode: formData.itemCode,
        itemName: formData.itemName,
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

      const message = data.message || (isSuccess ? (selectedRecord ? 'Item category updated successfully' : 'Item category added successfully') : 'Failed to save item category');
      showToast(message, isSuccess ? 'success' : 'error');

      if (isSuccess) {
        await fetchItemCategoryData();
        setAddModalOpen(false);
        setModifyModalOpen(false);
        setSelectedRecord(null);
      }
    } catch (error: any) {
      console.error('Error saving item category:', error);
      showToast(error.message || 'Failed to save item category', 'error');
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
        'https://kelvinmms.com:8443/api-gateway-mms/master-service/mMSMasterController/itemCategoryStatusUpdate',
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
        await fetchItemCategoryData();
        showToast(`Item category status updated to ${newDisplayStatus}`, 'success');
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
      console.error('Error updating item category status:', error);
      showToast(error.message || 'Failed to update item category status', 'error');
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
              Item Category Creation
            </h6>
            <Tooltip content="Add new item category" placement="bottom">
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
              <p className="text-gray-500 dark:text-gray-400 mt-2">Loading item category records...</p>
            </div>
          ) : (
            <>
              <div className="bg-white border border-gray-200 shadow-sm overflow-hidden dark:bg-gray-800 dark:border-gray-700 rounded-lg">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gradient-to-r from-[#3949AB] to-[#2F3D8F] dark:from-[#7857FF] dark:to-[#5E3CFF]">
                      <tr>
                        {renderTableHeader('entryNo', 'S.No.')}
                        {renderTableHeader('itemCode', 'Item Code')}
                        {renderTableHeader('itemName', 'Item Name')}
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
                                {record.itemCode}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200 font-medium">
                              {record.itemName}
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
              Add New Item Category
            </h3>
          </ModalHeader>
          <ModalBody className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="add-itemCode" className="text-sm font-medium">
                      Item Code <span className="text-red-500">*</span>
                    </Label>
                  </div>
                  <TextInput
                    id="add-itemCode"
                    name="itemCode"
                    placeholder='Enter Item Code'
                    value={formData.itemCode}
                    maxLength={30}
                    onChange={handleFormChange}
                    onBlur={checkItemCode}
                    ref={addItemCodeRef}
                    className="rounded-md py-2.5 px-3 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    color={
                      validationErrors.itemCode || codeValidationError ? 'failure' : 'gray'
                    }
                    helperText={validationErrors.itemCode || codeValidationError}
                  />
                  <div className="text-right">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {30 - formData.itemCode.length} characters remaining
                    </span>
                  </div>
                </div>

                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="add-itemName" className="text-sm font-medium">
                      Item Name <span className="text-red-500">*</span>
                    </Label>
                  </div>
                  <TextInput
                    id="add-itemName"
                    name="itemName"
                    placeholder='Enter Item Name'
                    maxLength={30}
                    value={formData.itemName}
                    onChange={handleFormChange}
                    ref={addItemNameRef}
                    className="rounded-md py-2.5 px-3 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    color={validationErrors.itemName ? 'failure' : 'gray'}
                    helperText={validationErrors.itemName}
                  />
                  <div className="text-right">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {30 - formData.itemName.length} characters remaining
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Modify Item Category</h3>
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
                      <Label htmlFor="modify-itemCode" className="text-sm font-medium">
                        Item Code <span className="text-red-500">*</span>
                      </Label>
                    </div>
                    <Input
                      id="modify-itemCode"
                      name="itemCode"
                      value={formData.itemCode}
                      maxLength={30}
                      onChange={handleFormChange}
                      disabled={true}
                      readOnly
                      className="rounded-md py-2.5 px-3 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-gray-100 cursor-not-allowed"
                      color={validationErrors.itemCode ? 'failure' : 'gray'}
                      helperText={validationErrors.itemCode}
                    />
                    <div className="text-right">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {30 - formData.itemCode.length} characters remaining
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 block">
                      <Label htmlFor="modify-itemName" className="text-sm font-medium">
                        Item Name <span className="text-red-500">*</span>
                      </Label>
                    </div>
                    <Input
                      id="modify-itemName"
                      name="itemName"
                      placeholder='Enter Item Name'
                      maxLength={30}
                      value={formData.itemName}
                      onChange={handleFormChange}
                      ref={modifyItemNameRef}
                      className="rounded-md py-2.5 px-3 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      color={validationErrors.itemName ? 'failure' : 'gray'}
                      helperText={validationErrors.itemName}
                    />
                    <div className="text-right">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {30 - formData.itemName.length} characters remaining
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

export default ItemCategory;