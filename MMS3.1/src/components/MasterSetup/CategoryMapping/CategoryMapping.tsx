// RecipeMaster.jsx
import React, { useState, useMemo, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Search, RefreshCw, ChefHat, Users, X, Save, AlertCircle, Trash2, CheckCircle } from 'lucide-react';
import { useCredentials } from '../../../context/AuthContext';

const CategoryRecipeMapping = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCuisine, setSelectedCuisine] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // API Data states
  const [categories, setCategories] = useState([]);
  const [cuisines, setCuisines] = useState([]);
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
  const [showNoCategoryModal, setShowNoCategoryModal] = useState(false);
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);

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
  const cuisineDropdownRef = useRef(null);
  const navigate = useNavigate();

  // Get user from auth context
  const usecredantials = useCredentials();
  const userId = usecredantials.userId || 0

  // Fetch Categories, Cuisines, and Recipes from API
  useEffect(() => {
    fetchDropdownData();
    fetchRecipesData();
  }, []);

  // Fetch mapped recipes when selectedCategory changes
  useEffect(() => {
    if (selectedCategory) {
      fetchMappedRecipes();
    } else {
      setMappedRecipes([]);
    }
  }, [selectedCategory]);

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
        openDropdown === 'cuisine' &&
        cuisineDropdownRef.current &&
        !cuisineDropdownRef.current.contains(event.target)
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
    // Check if category is selected
    if (!selectedCategory) {
      setShowNoCategoryModal(true);
      return;
    }

    // Check if any recipes are selected
    if (selected.size === 0) {
      setError('Please select at least one recipe to map');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setSaving(true);
    const token = sessionStorage.getItem('token');

    if (!token) {
      setError('No authentication token found');
      setSessionExpired(true);
      setSaving(false);
      return;
    }

    try {
      // Prepare the category mapping list
      const categoryMappingList = Array.from(selected).map(recipeId => {
        const recipe = recipes.find(r => r.id === recipeId);
        return {
          recipeFk: recipeId, 
          createdBy: userId
        };
      });

      const requestBody = {
        categoryFk: selectedCategory.value,
        categoryMappingList: categoryMappingList
      };

      console.log('Saving category mapping:', requestBody);

      const response = await fetch(
        'https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/saveCategoryMapping',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (response.status === 401) {
        setSessionExpired(true);
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        throw new Error(`Save API failed with status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to save category mapping');
      }

      // Success - show success modal and refresh mapped recipes
      setShowSaveSuccessModal(true);
      setSelected(new Set()); // Clear selected recipes
      
      // Refresh mapped recipes to show the newly added ones
      if (selectedCategory) {
        fetchMappedRecipes();
      }

    } catch (err) {
      console.error('Error saving category mapping:', err);
      setError(`Failed to save mapping: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Handle recipe inactivation
  const handleInactivateRecipe = async () => {
    if (!recipeToInactivate) return;

    setInactivating(true);
    const token = sessionStorage.getItem('token');

    if (!token) {
      setError('No authentication token found');
      setSessionExpired(true);
      setInactivating(false);
      return;
    }

    try {
      const response = await fetch(
        'https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/inactiveTheCategory',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: recipeToInactivate.originalData.id, // Use the id from mapped recipe
            updatedBy: userId, // Use userId from auth context
          }),
        },
      );

      if (response.status === 401) {
        setSessionExpired(true);
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        throw new Error(`Inactivation API failed with status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to inactivate recipe');
      }

      // Remove the recipe from mapped recipes on success
      setMappedRecipes((prev) => prev.filter((r) => r.id !== recipeToInactivate.id));
      
      // Show success message
      setError('Recipe successfully removed from category');
      setTimeout(() => setError(null), 3000);

    } catch (err) {
      console.error('Error inactivating recipe:', err);
      setError(`Failed to remove recipe: ${err.message}`);
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

  // Fetch mapped recipes for selected category
  const fetchMappedRecipes = async () => {
    const categoryFK = selectedCategory?.value;
    if (!categoryFK) return;

    setMappedLoading(true);
    const token = sessionStorage.getItem('token');

    if (!token) {
      setError('No authentication token found');
      setSessionExpired(true);
      setMappedLoading(false);
      return;
    }

    try {
      const response = await fetch(
        'https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/categoryMappedList',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            categoryFk: categoryFK,
          }),
        },
      );

      if (response.status === 401) {
        setSessionExpired(true);
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        throw new Error(`Mapped recipes API failed with status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch mapped recipes');
      }

      const transformedMappedRecipes = result.data.map((item) => ({
        id: item.recipeFk,
        name: item.recipeName,
        cuisine: item.countryName || 'Unknown Cuisine',
        image: item.imageUrl,
        category: selectedCategory?.name || 'Uncategorized',
        originalData: item,
      }));

      setMappedRecipes(transformedMappedRecipes);
    } catch (err) {
      console.error('Error fetching mapped recipes data:', err);
      setError(`Failed to load mapped recipes: ${err.message}`);
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

    const token = sessionStorage.getItem('token');

    if (!token) {
      setError('No authentication token found');
      setSessionExpired(true);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        'https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/availableCategoryList',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        },
      );

      if (response.status === 401) {
        setSessionExpired(true);
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        throw new Error(`Recipes API failed with status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch recipes');
      }

      const transformedRecipes = result.data.map((item) => ({
        id: item.recipeFk,
        name: item.recipeName,
        code: `SKSR/0123/${item.recipeFk}`,
        category:
          item.categoryList && item.categoryList.length > 0
            ? item.categoryList[0].categoryName
            : 'Uncategorized',
        cuisine: item.countryName || 'Unknown Cuisine',
        image: item.imageUrl,
        originalData: item,
      }));

      setRecipes(transformedRecipes);
    } catch (err) {
      console.error('Error fetching recipes data:', err);
      setError(`Failed to load recipes: ${err.message}`);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    setLoading(true);
    setError(null);
    setSessionExpired(false);

    const token = sessionStorage.getItem('token');

    if (!token) {
      setError('No authentication token found');
      setSessionExpired(true);
      setLoading(false);
      return;
    }

    try {
      // Fetch categories
      const categoryResponse = await fetch(
        'https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/loadCategoryDropDown',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (categoryResponse.status === 401) {
        setSessionExpired(true);
        throw new Error('Session expired. Please login again.');
      }

      if (!categoryResponse.ok) {
        throw new Error(`Category API failed with status: ${categoryResponse.status}`);
      }

      const categoryResult = await categoryResponse.json();

      if (!categoryResult.success) {
        throw new Error(categoryResult.message || 'Failed to fetch categories');
      }

      const transformedCategories = categoryResult.data.map((item) => ({
        id: item.pk,
        name: item.name,
        value: item.pk,
      }));

      setCategories([{ id: 0, name: 'Choose Category', value: '' }, ...transformedCategories]);

      // Fetch cuisines (countries)
      const cuisineResponse = await fetch(
        'https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/loadCountryDropDowm',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (cuisineResponse.status === 401) {
        setSessionExpired(true);
        throw new Error('Session expired. Please login again.');
      }

      if (!cuisineResponse.ok) {
        throw new Error(`Cuisine API failed with status: ${cuisineResponse.status}`);
      }

      const cuisineResult = await cuisineResponse.json();

      const transformedCuisines = cuisineResult.data.map((item) => ({
        id: item.pk,
        name: item.name,
        value: item.pk,
      }));

      setCuisines([{ id: 0, name: 'All Cuisine', value: '' }, ...transformedCuisines]);
    } catch (err) {
      console.error('Error fetching dropdown data:', err);
      setError(`Failed to load dropdown data: ${err.message}`);

      setCategories([{ id: 0, name: 'Choose Category', value: '' }]);
      setCuisines([{ id: 0, name: 'All Cuisine', value: '' }]);
    } finally {
      setLoading(false);
    }
  };

  // Handle category selection
  const handleCategorySelect = (selectedCategoryItem) => {
    setSelectedCategory(selectedCategoryItem.value === '' ? null : selectedCategoryItem);
    setOpenDropdown(null);
  };

  // Handle cuisine selection
  const handleCuisineSelect = (selectedCuisineItem) => {
    setSelectedCuisine(selectedCuisineItem.value === '' ? null : selectedCuisineItem);
    setOpenDropdown(null);
  };

  // Handle dropdown button click
  const handleDropdownClick = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  // Handle session expiration
  const handleSessionExpired = () => {
    sessionStorage.removeItem('token');
    navigate('/login');
  };

  // Refresh handler
  const handleRefresh = () => {
    fetchDropdownData();
    fetchRecipesData();
    if (selectedCategory) {
      fetchMappedRecipes();
    }
    setSelected(new Set());
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Filter and sort recipes - Show ALL recipes regardless of category selection
  const filteredAndSortedMenus = useMemo(() => {
    let filtered = recipes.filter((menu) => {
      const matchesSearch = menu.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCuisine = !selectedCuisine || menu.cuisine === selectedCuisine.name;

      return matchesSearch && matchesCuisine;
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
  }, [recipes, searchQuery, selectedCuisine, sortConfig]);

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
      // Only add recipes that are not already mapped
      paginatedMenus.forEach((menu) => {
        const isAlreadyMapped = selectedCategory && mappedRecipes.some(mapped => mapped.id === menu.id);
        if (!isAlreadyMapped) {
          newSelected.add(menu.id);
        }
      });
    } else {
      // Only remove recipes that are not already mapped
      paginatedMenus.forEach((menu) => {
        const isAlreadyMapped = selectedCategory && mappedRecipes.some(mapped => mapped.id === menu.id);
        if (!isAlreadyMapped) {
          newSelected.delete(menu.id);
        }
      });
    }
    setSelected(newSelected);
  };

  const handleDeselectAll = () => {
    // Only deselect recipes that are not already mapped
    const newSelected = new Set(selected);
    paginatedMenus.forEach((menu) => {
      const isAlreadyMapped = selectedCategory && mappedRecipes.some(mapped => mapped.id === menu.id);
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
    const categoryFK = selectedCategory?.value;
    const cuisineFK = selectedCuisine?.value;

    console.log('Copying recipe with Category FK:', categoryFK, 'Cuisine FK:', cuisineFK);

    setShowCopyModal(false);
  };

  // Pagination component
  const renderPagination = () => {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between mt-6 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        {/* Items per page selector */}
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

        {/* Page info */}
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-4 sm:mb-0">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
          {Math.min(currentPage * itemsPerPage, filteredAndSortedMenus.length)} of{' '}
          {filteredAndSortedMenus.length} recipes
        </div>

        {/* Pagination controls */}
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
              Category Recipe Mapping
            </h2>
            {error && (
              <p className={`text-sm mt-1 ${
                error.includes('successfully') ? 'text-green-500' : 'text-red-500'
              }`}>
                {error}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={handleRefresh}
              className="flex items-center justify-center gap-2 bg-yellow-300 dark:bg-gray-700 hover:bg-yellow-400 dark:hover:bg-gray-600 px-3 py-2 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200 w-full sm:w-auto"
              title="Refresh"
              disabled={loading}
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">{loading ? 'Loading...' : 'Refresh'}</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              title="Save Recipe Mapping"
            >
              <Save size={18} className={saving ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category Dropdown */}
          <div className="relative" ref={categoryDropdownRef}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Category *
            </label>
            <button
              onClick={() => handleDropdownClick('category')}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-left flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-500 transition-colors text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <span className="truncate">{selectedCategory?.name || 'Choose Category'}</span>
              <ChevronDown
                size={20}
                className={`text-gray-500 dark:text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                  openDropdown === 'category' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openDropdown === 'category' && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-600"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cuisine Dropdown */}
          <div className="relative" ref={cuisineDropdownRef}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filter by Cuisine
            </label>
            <button
              onClick={() => handleDropdownClick('cuisine')}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-left flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-500 transition-colors text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <span className="truncate">{selectedCuisine?.name || 'All Cuisine'}</span>
              <ChevronDown
                size={20}
                className={`text-gray-500 dark:text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                  openDropdown === 'cuisine' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openDropdown === 'cuisine' && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {cuisines.map((cui) => (
                  <button
                    key={cui.id}
                    onClick={() => handleCuisineSelect(cui)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-600"
                  >
                    {cui.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 invisible">
              Search
            </label>
            <Search
              className="absolute left-3 top-11 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
              size={20}
            />
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Available Recipes Header */}
      <div className="bg-white dark:bg-gray-800 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold text-gray-800 dark:text-white">
            Available Recipes: {filteredAndSortedMenus.length}
          </span>
          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">Sort by:</span>
            <select
              value={sortConfig.key}
              onChange={(e) => handleSort(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Name</option>
              <option value="category">Category</option>
              <option value="cuisine">Cuisine</option>
            </select>
            <button
              onClick={() => handleSort(sortConfig.key)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title={sortConfig.direction === 'ascending' ? 'Sort descending' : 'Sort ascending'}
            >
              {sortConfig.direction === 'ascending' ? '↑' : '↓'}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="selectAll"
              checked={
                // Only consider non-mapped recipes for select all
                paginatedMenus.length > 0 && 
                paginatedMenus.filter(menu => !(selectedCategory && mappedRecipes.some(mapped => mapped.id === menu.id)))
                  .every(menu => selected.has(menu.id))
              }
              onChange={handleSelectAll}
              className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-gray-700"
            />
            <label
              htmlFor="selectAll"
              className="text-gray-700 dark:text-gray-300 text-sm sm:text-base"
            >
              Select All
            </label>
          </div>
          <button
            onClick={handleDeselectAll}
            className="text-gray-700 dark:text-gray-300 hover:underline text-sm sm:text-base"
          >
            Deselect All
          </button>
        </div>
      </div>

      {/* Recipe Cards */}
      <div className="p-3 sm:p-4 lg:p-6 bg-white dark:bg-gray-800 transition-colors duration-200">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Loading recipes...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {paginatedMenus.map((menu) => {
                // Check if this recipe is mapped to the CURRENTLY SELECTED category
                const isAlreadyMapped = selectedCategory && mappedRecipes.some(
                  mapped => mapped.id === menu.id
                );
                const isSelected = selected.has(menu.id);
                
                return (
                  <div
                    key={menu.id}
                    className={`bg-white dark:bg-gray-800 border rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${
                      isAlreadyMapped 
                        ? 'border-green-300 dark:border-green-700' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <div className="p-3 sm:p-4">
                      <div className="flex items-center mb-3 sm:mb-4">
                        <input
                          type="checkbox"
                          checked={isAlreadyMapped ? true : isSelected}
                          onChange={() => !isAlreadyMapped && handleToggleSelect(menu.id)}
                          disabled={isAlreadyMapped}
                          className={`w-4 h-4 border rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-gray-700 mr-2 ${
                            isAlreadyMapped 
                              ? 'text-green-600 border-green-300 cursor-not-allowed' 
                              : 'text-blue-600 border-gray-300 dark:border-gray-600'
                          }`}
                        />
                        <label className={`text-sm ${
                          isAlreadyMapped 
                            ? 'text-green-700 dark:text-green-300' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {isAlreadyMapped ? 'Mapped' : 'Select'}
                        </label>
                      </div>
                      
                      <div className="bg-gray-100 dark:bg-gray-700 h-28 sm:h-32 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm rounded">
                        {menu.image ? (
                          <img
                            src={menu.image}
                            alt={menu.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          'No Image Available'
                        )}
                      </div>
                    </div>
                    
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                      <h3 className="font-bold text-gray-800 dark:text-white text-sm sm:text-base mb-2 line-clamp-2">
                        {menu.name}
                      </h3>

                      {/* Recipe details - Show actual data from API */}
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                        <div className="flex items-center gap-1">
                          <ChefHat size={12} />
                          <span className="line-clamp-1">{menu.category}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={12} />
                          <span className="line-clamp-1">{menu.cuisine}</span>
                        </div>
                      </div>

                      {/* Show all categories if available */}
                      {menu.originalData?.categoryList && menu.originalData.categoryList.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Categories:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {menu.originalData.categoryList.slice(0, 2).map((cat, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-full text-xs"
                              >
                                {cat.categoryName}
                              </span>
                            ))}
                            {menu.originalData.categoryList.length > 2 && (
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                                +{menu.originalData.categoryList.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredAndSortedMenus.length === 0 && !loading && (
              <div className="text-center py-8 sm:py-12">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 max-w-md mx-auto">
                  <ChefHat className="text-gray-400 dark:text-gray-500 mx-auto mb-4" size={48} />
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No recipes found</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">
                    Try adjusting your filters or search terms
                  </p>
                </div>
              </div>
            )}

            {/* Pagination */}
            {filteredAndSortedMenus.length > 0 && renderPagination()}
          </>
        )}
      </div>

      {/* Current Mappings - Only show when a category is selected */}
      {selectedCategory && (
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              Current Mappings : {mappedRecipes.length}
            </h2>
          </div>

          {/* Cards Section */}
          <div className="p-4">
            {mappedLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Loading mapped recipes...
                </p>
              </div>
            ) : (
              <>
                {/* Scrollable Container */}
                <div className="max-h-[250px] overflow-y-auto rounded-lg p-2 bg-gray-50 dark:bg-gray-900">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mappedRecipes.map((recipe) => (
                      <div
                        key={recipe.id}
                        className="relative bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-4 flex items-center justify-between gap-3"
                      >
                        {/* Image + Details in one line */}
                        <div className="flex items-center gap-3 flex-1">
                          {/* Image */}
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs rounded">
                            {recipe.image ? (
                              <img
                                src={recipe.image}
                                alt={recipe.name}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              'No Image'
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex flex-col text-left">
                            <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                              {recipe.name}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {recipe.category}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {recipe.originalData?.countryName || '—'}
                            </p>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveClick(recipe)}
                          className="text-gray-400 hover:text-red-600 transition p-1"
                          title="Remove from category"
                          disabled={inactivating}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Empty State */}
                {mappedRecipes.length === 0 && !mappedLoading && (
                  <div className="text-center py-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 max-w-md mx-auto">
                      <ChefHat
                        className="text-gray-400 dark:text-gray-500 mx-auto mb-3"
                        size={36}
                      />
                      <p className="text-gray-500 dark:text-gray-400 mb-1">
                        No mapped recipes found
                      </p>
                      <p className="text-gray-400 dark:text-gray-500 text-sm">
                        No recipes are currently mapped to this category
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Session Expired Modal */}
      {sessionExpired && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full transform scale-95 animate-scaleIn">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
              <AlertCircle className="text-red-500" size={24} />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Session Expired
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your session has expired. Please log in again to continue.
              </p>
            </div>
            <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <button
                onClick={handleSessionExpired}
                className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No Category Selected Modal */}
      {showNoCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full transform scale-95 animate-scaleIn">
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
                Category Required
              </h3>
              <button
                onClick={() => setShowNoCategoryModal(false)}
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
                    Please select a category before saving recipes.
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                You need to choose a category from the dropdown to map the selected recipes.
              </p>
            </div>
            <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setShowNoCategoryModal(false)}
                className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Success Modal */}
      {showSaveSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full transform scale-95 animate-scaleIn">
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
                Success!
              </h3>
              <button
                onClick={() => setShowSaveSuccessModal(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    Recipes successfully mapped to category!
                  </p>
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-3 mb-6">
               
                <p className="text-sm text-green-600 dark:text-green-400">
                  Successfully mapped to {selectedCategory?.name}.
                </p>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                The recipes are now available in the current mappings section.
              </p>
            </div>
            <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setShowSaveSuccessModal(false)}
                className="px-6 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inactivate Confirmation Modal */}
      {showInactivateModal && recipeToInactivate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full transform scale-95 animate-scaleIn">
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
                Remove Recipe
              </h3>
              <button
                onClick={handleCancelInactivate}
                disabled={inactivating}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
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
                    Are you sure you want to remove this recipe from the category?
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-6">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {recipeToInactivate.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Category: {recipeToInactivate.category}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Cuisine: {recipeToInactivate.cuisine}
                </p>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                This action will remove the recipe from the current category mapping.
              </p>
            </div>
            <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={handleCancelInactivate}
                disabled={inactivating}
                className="w-full sm:w-auto px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleInactivateRecipe}
                disabled={inactivating}
                className="w-full sm:w-auto px-6 py-3 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm order-1 sm:order-2 flex items-center justify-center gap-2"
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

      {/* Copy Recipe Modal */}
      {showCopyModal && selectedRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 p-4">
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

export default CategoryRecipeMapping;