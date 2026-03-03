import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronDown, Search, RefreshCw, Eye, Edit, Copy, Download, Plus, 
  X, CheckCircle, ChevronUp, ChefHat, AlertCircle, Layers, CheckCircle as CheckIcon,
  Clock, DollarSign
} from "lucide-react";
import { useAuth, useFormatDate, useFormatAmount, useCredentials } from "src/context/AuthContext";
import { BiCategory, BiMoney } from "react-icons/bi";
import { IconCurrencyDirham } from "@tabler/icons-react";

const baseUrl = 'https://kelvinmms.com:8443/api-gateway-mms/meal-set-template-services/mealSetTemplateController';

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

const MealSetTemplate = () => {
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
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isTogglingStatus, setIsTogglingStatus] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const { projectSettings } = useAuth();
  const formatDate = useFormatDate();
  const formatAmount = useFormatAmount();
  const credentials = useCredentials();
  const userId = credentials?.userId || 0;

  const navigate = useNavigate();


  const mealTypeOptions = [{ pk: null, name: "All Meal Type" }, ...mealTypes];
  const itemsPerPage = 15;

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

  // Session Expired Modal Component (exactly like MealSetMenu)
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

  // General Status Modal (like CopyStatusModal)
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

  // Centralised Download Error Handler
  const handleDownloadError = async (response) => {
    if (response.status === 401) {
      setSessionExpired(true);
      return true;
    }

    const text = await response.text();
    let data;
    try { 
      data = JSON.parse(text); 
    } catch (_) {}

    if (data?.success === false && data?.message?.includes('Session expired')) {
      setSessionExpired(true);
      return true;
    }

    let errorMsg = 'Unknown error';
    if (data) {
      errorMsg = data.error || data.message || errorMsg;
    } else {
      errorMsg = text;
    }

    setGeneralModal({
      isOpen: true,
      type: 'error',
      message: `Download failed (${response.status}): ${errorMsg}`,
    });
    return true;
  };

  // Single Template Download (View/Download)
  const handleViewDownload = async (templateId) => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      setSessionExpired(true);
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/viewDownload?templateId=${templateId}&userId=${credentials.userId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const handled = await handleDownloadError(response);
        if (handled) return;
      }

      const blob = await response.blob();
      const arrayBuffer = await blob.slice(0, 8).arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let ext = '';
      if (bytes[0] === 80 && bytes[1] === 75 && bytes[2] === 3 && bytes[3] === 4) ext = '.xlsx';
      else if (
        bytes[0] === 208 && bytes[1] === 207 && bytes[2] === 17 && bytes[3] === 224 &&
        bytes[4] === 161 && bytes[5] === 177 && bytes[6] === 26 && bytes[7] === 225
      ) ext = '.xls';

      const filename = `meal-template-${templateId}${ext || '.xlsx'}`;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setGeneralModal({ isOpen: true, type: 'success', message: 'Template downloaded successfully!' });
    } catch (err) {
      setGeneralModal({
        isOpen: true,
        type: 'error',
        message: `Download failed: ${err.message || 'Network error'}`,
      });
    }
  };

  // List Download
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
        createdBy: credentials.userId || null
      };

      console.log('List Download Body:', body);
      const response = await fetch(`${baseUrl}/listDownload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const handled = await handleDownloadError(response);
        if (handled) return;
      }

      const blob = await response.blob();
      const arrayBuffer = await blob.slice(0, 8).arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let ext = '';
      if (bytes[0] === 80 && bytes[1] === 75 && bytes[2] === 3 && bytes[3] === 4) ext = '.xlsx';
      else if (
        bytes[0] === 208 && bytes[1] === 207 && bytes[2] === 17 && bytes[3] === 224 &&
        bytes[4] === 161 && bytes[5] === 177 && bytes[6] === 26 && bytes[7] === 225
      ) ext = '.xls';

      const filename = `meal-templates-list${ext || '.xlsx'}`;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setGeneralModal({ isOpen: true, type: 'success', message: 'Templates list downloaded successfully!' });
    } catch (err) {
      setGeneralModal({
        isOpen: true,
        type: 'error',
        message: `List download failed: ${err.message || 'Network error'}`,
      });
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

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const body = {
        mealTypeFk: null,
        approvalStatus: null
      };
      const data = await apiFetch(`${baseUrl}/mealSetTemplateList`, {
        method: "POST",
        body: JSON.stringify(body)
      });
      if (data.success) {
        setTemplatesData(data.data);
      } else {
        setGeneralModal({ isOpen: true, type: 'error', message: data.message || 'Failed to fetch templates.' });
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      setSessionExpired(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTemplate = async () => {
    if (!newTemplateName.trim()) {
      setGeneralModal({ isOpen: true, type: 'error', message: 'Please enter a new template name.' });
      return;
    }

    try {
      const body = {
        id: selectedRecipe.id,
        newTemplateName: newTemplateName.trim(),
        approverBy: userId
      };
      const data = await apiFetch(`${baseUrl}/saveMealSetTemplateCopy`, {
        method: "POST",
        body: JSON.stringify(body)
      });
      if (data.success) {
        setGeneralModal({ isOpen: true, type: 'success', message: 'Template copied successfully!' });
        setShowCopyModal(false);
        setNewTemplateName('');
        setIsCopyConfirmed(false);
        fetchTemplates();
      } else {
        setGeneralModal({ isOpen: true, type: 'error', message: data.message || 'Failed to copy template.' });
      }
    } catch (error) {
      console.error('Error copying template:', error);
      setSessionExpired(true);
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
      const data = await apiFetch(`${baseUrl}/saveApprovalStatus`, {
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
      console.error('Error updating approval status:', error);
      setSessionExpired(true);
    }
  };

  // Enhanced status toggle function
  const handleToggleStatus = async (template) => {
    if (!template.id) {
      setGeneralModal({ isOpen: true, type: 'error', message: 'No id provided for the selected template.' });
      return;
    }

    const newStatus = template.status === 'A' ? 'I' : 'A';
    setIsTogglingStatus(prev => ({ ...prev, [template.id]: true }));

    try {
      const body = {
        id: template.id,
        status: newStatus
      };

      const data = await apiFetch(`${baseUrl}/mealSetStatusUpdate`, {
        method: "POST",
        body: JSON.stringify(body)
      });

      if (data.success) {
        setGeneralModal({ isOpen: true, type: 'success', message: `Template ${newStatus === 'A' ? 'activated' : 'deactivated'} successfully!` });
        fetchTemplates();
      } else {
        setGeneralModal({ isOpen: true, type: 'error', message: data.message || 'Failed to update template status.' });
      }
    } catch (error) {
      console.error(error);
      setSessionExpired(true);
    } finally {
      setIsTogglingStatus(prev => ({ ...prev, [template.id]: false }));
    }
  };

  const toggleCategories = (templateId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [templateId]: !prev[templateId]
    }));
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
  }, [selectedMealType, selectedStatus, selectedActiveStatus, searchQuery]);

  useEffect(() => {
    if (selectedRecipe) {
      setNewTemplateName(`Copy of ${selectedRecipe.templateName}`);
    }
  }, [selectedRecipe]);

  const baseList = templatesData?.mealSetTemplateList || [];
  const filteredMenus = React.useMemo(() => {
    const selectedMealTypeName = selectedMealType ? mealTypeOptions.find(o => o.pk === selectedMealType)?.name : null;
    return baseList.filter((menu) => 
      (!selectedMealType || menu.mealType === selectedMealTypeName) &&
      (selectedStatus === null || menu.approvalStatus === selectedStatus) &&
      (selectedActiveStatus === null || menu.status === selectedActiveStatus) &&
      (menu.templateName || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [templatesData, selectedMealType, selectedStatus, selectedActiveStatus, searchQuery, mealTypeOptions]);

  const totalPages = Math.ceil(filteredMenus.length / itemsPerPage);
  const paginatedMenus = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMenus.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMenus, currentPage]);

  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  const getStatusColor = (statusStr) => {
    switch (statusStr?.toLowerCase()) {
      case 'approved': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800';
      case 'pending': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800';
      case 'rejected': return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800';
      case 'draft': return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600';
    }
  };

  // Compute pending approvals count from total (unfiltered) if not provided by API
  const pendingApprovalCount = templatesData?.pendingApproval !== undefined 
    ? templatesData.pendingApproval 
    : baseList.filter(template => template.approvalStatus === 1).length;

  if (loading && !templatesData) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">Loading...</div>;
  }

  const activePercentageValue = templatesData ? ((templatesData.activeTemplate / templatesData.totalTemplate) * 100 || 0) : 0;
  const activePercentage = formatAmount(activePercentageValue, projectSettings?.decimalPlaces || 2) + '%';

  const avgCategoriesFormatted = formatAmount(templatesData?.avgCategories , 0);
  console.log('Avg Categories:', templatesData?.avgCategories, 'Formatted:', avgCategoriesFormatted);

  const handleRefresh = () => {
    setSearchQuery("");
    setSelectedMealType(null);
    setSelectedStatus(null);
    setSelectedActiveStatus(null);
    setOpenDropdown(null);
    setCurrentPage(1);
    fetchMealTypes();
    fetchTemplates();
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {sessionExpired && <SessionExpiredModal />}
      {generalModal.isOpen && <GeneralStatusModal />}
      
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white truncate">Meal Set Template</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage your meal set templates efficiently</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="flex items-center gap-1 bg-yellow-300 dark:bg-gray-700 hover:bg-gray-300 px-3 py-2 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200"
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
              onClick={() => navigate('/Transaction/AddMealTemplate')}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-200 dark:bg-blue-500 p-4 rounded-lg shadow border border-blue-200 dark:border-blue-800 flex items-center gap-3">
            <Layers className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Templates</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{templatesData?.totalTemplate || 0}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">All meal set templates</p>
            </div>
          </div>
          <div className="bg-green-200 dark:bg-green-900/20 p-4 rounded-lg shadow border border-green-200 dark:border-green-800 flex items-center gap-3">
            <CheckIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Active Templates</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{templatesData?.activeTemplate || 0}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">{activePercentage} active</p>
            </div>
          </div>
          <div className="bg-yellow-200 dark:bg-yellow-900/20 p-4 rounded-lg shadow border border-yellow-200 dark:border-yellow-800 flex items-center gap-3">
            <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{pendingApprovalCount}</p>
            </div>
          </div>
          <div className="bg-purple-200 dark:bg-purple-900/20 p-4 rounded-lg shadow border border-purple-200 dark:border-purple-800 flex items-center gap-3">
            <BiCategory className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Avg. Categories</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{avgCategoriesFormatted}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Per template</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200 relative">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
        
          <div className="relative">
            <button
              onClick={() => toggleDropdown('mealType')}
              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-left flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-500 transition-colors text-gray-700 dark:text-gray-300 text-sm relative"
            >
              <span className="truncate">{mealTypeOptions.find(o => o.pk === selectedMealType)?.name || "All Meal Type"}</span>
              <ChevronDown size={16} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
            </button>
            {openDropdown === 'mealType' && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto top-full left-0">
                {mealTypeOptions.map((opt) => (
                  <button
                    key={opt.pk || 'all'}
                    onClick={() => {
                      setSelectedMealType(opt.pk);
                      setOpenDropdown(null);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors text-sm"
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
              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-left flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-500 transition-colors text-gray-700 dark:text-gray-300 text-sm relative"
            >
              <span className="truncate">{statusOptions.find(o => o.value === selectedStatus)?.label || "All Status"}</span>
              <ChevronDown size={16} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
            </button>
            {openDropdown === 'status' && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto top-full left-0">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value || 'all'}
                    onClick={() => {
                      setSelectedStatus(opt.value);
                      setOpenDropdown(null);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors text-sm"
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
              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-left flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-500 transition-colors text-gray-700 dark:text-gray-300 text-sm relative"
            >
              <span className="truncate">{activeOptions.find(o => o.value === selectedActiveStatus)?.label || "All Active Status"}</span>
              <ChevronDown size={16} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
            </button>
            {openDropdown === 'active' && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto top-full left-0">
                {activeOptions.map((opt) => (
                  <button
                    key={opt.value || 'all'}
                    onClick={() => {
                      setSelectedActiveStatus(opt.value);
                      setOpenDropdown(null);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors text-sm"
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
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm relative"
            />
          </div>
        </div>
      </div>

      <div className="sm:py-4 relative z-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
          {paginatedMenus.map((template) => {
            const categoryTags = template.categoryList ? template.categoryList.map(cat => cat.categoriesName).filter(Boolean) : [];
            const statusColorClass = getStatusColor(template.approvalStatusStr);
            const isDisabled = template.status === 'I';
            const permissions = getActionPermissions(template.approvalStatusStr);
            const isCategoriesExpanded = expandedCategories[template.id];
            const theme = getMealTypeTheme(template.mealType);
            
            return (
              <div 
                key={template.id} 
                className={`relative bg-white dark:bg-gray-800 ${theme.bg} border border-blue-800 dark:border-blue-700 border-t-4 border-t-blue-700 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden flex flex-col h-full`}
              >
                {/* Blur overlay for inactive cards */}
                {isDisabled && (
                  <div className="absolute inset-0 bg-gray-200/20 dark:bg-gray-700/20 backdrop-blur-sm z-10 rounded-xl"></div>
                )}
                
                {/* Header with Template Name and Status - Navy Blue Background and Text */}
                <div className={`p-3 bg-blue-700 dark:bg-blue-500 border-b border-blue-700 flex-shrink-0 relative z-20 ${isDisabled ? 'opacity-80' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`font-bold text-sm leading-tight flex-1 line-clamp-2 break-words text-white ${isDisabled ? 'text-blue-200' : ''}`}>
                      {template.templateName}
                    </h3>
                    <span className={`${statusColorClass} text-xs px-2 py-1 rounded font-medium flex-shrink-0 whitespace-nowrap ${isDisabled ? 'opacity-80' : ''}`}>
                      {template.approvalStatusStr || 'Unknown'}
                    </span>
                  </div>
                </div>
                
                {/* Content Area */}
                <div className={`p-3 flex-1 flex flex-col relative z-20 ${isDisabled ? 'blur-[0.5px] opacity-90' : ''}`}>
                  {/* Enhanced Info Grid with Bold Values */}
                  <div className="grid grid-cols-2 gap-20 space-y-3">
                    <div className="space-y-1.5">
                      <div>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Meal Type</div>
                        <span className={`text-xs font-bold block truncate px-0.2 py-0.5 rounded ${theme.badgeText}`}>
                          {template.mealType || 'Unknown'}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Recipes</div>
                        <span className="text-xs font-bold px-0.2 py-0.5 rounded block  text-orange-700 dark:text-orange-300">
                          {template.totalRecipes || 0}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <div>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Categories</div>
                        <span className="text-xs font-bold px-0.2 py-0.5 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 ">
                          {template.totalCategories || 0}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Date</div>
                        <span className="text-xs font-bold dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-0.2 py-0.5 rounded font-medium block dark:border-gray-600">
                          {formatDate(template.createdDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Simplified Categories Section - Only count with arrow, toggle to show list */}
                  <div className="flex-1 mt-3">
                    <div className="flex items-center justify-between mb-1.5 cursor-pointer" onClick={() => toggleCategories(template.id)}>
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Categories ({categoryTags.length})
                      </div>
                      {categoryTags.length > 0 && (
                        <ChevronDown 
                          size={12} 
                          className={`transition-transform duration-200 ${isCategoriesExpanded ? 'rotate-180' : ''} text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300`} 
                        />
                      )}
                    </div>
                    
                    {isCategoriesExpanded && categoryTags.length > 0 && (
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2 border border-gray-200 dark:border-gray-600 max-h-24 overflow-y-auto">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {categoryTags.map((tag, index) => (
                            <span 
                              key={index} 
                              className="text-xs px-1.5 py-0.5 rounded font-medium whitespace-nowrap bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={() => toggleCategories(template.id)}
                          className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 mt-1 font-medium flex items-center gap-1"
                        >
                          <X size={10} /> Close
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons - Improved Spacing */}
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex gap-1 flex-wrap">
                      {/* View Button */}
                      <button 
                        onClick={() => navigate('/Transaction/ViewMealTemplate', { state: { id: template.id } })} 
                        className={`p-1.5 rounded-lg transition-all shadow-sm ${
                          isDisabled
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md'
                        }`}
                        title="View"
                        disabled={isDisabled}
                      >
                        <Eye size={12} />
                      </button>
                      
                      {/* Edit Button */}
                      <button 
                        onClick={() => navigate('/Transaction/ModifyMealTemplate', { state: { id: template.id } })} 
                        className={`p-1.5 rounded-lg transition-all shadow-sm ${
                          !permissions.edit || isDisabled
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md'
                        }`}
                        title="Edit"
                        disabled={!permissions.edit || isDisabled}
                      >
                        <Edit size={12} />
                      </button>
                      
                      {/* Copy Button */}
                      <button 
                        onClick={() => {
                          setSelectedRecipe(template);
                          setShowCopyModal(true);
                        }} 
                        className={`p-1.5 rounded-lg transition-all shadow-sm ${
                          !permissions.copy || isDisabled
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'bg-gray-100 dark:bg-gray-700 text-green-600 dark:text-green-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md'
                        }`}
                        title="Copy"
                        disabled={!permissions.copy || isDisabled}
                      >
                        <Copy size={12} />
                      </button>
                      
                      {/* Approval Button */}
                      <button 
                        onClick={() => {
                          setSelectedForApproval(template);
                          setShowApprovalModal(true);
                        }} 
                        className={`p-1.5 rounded-lg transition-all shadow-sm ${
                          !permissions.approval || isDisabled
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md'
                        }`}
                        title="Approval Status"
                        disabled={!permissions.approval || isDisabled}
                      >
                        <CheckCircle size={12} />
                      </button>
                      
                      {/* Download Button */}
                      <button 
                        onClick={() => handleViewDownload(template.id)}
                        className={`p-1.5 rounded-lg transition-all shadow-sm ${
                          !permissions.download || isDisabled
                            ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed bg-gray-100 dark:bg-gray-700'
                            : 'text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20'
                        }`}
                        title="Download"
                        disabled={!permissions.download || isDisabled}
                      >
                        <Download size={12} />
                      </button>
                    </div>
                    
                    {/* Status Toggle Button */}
                    <button
                      onClick={() => handleToggleStatus(template)}
                      disabled={isTogglingStatus[template.id]}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-semibold transition-all shadow-sm border ${
                        template.status === 'A' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 border-green-200 dark:border-green-800' 
                          : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30 border-red-200 dark:border-red-800'
                      } ${isTogglingStatus[template.id] ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isTogglingStatus[template.id] ? (
                        <RefreshCw size={10} className="animate-spin" />
                      ) : (
                        <CheckCircle size={10} />
                      )}
                      {template.status === 'A' ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredMenus.length === 0 && !loading && (
          <div className="text-center py-8 sm:py-12">
            <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6 sm:p-8 max-w-sm mx-auto shadow-lg">
              <ChefHat className="text-gray-400 dark:text-gray-500 mx-auto mb-3" size={40} />
              <p className="text-gray-500 dark:text-gray-400 text-base font-semibold mb-1">No templates found</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">Try adjusting your filters or search terms</p>
            </div>
          </div>
        )}

        {filteredMenus.length > 0 && <PaginationComponent />}
      </div>

      {/* Copy Modal */}
      {showCopyModal && selectedRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full transform scale-95 animate-scaleIn border-2 border-gray-200 dark:border-gray-700">
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">Copy Template</h3>
              <button onClick={() => setShowCopyModal(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-2 text-sm sm:text-base">You are about to copy the template:</p>
              <p className="font-semibold text-lg text-gray-900 dark:text-white mb-1">{selectedRecipe.templateName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">ID. {selectedRecipe.id}</p>
              
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">New Template Name *</label>
              <input 
                type="text" 
                placeholder="Enter new template name" 
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-6">The new template will be created with this name</p>
              
              <div className="flex items-center mb-6">
                <input 
                  type="checkbox" 
                  checked={isCopyConfirmed}
                  onChange={(e) => setIsCopyConfirmed(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 bg-white dark:bg-gray-700" 
                />
                <label className="ml-2 text-sm text-gray-600 dark:text-gray-400">I confirm that I want to create a copy of this template</label>
              </div>
            </div>
            <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-end gap-3">
              <button 
                onClick={() => setShowCopyModal(false)} 
                className="w-full sm:w-auto px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm order-2 sm:order-1 border border-gray-300 dark:border-gray-600"
              >
                Cancel
              </button>
              <button 
                onClick={handleCopyTemplate} 
                disabled={!isCopyConfirmed || !newTemplateName.trim()}
                className={`w-full sm:w-auto px-4 py-2 rounded-lg transition-colors font-medium shadow-sm text-sm order-1 sm:order-2 border ${
                  !isCopyConfirmed || !newTemplateName.trim()
                    ? 'bg-gray-400 text-gray-500 cursor-not-allowed border-gray-400'
                    : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
                }`}
              >
                Copy Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Approval Modal with Pending option for Draft */}
      {showApprovalModal && selectedForApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full border-2 border-gray-200 dark:border-gray-700">
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">Update Approval Status</h3>
              <button onClick={() => setShowApprovalModal(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">Select the new approval status for:</p>
              <p className="font-semibold text-gray-900 dark:text-white mb-4 text-center">{selectedForApproval.templateName}</p>
              
              <div className="grid grid-cols-1 gap-3 mb-4">
                {selectedForApproval.approvalStatusStr?.toLowerCase() === 'draft' && (
                  <button 
                    onClick={() => handleUpdateApprovalStatus(1)}
                    className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors text-yellow-700 dark:text-yellow-300 font-medium text-sm"
                  >
                    Mark as Pending
                  </button>
                )}
                <button 
                  onClick={() => handleUpdateApprovalStatus(0)}
                  className="p-3 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-green-700 dark:text-green-300 font-medium text-sm"
                >
                  Approve
                </button>
                <button 
                  onClick={() => handleUpdateApprovalStatus(2)}
                  className="p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-red-700 dark:text-red-300 font-medium text-sm"
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

export default MealSetTemplate;