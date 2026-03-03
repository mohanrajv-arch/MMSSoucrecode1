// MealTypeMapping.jsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown, Search, RefreshCw, ChefHat, Users, X, Save, AlertCircle, Trash2, CheckCircle,
  Eye, Edit, Copy, Download, Plus,
  ArrowBigDown,
  ArrowDown
} from 'lucide-react';
import { useCredentials } from '../../../context/AuthContext';
import { BiDownArrow } from 'react-icons/bi';

const MealTypeMapping = () => {
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mappedSearchQuery, setMappedSearchQuery] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  // API Data states
  const [categories, setCategories] = useState([]);
  const [mealTypes, setMealTypes] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [mappedRecipes, setMappedRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mappedLoading, setMappedLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  // New states for inactivation
  const [showInactivateModal, setShowInactivateModal] = useState(false);
  const [recipeToInactivate, setRecipeToInactivate] = useState(null);
  const [inactivating, setInactivating] = useState(false);
  // New states for save functionality
  const [saving, setSaving] = useState(false);
  const [showNoMealTypeModal, setShowNoMealTypeModal] = useState(false);
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);
  // General modal for errors/success
  const [generalModal, setGeneralModal] = useState({ isOpen: false, type: 'success', message: '' });
  // Expanded categories state
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'ascending',
  });
  // Refs for dropdown containers
  const categoryDropdownRef = useRef(null);
  const mealTypeDropdownRef = useRef(null);
  const navigate = useNavigate();
  // Get user from auth context
  const usecredantials = useCredentials();
  const userId = usecredantials.userId || 0;

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
      if (response.status === 404) {
        throw new Error(`Not found: ${url}`);
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
            navigate('/login');
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

  // Toggle expanded categories
  const toggleCategories = (recipeId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(recipeId)) {
      newExpanded.delete(recipeId);
    } else {
      newExpanded.add(recipeId);
    }
    setExpandedCategories(newExpanded);
  };

  // Fetch Categories, Meal Types, and Recipes from API
  useEffect(() => {
    fetchDropdownData();
    fetchRecipesData();
  }, []);

  // Fetch mapped recipes when selectedMealType changes
  useEffect(() => {
    if (selectedMealType) {
      fetchMappedRecipes();
    } else {
      setMappedRecipes([]);
    }
  }, [selectedMealType]);

  // Click outside handler to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        openDropdown === 'category' &&
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      ) {
        setOpenDropdown(null);
      }
      if (
        openDropdown === 'mealType' &&
        mealTypeDropdownRef.current &&
        !mealTypeDropdownRef.current.contains(event.target)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  // Handle save functionality
  const handleSave = async () => {
    // Check if meal type is selected
    if (!selectedMealType) {
      setShowNoMealTypeModal(true);
      return;
    }
    // Check if any recipes are selected
    if (selected.size === 0) {
      setGeneralModal({ isOpen: true, type: 'error', message: 'Please select at least one recipe to map' });
      return;
    }
    setSaving(true);
    setError(null); // Clear any previous errors
    try {
      // Prepare the meal type mapping list
      const mealTypeList = Array.from(selected).map(recipeId => ({
        recipeFk: recipeId,
        createdBy: userId
      }));
      const requestBody = {
        mealFk: selectedMealType.value,
        mealTypeList: mealTypeList
      };
      console.log('Saving meal type mapping:', requestBody);
      const data = await apiFetch(
        'https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/saveRecipeMealMappingMaster',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        },
      );
      if (!data.success) {
        throw new Error(data.message || 'Failed to save meal type mapping');
      }
      // Success - show success modal
      setShowSaveSuccessModal(true);
      setSelected(new Set()); // Clear selected recipes
    } catch (err) {
      console.error('Error saving meal type mapping:', err);
      setGeneralModal({ isOpen: true, type: 'error', message: `Failed to save mapping: ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  // Handle reset to initial state after save success
  const handleSaveSuccessContinue = () => {
    setShowSaveSuccessModal(false);
    // Reset to initial state
    setSelectedMealType(null);
    setSelectedCategory(null);
    setSearchQuery('');
    setMappedSearchQuery(''); // Reset mapped search
    setCurrentPage(1);
    setSelected(new Set());
    setMappedRecipes([]);
    setSortConfig({ key: 'name', direction: 'ascending' });
    setExpandedCategories(new Set());
  };

  // Handle recipe inactivation
  const handleInactivateRecipe = async () => {
    if (!recipeToInactivate) return;
    setInactivating(true);
    setError(null); // Clear any previous errors
    try {
      const data = await apiFetch(
        'https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/inactiveTheMealType',
        {
          method: 'POST',
          body: JSON.stringify({
            id: recipeToInactivate.originalData.id,
            updatedBy: userId,
          }),
        },
      );
      if (!data.success) {
        throw new Error(data.message || 'Failed to inactivate recipe');
      }
      // Remove the recipe from mapped recipes on success
      setMappedRecipes((prev) => prev.filter((r) => r.id !== recipeToInactivate.id));
     
      // Show success message
      setGeneralModal({ isOpen: true, type: 'success', message: 'Recipe successfully removed from meal type' });
    } catch (err) {
      console.error('Error inactivating recipe:', err);
      setGeneralModal({ isOpen: true, type: 'error', message: `Failed to remove recipe: ${err.message}` });
    } finally {
      setInactivating(false);
      setShowInactivateModal(false);
      setRecipeToInactivate(null);
    }
  };

  // Handle remove mapped recipe click
  const handleRemoveClick = (recipe) => {
    setRecipeToInactivate(recipe);
    setShowInactivateModal(true);
  };

  // Cancel inactivation
  const handleCancelInactivate = () => {
    setShowInactivateModal(false);
    setRecipeToInactivate(null);
  };

  // Fetch mapped recipes for selected meal type
  const fetchMappedRecipes = async () => {
    const mealTypeFK = selectedMealType?.value;
    if (!mealTypeFK) return;
    setMappedLoading(true);
    setError(null); // Clear any previous errors
    try {
      const data = await apiFetch(
        'https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/mealList',
        {
          method: 'POST',
          body: JSON.stringify({
            mealFk: mealTypeFK,
          }),
        },
      );
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch mapped recipes');
      }
      const transformedMappedRecipes = data.data.map((item) => ({
        id: item.recipeFk,
        name: item.recipeName,
        cuisine: item.countryName || 'Unknown Cuisine',
        image: item.imageUrl,
        mealType: selectedMealType?.name || 'Uncategorized',
        originalData: item,
      }));
      setMappedRecipes(transformedMappedRecipes);
    } catch (err) {
      console.error('Error fetching mapped recipes data:', err);
      setGeneralModal({ isOpen: true, type: 'error', message: `Failed to load mapped recipes: ${err.message}` });
      setMappedRecipes([]);
    } finally {
      setMappedLoading(false);
    }
  };

  // Fetch recipes data from API
  const fetchRecipesData = async () => {
    setLoading(true);
    setError(null);
    setSessionExpired(false);
    try {
      const data = await apiFetch(
        'https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/recipeAvailableList',
        {
          method: 'POST',
          body: JSON.stringify({}),
        },
      );
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch recipes');
      }
      // Transform the API response data
      const transformedRecipes = data.data.map((item) => {
        const primaryCategory = item.categoryList?.[0]?.categoryName || item.categoryName || 'Uncategorized';
        const allCategories = item.categoryList ? item.categoryList.map(cat => cat.categoryName).filter(Boolean) : [primaryCategory];
        return {
          id: item.recipeFk,
          name: item.recipeName,
          code: `SKSR/0123/${item.recipeFk}`,
          category: primaryCategory,
          allCategories,
          cuisine: item.countryName || 'Unknown Cuisine',
          image: item.imageUrl,
          originalData: item,
        };
      });
      setRecipes(transformedRecipes);
    } catch (err) {
      console.error('Error fetching recipes data:', err);
      setGeneralModal({ isOpen: true, type: 'error', message: `Failed to load recipes: ${err.message}` });
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    setLoading(true);
    setError(null);
    setSessionExpired(false);
    try {
      // Fetch categories
      const categoryData = await apiFetch(
        'https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/loadCategoryDropDown',
        { method: 'GET' },
      );
      if (!categoryData.success) {
        throw new Error(categoryData.message || 'Failed to fetch categories');
      }
      const transformedCategories = categoryData.data.map((item) => ({
        id: item.pk,
        name: item.name,
        value: item.pk,
      }));
      setCategories([{ id: 0, name: 'All Categories', value: '' }, ...transformedCategories]);
      // Fetch meal types
      const mealTypeData = await apiFetch(
        'https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/loadMealTypeDropDown',
        { method: 'GET' },
      );
      if (!mealTypeData.success) {
        throw new Error(mealTypeData.message || 'Failed to fetch meal types');
      }
      const transformedMealTypes = mealTypeData.data.map((item) => ({
        id: item.pk,
        name: item.name,
        value: item.pk
      }));
      setMealTypes([{ id: 0, name: 'Choose Meal Type', value: '' }, ...transformedMealTypes]);
    } catch (err) {
      console.error('Error fetching dropdown data:', err);
      setGeneralModal({ isOpen: true, type: 'error', message: `Failed to load dropdown data: ${err.message}` });
      setCategories([{ id: 0, name: 'All Categories', value: '' }]);
      setMealTypes([{ id: 0, name: 'Choose Meal Type', value: '' }]);
    } finally {
      setLoading(false);
    }
  };

  // Handle category selection
  const handleCategorySelect = (selectedCategoryItem) => {
    setSelectedCategory(selectedCategoryItem.value === '' ? null : selectedCategoryItem);
    setOpenDropdown(null);
  };

  // Handle meal type selection
  const handleMealTypeSelect = (selectedMealTypeItem) => {
    setSelectedMealType(selectedMealTypeItem.value === '' ? null : selectedMealTypeItem);
    setOpenDropdown(null);
  };

  // Handle dropdown button click
  const handleDropdownClick = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  // Handle session expiration
  const handleSessionExpired = () => {
    sessionStorage.removeItem('token');
    setLoading(false);
    setMappedLoading(false);
    setSaving(false);
    setInactivating(false);
    navigate('/login');
  };

  // Enhanced Refresh handler
  const handleRefresh = () => {
    setSelectedMealType(null);
    setSelectedCategory(null);
    setSearchQuery('');
    setMappedSearchQuery('');
    setCurrentPage(1);
    setSelected(new Set());
    setMappedRecipes([]);
    setSortConfig({ key: 'name', direction: 'ascending' });
    setExpandedCategories(new Set());
    setError(null);
    setLoading(false);
    setMappedLoading(false);
    setSaving(false);
    setInactivating(false);
    fetchDropdownData();
    fetchRecipesData();
  };

  // Filter and sort recipes for available
  const filteredAndSortedMenus = useMemo(() => {
    let filtered = recipes.filter((menu) => {
      const matchesSearch = menu.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || menu.category === selectedCategory.name;
      return matchesSearch && matchesCategory;
    });
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return filtered;
  }, [recipes, searchQuery, selectedCategory, sortConfig]);

  // Filter mapped recipes for current mappings
  const filteredMappedRecipes = useMemo(() => {
    return mappedRecipes.filter((recipe) =>
      recipe.name.toLowerCase().includes(mappedSearchQuery.toLowerCase())
    );
  }, [mappedRecipes, mappedSearchQuery]);

  // Paginated recipes
  const paginatedMenus = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedMenus.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedMenus, currentPage, itemsPerPage]);

  // Total pages
  const totalPages = Math.ceil(filteredAndSortedMenus.length / itemsPerPage);

  // Handle sort
  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === 'ascending' ? 'descending' : 'ascending',
    }));
  };

  // Updated handleSelectAll to exclude already mapped recipes
  const handleSelectAll = (e) => {
    const newSelected = new Set(selected);
    if (e.target.checked) {
      paginatedMenus.forEach((menu) => {
        const isAlreadyMapped = selectedMealType && mappedRecipes.some(mapped => mapped.id === menu.id);
        if (!isAlreadyMapped) {
          newSelected.add(menu.id);
        }
      });
    } else {
      paginatedMenus.forEach((menu) => {
        const isAlreadyMapped = selectedMealType && mappedRecipes.some(mapped => mapped.id === menu.id);
        if (!isAlreadyMapped) {
          newSelected.delete(menu.id);
        }
      });
    }
    setSelected(newSelected);
  };

  const handleDeselectAll = () => {
    const newSelected = new Set(selected);
    paginatedMenus.forEach((menu) => {
      const isAlreadyMapped = selectedMealType && mappedRecipes.some(mapped => mapped.id === menu.id);
      if (!isAlreadyMapped) {
        newSelected.delete(menu.id);
      }
    });
    setSelected(newSelected);
  };

  const handleToggleSelect = (id) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const handleCopyConfirm = () => {
    const mealTypeFK = selectedMealType?.value;
    const categoryFK = selectedCategory?.value;
    console.log('Copying recipe with Meal Type FK:', mealTypeFK, 'Category FK:', categoryFK);
    setShowCopyModal(false);
  };

  useEffect(() => {
    console.log('All recipes:', recipes);
    console.log('All categories in recipes:', [...new Set(recipes.map(r => r.category))]);
    console.log('Dropdown categories:', categories);
  }, [recipes, categories]);

  // Pagination component
  const renderPagination = () => {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between mt-6 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 mb-4 sm:mb-0">
          <span className="text-sm text-gray-600 dark:text-gray-300">Recipes per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="text-sm border border-gray-300 rounded-lg px-6 py-1.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[8, 12, 16, 20].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-4 sm:mb-0">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
          {Math.min(currentPage * itemsPerPage, filteredAndSortedMenus.length)} of{' '}
          {filteredAndSortedMenus.length} recipes
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg ${
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
            className={`p-2 rounded-lg ${
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
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium ${
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
            className={`p-2 rounded-lg ${
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
            className={`p-2 rounded-lg ${
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

  // Enhanced Loading animation
  const LoadingAnimation = ({ message = 'Loading...' }) => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="space-y-2 mb-4">
        <div className="animate-pulse bg-gray-300 dark:bg-gray-600 rounded-lg h-12 w-12 flex items-center justify-center"></div>
        <div className="animate-pulse bg-gray-300 dark:bg-gray-600 rounded h-2 w-20"></div>
      </div>
      <p className="text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  );

  // Simplified Save Success Modal
  const SaveSuccessModal = () => (
    <div className="fixed inset-0 bg-black/20 dark:bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-500" size={24} />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Success!</h3>
          </div>
          <button onClick={handleSaveSuccessContinue} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-6">Recipes mapped to this meal type successfully</p>
          <button
            onClick={handleSaveSuccessContinue}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );

  // Get card theme based on category
  const getCategoryTheme = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('veg')) {
      return {
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-800 dark:text-green-200',
        badgeBg: 'bg-green-100 dark:bg-green-800/50',
        badgeText: 'text-green-700 dark:text-green-300'
      };
    } else if (cat.includes('non-veg') || cat.includes('chicken')) {
      return {
        bg: 'bg-red-50 dark:bg-red-900/20',
        text: 'text-red-800 dark:text-red-200',
        badgeBg: 'bg-red-100 dark:bg-red-800/50',
        badgeText: 'text-red-700 dark:text-red-300'
      };
    }
    return {
      bg: 'bg-gray-50 dark:bg-gray-700',
      text: 'text-gray-800 dark:text-gray-200',
      badgeBg: 'bg-gray-100 dark:bg-gray-600',
      badgeText: 'text-gray-700 dark:text-gray-300'
    };
  };

  const getStatusColor = (statusStr) => {
    switch (statusStr?.toLowerCase()) {
      case 'mapped': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800';
      case 'available': return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {sessionExpired && <SessionExpiredModal />}
      {generalModal.isOpen && <GeneralStatusModal />}
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white truncate">Meal Type Recipe Mapping</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Map recipes to meal types efficiently</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1 bg-yellow-300 dark:bg-gray-700 hover:bg-gray-300 px-3 py-2 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200"
              title="Reload"
              onClick={handleRefresh}
              disabled={loading || saving}
            >
              <RefreshCw size={18} className={(loading || saving) ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              title="Save"
            >
              <Save size={18} className={saving ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
            <LoadingAnimation message="Loading filters..." />
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Meal Type Dropdown */}
          <div className="relative" ref={mealTypeDropdownRef}>
            <button
              onClick={() => handleDropdownClick('mealType')}
              disabled={loading}
              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-left flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-500 transition-colors text-gray-700 dark:text-gray-300 text-sm relative disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="truncate">{selectedMealType?.name || 'Choose Meal Type'}</span>
              <ChevronDown size={16} className={`text-gray-500 dark:text-gray-400 flex-shrink-0 transition-transform duration-200 ${openDropdown === 'mealType' ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === 'mealType' && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto top-full left-0">
                {mealTypes.map((mealType) => (
                  <button
                    key={mealType.id}
                    onClick={() => handleMealTypeSelect(mealType)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors text-sm focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-600"
                  >
                    {mealType.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Category Dropdown */}
          <div className="relative" ref={categoryDropdownRef}>
            <button
              onClick={() => handleDropdownClick('category')}
              disabled={loading}
              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-left flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-500 transition-colors text-gray-700 dark:text-gray-300 text-sm relative disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="truncate">{selectedCategory?.name || 'All Categories'}</span>
              <ChevronDown size={16} className={`text-gray-500 dark:text-gray-400 flex-shrink-0 transition-transform duration-200 ${openDropdown === 'category' ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === 'category' && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto top-full left-0">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors text-sm focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-600"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 z-10" size={16} />
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={loading}
              className="w-full pl-10 pr-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm relative disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Available Recipes Header */}
      <div className="bg-white dark:bg-gray-800 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Users size={20} className="text-green-600" />
            Available Recipes: {filteredAndSortedMenus.length}
          </span>
          {/* Sort Options */}
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-xl">
            <span className="text-sm text-gray-600 dark:text-gray-300">Sort by:</span>
            <select
              value={sortConfig.key}
              onChange={(e) => handleSort(e.target.value)}
              disabled={loading}
              className="text-sm border-0 bg-transparent px-2 py-1 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="name">Name</option>
              <option value="category">Category</option>
              <option value="cuisine">Cuisine</option>
            </select>
            <button
              onClick={() => handleSort(sortConfig.key)}
              disabled={loading}
              className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold"
              title={sortConfig.direction === 'ascending' ? 'Sort descending' : 'Sort ascending'}
            >
              {sortConfig.direction === 'ascending' ? '↑' : '↓'}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="selectAll"
              checked={
                paginatedMenus.length > 0 &&
                paginatedMenus.filter(menu => !(selectedMealType && mappedRecipes.some(mapped => mapped.id === menu.id)))
                  .every(menu => selected.has(menu.id))
              }
              onChange={handleSelectAll}
              disabled={loading}
              className="w-4 h-4 text-blue-600 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <label
              htmlFor="selectAll"
              className="text-gray-700 dark:text-gray-300 text-sm sm:text-base font-medium"
            >
              Select All
            </label>
          </div>
          <button
            onClick={handleDeselectAll}
            disabled={loading}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Deselect All
          </button>
        </div>
      </div>

      {/* Recipe Cards Grid */}
      <div className="p-3 sm:p-4 relative z-0 bg-white dark:bg-gray-800">
        {loading && (
          <div className="absolute inset-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm flex items-center justify-center z-10">
            <LoadingAnimation />
          </div>
        )}
        {!loading && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
              {paginatedMenus.map((menu) => {
                const isAlreadyMapped = selectedMealType && mappedRecipes.some(mapped => mapped.id === menu.id);
                const isSelected = selected.has(menu.id);
                const theme = getCategoryTheme(menu.category);
                const statusStr = isAlreadyMapped ? 'Mapped' : 'Available';
                const statusColorClass = getStatusColor(statusStr);
                const isExpanded = expandedCategories.has(menu.id);
               
                return (
                  <div
                    key={menu.id}
                    className={`relative bg-white dark:bg-gray-800 ${theme.bg} border border-blue-800 dark:border-blue-700 border-t-4 border-t-blue-900 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden flex flex-col h-full`}
                  >
                    {/* Image Section with Checkbox top right */}
                    <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
                      {menu.image ? (
                        <img
                          src={menu.image}
                          alt={menu.name}
                          className="w-full h-full object-cover transition-transform hover:scale-105"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                          <ChefHat size={24} className="mb-1" />
                          <span className="text-xs">No Image</span>
                        </div>
                      )}
                      {/* Checkbox top right of image */}
                      <div className="absolute top-2 right-2">
                        {isAlreadyMapped ? (
                          <CheckCircle className="text-green-500" size={20} />
                        ) : (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(menu.id)}
                            disabled={loading}
                            className="w-5 h-5 text-blue-600 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        )}
                      </div>
                    </div>
                   
                    {/* Header with Recipe Name and Status */}
                    <div className="p-3 bg-blue-700 dark:bg-blue-800 border-b border-blue-700 flex-shrink-0 relative z-20">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`font-bold text-sm leading-tight flex-1 line-clamp-2 break-words text-white`}>
                          {menu.name}
                        </h3>
                     
                      </div>
                    </div>
                   
                    {/* Content Area */}
                    <div className={`p-3 flex-1 flex flex-col relative z-20`}>
                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-18 mb-3">
                        <div className="space-y-1.5">
                          <div>
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Category</div>
                            <div className="relative">
                              <span className={`text-xs font-bold block px-0.5 py-0.5 rounded ${theme.badgeText}`}>
                                {menu.category}
                              </span>
                              {menu.allCategories.length > 1 && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleCategories(menu.id);
                                    }}
                                    className="absolute -top-1 -right-1 p-0.5 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-shadow"
                                  >
                                    <ArrowDown size={10} className="text-black dark:text-gray-400" />
                                  </button>
                                  {isExpanded && (
                                    <div className="mt-2 flex flex-wrap gap-1 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                      {menu.allCategories.slice(1).map((cat, index) => (
                                        <span
                                          key={index}
                                          className={`text-xs px-1 py-0.5 rounded ${theme.badgeText}`}
                                        >
                                          {cat}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                       
                        <div>
                          <div>
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Cuisine</div>
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 px-0.5 py-0.5 rounded font-medium block">
                              {menu.cuisine}
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Action Text (no checkbox here) */}
                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex gap-1 flex-wrap">
                          <span className={`text-sm font-semibold ${
                            isAlreadyMapped
                              ? 'text-green-700 dark:text-green-300'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {isAlreadyMapped ? 'Already Mapped' : 'Select to Map'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {filteredAndSortedMenus.length === 0 && !loading && (
              <div className="text-center py-8 sm:py-12">
                <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6 sm:p-8 max-w-sm mx-auto shadow-lg">
                  <ChefHat className="text-gray-400 dark:text-gray-500 mx-auto mb-3" size={40} />
                  <p className="text-gray-500 dark:text-gray-400 text-base font-semibold mb-1">No recipes found</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">Try adjusting your filters or search terms</p>
                </div>
              </div>
            )}
            {filteredAndSortedMenus.length > 0 && renderPagination()}
          </>
        )}
      </div>

      {/* Current Mappings */}
      {selectedMealType && (
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-sm relative">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <CheckCircle size={20} className="text-emerald-600" />
              Current Mappings: {filteredMappedRecipes.length}
            </h2>
            <div className="relative w-full sm:w-auto">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                size={18}
              />
              <input
                type="text"
                placeholder="Search mapped recipes..."
                value={mappedSearchQuery}
                onChange={(e) => setMappedSearchQuery(e.target.value)}
                disabled={mappedLoading}
                className="w-full sm:w-64 pl-10 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              />
            </div>
          </div>
          <div className="p-4 relative">
            {mappedLoading && (
              <div className="absolute inset-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm flex items-center justify-center z-10">
                <LoadingAnimation message="Loading mapped recipes..." />
              </div>
            )}
            {!mappedLoading && (
              <>
                <div className="max-h-[300px] overflow-y-auto rounded-xl p-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0">
                    {filteredMappedRecipes.map((recipe) => (
                      <div
                        key={recipe.id}
                        className="relative bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-4 flex flex-col h-full"
                      >
                        {/* Image */}
                        <div className="w-full h-20 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden mb-3 flex-shrink-0">
                          {recipe.image ? (
                            <img
                              src={recipe.image}
                              alt={recipe.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                              No Image
                            </div>
                          )}
                        </div>
                        {/* Content */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="space-y-1 mb-3">
                            <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                              {recipe.name}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {recipe.mealType}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {recipe.cuisine}
                            </p>
                          </div>
                          {/* Delete Button */}
                          <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-gray-700">
                            <button
                              onClick={() => handleRemoveClick(recipe)}
                              className="text-gray-400 hover:text-red-600 transition p-1 disabled:opacity-50 disabled:cursor-not-allowed self-end"
                              title="Remove from meal type"
                              disabled={inactivating}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {filteredMappedRecipes.length === 0 && !mappedLoading && (
                  <div className="text-center py-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 max-w-md mx-auto">
                      <CheckCircle
                        className="text-gray-400 dark:text-gray-500 mx-auto mb-3"
                        size={36}
                      />
                      <p className="text-gray-500 dark:text-gray-400 mb-1">
                        No mapped recipes found
                      </p>
                      <p className="text-gray-400 dark:text-gray-500 text-sm">
                        No recipes are currently mapped to this meal type
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showNoMealTypeModal && (
        <div className="fixed inset-0 bg-black/10 dark:bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full transform scale-95 animate-scaleIn">
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
                Meal Type Required
              </h3>
              <button
                onClick={() => setShowNoMealTypeModal(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                  <AlertCircle className="text-yellow-600 dark:text-yellow-400" size={20} />
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    Please select a meal type before saving recipes.
                  </p>
                </div>
              </div>
             
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                You need to choose a meal type from the dropdown to map the selected recipes.
              </p>
            </div>
            <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setShowNoMealTypeModal(false)}
                className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      {showSaveSuccessModal && <SaveSuccessModal />}
      {showInactivateModal && recipeToInactivate && (
        <div className="fixed inset-0 bg-black/10 dark:bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full transform scale-95 animate-scaleIn">
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
                Remove Recipe
              </h3>
              <button
                onClick={handleCancelInactivate}
                disabled={inactivating}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <Trash2 className="text-red-600 dark:text-red-400" size={20} />
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    Are you sure you want to remove this recipe from the meal type?
                  </p>
                </div>
              </div>
             
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-6">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {recipeToInactivate.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Meal Type: {recipeToInactivate.mealType}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Cuisine: {recipeToInactivate.cuisine}
                </p>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                This action will remove the recipe from the current meal type mapping.
              </p>
            </div>
            <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={handleCancelInactivate}
                disabled={inactivating}
                className="w-full sm:w-auto px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium order-2 sm:order-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleInactivateRecipe}
                disabled={inactivating}
                className="w-full sm:w-auto px-6 py-3 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm order-1 sm:order-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {inactivating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Remove Recipe
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {showCopyModal && selectedRecipe && (
        <div className="fixed inset-0 bg-black/10 dark:bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full transform scale-95 animate-scaleIn">
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
                Copy Recipe
              </h3>
              <button
                onClick={() => setShowCopyModal(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-2 text-sm sm:text-base">
                You are about to copy the recipe:
              </p>
              <p className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                {selectedRecipe.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Ref. {selectedRecipe.code}
              </p>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                New Recipe Name *
              </label>
              <input
                type="text"
                placeholder="Enter new recipe name"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-6">
                The new recipe will be created with this name
              </p>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Meal Type:
              </label>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-2 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 rounded-full text-sm font-medium cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-900/30 transition-colors">
                  BREAKFAST
                </span>
                <span className="px-3 py-2 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 rounded-full text-sm font-medium cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-900/30 transition-colors">
                  LUNCH
                </span>
                <span className="px-3 py-2 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 rounded-full text-sm font-medium cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-900/30 transition-colors">
                  DINNER
                </span>
                <span className="px-3 py-2 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 rounded-full text-sm font-medium cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-900/30 transition-colors">
                  NIGHT SHIFT
                </span>
              </div>
              <div className="flex items-center mb-6">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 bg-white dark:bg-gray-700"
                />
                <label className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  I confirm that I want to create a copy of this recipe
                </label>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total: {selectedRecipe.total}
              </p>
            </div>
            <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowCopyModal(false)}
                className="w-full sm:w-auto px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleCopyConfirm}
                className="w-full sm:w-auto px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm order-1 sm:order-2"
              >
                Copy Recipe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealTypeMapping;