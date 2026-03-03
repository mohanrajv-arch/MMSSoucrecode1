import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, RefreshCw, Save, Loader2, Calculator, Filter, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SearchableSelect from 'src/components/Spa Components/DropdownSearch';
import { useAuth, useCredentials, useFormatAmount, useFormatDate } from 'src/context/AuthContext';

const AddMealMenu = () => {
  const [mealTypes, setMealTypes] = useState([]);
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [menuName, setMenuName] = useState('');
  const [filterOptions, setFilterOptions] = useState(['All Categories']);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState('All Categories');
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);
  const [generalModal, setGeneralModal] = useState({ isOpen: false, type: 'success', message: '' });
  const navigate = useNavigate();
  const { projectSettings } = useAuth();
  const formatDate = useFormatDate();
  const formatAmount = useFormatAmount();
  const credentials = useCredentials();
  const userId = credentials?.userId || 0;

  // Centralised API fetch with token + session handling
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
      } catch (e) {}
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

  // Session Expired Modal
  const SessionExpiredModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
        <h2 className="text-lg font-bold text-gray-900">Session Expired</h2>
        <p className="mt-2 text-sm text-gray-600">
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
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
        <div className="flex justify-center mb-4">
          {generalModal.type === 'success' ? (
            <CheckCircle className="h-12 w-12 text-green-500" />
          ) : (
            <AlertCircle className="h-12 w-12 text-red-500" />
          )}
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          {generalModal.type === 'success' ? 'Success!' : 'Error!'}
        </h2>
        <p className="text-sm text-gray-600 mb-4">{generalModal.message}</p>
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

  // Fetch meal types for dropdown
  useEffect(() => {
    const fetchMealTypes = async () => {
      try {
        const data = await apiFetch('https://kelvinmms.com:8443/api-gateway-mms/meal-set-template-services/mealSetTemplateController/loadMealTypeDropDown', { method: 'GET' });
        if (data.success && data.data.length > 0) {
          setMealTypes(data.data);
        }
      } catch (error) {
        console.error(error);
        setSessionExpired(true);
      }
    };
    fetchMealTypes();
  }, []);

  // Fetch templates based on meal type
  const fetchTemplates = async (mealTypeFk) => {
    try {
      const data = await apiFetch(`https://kelvinmms.com:8443/api-gateway-mms/menu-creation-service/mealSetMenuController/loadMealSetTemplateDropDown/${mealTypeFk}`, { method: 'GET' });
      if (data.success && data.data.length > 0) {
        setTemplates(data.data);
      } else {
        setTemplates([]);
        setSelectedTemplate(null);
        setTableData([]);
        setFilterOptions(['All Categories']);
        setSelectedFilterCategory('All Categories');
      }
    } catch (error) {
      console.error(error);
      setSessionExpired(true);
    }
  };

  // Fetch categories and recipes based on template
  const fetchCategoriesAndRecipes = async (templateFk) => {
    if (!templateFk) return;
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await apiFetch('https://kelvinmms.com:8443/api-gateway-mms/menu-creation-service/mealSetMenuController/categoryListByFk', {
        method: 'POST',
        body: JSON.stringify({ templateFk }),
      });
     
      if (data.success && data.data && data.data.length > 0) {
        const templateData = data.data[0];
        const detailList = templateData.detailList || [];
        // Deduplicate categories by categoryFk to avoid duplicate rows
        const categoryMap = new Map();
        detailList.forEach((category) => {
          if (!categoryMap.has(category.categoryFk)) {
            categoryMap.set(category.categoryFk, category);
          }
        });
        const uniqueDetailList = Array.from(categoryMap.values());
        // Process categories and recipes from the API response
        const processedData = [];
        let rowId = 0;
        uniqueDetailList.forEach((category) => {
          const categoryName = category.categoryName;
          const categoryFk = category.categoryFk;
          const recipes = category.recipes || [];
          // Create recipe options from the recipes array, prepend 'Select Recipe' as first option
          const recipeOptions = [
            { name: 'Select Recipe', pk: null },
            ...recipes.map((recipe) => ({
              name: recipe.recipeName,
              pk: recipe.recipeFk,
              portionSize: recipe.portionSize || 0.0,
              perPortionCost: recipe.perPortionCost || 0.0,
              uom: recipe.uom || 'Kg'
            }))
          ];
          // Create rows based on recipeCount for each category
          const recipeCount = category.recipeCount || 1;
          for (let i = 0; i < recipeCount; i++) {
            processedData.push({
              id: rowId++,
              categoryName: categoryName,
              categoryFk: categoryFk,
              recipeOptions: recipeOptions,
              selectedRecipe: null,
              idealPortion: 0.0000,
              costPerPortion: 0.00,
            });
          }
        });
        setTableData(processedData);
        // Set filter options
        const uniqueCategories = ['All Categories', ...new Set(uniqueDetailList.map(cat => cat.categoryName))];
        setFilterOptions(uniqueCategories);
        setSelectedFilterCategory('All Categories');
      } else {
        setTableData([]);
        setFilterOptions(['All Categories']);
        setSelectedFilterCategory('All Categories');
      }
    } catch (error) {
      console.error(error);
      setSessionExpired(true);
      setTableData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Computed filter option objects for SearchableSelect
  const filterOptionObjects = useMemo(() => {
    return filterOptions.map((opt) => ({ name: opt }));
  }, [filterOptions]);

  // Computed displayed table data based on filter
  const displayedData = useMemo(() => {
    if (selectedFilterCategory === 'All Categories') {
      return tableData;
    }
    return tableData.filter((row) => row.categoryName === selectedFilterCategory);
  }, [tableData, selectedFilterCategory]);

  // Calculate total cost
  const totalCost = useMemo(() => {
    return tableData
      .filter((row) => row.selectedRecipe)
      .reduce((sum, row) => sum + (row.costPerPortion), 0);
  }, [tableData]);

  // Handle meal type change
  const handleMealTypeChange = (selectedName) => {
    const mealType = mealTypes.find((mt) => mt.name === selectedName);
    setSelectedMealType(mealType);
    setSelectedTemplate(null);
    setTableData([]);
    setMenuName('');
    setFilterOptions(['All Categories']);
    setSelectedFilterCategory('All Categories');
    if (mealType) {
      fetchTemplates(mealType.pk);
    }
  };

  // Handle template change
  const handleTemplateChange = (selectedName) => {
    const template = templates.find((t) => t.name === selectedName);
    setSelectedTemplate(template);
    setTableData([]);
    setMenuName('');
    setFilterOptions(['All Categories']);
    setSelectedFilterCategory('All Categories');
    if (template) {
      fetchCategoriesAndRecipes(template.pk);
    }
  };

  // Check if recipe is already selected in the same category
const isRecipeAlreadySelected = (recipePk, currentRowId) => {
  return tableData.some((row) => 
    row.selectedRecipe?.pk === recipePk && 
    row.id !== currentRowId
  );
};

  // Handle recipe change for a row

const handleRecipeChange = (rowId, selectedName) => {
  if (selectedName === 'Select Recipe') {
    setTableData((prev) =>
      prev.map((r) => {
        if (r.id === rowId) {
          return {
            ...r,
            selectedRecipe: null,
            idealPortion: 0.0000,
            costPerPortion: 0.00,
          };
        }
        return r;
      })
    );
    return;
  }

  setTableData((prev) => {
    const currentData = [...prev];
    const currentRow = currentData.find((r) => r.id === rowId);
    if (!currentRow) return prev;

    const recipe = currentRow.recipeOptions.find((opt) => opt.name === selectedName);
    if (!recipe) return prev;

    // Check for duplicate recipe ANYWHERE in the table (across all categories)
    if (isRecipeAlreadySelected(recipe.pk, rowId)) {
      setGeneralModal({ 
        isOpen: true, 
        type: 'error', 
        message: `Recipe "${recipe.name}" is already added in another category. Each recipe can only be used once.` 
      });
      return prev; // Don't allow the change
    }

    // Clear the error if any
    setErrorMessage('');

    return currentData.map((r) => {
      if (r.id === rowId) {
        return {
          ...r,
          selectedRecipe: recipe,
          idealPortion: recipe.portionSize,
          costPerPortion: recipe.perPortionCost,
        };
      }
      return r;
    });
  });
};

  // Handle refresh
  const handleRefresh = () => {
    if (selectedTemplate) {
      fetchCategoriesAndRecipes(selectedTemplate.pk);
    }
  };

  // Save meal set menu
  const handleSave = async () => {
    const errors = [];
    if (!selectedMealType) errors.push('Meal Type is required');
    if (!selectedTemplate) errors.push('Template is required');
    if (!menuName.trim()) errors.push('Menu Name is required');
    else if (menuName.length > 50) errors.push('Menu Name cannot exceed 50 characters');
    if (tableData.filter((row) => row.selectedRecipe).length === 0) errors.push('At least one recipe must be selected');
    if (errors.length > 0) {
      setErrorMessage(errors.join(', '));
      setGeneralModal({ isOpen: true, type: 'error', message: errors.join(', ') });
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    // Prepare detailList - only rows with selected recipe
    const detailList = tableData
      .filter((row) => row.selectedRecipe)
      .map((row) => ({
        categoryFk: row.categoryFk,
        categoryName: row.categoryName,
        recipeFk: row.selectedRecipe.pk,
      }));
    // Calculate counts: unique categories (no duplicates), total selected recipes
    const categoryCount = new Set(detailList.map((d) => d.categoryFk)).size;
    const recipeCount = detailList.length;
    const payload = {
      mealTypeFk: selectedMealType.pk,
      templateFk: selectedTemplate.pk,
      menuName: menuName.trim(),
      categoryCount,
      recipeCount,
      totalCost: totalCost,
      approverBy: 1, // Replace with actual userFk from session or context if available
      detailList,
    };
    console.log('Payload to save:', payload);
    try {
      const data = await apiFetch('https://kelvinmms.com:8443/api-gateway-mms/menu-creation-service/mealSetMenuController/saveMealSetMenu', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (data.success) {
        setSuccessMessage('Meal set menu saved successfully!');
        setGeneralModal({ isOpen: true, type: 'success', message: 'Meal set menu saved successfully!' });
        setTimeout(() => navigate('/Transaction/MealSetMenu'), 1500);
      } else {
        setErrorMessage(data.message || 'Failed to save meal set menu.');
        setGeneralModal({ isOpen: true, type: 'error', message: data.message || 'Failed to save meal set menu.' });
      }
    } catch (error) {
      console.error(error);
      setSessionExpired(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {sessionExpired && <SessionExpiredModal />}
      {generalModal.isOpen && <GeneralStatusModal />}
      {/* Header */}
      <div className="bg-white border-b rounded-lg border-gray-200 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Create Meal Set Menu</h1>
          <p className="text-xs text-gray-600 mt-0.5">Add new meal set menu with recipes</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/Transaction/MealSetMenu')}
            className="flex items-center gap-1.5 px-3 py-3 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-3 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !selectedMealType || !selectedTemplate || !menuName.trim() || menuName.length > 50 || tableData.filter((row) => row.selectedRecipe).length === 0}
            className="flex items-center gap-1.5 px-3 py-3 bg-orange-600 text-white rounded-lg text-xs font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={18} />}
          </button>
        </div>
      </div>
      {/* Main Content */}
      <div className="py-4 space-y-4">
        {/* Form Fields */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Menu Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Meal Type *</label>
              <SearchableSelect
                options={mealTypes}
                value={selectedMealType?.name || ''}
                onChange={handleMealTypeChange}
                placeholder="Select Meal Type"
                displayKey="name"
                valueKey="name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Template *</label>
              <SearchableSelect
                options={templates}
                value={selectedTemplate?.name || ''}
                onChange={handleTemplateChange}
                placeholder="Select Template"
                disabled={!selectedMealType}
                displayKey="name"
                valueKey="name"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Menu Name *</label>
              <input
                type="text"
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
                maxLength={50}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Enter menu name"
              />
              <p className={`text-xs ${50 - menuName.length <= 0 ? 'text-red-500' : 'text-gray-500'}`}>
                {Math.max(0, 50 - menuName.length)} Characters remaining
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Filter Category</label>
              <div className="relative">
                <SearchableSelect
                  options={filterOptionObjects}
                  value={selectedFilterCategory}
                  onChange={setSelectedFilterCategory}
                  placeholder="Filter by Category"
                  disabled={!selectedTemplate || isLoading}
                  displayKey="name"
                  valueKey="name"
                />
              </div>
            </div>
          </div>
        </div>
        {/* Recipe Selection Table */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Recipe Selection</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded">
                <Calculator size={14} className="text-blue-600" />
                <span className="text-xs font-medium text-blue-800">
                  Total: <span className="font-bold">  {formatAmount(totalCost || 0, projectSettings?.costDecimalPlaces || 2)}</span>
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {displayedData.length} items
              </div>
            </div>
          </div>
         
          <div className="overflow-x-auto overflow-y-visible border border-gray-200 rounded">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider min-w-[120px]">Category</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider min-w-[250px]">Recipe</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider min-w-[100px]">Portion</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider min-w-[100px]">Cost/Portion</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Loader2 size={18} className="animate-spin text-gray-400 mb-1.5" />
                        <p className="text-xs text-gray-500">Loading recipes...</p>
                      </div>
                    </td>
                  </tr>
                ) : displayedData.length > 0 ? (
                  displayedData.map((row) => {
                    const rowTotal = (row.idealPortion * row.costPerPortion) || 0;
                    return (
                      <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2 whitespace-nowrap min-w-[120px]">
                          <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                            {row.categoryName}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-left relative min-w-[250px]">
                          <SearchableSelect
                            options={row.recipeOptions}
                            value={row.selectedRecipe?.name || ''}
                            onChange={(newName) => handleRecipeChange(row.id, newName)}
                            placeholder="Select Recipe"
                            displayKey="name"
                            valueKey="name"
                            className="w-full"
                          />
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap min-w-[100px]">
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-gray-900 font-medium">
                                {formatAmount(row.idealPortion|| 0, projectSettings?.costDecimalPlaces || 2)}
                            </span>
                            <span className="text-xs text-gray-500">Kg</span>
                          </div>
                        </td>
                        <td className="py-2 whitespace-nowrap text-center min-w-[100px]">
                          <span className="text-sm text-gray-900 font-medium">
                             {formatAmount(row.costPerPortion|| 0, projectSettings?.costDecimalPlaces || 2)}
                          </span>
                        </td>
                       
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <div className="bg-gray-100 p-2 rounded-full mb-2">
                          <Calculator size={16} className="text-gray-400" />
                        </div>
                        <p className="text-xs font-medium">No recipes available</p>
                        <p className="text-xs mt-0.5">Select a template to view recipes</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Messages */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            {successMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddMealMenu;