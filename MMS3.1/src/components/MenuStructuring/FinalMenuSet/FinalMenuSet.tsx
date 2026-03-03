import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronDown, Search, RefreshCw, Eye, Edit, Copy, Download, Plus, 
  X, CheckCircle, AlertCircle, Layers, CheckCircle as CheckIcon,
  Clock, DollarSign, Menu as MenuIcon, ChevronRight, Loader2
} from "lucide-react";
import { useAuth, useCredentials, useFormatAmount, useFormatDate } from "src/context/AuthContext";
import { BiMoney } from "react-icons/bi";

const baseUrl = 'https://kelvinmms.com:8443/api-gateway-mms/menu-creation-service/finalMenuSetController';
const templateBaseUrl = 'https://kelvinmms.com:8443/api-gateway-mms/menu-creation-service/finalMenuSetController';

const statusOptions = [
  { value: null, label: "All Status" },
  { value: 0, label: "Approved" },
  { value: 1, label: "Pending" },
  { value: 2, label: "Rejected" },
  { value: 3, label: "Draft" }
];

const activeOptions = [
  { value: null, label: "All Active Status" },
  { value: 'A', label: "Active" },
  { value: 'I', label: "Inactive" }
];

const FinalMenuSet = () => {
  const [mealTypes, setMealTypes] = useState([]);
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedActiveStatus, setSelectedActiveStatus] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [isCopyConfirmed, setIsCopyConfirmed] = useState(false);
  const [templatesData, setTemplatesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [generalModal, setGeneralModal] = useState({ isOpen: false, type: 'success', message: '' });
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedForApproval, setSelectedForApproval] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [isTogglingStatus, setIsTogglingStatus] = useState({});
  const [expandedDetails, setExpandedDetails] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  // NEW STATE: Track copying state
  const [isCopying, setIsCopying] = useState(false);

  const credentials = useCredentials();
  const userId = credentials?.userId || 0;

  const { projectSettings } = useAuth();
  const formatDate = useFormatDate();
  const formatAmount = useFormatAmount();

  const navigate = useNavigate();

  const mealTypeOptions = [{ pk: null, name: "All Meal Type" }, ...mealTypes];
  const itemsPerPage = 15;

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

  // General Status Modal
  const GeneralStatusModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
        <div className="flex justify-center mb-4">
          {generalModal.type === 'success' ? (
            <CheckCircle className="h-12 w-12 text-green-500" />
          ) : (
            <AlertCircle className="h-12 w-12 text-red-500" />
          )}
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {generalModal.type === 'success' ? 'Success!' : 'Error!'}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{generalModal.message}</p>
        <button
          onClick={() => setGeneralModal({ isOpen: false, type: 'success', message: '' })}
          className={`px-4 py-2 text-white rounded-lg hover:opacity-90 transition ${
            generalModal.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          OK
        </button>
      </div>
    </div>
  );

  // Copy Loading Modal Component
  const CopyLoadingModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Loader2 className="h-16 w-16 text-blue-600 dark:text-blue-400 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Copy className="h-8 w-8 text-blue-500 dark:text-blue-300" />
            </div>
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Copying Menu...</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Please wait while we create a copy of "{selectedRecipe?.finalMenuName || selectedRecipe?.templateName || 'the menu'}"
        </p>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
          <div className="bg-blue-600 h-2 rounded-full animate-pulse"></div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">This may take a few seconds</p>
      </div>
    </div>
  );

  const handleDownloadError = async (response) => {
    if (!response.ok) {
      if (response.status === 401) {
        setSessionExpired(true);
        return true;
      }
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
        if (data.success === false && data.message === "Session expired or invalid. Please login again.") {
          setSessionExpired(true);
          return true;
        }
      } catch (e) {}
      throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
    }
    return false;
  };

  const validateBlob = async (blob) => {
    const bytes = new Uint8Array(await blob.slice(0, 8).arrayBuffer());
    if (bytes[0] === 80 && bytes[1] === 75 && bytes[2] === 3 && bytes[3] === 4) return '.xlsx';
    else if (bytes[0] === 208 && bytes[1] === 207 && bytes[2] === 17 && bytes[3] === 224 && bytes[4] === 161 && bytes[5] === 177 && bytes[6] === 26 && bytes[7] === 225) return '.xls';
    return null;
  };

  // Enhanced Individual template download using /viewDownload with path param
  const handleViewDownload = async (templateId) => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      setSessionExpired(true);
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/viewDownload/${templateId}/${credentials.userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        await handleDownloadError(response);
        return;
      }

      const blob = await response.blob();
      const extension = await validateBlob(blob);
      const filename = `final-menu-${templateId}${extension || '.xlsx'}`;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setGeneralModal({ isOpen: true, type: 'success', message: 'Menu downloaded successfully!' });
    } catch (error) {
      setGeneralModal({ isOpen: true, type: 'error', message: `Download failed: ${error.message}. Please contact support.` });
    }
  };

  // Enhanced Bulk list download using /listDownload with dynamic body
  const handleListDownload = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      setSessionExpired(true);
      return;
    }

    try {
      const body = { 
        mealTypeFk: selectedMealType || null, 
        approvalStatus: selectedStatus,
        status: selectedActiveStatus || null,
        createdBy: credentials.userId || null
      };
      
      const response = await fetch(`${baseUrl}/listDownload`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        await handleDownloadError(response);
        return;
      }

      const blob = await response.blob();
      const extension = await validateBlob(blob);
      const filename = `final-menus-list${extension || '.xlsx'}`;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setGeneralModal({ isOpen: true, type: 'success', message: 'Menus list downloaded successfully!' });
    } catch (error) {
      setGeneralModal({ isOpen: true, type: 'error', message: `Download failed: ${error.message}. Please contact support.` });
    }
  };

  const fetchMealTypes = async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`${baseUrl}/loadMealTypeDropDown`, { method: 'GET' });
      if (data.success && data.data && Array.isArray(data.data)) {
        setMealTypes(data.data);
      } else {
        setGeneralModal({ isOpen: true, type: 'error', message: 'No meal types records found in the response.' });
      }
    } catch (error) {
      console.error(error);
      setSessionExpired(true);
    } finally {
      setLoading(false);
    }
  };

  const processTemplatesData = (rawData) => {
    if (!rawData || !rawData.finalSetMenuList) return rawData;
    return {
      ...rawData,
      finalSetMenuList: rawData.finalSetMenuList.map(item => ({
        ...item,
        approverBy: userId,
        approver: item.approver || { id: userId }
      }))
    };
  };

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const body = { mealTypeFk: null, approvalStatus: null };
      const data = await apiFetch(`${baseUrl}/finalMenuList`, {
        method: "POST",
        body: JSON.stringify(body)
      });
      if (data.success) {
        const processedData = processTemplatesData(data.data);
        setTemplatesData(processedData);
      } else {
        setGeneralModal({ isOpen: true, type: 'error', message: data.message || 'Failed to fetch final menus.' });
      }
    } catch (error) {
      console.error(error);
      setSessionExpired(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplatesDropdown = async (mealTypeFk) => {
    if (mealTypeFk) {
      try {
        const data = await apiFetch(`${templateBaseUrl}/loadMealSetTemplateDropDown/${mealTypeFk}`, { method: 'GET' });
        if (data.success && data.data) {
          setTemplates(data.data);
        }
      } catch (error) {
        console.error('Error fetching templates dropdown:', error);
        setSessionExpired(true);
      }
    }
  };

  // UPDATED: handleCopyTemplate with loading state
  const handleCopyTemplate = async () => {
    if (!newTemplateName.trim()) {
      setGeneralModal({ isOpen: true, type: 'error', message: 'Please enter a new menu name.' });
      return;
    }

    // Start loading
    setIsCopying(true);

    try {
      const body = {
        id: selectedRecipe.id,
        newMenuName: newTemplateName.trim(),
        createdBy: userId
      };
      const data = await apiFetch(`${baseUrl}/copyFinalMenuSet`, {
        method: "POST",
        body: JSON.stringify(body)
      });
      if (data.success) {
        setGeneralModal({ isOpen: true, type: 'success', message: 'Final menu copied successfully!' });
        setShowCopyModal(false);
        setNewTemplateName('');
        setIsCopyConfirmed(false);
        fetchTemplates();
      } else {
        setGeneralModal({ isOpen: true, type: 'error', message: data.message || 'Failed to copy final menu.' });
      }
    } catch (error) {
      console.error(error);
      setSessionExpired(true);
      setGeneralModal({ isOpen: true, type: 'error', message: `Copy failed: ${error.message}` });
    } finally {
      // Stop loading regardless of success or failure
      setIsCopying(false);
    }
  };

  const handleUpdateApprovalStatus = async (approvalStatus) => {
    if (!selectedForApproval) return;

    try {
      const body = {
        id: selectedForApproval.id,
        approvalStatus,
        approverBy: userId
      };
      const data = await apiFetch(`${baseUrl}/finalSetMenuApprovalStatus`, {
        method: "POST",
        body: JSON.stringify(body)
      });
      if (data.success) {
        setGeneralModal({ isOpen: true, type: 'success', message: 'Approval status updated successfully!' });
        setShowApprovalModal(false);
        setSelectedForApproval(null);
        fetchTemplates();
      } else {
        setGeneralModal({ isOpen: true, type: 'error', message: data.message || 'Failed to update approval status.' });
      }
    } catch (error) {
      console.error(error);
      setSessionExpired(true);
    }
  };

  // Enhanced status toggle function
  const handleToggleStatus = async (menu) => {
    if (!menu.id) {
      setGeneralModal({ isOpen: true, type: 'error', message: 'No id provided for the selected menu.' });
      return;
    }

    const newStatus = menu.status === 'A' ? 'I' : 'A';
    setIsTogglingStatus(prev => ({ ...prev, [menu.id]: true }));

    try {
      const body = {
        id: menu.id,
        status: newStatus
      };

      const data = await apiFetch(`${baseUrl}/finalMenuSetStatusUpdate`, {
        method: "POST",
        body: JSON.stringify(body)
      });

      if (data.success) {
        setGeneralModal({ isOpen: true, type: 'success', message: `Final menu ${newStatus === 'A' ? 'activated' : 'deactivated'} successfully!` });
        fetchTemplates();
      } else {
        setGeneralModal({ isOpen: true, type: 'error', message: data.message || 'Failed to update final menu status.' });
      }
    } catch (error) {
      console.error(error);
      setSessionExpired(true);
    } finally {
      setIsTogglingStatus(prev => ({ ...prev, [menu.id]: false }));
    }
  };

  // Check if actions should be disabled based on approval status
  const getActionPermissions = (approvalStatusStr) => {
    const status = approvalStatusStr?.toLowerCase();
    
    switch (status) {
      case 'approved':
        return {
          view: true,
          edit: false,
          copy: true,
          approval: false,
          download: true
        };
      case 'rejected':
        return {
          view: true,
          edit: false,
          copy: true,
          approval: false,
          download: true
        };
      case 'draft':
        return {
          view: true,
          edit: true,
          copy: true,
          approval: true,
          download: true
        };
      case 'pending':
        return {
          view: true,
          edit: true,
          copy: true,
          approval: true,
          download: true
        };
      default:
        return {
          view: true,
          edit: true,
          copy: true,
          approval: true,
          download: true
        };
    }
  };

  // Get card theme based on meal type
  const getMealTypeTheme = (mealType) => {
    const type = (mealType || '').toUpperCase();
    if (type.includes('DINNER')) {
      return {
        bg: 'bg-indigo-50 dark:bg-indigo-900/20',
        text: 'text-indigo-800 dark:text-indigo-200',
        badgeBg: 'bg-indigo-100 dark:bg-indigo-800/50',
        badgeText: 'text-indigo-700 dark:text-indigo-300'
      };
    } else if (type.includes('LUNCH')) {
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        text: 'text-emerald-800 dark:text-emerald-200',
        badgeBg: 'bg-emerald-100 dark:bg-emerald-800/50',
        badgeText: 'text-emerald-700 dark:text-emerald-300'
      };
    } else if (type.includes('BREAKFAST')) {
      return {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        text: 'text-orange-800 dark:text-orange-200',
        badgeBg: 'bg-orange-100 dark:bg-orange-800/50',
        badgeText: 'text-orange-700 dark:text-orange-300'
      };
    }
    return {
      bg: 'bg-gray-50 dark:bg-gray-700',
      text: 'text-gray-800 dark:text-gray-200',
      badgeBg: 'bg-gray-100 dark:bg-gray-600',
      badgeText: 'text-gray-700 dark:text-gray-300'
    };
  };

  useEffect(() => {
    fetchMealTypes();
    fetchTemplates();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchTemplatesDropdown(selectedMealType);
  }, [selectedMealType]);

  useEffect(() => {
    if (selectedRecipe) {
      setNewTemplateName(`Copy of ${selectedRecipe.finalMenuName || selectedRecipe.templateName}`);
    }
  }, [selectedRecipe]);

  const baseList = templatesData?.finalSetMenuList || [];
  const selectedMealTypeName = selectedMealType ? mealTypeOptions.find(o => o.pk === selectedMealType)?.name : null;

  const filteredMenus = React.useMemo(() => {
    return baseList.filter((menu) =>
      (!selectedMealType || menu.detailList?.some(d => d.mealTypeName === selectedMealTypeName)) &&
      (selectedStatus === null || menu.approvalStatus === selectedStatus) &&
      (selectedActiveStatus === null || menu.status === selectedActiveStatus) &&
      (menu.finalMenuName || menu.templateName || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [templatesData, selectedMealType, selectedStatus, selectedActiveStatus, searchQuery, selectedMealTypeName, mealTypeOptions]);

  const totalPages = Math.ceil(filteredMenus.length / itemsPerPage);
  const paginatedMenus = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMenus.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMenus, currentPage]);

  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  const handleRefresh = () => {
    setSearchQuery("");
    setSelectedMealType(null);
    setSelectedStatus(null);
    setSelectedActiveStatus(null);
    setOpenDropdown(null);
    setCurrentPage(1);
    fetchTemplates();
  };

  const getStatusColor = (statusStr) => {
    switch (statusStr?.toLowerCase()) {
      case 'approved': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800';
      case 'pending': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800';
      case 'rejected': return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800';
      case 'draft': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600';
    }
  };

  const PaginationComponent = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('...');
      }
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <button
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-600"
        >
          First
        </button>
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-600"
        >
          Previous
        </button>
        {pages.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-sm text-gray-500">...</span>
            ) : (
              <button
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                  currentPage === page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-600'
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-600"
        >
          Next
        </button>
        <button
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-600"
        >
          Last
        </button>
        <span className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
          Page {currentPage} of {totalPages}
        </span>
      </div>
    );
  };

  if (loading && !templatesData) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">Loading...</div>;
  }

  const activePercentage = templatesData ? ((templatesData.activeMenu / templatesData.totalMenu) * 100 || 0).toFixed(2) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {sessionExpired && <SessionExpiredModal />}
      {generalModal.isOpen && <GeneralStatusModal />}
      {/* ADDED: Show copy loading modal when copying */}
      {isCopying && <CopyLoadingModal />}
      
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200 shadow-sm">
        <div className="py-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white truncate">Final Menu Set</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage your final menu sets efficiently</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="flex items-center gap-1 bg-yellow-100 dark:bg-gray-700 hover:bg-yellow-200 px-3 py-2 dark:hover:bg-gray-600 text-yellow-700 dark:text-gray-300 rounded-lg transition-all duration-200 shadow-sm"
              title="Reload"
              onClick={handleRefresh}
            >
              <RefreshCw size={18} />
            </button>
            <button 
              onClick={handleListDownload}
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              title="Export"
            >
              <Download size={18} />
            </button>
            <button 
              onClick={() => navigate('/Transaction/AddFinalMenu')}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-300 dark:bg-blue-900/20 p-4 rounded-xl shadow-md border border-blue-200 dark:border-blue-800 flex items-center gap-3 hover:shadow-lg transition-shadow">
            <Layers className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Menus</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{templatesData?.totalMenu || 0}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">All final menu sets</p>
            </div>
          </div>
          <div className="bg-green-300 dark:bg-green-900/20 p-4 rounded-xl shadow-md border border-green-200 dark:border-green-800 flex items-center gap-3 hover:shadow-lg transition-shadow">
            <CheckIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-green-600 dark:text-green-400 text-sm font-medium">Active Menu</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{templatesData?.activeMenu || 0}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">{activePercentage}% active</p>
            </div>
          </div>
          <div className="bg-yellow-300 dark:bg-yellow-900/20 p-4 rounded-xl shadow-md border border-yellow-200 dark:border-yellow-800 flex items-center gap-3 hover:shadow-lg transition-shadow">
            <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{templatesData?.pendingApproval || 0}</p>
            </div>
          </div>
          <div className="bg-purple-300 dark:bg-purple-900/20 p-4 rounded-xl shadow-md border border-purple-200 dark:border-purple-800 flex items-center gap-3 hover:shadow-lg transition-shadow">
            <BiMoney className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <div>
              <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Avg. Cost</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{formatAmount(templatesData?.averageCost || 0, projectSettings?.costDecimalPlaces || 2)} </p> 
              <p className="text-gray-500 dark:text-gray-400 text-xs">Per menu</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 py-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="relative">
            <button
              onClick={() => toggleDropdown('mealType')}
              className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-left flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 text-gray-700 dark:text-gray-300 text-sm shadow-sm hover:shadow-md relative"
            >
              <span className="truncate">{mealTypeOptions.find(o => o.pk === selectedMealType)?.name || "All Meal Type"}</span>
              <ChevronDown size={16} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
            </button>
            {openDropdown === 'mealType' && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-xl max-h-60 overflow-y-auto top-full left-0">
                {mealTypeOptions.map((opt) => (
                  <button
                    key={opt.pk || 'all'}
                    onClick={() => {
                      setSelectedMealType(opt.pk);
                      setOpenDropdown(null);
                    }}
                    className="w-full px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-all duration-200 text-sm"
                  >
                    {opt.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => toggleDropdown('status')}
              className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-left flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 text-gray-700 dark:text-gray-300 text-sm shadow-sm hover:shadow-md relative"
            >
              <span className="truncate">{statusOptions.find(o => o.value === selectedStatus)?.label || "All Status"}</span>
              <ChevronDown size={16} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
            </button>
            {openDropdown === 'status' && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-xl max-h-60 overflow-y-auto top-full left-0">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value || 'all'}
                    onClick={() => {
                      setSelectedStatus(opt.value);
                      setOpenDropdown(null);
                    }}
                    className="w-full px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-all duration-200 text-sm"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => toggleDropdown('active')}
              className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-left flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 text-gray-700 dark:text-gray-300 text-sm shadow-sm hover:shadow-md relative"
            >
              <span className="truncate">{activeOptions.find(o => o.value === selectedActiveStatus)?.label || "All Active Status"}</span>
              <ChevronDown size={16} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
            </button>
            {openDropdown === 'active' && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-xl max-h-60 overflow-y-auto top-full left-0">
                {activeOptions.map((opt) => (
                  <button
                    key={opt.value || 'all'}
                    onClick={() => {
                      setSelectedActiveStatus(opt.value);
                      setOpenDropdown(null);
                    }}
                    className="w-full px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-all duration-200 text-sm"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 z-10" size={16} />
            <input
              type="text"
              placeholder="Search menus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm shadow-sm hover:shadow-md relative"
            />
          </div>
        </div>
      </div>

      <div className="py-5 relative z-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {paginatedMenus.map((menu) => {
            const statusColorClass = getStatusColor(menu.approvalStatusStr);
            const isDisabled = menu.status === 'I';
            const permissions = getActionPermissions(menu.approvalStatusStr);
            const theme = getMealTypeTheme(menu.detailList?.[0]?.mealTypeName);
            const totalRecipes = menu.recipeCount || (menu.detailList || []).reduce((acc, d) => acc + (d.recipeCount || 0), 0) || 0;
            const totalCost = menu.totalCost || 0;
            const detailList = menu.detailList || [];
            
            return (
              <div 
                key={menu.id} 
                className={`relative bg-white dark:bg-gray-800 ${theme.bg} border border-gray-200 dark:border-gray-700 border-t-4 border-t-blue-900 shadow-md hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden flex flex-col h-full`}
              >
                {/* Subtle blur overlay for inactive cards */}
                {isDisabled && (
                  <div className="absolute inset-0 bg-gray-200/20 dark:bg-gray-700/20 backdrop-blur-sm z-10 rounded-xl"></div>
                )}
                
                {/* Header with Menu Name and Status - Enhanced Navy Blue Background */}
                <div className={`p-3.5 bg-gradient-to-r from-blue-900 to-blue-800 dark:from-blue-800 dark:to-blue-700 border-b border-blue-700 flex-shrink-0 relative z-20 ${isDisabled ? 'opacity-80' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`font-bold text-sm leading-tight flex-1 break-words text-white whitespace-normal ${isDisabled ? 'text-blue-200' : ''}`}>
                      {menu.finalMenuName || menu.templateName || 'Unnamed Menu'}
                    </h3>
                    <span className={`${statusColorClass} text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 whitespace-nowrap shadow-sm ${isDisabled ? 'opacity-80' : ''}`}>
                      {menu.approvalStatusStr || 'Unknown'}
                    </span>
                  </div>
                </div>
                
                {/* Content Area - Blurred subtly if inactive */}
                <div className="p-3.5 flex-1 flex flex-col relative z-20 space-y-3.5">
                  {/* Main content - subtle blur when disabled */}
                  <div className={`space-y-3 ${isDisabled ? 'blur-[0.5px] opacity-90' : ''}`}>
                    {/* Total Recipes and Total Cost with Enhanced Badges */}
                    <div className="grid grid-cols-2 gap-3 mb-3.5">
                      <div className="space-y-1.5">
                        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">Total Recipes</div>
                        <span className={`text-xs font-bold px-2.5 py-1.5 dark:from-orange-900/20 dark:to-orange-800/30 text-orange-700 dark:text-orange-300 dark:border-orange-800`}>
                          {totalRecipes}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">Total Cost</div>
                        <span className={`text-xs font-bold px-2.5 py-1.5 dark:from-emerald-900/20 dark:to-emerald-800/30 text-emerald-700 dark:text-emerald-300 dark:border-emerald-800`}>
                          {formatAmount(totalCost || 0, projectSettings?.costDecimalPlaces || 2)}
                        </span>
                      </div>
                    </div>
                     <div className="space-y-1.5">
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">Created  <span className="text-xs font-bold  text-blue-700 dark:text-gray-300 px-2.5 py-1.5  dark:border-gray-600">
                        {formatDate(menu.createdDate)}
                      </span></div>
                    
                    </div>
                    {/* Enhanced Meal Breakdown Section */}
                    <div className="flex-1 space-y-2.5">
                      <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2.5 flex items-center gap-1">
                        <span>MEAL BREAKDOWN:</span>
                      </div>
                      <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                        {detailList.map((detail, index) => {
                          const detailKey = `${menu.id}-${index}`;
                          const isExpanded = expandedDetails.has(detailKey);
                          const handleToggleDetail = () => {
                            setExpandedDetails(prev => {
                              const newSet = new Set(prev);
                              if (isExpanded) {
                                newSet.delete(detailKey);
                              } else {
                                newSet.add(detailKey);
                              }
                              return newSet;
                            });
                          };
                          return (
                            <div 
                              key={index} 
                              className={`flex items-start justify-between py-2 px-2 text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors hover:bg-gray-100 dark:hover:bg-gray-600 ${
                                isDisabled ? 'opacity-80' : ''
                              }`}
                            >
                              <span 
                                className="flex-1 text-xs font-semibold break-words whitespace-normal pr-2 text-gray-800 dark:text-gray-200 cursor-pointer hover:text-blue-600 flex items-center"
                                onClick={handleToggleDetail}
                              >
                                {`${detail.mealTypeName || 'Unknown'}`}
                                <ChevronRight 
                                  size={10} 
                                  className={`inline ml-1 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
                                />
                              </span>
                              {isExpanded && (
                                <span className="flex-1 text-xs break-words whitespace-normal pr-2 text-gray-600 dark:text-gray-400 italic">
                                  {`${detail.menuName || 'No Sub-Menu'}`}
                                </span>
                              )}
                            </div>
                          );
                        })}
                        {detailList.length === 0 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-3 bg-gray-50 dark:bg-gray-700 rounded-lg">No meal details available</div>
                        )}
                      </div>
                    </div>

                    {/* Enhanced Created Date with Badge */}
                   
                  </div>

                  {/* Action Buttons - No blur, higher z-index, enhanced styling */}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 relative z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-b-xl">
                    <div className="flex gap-1.5 flex-wrap">
                      {/* View Button */}
                      <button 
                        onClick={() => navigate('/Transaction/ViewFinalMenu', { state: { id: menu.id } })} 
                        className={`p-2 rounded-full transition-all shadow-md ${
                          isDisabled
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:shadow-lg'
                        }`}
                        title="View"
                        disabled={isDisabled}
                      >
                        <Eye size={14} />
                      </button>
                      
                      {/* Edit Button */}
                      <button 
                        onClick={() => navigate(`/Transaction/ModifyFinalMenu/${menu.id}`)} 
                        className={`p-2 rounded-full transition-all shadow-md ${
                          !permissions.edit || isDisabled
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 hover:shadow-lg'
                        }`}
                        title="Edit"
                        disabled={!permissions.edit || isDisabled}
                      >
                        <Edit size={14} />
                      </button>
                      
                      {/* Copy Button */}
                      <button 
                        onClick={() => {
                          setSelectedRecipe(menu);
                          setShowCopyModal(true);
                        }} 
                        className={`p-2 rounded-full transition-all shadow-md ${
                          !permissions.copy || isDisabled
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:shadow-lg'
                        }`}
                        title="Copy"
                        disabled={!permissions.copy || isDisabled}
                      >
                        <Copy size={14} />
                      </button>
                      
                      {/* Approval Button */}
                      <button 
                        onClick={() => {
                          setSelectedForApproval(menu);
                          setShowApprovalModal(true);
                        }} 
                        className={`p-2 rounded-full transition-all shadow-md ${
                          !permissions.approval || isDisabled
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-lg'
                        }`}
                        title="Approval Status"
                        disabled={!permissions.approval || isDisabled}
                      >
                        <CheckCircle size={14} />
                      </button>
                      
                      {/* Download Button - Triggers /viewDownload/{id} */}
                      <button 
                        onClick={() => handleViewDownload(menu.id)}
                        className={`p-2 rounded-full transition-all shadow-md ${
                          !permissions.download || isDisabled
                            ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed bg-gray-100 dark:bg-gray-700'
                            : 'text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20'
                        }`}
                        title="Download"
                        disabled={!permissions.download || isDisabled}
                      >
                        <Download size={14} />
                      </button>
                    </div>
                    
                    {/* Status Toggle Button - Highest z-index, no blur, enhanced */}
                    <button
                      onClick={() => handleToggleStatus(menu)}
                      disabled={isTogglingStatus[menu.id]}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold transition-all shadow-md border relative z-50 ${
                        menu.status === 'A' 
                          ? 'bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/40 text-green-700 dark:text-green-300 hover:from-green-200 hover:to-green-300 dark:hover:from-green-900/50 dark:hover:to-green-800/60 border-green-200 dark:border-green-800' 
                          : 'bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/40 text-red-700 dark:text-red-300 hover:from-red-200 hover:to-red-300 dark:hover:from-red-900/50 dark:hover:to-red-800/60 border-red-200 dark:border-red-800'
                      } ${isTogglingStatus[menu.id] ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isTogglingStatus[menu.id] ? (
                        <RefreshCw size={12} className="animate-spin" />
                      ) : (
                        <CheckCircle size={12} />
                      )}
                      {menu.status === 'A' ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredMenus.length === 0 && !loading && (
          <div className="text-center py-8 sm:py-12">
            <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6 sm:p-8 max-w-sm mx-auto shadow-xl">
              <MenuIcon className="text-gray-400 dark:text-gray-500 mx-auto mb-3" size={48} />
              <p className="text-gray-500 dark:text-gray-400 text-base font-semibold mb-1">No final menus found</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">Try adjusting your filters or search terms</p>
            </div>
          </div>
        )}

        {filteredMenus.length > 0 && <PaginationComponent />}
      </div>

      {/* Copy Modal - Enhanced with loading state */}
      {showCopyModal && selectedRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full transform scale-95 animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-700">
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
                {isCopying ? 'Copying Menu...' : 'Copy Final Menu'}
              </h3>
              {!isCopying && (
                <button onClick={() => setShowCopyModal(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-200">
                  <X size={20} />
                </button>
              )}
            </div>
            <div className="p-4 sm:p-6">
              {isCopying ? (
                <div className="text-center py-8">
                  <div className="flex justify-center mb-6">
                    <Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-400 animate-spin" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Creating Copy...</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Please wait while we copy "{selectedRecipe.finalMenuName || selectedRecipe.templateName}"
                  </p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-6">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse"></div>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 dark:text-gray-400 mb-2 text-sm sm:text-base">You are about to copy the final menu:</p>
                  <p className="font-semibold text-lg text-gray-900 dark:text-white mb-1">{selectedRecipe.finalMenuName || selectedRecipe.templateName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">ID. {selectedRecipe.id}</p>
                  
                  <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">New Menu Name *</label>
                  <input 
                    type="text" 
                    placeholder="Enter new menu name" 
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm hover:shadow-md"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-6">The new final menu will be created with this name</p>
                  
                  <div className="flex items-center mb-6">
                    <input 
                      type="checkbox" 
                      checked={isCopyConfirmed}
                      onChange={(e) => setIsCopyConfirmed(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 bg-white dark:bg-gray-700" 
                    />
                    <label className="ml-2 text-sm text-gray-600 dark:text-gray-400">I confirm that I want to create a copy of this final menu</label>
                  </div>
                </>
              )}
            </div>
            {!isCopying && (
              <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-end gap-3">
                <button 
                  onClick={() => setShowCopyModal(false)} 
                  className="w-full sm:w-auto px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 font-medium text-sm shadow-sm border border-gray-300 dark:border-gray-600 order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCopyTemplate} 
                  disabled={!isCopyConfirmed || !newTemplateName.trim()}
                  className={`w-full sm:w-auto px-4 py-2.5 rounded-xl transition-all duration-200 font-medium shadow-md text-sm order-1 sm:order-2 border ${
                    !isCopyConfirmed || !newTemplateName.trim()
                      ? 'bg-gray-400 text-gray-500 cursor-not-allowed border-gray-400'
                      : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:shadow-lg'
                  }`}
                >
                  Copy Final Menu
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Approval Modal */}
      {showApprovalModal && selectedForApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full border border-gray-200 dark:border-gray-700">
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">Update Approval Status</h3>
              <button onClick={() => setShowApprovalModal(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-200">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">Select the new approval status for:</p>
              <p className="font-semibold text-gray-900 dark:text-white mb-4 text-center">{selectedForApproval.finalMenuName || selectedForApproval.templateName}</p>
              
              <div className="grid grid-cols-1 gap-3 mb-4">
                {selectedForApproval.approvalStatusStr?.toLowerCase() === 'draft' && (
                  <button 
                    onClick={() => handleUpdateApprovalStatus(1)}
                    className="p-3.5 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/30 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl hover:from-yellow-100 hover:to-yellow-200 dark:hover:from-yellow-900/30 dark:hover:to-yellow-800/40 transition-all duration-200 text-yellow-700 dark:text-yellow-300 font-medium text-sm shadow-sm hover:shadow-md"
                  >
                    Mark as Pending
                  </button>
                )}
                <button 
                  onClick={() => handleUpdateApprovalStatus(0)}
                  className="p-3.5 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30 border-2 border-green-200 dark:border-green-800 rounded-xl hover:from-green-100 hover:to-green-200 dark:hover:from-green-900/30 dark:hover:to-green-800/40 transition-all duration-200 text-green-700 dark:text-green-300 font-medium text-sm shadow-sm hover:shadow-md"
                >
                  Approve
                </button>
                <button 
                  onClick={() => handleUpdateApprovalStatus(2)}
                  className="p-3.5 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/30 border-2 border-red-200 dark:border-red-800 rounded-xl hover:from-red-100 hover:to-red-200 dark:hover:from-red-900/30 dark:hover:to-red-800/40 transition-all duration-200 text-red-700 dark:text-red-300 font-medium text-sm shadow-sm hover:shadow-md"
                >
                  Reject
                </button>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Current Status: <span className="font-semibold">{selectedForApproval.approvalStatusStr}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalMenuSet;