import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Trash2, ArrowLeft, RefreshCw, Save, CheckCircle, XCircle, ChevronDown, Tag, Loader2, Search } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { useCredentials } from 'src/context/AuthContext';

interface MealType {
  pk: number;
  code: string;
  name: string;
}

interface CategoryOption {
  pk: number;
  code: string;
  name: string;
}

interface SelectedCategory {
  id: string;
  categoryFk: number;
  categoriesName: string;
  recipesRequired: number;
}

const ModifyMealTemplate = (readOnly = false) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [categories, setCategories] = useState<SelectedCategory[]>([]);
  const [showMealTypeDropdown, setShowMealTypeDropdown] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [searchCategoryTerm, setSearchCategoryTerm] = useState('');
  const [isLoadingMealTypes, setIsLoadingMealTypes] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);
  const [templateData, setTemplateData] = useState<any>(null);

  const credentials = useCredentials();
  const navigate = useNavigate();
  const location = useLocation();
  const { id: templateId } = location.state || {};

  const baseUrl = 'https://kelvinmms.com:8443/api-gateway-mms/meal-set-template-services/mealSetTemplateController';

  const title = templateId ? 'Modify Meal Set Template' : 'Create Meal Set Template';

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Generic fetch helper
  const apiFetch = async (url: string, options: RequestInit = {}) => {
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
    } catch (e: any) {
      console.error('Failed to parse JSON response:', e);
      throw new Error(`Invalid JSON response from server: ${e?.message ?? String(e)}`);
    }
    // Check for session expired
    if (data.success === false && data.message === "Session expired or invalid. Please login again.") {
      setSessionExpired(true);
      throw new Error(data.message);
    }
    return data;
  };

  // Fetch Meal Types
  useEffect(() => {
    const fetchMealTypes = async () => {
      setIsLoadingMealTypes(true);
      setErrorMessage('');
      try {
        const data = await apiFetch(`${baseUrl}/loadMealTypeDropDown`, { method: 'GET' });
        if (data.success && data.data && Array.isArray(data.data)) {
          setMealTypes(data.data);
          if (!templateId) {
            setSelectedMealType(data.data[0] || null);
          }
        } else {
          setErrorMessage(data.message || 'No meal types records found in the response.');
        }
      } catch (error: any) {
        console.error('Error loading meal types records:', error);
        setSessionExpired(true);
      } finally {
        setIsLoadingMealTypes(false);
      }
    };
    fetchMealTypes();
  }, [templateId]);

  // Fetch Template Data
  const fetchTemplate = useCallback(async () => {
    if (!templateId) return;
    setIsLoadingTemplate(true);
    setErrorMessage('');
    try {
      const data = await apiFetch(`${baseUrl}/mealSetViewById?id=${templateId}`, { method: 'GET' });
      if (data.success && data.data) {
        setTemplateData(data.data);
      } else {
        setErrorMessage(data.message || 'No template data found.');
      }
    } catch (error: any) {
      console.error('Error loading template:', error);
      setSessionExpired(true);
    } finally {
      setIsLoadingTemplate(false);
    }
  }, [templateId, baseUrl]);

  useEffect(() => {
    fetchTemplate();
  }, [fetchTemplate]);

  // Populate form from template data
  useEffect(() => {
    if (templateData && mealTypes.length > 0) {
      const mealType = mealTypes.find(mt => mt.name === templateData.mealType);
      if (mealType) {
        setSelectedMealType(mealType);
      }
      setTemplateName(templateData.templateName || '');
      if (templateData.categoryList && Array.isArray(templateData.categoryList)) {
        const selectedCats = templateData.categoryList.map((cat: any) => ({
          id: `edit-${cat.categoryFk || cat.pk || Math.random()}`,
          categoryFk: cat.categoryFk || cat.pk,
          categoriesName: cat.categoriesName,
          recipesRequired: Math.max(1, cat.totalRecipes || 1),
        }));
        setCategories(selectedCats);
      }
    }
  }, [templateData, mealTypes]);

  // Fetch Category Options when modal opens
  useEffect(() => {
    if (showCategoryModal) {
      const fetchCategories = async () => {
        setIsLoadingCategories(true);
        setErrorMessage('');
        setSearchCategoryTerm('');
        setSelectedCategoryIds([]);
        try {
          const data = await apiFetch(`${baseUrl}/loadCategoryDropDown`, { method: 'GET' });
          if (data.success && data.data && Array.isArray(data.data)) {
            setCategoryOptions(data.data);
          } else {
            setErrorMessage(data.message || 'No categories records found in the response.');
          }
        } catch (error: any) {
          console.error('Error loading categories records:', error);
          setSessionExpired(true);
        } finally {
          setIsLoadingCategories(false);
        }
      };
      fetchCategories();
    }
  }, [showCategoryModal]);

  // Set selectedCategoryIds when modal opens
  useEffect(() => {
    if (showCategoryModal) {
      setSelectedCategoryIds([]);
      setSearchCategoryTerm('');
    }
  }, [showCategoryModal]);

  // Filtered category options based on search
  const filteredCategoryOptions = useMemo(() => {
    return categoryOptions.filter(option =>
      option.name.toLowerCase().includes(searchCategoryTerm.toLowerCase())
    );
  }, [categoryOptions, searchCategoryTerm]);

  const addCategories = () => {
    const existingPks = new Set(categories.map(c => c.categoryFk));
    const newPks = selectedCategoryIds.filter(pk => !existingPks.has(pk));
    const newCategories = newPks.map((pk) => {
      const option = categoryOptions.find(opt => opt.pk === pk);
      if (!option) return null;
      return {
        id: Date.now().toString() + Math.random(),
        categoryFk: option.pk,
        categoriesName: option.name,
        recipesRequired: 1,
      };
    }).filter(Boolean) as SelectedCategory[];
    setCategories([...categories, ...newCategories]);
    setShowCategoryModal(false);
    setSelectedCategoryIds([]);
    setSearchCategoryTerm('');
  };

  const removeCategory = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  const updateCategory = (id: string, field: 'recipesRequired', value: number) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, [field]: value } : cat
    ));
  };

  const totalCategories = categories.length;
  const totalRecipes = categories.reduce((sum, cat) => sum + cat.recipesRequired, 0);

  const validateAndSave = async () => {
    const errors: string[] = [];
    if (!selectedMealType) errors.push('Meal Type is required');
    if (!templateName.trim()) errors.push('Template Name is required');
    else if (templateName.length > 50) errors.push('Template Name cannot exceed 50 characters');
    if (categories.length === 0) errors.push('At least one category is required');
    if (categories.some(cat => cat.recipesRequired < 1)) errors.push('Recipes required must be at least 1 for each category');

    if (errors.length > 0) {
      setErrorMessage(errors.join(', '));
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    try {
      let endpoint = `${baseUrl}/saveMealSetTemplate`;
      let payload = {
        ...(templateData?.id && { id: templateData.id }),
        mealTypeFk: selectedMealType.pk,
        mealType: selectedMealType.name,
        totalCategories,
        totalRecipes,
        templateName: templateName.trim(),
        approverBy: credentials?.userId || 'admin_user',
        subList: categories.map(cat => ({
          categoryFk: cat.categoryFk,
          categoriesName: cat.categoriesName,
          totalRecipes: cat.recipesRequired,
        })),
      };

      // For modify, use modify endpoint and adjust payload
      if (templateId) {
        endpoint = `${baseUrl}/modifyMealSetTemplate`;
        payload = {
          id: templateData.id,
          mealTypeFk: selectedMealType.pk,
          mealType: selectedMealType.name,
          totalCategories,
          totalRecipes,
          templateName: templateName.trim(),
          approvalStatus: 3,
          approverBy: credentials?.userId || 'admin_user',
          subList: categories.map(cat => ({
            categoryFk: cat.categoryFk,
            categoriesName: cat.categoriesName,
            totalRecipes: cat.recipesRequired,
          })),
        };
      }

      const data = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (data.success) {
        setSuccessMessage('Template Modified successfully!');
        setTimeout(() => navigate('/Transaction/MealSetTemplate'), 1500);
      } else {
        setErrorMessage(data.message || 'Modify failed');
      }
    } catch (error: any) {
      console.error('Error Modifying template:', error);
      setSessionExpired(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    if (templateId) {
      await fetchTemplate();
    } else {
      setSelectedMealType(null);
      setTemplateName('');
      setCategories([]);
      setShowMealTypeDropdown(false);
    }
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

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {sessionExpired && <SessionExpiredModal />}
      {/* Header */}
      <div className="bg-white rounded-lg dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {title}
            </h1>
         
          </div>
          <div className="flex gap-2">
            <button 
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              onClick={() => navigate('/Transaction/MealSetTemplate')}
            >
              <ArrowLeft size={16} />
            </button>
            <button 
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              {isLoadingTemplate ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            </button>
            <button 
              onClick={validateAndSave}
              className="flex items-center gap-2 px-3 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm disabled:opacity-50"
              disabled={isSaving}
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="mx-4 sm:mx-6 max-w-7xl p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-300 mb-4">
          <div className="flex items-center gap-2">
            <XCircle size={20} />
            {errorMessage}
          </div>
        </div>
      )}
      {successMessage && (
        <div className="mx-4 sm:mx-6 max-w-7xl p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md text-green-700 dark:text-green-300 mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle size={20} />
            {successMessage}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors">
          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Meal Type Dropdown */}
     <div>
  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
    Meal Type <span className="text-red-500">*</span>
  </label>
  <div className="relative">
    <button
      onClick={() => !isLoadingMealTypes && !isLoadingTemplate && !readOnly && setShowMealTypeDropdown(!showMealTypeDropdown)}
      disabled={isLoadingMealTypes || isLoadingTemplate || readOnly}
      className="w-full px-3 py-2.5 text-left bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center justify-between text-sm"
    >
      <span>
        {isLoadingMealTypes || isLoadingTemplate ? 'Loading...' : 
         readOnly ? (selectedMealType?.name || 'No selection') : 
         (selectedMealType?.name || 'Select Type Option')}
      </span>
      {!readOnly && <ChevronDown size={16} className="text-gray-400" />}
    </button>
    {showMealTypeDropdown && !readOnly && (
      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
        {/* Select Type Option as first item */}
        <button
          key="select-type"
          onClick={() => {
            setSelectedMealType(null);
            handleRefresh();
            setShowMealTypeDropdown(false);
          }}
          className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-sm first:rounded-t-md transition-colors"
        >
          Select Type Option
        </button>
        {mealTypes.map((type) => (
          <button
            key={type.pk}
            onClick={() => {
              setSelectedMealType(type);
              setShowMealTypeDropdown(false);
            }}
            className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-sm last:rounded-b-md transition-colors"
          >
            {type.name}
          </button>
        ))}
      </div>
    )}
  </div>
</div>

            {/* Template Name */}
            <div className="space-y-2">
              <label htmlFor="templateNameInput" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                Template Name <span className="text-red-500">*</span>
              </label>
              <input
                id="templateNameInput"
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                maxLength={50}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-sm placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50"
                placeholder="Enter template name"
              />
              <p className={`text-xs ${50 - templateName.length <= 0 ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {Math.max(0, 50 - templateName.length)} Characters remaining
              </p>
            </div>
          </div>

          {/* Category Requirements Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Tag size={20} className="text-indigo-600" />
                Category Requirements
              </h2>
              {!readOnly && <button
                onClick={() => setShowCategoryModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm shadow-md hover:shadow-lg"
                disabled={isLoadingCategories}
              >
                <Plus size={16} />
                Add Categories
              </button>}
            </div>

            {/* Categories Table */}
            <div className="border border-gray-200 dark:border-gray-600 rounded-md overflow-hidden bg-white dark:bg-gray-800">
              {/* Table Header */}
              <div className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-4 py-3">
                  <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">Category Name</div>
                  <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">Recipes Required</div>
                  <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center sm:text-left">Actions</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200 dark:divide-gray-600 max-h-64 overflow-y-auto">
                {categories.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                    <Search size={24} className="mx-auto mb-2 opacity-50" />
                    No categories added. Select from modal to start.
                  </div>
                ) : (
                  categories.map((category) => (
                    <div key={category.id} className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{category.categoriesName}</div>
                      <div>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={category.recipesRequired}
                          onChange={(e) => {
                            const val = e.target.value;
                            const num = val === '' ? 0 : parseInt(val, 10) || 0;
                            updateCategory(category.id, 'recipesRequired', num);
                          }}
                          onBlur={(e) => {
                            const val = e.target.value;
                            const num = val === '' ? 1 : parseInt(val, 10) || 1;
                            updateCategory(category.id, 'recipesRequired', Math.max(1, num));
                          }}
                          className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-sm disabled:opacity-50"
                        />
                      </div>
                      <div className="flex justify-center sm:justify-start">
                        <button
                          onClick={() => removeCategory(category.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Summary Footer */}
              <div className="bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                <div className="px-4 py-3 space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                    <span>Total Categories:</span>
                    <span className="text-indigo-600 dark:text-indigo-400">{totalCategories}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                    <span>Total Recipes:</span>
                    <span className="text-green-600 dark:text-green-400">{totalRecipes}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && !readOnly && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div
              className="fixed inset-0 bg-black/30 transition-opacity"
              role="button"
              tabIndex={0}
              aria-label="Close category modal"
              onClick={() => setShowCategoryModal(false)}
              onKeyDown={(e) => {
                // support Enter, Space and Escape to close the overlay
                if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
                  setShowCategoryModal(false);
                }
              }}
            />
            <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-5xl mb-7">
              <div className="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Categories</h3>
                    {/* Search Input */}
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                      <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchCategoryTerm}
                        onChange={(e) => setSearchCategoryTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-sm placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {isLoadingCategories ? (
                        <div className="text-center py-8">
                          <Loader2 size={20} className="mx-auto mb-2 text-indigo-600 animate-spin" />
                          Loading categories...
                        </div>
                      ) : filteredCategoryOptions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          No categories found.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {filteredCategoryOptions.map((option) => {
                            const isAlreadySelected = categories.some((cat) => cat.categoryFk === option.pk);
                            const isTemporarilySelected = selectedCategoryIds.includes(option.pk);
                            return (
                              <label
                                key={option.pk}
                                className={`flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer text-sm border transition-colors ${
                                  isAlreadySelected ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : ''
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isAlreadySelected || isTemporarilySelected}
                                  disabled={isAlreadySelected}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedCategoryIds([...selectedCategoryIds, option.pk]);
                                    } else {
                                      setSelectedCategoryIds(selectedCategoryIds.filter((id) => id !== option.pk));
                                    }
                                  }}
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
                                />
                                <span className="ml-2 text-gray-900 dark:text-gray-100 truncate">{option.name}</span>
                                {isAlreadySelected && (
                                  <span className="ml-2 text-xs text-indigo-600 dark:text-indigo-400">(Already Added)</span>
                                )}
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  disabled={selectedCategoryIds.length === 0 || isLoadingCategories}
                  className="w-full inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto disabled:opacity-50"
                  onClick={addCategories}
                >
                  Add Selected ({selectedCategoryIds.length})
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md bg-white dark:bg-gray-600 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 sm:mt-0 sm:w-auto"
                  onClick={() => setShowCategoryModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModifyMealTemplate;