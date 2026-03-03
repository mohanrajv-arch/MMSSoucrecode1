import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Search,
  Eye,
  Edit,
  Copy,
  Plus,
  Users,
  ChefHat,
  History,
  Download,
  CheckCircle,
  AlertCircle,
  Layers,
  CheckIcon,
  Clock,
  DollarSign,
  ChevronUp,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  XCircle,
} from 'lucide-react';
import { useAuth, useCredentials, useFormatAmount, useFormatDate, useFormatQuantity } from 'src/context/AuthContext';
import { FaMoneyBill } from 'react-icons/fa';
import SearchableSelect from 'src/components/Spa Components/DropdownSearch';

const uomOptionsArray = [
  { id: 0, value: 'Select UOM' },
  { id: 1, value: 'g' },
  { id: 2, value: 'Kg' },
  { id: 3, value: 'Liter' },
  { id: 4, value: 'Piece' },
];

// Fix the status options - use empty string for all to avoid null handling issues in the select component
const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'A', label: 'Active' },
  { value: 'I', label: 'Inactive' },
];

const RecipeMaster = () => {
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);
  const [copyModal, setCopyModal] = useState({ isOpen: false, type: 'success', message: '' });
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [newRecipeName, setNewRecipeName] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedMealTypes, setExpandedMealTypes] = useState({});
  const navigate = useNavigate();
  const credentials = useCredentials();
  const userId = credentials?.userId || 0;
  const { projectSettings } = useAuth();
  const formatDate = useFormatDate();
  const formatAmount = useFormatAmount();
  const formatQuantity = useFormatQuantity();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [uom, setUom] = useState('Select UOM');
  const [selectedCategory, setSelectedCategory] = useState({
    pk: null,
    displayName: 'All Categories',
  });
  const [selectedCuisine, setSelectedCuisine] = useState({ pk: null, displayName: 'All Cuisines' });
  // Fix: Initialize selectedStatus as empty string to match the updated options and ensure consistent string handling
  const [selectedStatus, setSelectedStatus] = useState('');

  // Data
  const [fullCategoriesData, setFullCategoriesData] = useState([]);
  const [fullCuisineData, setFullCuisineData] = useState([]);
  const [menuData, setMenuData] = useState([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 10;
  const maxVisiblePages = 5;

  // Toggling status
  const [isTogglingStatus, setIsTogglingStatus] = useState({});

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

  const CopyStatusModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
        <div className="flex justify-center mb-4">
          {copyModal.type === 'success' ? (
            <CheckCircle className="h-12 w-12 text-green-500" />
          ) : (
            <AlertCircle className="h-12 w-12 text-red-500" />
          )}
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {copyModal.type === 'success' ? 'Success!' : 'Error!'}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{copyModal.message}</p>
        <button
          onClick={() => setCopyModal({ isOpen: false, type: 'success', message: '' })}
          className={`px-4 py-2 text-white rounded-lg hover:opacity-90 transition ${
            copyModal.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          OK
        </button>
      </div>
    </div>
  );

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) throw new Error('No authentication token found.');
        const res = await fetch(
          'https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/loadCategoryDropDown',
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!res.ok) {
          const data = await res.json();
          const errorText = await data.text();
          setSessionExpired(true);
          throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
        }
        const data = await res.json();
        setFullCategoriesData(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        console.error(err);
        setSessionExpired(true);
      }
    };
    fetchCategories();
  }, []);

  // Fetch cuisines
  useEffect(() => {
    const fetchCuisines = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) throw new Error('No authentication token found.');
        const res = await fetch(
          'https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/loadCountryDropDowm',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );
        if (!res.ok) {
          const errorText = await res.text();
          setSessionExpired(true);
          throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
        }
        const data = await res.json();
        if (data && data.data) {
          setFullCuisineData(Array.isArray(data.data) ? data.data : []);
        } else if (data && Array.isArray(data)) {
          setFullCuisineData(data);
        } else {
          console.warn('Unexpected response format for cuisines:', data);
          setFullCuisineData([]);
        }
      } catch (err) {
        console.error('Error fetching cuisines:', err);
        setFullCuisineData([]);
      }
    };
    fetchCuisines();
  }, []);

  // Fetch recipes
  const fetchRecipeList = async () => {
    setIsLoadingRecipes(true);
    try {
      const token = sessionStorage.getItem('token');
      if (!token) throw new Error('No authentication token found.');
      const body = {};
      if (selectedCategory.pk) body.categoryFk = selectedCategory.pk;
      if (selectedCuisine.pk) body.cuisinesFk = selectedCuisine.pk;
      if (uom !== 'Select UOM') body.uom = uom;
      const res = await fetch(
        'https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/recipeMasterList',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        },
      );
      if (!res.ok) {
        const errorText = await res.text();
        setSessionExpired(true);
        throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
      }
      const data = await res.json();
      const safeData = Array.isArray(data.data)
        ? data.data
            .map((item) => {
              const uniqueCategories = Array.isArray(item.categoryList)
                ? [...new Set(item.categoryList.map((c) => c.categoryName).filter(Boolean))]
                : [];
              const uniqueMealTypes = Array.isArray(item.mealList)
                ? [...new Set(item.mealList.map((m) => m.mealName).filter(Boolean))]
                : [];
              let cuisineName = 'N/A';
              if (item.cuisine && item.cuisine.name) {
                cuisineName = item.cuisine.name;
              } else if (item.cuisinesFk && item.cuisinesFk.name) {
                cuisineName = item.cuisinesFk.name;
              } else if (item.cuisineName) {
                cuisineName = item.cuisineName;
              }
              return {
                id: item.id,
                name: item.recipeName || 'N/A',
                code: item.refNo || 'N/A',
                category: uniqueCategories.join(', ') || 'N/A',
                categoriesList: uniqueCategories,
                cuisine: cuisineName,
                uom: item.uom || 'N/A',
                servings: item.servings || 0,
                total: item.totalCost || 0,
                perPortion: item.perPortionCost || 0,
                status: item.status || 'N/A',
                image: item.imageUrl || '',
                portionSize: item.portionSize || 0,
                mealTypes: uniqueMealTypes,
                difficulty: item.difficulty || 'N/A',
                time: item.time || 'N/A',
              };
            })
            .filter((v, i, self) => i === self.findIndex((r) => r.id === v.id))
        : [];
      setMenuData(safeData);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      setMenuData([]);
    } finally {
      setIsLoadingRecipes(false);
    }
  };

  useEffect(() => {
    fetchRecipeList();
  }, [selectedCategory.pk, selectedCuisine.pk, uom]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory.pk, selectedCuisine.pk, uom, selectedStatus]);

  const handleToggleStatus = async (recipeId, currentStatus) => {
    const newStatus = currentStatus === 'A' ? 'I' : 'A';
    setIsTogglingStatus(prev => ({ ...prev, [recipeId]: true }));
    try {
      const token = sessionStorage.getItem('token');
      if (!token) throw new Error('No authentication token found.');
      const res = await fetch(
        'https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/recipeStatusUpdate',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ id: recipeId, status: newStatus }),
        },
      );
      if (res.ok) {
        await fetchRecipeList();
        setCopyModal({
          isOpen: true,
          type: 'success',
          message: `Recipe ${newStatus === 'A' ? 'activated' : 'deactivated'} successfully!`,
        });
      } else {
        console.error('Failed to update status');
        setCopyModal({
          isOpen: true,
          type: 'error',
          message: 'Failed to update status.',
        });
      }
    } catch (err) {
      console.error(err);
      setCopyModal({
        isOpen: true,
        type: 'error',
        message: 'Error updating status.',
      });
    } finally {
      setIsTogglingStatus(prev => ({ ...prev, [recipeId]: false }));
    }
  };

  const handleDownloadClick = async (recipeId, recipeName) => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) throw new Error('No authentication token found.');
      const response = await fetch(
        `https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/printexcelreport/${recipeId}/${credentials.userId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      const fileName = `${recipeName}_recipe_report.xlsx`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading recipe report:', err);
      setCopyModal({
        isOpen: true,
        type: 'error',
        message: 'Failed to download recipe report. Please try again.',
      });
    }
  };

  const handleCopyClick = (menu) => {
    setSelectedRecipe(menu);
    setNewRecipeName(`Copy of ${menu.name}`);
    setIsConfirmed(false);
    setIsCopyModalOpen(true);
  };

  const handleCopyRecipe = async () => {
    if (!newRecipeName.trim() || !isConfirmed) return;
    setIsCopying(true);
    try {
      const token = sessionStorage.getItem('token');
      if (!token) throw new Error('No authentication token found.');
      const body = {
        id: selectedRecipe.id,
        newRecipeName: newRecipeName.trim(),
        createdBy: credentials.userId 
      };
      const res = await fetch(
        'https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/saveRecipeCopy',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        },
      );
      const data = await res.json();
      if (data.success) {
        setCopyModal({
          isOpen: true,
          type: 'success',
          message: 'Recipe copied successfully!',
        });
        setIsCopyModalOpen(false);
        await fetchRecipeList();
      } else {
        setCopyModal({
          isOpen: true,
          type: 'error',
          message: `Failed to copy recipe: ${data.message || 'Unknown error'}`,
        });
      }
    } catch (err) {
      console.error(err);
      setCopyModal({
        isOpen: true,
        type: 'error',
        message: 'Error copying recipe: ' + (err instanceof Error ? err.message : 'Unknown error'),
      });
    } finally {
      setIsCopying(false);
    }
  };

  const toggleCategories = (recipeId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [recipeId]: !prev[recipeId]
    }));
  };

  const toggleMealTypes = (recipeId) => {
    setExpandedMealTypes(prev => ({
      ...prev,
      [recipeId]: !prev[recipeId]
    }));
  };

  // New function to fetch full recipe details for history
  const handleViewHistory = async (menu) => {
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("LoginToken");
      if (!token) {
        setSessionExpired(true);
        return;
      }

      const response = await fetch(
        `https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/recipeViewById/${menu.id}`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403 || response.status === 404) {
          setSessionExpired(true);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      let fullRecipe;
      if (result.success && result.data) {
        fullRecipe = result.data;
      } else if (result.data) {
        fullRecipe = result.data;
      } else {
        throw new Error(result.message || 'No recipe data found');
      }

      navigate('/Master/RecipeHistory', { state: { recipe: fullRecipe } });
    } catch (error) {
      console.error("Error fetching full recipe for history:", error);
      // Fallback to partial data
      navigate('/Master/RecipeHistory', { state: { recipe: menu } });
    }
  };

  // Filter & Pagination
  const filteredRecipes = menuData.filter((menu) => {
    const matchesSearch =
      !searchQuery ||
      menu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      menu.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !selectedStatus || menu.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredRecipes.slice(indexOfFirstCard, indexOfLastCard);
  const totalPages = Math.ceil(filteredRecipes.length / cardsPerPage);

  const getVisiblePages = () => {
    const delta = maxVisiblePages / 2;
    let range = [];
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }
    if (currentPage - delta > 2) {
      range.unshift('...');
    }
    if (currentPage + delta < totalPages - 1) {
      range.push('...');
    }
    return [1, ...range, totalPages].filter((page, idx, self) => {
      return page !== '...' || !self.includes('...', idx + 1);
    });
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const jumpPages = (direction, steps = 5) => {
    if (direction === 'forward') {
      setCurrentPage((prev) => Math.min(prev + steps, totalPages));
    } else {
      setCurrentPage((prev) => Math.max(prev - steps, 1));
    }
  };

  const categoryOptions = [
    { pk: null, displayName: 'All Categories' },
    ...fullCategoriesData.map((c) => ({ pk: c.pk, displayName: c.categoryName || c.name })),
  ];
  const cuisineOptions = [
    { pk: null, displayName: 'All Cuisines' },
    ...fullCuisineData.map((c) => ({ pk: c.pk, displayName: c.name })),
  ];
  const uomOptions = uomOptionsArray.map((opt) => ({ value: opt.value, displayName: opt.value }));

  // Stats calculation
  const totalRecipes = menuData.length;
  const activeRecipes = menuData.filter((m) => m.status === 'A').length;
  const inactiveRecipes = totalRecipes - activeRecipes;
  const averageCost = menuData.length > 0 ? menuData.reduce((sum, m) => sum + m.perPortion, 0) / menuData.length : 0;

  // Get status color
  const getStatusColor = (statusStr) => {
    switch (statusStr?.toLowerCase()) {
      case 'a': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800';
      case 'i': return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600';
    }
  };

  const getMealColor = (type) => {
    switch (type) {
      case 'BREAKFAST':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800';
      case 'LUNCH':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
      case 'DINNER':
        return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800';
      case 'NIGHT SHIFT':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600';
    }
  };

  // Loading Skeleton Card
  const LoadingSkeletonCard = () => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm animate-pulse overflow-hidden flex flex-col h-full">
      <div className="h-20 bg-gray-200 dark:bg-gray-700"></div>
      <div className="p-2 bg-gradient-to-r from-blue-900 to-blue-800 h-14"></div>
      <div className="p-2 flex-1 space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        <div className="flex gap-2">
          <div className="flex-1 space-y-1">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
          <div className="flex-1 space-y-1">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-700">
        <div className="flex gap-1 flex-1">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 h-8 w-8"></div>
          ))}
        </div>
        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>
    </div>
  );

  // Handle refresh without page reload
  const handleRefresh = () => {
    setSearchQuery('');
    setUom('Select UOM');
    setSelectedCategory({ pk: null, displayName: 'All Categories' });
    setSelectedCuisine({ pk: null, displayName: 'All Cuisines' });
    setSelectedStatus('');
    setCurrentPage(1);
    // The useEffect will automatically refetch due to dependency changes
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {sessionExpired && <SessionExpiredModal />}
      {copyModal.isOpen && <CopyStatusModal />}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white truncate">Recipe Master</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage your recipes efficiently</p>
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
              onClick={() => navigate('/Master/AddRecipe')}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-300 dark:bg-blue-900/20 p-4 rounded-lg shadow border border-blue-200 dark:border-blue-800 flex items-center gap-3">
            <Layers className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Recipes</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{totalRecipes}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">All recipes</p>
            </div>
          </div>
          <div className="bg-green-300 dark:bg-green-900/20 p-4 rounded-lg shadow border border-green-200 dark:border-green-800 flex items-center gap-3">
            <CheckIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Active Recipes</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{activeRecipes}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">{((activeRecipes / totalRecipes) * 100 || 0).toFixed(0)}% active</p>
            </div>
          </div>
          <div className="bg-red-300 dark:bg-red-900/20 p-4 rounded-lg shadow border border-red-200 dark:border-red-800 flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Inactive Recipes</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{inactiveRecipes}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">{((inactiveRecipes / totalRecipes) * 100 || 0).toFixed(0)}% inactive</p>
            </div>
          </div>
          <div className="bg-purple-300 dark:bg-purple-900/20 p-4 rounded-lg shadow border border-purple-200 dark:border-purple-800 flex items-center gap-3">
            <FaMoneyBill className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Avg. Cost</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{formatAmount(averageCost, projectSettings?.costDecimalPlaces || 2)}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Per portion</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 sm:gap-4">
          <SearchableSelect
            options={categoryOptions}
            value={selectedCategory.pk}
            onChange={(pk) => {
              const opt = categoryOptions.find((o) => o.pk == pk);
              setSelectedCategory(opt || { pk: null, displayName: 'All Categories' });
            }}
            placeholder="All Categories"
            displayKey="displayName"
            valueKey="pk"
          />
          <SearchableSelect
            options={cuisineOptions}
            value={selectedCuisine.pk}
            onChange={(pk) => {
              const opt = cuisineOptions.find((o) => o.pk == pk);
              setSelectedCuisine(opt || { pk: null, displayName: 'All Cuisines' });
            }}
            placeholder="All Cuisines"
            displayKey="displayName"
            valueKey="pk"
          />
          <SearchableSelect
            options={uomOptions}
            value={uom}
            onChange={(value) => setUom(value)}
            placeholder="Select UOM"
            displayKey="displayName"
            valueKey="value"
          />
          {/* Fix: Use consistent string-based value handling for status filter */}
          <SearchableSelect
            options={statusOptions}
            value={selectedStatus}
            onChange={(value) => {
              setSelectedStatus(value); // This triggers the client-side filtering
            }}
            placeholder="All Status"
            displayKey="label"
            valueKey="value"
          />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 z-10" size={16} />
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm h-10"
            />
          </div>
        </div>
      </div>
      <div className="p-3 sm:p-4 relative z-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
          {isLoadingRecipes ? (
            Array.from({ length: cardsPerPage }).map((_, idx) => <LoadingSkeletonCard key={idx} />)
          ) : (
            currentCards.map((menu) => {
              const isActive = menu.status === 'A';
              const isDisabled = !isActive;
              const statusColorClass = getStatusColor(menu.status);
              const isCatExpanded = expandedCategories[menu.id];
              const catToShow = isCatExpanded ? menu.categoriesList : menu.categoriesList.slice(0, 1);
              const isMealExpanded = expandedMealTypes[menu.id];
              const mealToShow = isMealExpanded ? menu.mealTypes : menu.mealTypes.slice(0, 3);
              return (
                <div
                  key={menu.id}
                  className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-t-4 border-t-blue-900 shadow-md hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden flex flex-col h-full"
                >
                  {isDisabled && (
                    <div className="absolute inset-0 bg-gray-200/20 dark:bg-gray-700/20 backdrop-blur-sm z-10 rounded-xl"></div>
                  )}
                  <div className="h-20 bg-gray-100 dark:bg-gray-700 flex items-center justify-center relative z-20 overflow-hidden">
                    {!menu.image ? (
                      <span className="text-xs text-gray-500 dark:text-gray-400">No Image Available</span>
                    ) : (
                      <img src={menu.image} alt={menu.name} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className={`p-2 bg-gradient-to-r from-blue-900 to-blue-800 dark:from-blue-800 dark:to-blue-700 border-b border-blue-700 flex-shrink-0 relative z-20 ${isDisabled ? 'opacity-80' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-bold text-sm leading-tight flex-1 line-clamp-2 break-words text-white ${isDisabled ? 'text-blue-200' : ''}`}>
                        {menu.name}
                      </h3>
                    </div>
                  </div>
                  <div className={`p-3 flex-1 flex flex-col relative z-20 space-y-3 ${isDisabled ? 'blur-[0.5px] opacity-90' : ''}`}>
                    <div className="flex flex-wrap gap-4 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      <span className="text-xs font-semibold text-blue-700 dark:blue-gray-300"> {menu.code}</span>
                      <span className="text-xs font-semibold text-green-700 dark:green-gray-300">{formatQuantity(menu.servings || 0, projectSettings?.quantityDecimalPlaces || 4)} <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Servings</span></span>
                      <span>UOM: {menu.uom}</span>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Categories</div>
                      <div className="flex gap-1 flex-wrap">
                        {catToShow.map((cat, index) => (
                          <span
                            key={index}
                            className="text-xs px-1.5 py-0.5 rounded font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                          >
                            {cat}
                          </span>
                        ))}
                        {menu.categoriesList.length > 1 && (
                          <button
                            onClick={() => toggleCategories(menu.id)}
                            className="text-xs text-blue-500 hover:text-blue-700 font-medium underline"
                          >
                            {isCatExpanded ? 'Show less' : `+${menu.categoriesList.length - 1}`}
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Meal Type</div>
                      <div className="flex gap-1 flex-wrap">
                        {mealToShow.map((type, index) => (
                          <span
                            key={index}
                            className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap border ${getMealColor(type)}`}
                          >
                            {type}
                          </span>
                        ))}
                        {menu.mealTypes.length > 3 && (
                          <button
                            onClick={() => toggleMealTypes(menu.id)}
                            className="text-xs text-purple-500 hover:text-purple-700 font-medium underline"
                          >
                            {isMealExpanded ? 'Show less' : `+${menu.mealTypes.length - 3}`}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="border-t border-gray-100 dark:border-gray-700 flex justify-between text-sm pt-1">
                      <div className="text-center">
                        <div className="text-gray-500 dark:text-gray-400 text-xs">Total</div>
                        <div className="font-semibold text-gray-800 dark:text-white">
                          {formatAmount(menu.total || 0, projectSettings?.costDecimalPlaces || 2)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-500 dark:text-gray-400 text-xs">Per Portion</div>
                        <div className="font-semibold text-gray-800 dark:text-white">
                          {formatAmount(menu.perPortion || 0, projectSettings?.costDecimalPlaces || 2)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-auto p-2 border-t border-gray-100 dark:border-gray-700 relative z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-b-xl">
                    <div className="flex gap-1 flex-wrap">
                      <button
                        onClick={() =>
                          navigate('/Master/RecipeDetails', { state: { recipeId: menu.id } })
                        }
                        title="View"
                        className={`p-2 rounded-full transition-all shadow-md ${
                          isDisabled
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:shadow-lg'
                        }`}
                        disabled={isDisabled}
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => navigate('/Master/ModifyRecipe', { state: { recipe: menu } })}
                        title="Edit"
                        className={`p-2 rounded-full transition-all shadow-md ${
                          isDisabled
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 hover:shadow-lg'
                        }`}
                        disabled={isDisabled}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleViewHistory(menu)}
                        title="View History"
                        className={`p-2 rounded-full transition-all shadow-md ${
                          isDisabled
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:shadow-lg'
                        }`}
                        disabled={isDisabled}
                      >
                        <History size={14} />
                      </button>
                      <button
                        onClick={() => handleCopyClick(menu)}
                        title="Copy"
                        className={`p-2 rounded-full transition-all shadow-md ${
                          isDisabled
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:shadow-lg'
                        }`}
                        disabled={isDisabled}
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={() => handleDownloadClick(menu.id, menu.name)}
                        title="Download Report"
                        className={`p-2 rounded-full transition-all shadow-md ${
                          isDisabled
                            ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed bg-gray-100 dark:bg-gray-700'
                            : 'text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20'
                        }`}
                        disabled={isDisabled}
                      >
                        <Download size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => handleToggleStatus(menu.id, menu.status)}
                      disabled={isTogglingStatus[menu.id]}
                      className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-semibold transition-all shadow-md border relative z-50 ${
                        isActive
                          ? 'bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/40 text-green-700 dark:text-green-300 hover:from-green-200 hover:to-green-300 dark:hover:from-green-900/50 dark:hover:to-green-800/60 border-green-200 dark:border-green-800'
                          : 'bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/40 text-red-700 dark:text-red-300 hover:from-red-200 hover:to-red-300 dark:hover:from-red-900/50 dark:hover:to-red-800/60 border-red-200 dark:border-red-800'
                      } ${isTogglingStatus[menu.id] ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isTogglingStatus[menu.id] ? (
                        <RefreshCw size={12} className="animate-spin" />
                      ) : (
                        <CheckCircle size={12} />
                      )}
                      {isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {currentCards.length === 0 && !isLoadingRecipes && !sessionExpired && (
          <div className="text-center py-8 sm:py-12">
            <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6 sm:p-8 max-w-sm mx-auto shadow-lg">
              <ChefHat className="text-gray-400 dark:text-gray-500 mx-auto mb-3" size={40} />
              <p className="text-gray-500 dark:text-gray-400 text-base font-semibold mb-1">No recipes found</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">Try adjusting your filters or search terms</p>
            </div>
          </div>
        )}
        {totalPages > 1 && !isLoadingRecipes && !sessionExpired && (
          <div className="flex flex-wrap justify-center items-center gap-2 mt-8 px-4">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm transition-colors duration-200 shadow-md"
            >
              <ChevronsLeft size={16} />
              First
            </button>
            <button
              onClick={() => jumpPages('backward', 5)}
              disabled={currentPage <= 5}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm transition-colors duration-200 shadow-md"
            >
              <ChevronLeft size={16} />
              -5
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm transition-colors duration-200 shadow-md"
            >
              <ChevronLeft size={16} />
              Prev
            </button>
            {getVisiblePages().map((page, idx) => (
              <button
                key={idx}
                onClick={() => typeof page === 'number' && handlePageChange(page)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 hover:shadow-lg'
                } ${
                  typeof page !== 'number'
                    ? 'cursor-default text-gray-400 bg-transparent hover:bg-transparent'
                    : ''
                }`}
                disabled={typeof page !== 'number'}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm transition-colors duration-200 shadow-md"
            >
              Next
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => jumpPages('forward', 5)}
              disabled={currentPage >= totalPages - 5}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm transition-colors duration-200 shadow-md"
            >
              +5
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm transition-colors duration-200 shadow-md"
            >
              Last
              <ChevronsRight size={16} />
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400 px-4">
              Page {currentPage} of {totalPages} ({filteredRecipes.length} recipes)
            </span>
          </div>
        )}
      </div>
      {/* Copy Recipe Modal - Simplified to match MealSetMenu */}
      {isCopyModalOpen && selectedRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full transform scale-95 animate-scaleIn border-2 border-gray-200 dark:border-gray-700">
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">Copy Recipe</h3>
              <button onClick={() => setIsCopyModalOpen(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-2 text-sm sm:text-base">You are about to copy the recipe:</p>
              <p className="font-semibold text-lg text-gray-900 dark:text-white mb-1">{selectedRecipe.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">ID. {selectedRecipe.id}</p>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">New Recipe Name *</label>
              <input
                type="text"
                placeholder="Enter new recipe name"
                value={newRecipeName}
                onChange={(e) => setNewRecipeName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-6">The new recipe will be created with this name</p>
              <div className="flex items-center mb-6">
                <input
                  type="checkbox"
                  checked={isConfirmed}
                  onChange={(e) => setIsConfirmed(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 bg-white dark:bg-gray-700"
                />
                <label className="ml-2 text-sm text-gray-600 dark:text-gray-400">I confirm that I want to create a copy of this recipe</label>
              </div>
            </div>
            <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setIsCopyModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm order-2 sm:order-1 border border-gray-300 dark:border-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCopyRecipe}
                disabled={!isConfirmed || !newRecipeName.trim() || isCopying}
                className={`w-full sm:w-auto px-4 py-2 rounded-lg transition-colors font-medium shadow-sm text-sm order-1 sm:order-2 border ${
                  !isConfirmed || !newRecipeName.trim() || isCopying
                    ? 'bg-gray-400 text-gray-500 cursor-not-allowed border-gray-400'
                    : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
                }`}
              >
                {isCopying ? 'Copying...' : 'Copy Recipe'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeMaster;