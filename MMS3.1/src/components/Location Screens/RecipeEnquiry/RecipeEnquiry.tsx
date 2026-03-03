import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useCredentials, useFormatAmount, useFormatDate, useFormatQuantity } from "src/context/AuthContext";
import { CustomizerContext } from "src/context/CustomizerContext";
import SearchableSelect from "src/components/Spa Components/DropdownSearch";
import { RefreshCw } from 'lucide-react';
// Types
interface Category {
  id: number;
  name: string;
  value: number;
  pk: number;
}
interface Recipe {
  id: number;
  recipeName: string;
  servings: number;
  cuisineName: string;
  categoryListName: string[];
  mealList: Array<{ mealName: string }>;
  description?: string;
  portionSize?: number;
  baseQuantity?: number;
  finishedProduct?: number;
  uom?: string;
  perPortionCost?: number;
  cookingInstruction?: string;
  totalCost?: number;
  recipeSubList: RecipeSubItem[];
  status?: string;
  refNo?: string;
}
interface RecipeSubItem {
  itemCode: string;
  itemName: string;
  packageId: string;
  packagePrice: number;
  chefUnit: string;
  costPrice: number;
  quantity: number;
  itemCategoryName: string;
  packagePerCost: number;
  packagePerQty: number;
  total: number;
}
interface RawMaterial {
  itemCode: string;
  itemName: string;
  packageId: string;
  packagePrice: number;
  chefUnit: string;
  costPrice: number;
  baseQuantity: number;
  adjustedQuantity: number;
  baseTotal: number;
  adjustedTotal: number;
  category: string;
}
interface CostSummary {
  baseTotalCost: number;
  adjustedTotalCost: number;
  costPerPortionBase: number;
  costPerPortionAdjusted: number;
}
const RecipeEnquiry: React.FC = () => {
  const navigate = useNavigate();
  const { projectSettings } = useAuth();
  const formatDate = useFormatDate();
  const formatAmount = useFormatAmount();
  const formatQuantity = useFormatQuantity();
  const { setIsLayout, isLayout } = useContext(CustomizerContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [tableSearchTerm, setTableSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [basePortion, setBasePortion] = useState();
  const [loading, setLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [recipeDetailsLoading, setRecipeDetailsLoading] = useState(false);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [costSummary, setCostSummary] = useState<CostSummary>({
    baseTotalCost: 0,
    adjustedTotalCost: 0,
    costPerPortionBase: 0,
    costPerPortionAdjusted: 0
  });
  const [sortConfig, setSortConfig] = useState<{ key: keyof RawMaterial; direction: 'asc' | 'desc' } | null>(null);
const [multiplier, setMultiplier] = useState<number>();
const [newPortion, setNewPortion] = useState<number>();
const [adjustedFinishedProduct, setAdjustedFinishedProduct] = useState<number>(20.0000);
  // Set layout to "boxed" as default on component mount to respect config
  useEffect(() => {
    setIsLayout("boxed");
  }, [setIsLayout]);
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
      if (response.status === 401 || response.status === 403) {
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
  // Session Expired Modal Component (exactly like MealSetTemplate)
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
  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const categoryResponse = await apiFetch(
          'https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/loadCategoryDropDown',
          {
            method: 'GET',
          }
        );
        console.log('Category API Response:', categoryResponse);
       
        if (categoryResponse.success && categoryResponse.data && categoryResponse.data.length > 0) {
          const transformedCategories = categoryResponse.data.map((item: any) => ({
            id: item.pk,
            name: item.name,
            value: item.pk,
            pk: item.pk
          }));
          setCategories([{ id: 0, name: 'All Categories', value: 0, pk: 0 }, ...transformedCategories]);
        } else {
          setCategories([{ id: 0, name: 'All Categories', value: 0, pk: 0 }]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([{ id: 0, name: 'All Categories', value: 0, pk: 0 }]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);
  // Fetch recipes from NEW API - Updated to recipe-service
  const fetchRecipes = async (categoryId?: number) => {
    try {
      setRecipesLoading(true);
     
      // Prepare request body - send categoryFk only if a category is selected (not 0)
      const requestBody = categoryId && categoryId > 0 ? { categoryFk: categoryId } : {};
     
      console.log('Fetching recipes with request body:', requestBody);
      console.log('Selected category ID:', categoryId);
     
      const recipeResponse = await apiFetch(
        'https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/recipeMasterList',
        {
          method: 'POST',
          body: JSON.stringify(requestBody)
        }
      );
      console.log('Recipe Listing API Response:', recipeResponse);
     
      if (recipeResponse.success && recipeResponse.data && recipeResponse.data.length > 0) {
        const transformedRecipes: Recipe[] = recipeResponse.data.map((item: any) => {
          console.log('Processing recipe item:', item);
         
          // Extract category names from categoryList array
          let categoryListName: string[] = [];
          if (item.categoryList && Array.isArray(item.categoryList)) {
            categoryListName = item.categoryList
              .map((category: any) => {
                if (category && typeof category === 'object' && category.categoryName) {
                  return category.categoryName;
                }
                return null;
              })
              .filter((name: string | null): name is string => name !== null);
          }
          // Transform mealList - handle array of objects with mealName
          const mealList = (item.mealList && Array.isArray(item.mealList))
            ? item.mealList.map((meal: any) => ({
                mealName: String(meal.mealName || 'Unknown Meal')
              }))
            : [];
          return {
            id: item.id || 0,
            recipeName: String(item.recipeName || 'Unnamed Recipe'),
            servings: Number(item.servings) || 0,
            cuisineName: String(item.cuisineName || 'Unknown Cuisine'),
            categoryListName: categoryListName.length > 0 ? categoryListName : ['Uncategorized'],
            mealList: mealList,
            description: `${item.recipeName || 'Recipe'} - ${item.cuisineName || 'Unknown'} cuisine`,
            portionSize: Number(item.portionSize || 0),
            baseQuantity: Number(item.baseQuantity || item.servings || 0),
            finishedProduct: Number(item.finishedProduct || 0),
            uom: String(item.uom || "Kg"),
            perPortionCost: Number(item.perPortionCost || 0),
            cookingInstruction: String(item.cookingInstruction || ""),
            totalCost: Number(item.totalCost || 0),
            recipeSubList: item.recipeSubList || [],
            status: String(item.status || "A"),
            refNo: String(item.refNo || "")
          };
        });
        setRecipes(transformedRecipes);
      } else {
        console.log('No recipes found in response');
        setRecipes([]);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setRecipes([]);
    } finally {
      setRecipesLoading(false);
    }
  };
  // Fetch detailed recipe data when a recipe is selected
  const fetchRecipeDetails = async (recipeId: number) => {
    try {
      setRecipeDetailsLoading(true);
     
      const response = await apiFetch(
        `https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/recipeViewById/${recipeId}`,
        {
          method: 'GET',
        }
      );
      console.log('Recipe Details API Response:', response);
     
      if (response.success && response.data) {
        const recipeData = response.data;
       
        // Extract category names from categoryListName array - handle nested objects
        let categoryListName: string[] = [];
        if (recipeData.categoryListName && Array.isArray(recipeData.categoryListName)) {
          categoryListName = recipeData.categoryListName
            .map((category: any) => {
              if (typeof category === 'string') {
                return category;
              } else if (category && typeof category === 'object' && category.categoryName) {
                return category.categoryName;
              }
              return null;
            })
            .filter((name: string | null): name is string => name !== null);
        }
        // Transform the API data to match our Recipe interface
        const detailedRecipe: Recipe = {
          id: recipeData.id || 0,
          recipeName: String(recipeData.recipeName || 'Unnamed Recipe'),
          servings: Number(recipeData.baseQuantity) || 0,
          cuisineName: String(recipeData.cuisineName || 'Unknown Cuisine'),
          categoryListName: categoryListName.length > 0 ? categoryListName : ['Uncategorized'],
          mealList: (recipeData.mealList && Array.isArray(recipeData.mealList))
            ? recipeData.mealList.map((meal: any) => ({
                mealName: String(meal.mealName || 'Unknown Meal')
              }))
            : [],
          description: `${recipeData.recipeName || 'Recipe'} - ${recipeData.cuisineName || 'Unknown'} cuisine`,
          portionSize: Number(recipeData.portionSize || 0.3522),
          baseQuantity: Number(recipeData.baseQuantity || 56.78),
          finishedProduct: Number(recipeData.finishedProduct || 20.0),
          uom: String(recipeData.uom || "Kg"),
          perPortionCost: Number(recipeData.perPortionCost || 7.1),
          cookingInstruction: String(recipeData.cookingInstruction || "No instructions provided"),
          totalCost: Number(recipeData.totalCost || 142.03),
          recipeSubList: recipeData.recipeSubList || [],
          status: String(recipeData.status || "A"), // Ensure status is preserved exactly from API
          refNo: String(recipeData.refNo || "")
        };
        setSelectedRecipe(detailedRecipe);
       
        // Set base portion and initial values
        const baseQty = detailedRecipe.baseQuantity || detailedRecipe.servings || 0;
        setBasePortion(baseQty);
        setNewPortion(baseQty);
        setMultiplier(1);
        setAdjustedFinishedProduct(detailedRecipe.finishedProduct || 20.0000);
        // Transform recipeSubList to RawMaterials - USING REAL API DATA
        const transformedRawMaterials: RawMaterial[] = (recipeData.recipeSubList || []).map((subItem: any) => ({
          itemCode: String(subItem.itemCode || 'N/A'),
          itemName: String(subItem.itemName || 'Unknown Item'),
          packageId: String(subItem.packageId || 'N/A'),
          packagePrice: Number(subItem.packagePrice || 0),
          chefUnit: String(subItem.chefUnit || 'N/A'),
          costPrice: Number(subItem.costPrice || 0),
          baseQuantity: Number(subItem.quantity || 0),
          adjustedQuantity: Number(subItem.quantity || 0),
          baseTotal: Number(subItem.total || 0),
          adjustedTotal: Number(subItem.total || 0),
          category: String(subItem.itemCategoryName || 'Uncategorized')
        }));
        setRawMaterials(transformedRawMaterials);
        // Calculate cost summary - USING REAL API DATA
        const baseTotal = Number(recipeData.totalCost || 0);
        const adjustedTotal = baseTotal * multiplier;
        const costPerPortionBase = baseTotal / baseQty;
        const costPerPortionAdjusted = adjustedTotal / newPortion;
        setCostSummary({
          baseTotalCost: baseTotal,
          adjustedTotalCost: adjustedTotal,
          costPerPortionBase: costPerPortionBase,
          costPerPortionAdjusted: costPerPortionAdjusted
        });
      } else {
        console.error('No recipe data found in response');
      }
    } catch (error) {
      console.error('Error fetching recipe details:', error);
    } finally {
      setRecipeDetailsLoading(false);
    }
  };
  // Update cost summary and raw materials when multiplier changes
  useEffect(() => {
    if (selectedRecipe) {
      const baseTotal = selectedRecipe.totalCost || 0;
      const adjustedTotal = baseTotal * multiplier;
      const costPerPortionBase = baseTotal / basePortion;
      const costPerPortionAdjusted = adjustedTotal / newPortion;
      setCostSummary({
        baseTotalCost: baseTotal,
        adjustedTotalCost: adjustedTotal,
        costPerPortionBase: costPerPortionBase,
        costPerPortionAdjusted: costPerPortionAdjusted
      });
      // Update raw materials with adjusted quantities and totals
      const updatedRawMaterials = rawMaterials.map(material => ({
        ...material,
        adjustedQuantity: material.baseQuantity * multiplier,
        baseTotal: material.costPrice * material.baseQuantity,
        adjustedTotal: material.costPrice * material.baseQuantity * multiplier
      }));
      setRawMaterials(updatedRawMaterials);
    }
  }, [multiplier, basePortion, newPortion, selectedRecipe]);
  // Fetch recipes when component mounts
  useEffect(() => {
    fetchRecipes();
  }, []);
  // Fetch recipes when category changes
  useEffect(() => {
    if (!categoriesLoading) {
      fetchRecipes(selectedCategory);
    }
  }, [selectedCategory, categoriesLoading]);
  // Handle category selection
  const handleCategoryChange = (name: string) => {
    console.log('Category selected:', name);
    const category = categories.find(c => c.name === name);
    setSelectedCategory(category ? category.pk : 0);
  };
  const categoryOptions = categories.map(cat => ({ name: cat.name, pk: cat.pk }));
  // Filter recipes based on search term (client-side filtering only for search)
  const filteredRecipes = recipes.filter(recipe =>
    recipe.recipeName.toLowerCase().includes(searchTerm.toLowerCase())
  );
// Update your input handling functions to allow 0 explicitly
const handleMultiplierChange = (value: number | '') => {
  if (value === '') {
    setMultiplier(0);
    setNewPortion(0);
    if (selectedRecipe) {
      setAdjustedFinishedProduct(0);
    }
  } else {
    setMultiplier(value);
    const newPortionValue = basePortion * value;
    setNewPortion(newPortionValue);
    if (selectedRecipe) {
      setAdjustedFinishedProduct((selectedRecipe.finishedProduct || 20) * value);
    }
  }
};
const handleAdjustedProductChange = (value: number | '') => {
  if (value === '') {
    setAdjustedFinishedProduct(0);
    setMultiplier(0);
    setNewPortion(0);
  } else {
    setAdjustedFinishedProduct(value);
    if (selectedRecipe) {
      const newMultiplier = value / (selectedRecipe.finishedProduct || 20);
      setMultiplier(newMultiplier);
      setNewPortion(basePortion * newMultiplier);
    }
  }
};
const handlePortionChange = (value: number | '') => {
  if (value === '') {
    setNewPortion(0);
    setMultiplier(0);
    if (selectedRecipe) {
      setAdjustedFinishedProduct(0);
    }
  } else {
    setNewPortion(value);
    const newMultiplier = value / basePortion;
    setMultiplier(newMultiplier);
    if (selectedRecipe) {
      setAdjustedFinishedProduct((selectedRecipe.finishedProduct || 20) * newMultiplier);
    }
  }
};
// Replace the existing input handling functions with these:
const handleNumericInputChange = (
  currentValue: number,
  newVal: string,
  setter: (val: number) => void,
  handler?: (val: number) => void
) => {
  // Allow empty string or valid numbers including 0
  if (newVal === '' || /^\d*\.?\d*$/.test(newVal)) {
    if (newVal.startsWith('-')) return; // Prevent negatives
   
    // Parse the value, default to 0 if empty or invalid
    const numVal = newVal === '' ? 0 : parseFloat(newVal);
   
    // Prevent NaN
    if (isNaN(numVal)) {
      setter(0);
      if (handler) handler(0);
    } else {
      // Ensure value is within reasonable bounds (allow 0)
      const boundedValue = Math.max(0, Math.min(numVal, 999999));
      setter(boundedValue);
      if (handler) handler(boundedValue);
    }
  }
};
const handleNumericInputBlur = (currentValue: number, newVal: string, setter: (val: number) => void) => {
  const numVal = parseFloat(newVal) || 0;
  // Ensure the value is a valid number (allow 0)
  const finalValue = isNaN(numVal) ? 0 : numVal;
  setter(finalValue);
};
  const handleRecipeSelect = async (recipe: Recipe) => {
    console.log('Selected recipe ID:', recipe.id);
    console.log('Selected recipe status:', recipe.status); // Log to verify status
    await fetchRecipeDetails(recipe.id);
  };
  const handleRefresh = async () => {
    await fetchRecipes(selectedCategory);
    if (selectedRecipe) {
      await fetchRecipeDetails(selectedRecipe.id);
    }
  };
  // Table sort handler
  const handleSort = (key: keyof RawMaterial) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  // Numeric columns for sorting
  const numericColumns = ['packagePrice', 'costPrice', 'baseQuantity', 'adjustedQuantity', 'baseTotal', 'adjustedTotal'] as (keyof RawMaterial)[];
  // Comparator for sorting
  const getComparator = (key: keyof RawMaterial) => (a: RawMaterial, b: RawMaterial) => {
    let aVal = a[key];
    let bVal = b[key];
    const isNumeric = numericColumns.includes(key);
    if (isNumeric) {
      aVal = Number(aVal);
      bVal = Number(bVal);
    } else {
      aVal = String(aVal).toLowerCase();
      bVal = String(bVal).toLowerCase();
    }
    if (aVal < bVal) return -1;
    if (aVal > bVal) return 1;
    return 0;
  };
  // Filtered and sorted raw materials
  const sortedRawMaterials = useMemo(() => {
    let sortableRawMaterials = [...rawMaterials];
    if (tableSearchTerm) {
      sortableRawMaterials = sortableRawMaterials.filter(material =>
        material.itemName.toLowerCase().includes(tableSearchTerm.toLowerCase()) ||
        material.itemCode.toLowerCase().includes(tableSearchTerm.toLowerCase()) ||
        material.category.toLowerCase().includes(tableSearchTerm.toLowerCase()) ||
        material.packageId.toLowerCase().includes(tableSearchTerm.toLowerCase()) ||
        material.chefUnit.toLowerCase().includes(tableSearchTerm.toLowerCase())
      );
    }
    if (sortConfig !== null) {
      sortableRawMaterials.sort((a, b) => {
        const comparator = getComparator(sortConfig.key);
        const cmp = comparator(a, b);
        return sortConfig.direction === 'asc' ? cmp : -cmp;
      });
    }
    return sortableRawMaterials;
  }, [rawMaterials, tableSearchTerm, sortConfig]);
  // Get status display text and color
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'A':
        return { text: 'Active', color: 'bg-green-500' };
      case 'I':
        return { text: 'Inactive', color: 'bg-red-500' };
      default:
        return { text: 'Unknown', color: 'bg-gray-500' };
    }
  };
  // Session Expired Modal
  if (sessionExpired) {
    return <SessionExpiredModal />;
  }
  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 text-gray-700 dark:text-gray-300 ${isLayout === 'boxed' ? 'container mx-auto px-3 py-4 max-w-7xl' : 'container mx-auto px-3 py-4 max-w-7xl'}`}>
      {/* Header with Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 mb-4">
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
            Recipe Enquiry
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Select and analyze recipe costs and ingredients
          </p>
        </div>
       
        {/* Action Buttons */}
        <div className="flex gap-2 flex-shrink-0">
        <button 
              className="flex items-center gap-1 bg-yellow-300 dark:bg-gray-700 hover:bg-gray-300 px-3 py-2 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200"
              title="Reload"
              onClick={handleRefresh}
            >
              <RefreshCw size={18} />
            </button>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-6 gap-3">
        {/* Left Column - Recipe Selection - Fixed */}
        <div className="xl:col-span-2 space-y-3">
          {/* Search and Filter Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2.5 shadow-sm h-fit">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-white mb-2.5 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Select Recipe
            </h2>
           
            {/* Search */}
            <div className="mb-2.5">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search recipes by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-2 py-1.5 pl-7 border border-gray-300 dark:border-gray-600 rounded-lg text-xs bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <svg className="absolute left-2 top-2 w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            {/* Category Filter */}
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filter by Category
              </label>
              <SearchableSelect
                options={categoryOptions}
                value={categories.find(c => c.pk === selectedCategory)?.name || 'All Categories'}
                onChange={handleCategoryChange}
                placeholder="All Categories"
                displayKey="name"
                valueKey="name"
                disabled={categoriesLoading}
                className="w-full text-xs"
              />
            </div>
            <div className="border-t border-gray-200 dark:border-gray-600 pt-1.5">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center">
                {filteredRecipes.length} recipes found
                {recipesLoading && ' (Loading...)'}
              </p>
            </div>
          </div>
          {/* Recipe List with Compact Design */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2.5 shadow-sm h-fit">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Available Recipes
            </h3>
           
            <div className="max-h-[300px] overflow-y-auto pr-1 space-y-1">
              {recipesLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 animate-pulse">
                    <div className="flex justify-between items-start mb-1">
                      <div className="h-2.5 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                      <div className="h-2.5 bg-gray-300 dark:bg-gray-600 rounded w-6"></div>
                    </div>
                    <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-full mb-1"></div>
                    <div className="flex gap-1">
                      <div className="h-2.5 bg-gray-300 dark:bg-gray-600 rounded w-8"></div>
                      <div className="h-2.5 bg-gray-300 dark:bg-gray-600 rounded w-6"></div>
                    </div>
                  </div>
                ))
              ) : filteredRecipes.length > 0 ? (
                filteredRecipes.map((recipe) => {
                  const statusInfo = getStatusInfo(recipe.status || 'A');
                  return (
                    <div
                      key={recipe.id}
                      className={`bg-white dark:bg-gray-800 rounded-lg border p-2
                        cursor-pointer transition-all duration-200 group ${
                        selectedRecipe?.id === recipe.id
                          ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm'
                      }`}
                      onClick={() => handleRecipeSelect(recipe)}
                    >
                      <div className="flex justify-between items-start mb-0.5">
                        <h3 className="text-xs font-semibold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                          {recipe.recipeName}
                        </h3>
                        <div className="flex items-center gap-1">
                         
                          <div className={`w-1.5 h-1.5 rounded-full ${statusInfo.color}`} title={statusInfo.text}></div>
                        </div>
                      </div>
                     
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400
                       bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded-full flex-shrink-0">
                            {recipe.categoryListName.length > 0 ? recipe.categoryListName[0] : 'Uncategorized'}
                          </span>
                      {/* Meal Types */}
                      <div className="flex flex-wrap mt-0.5 gap-0.5 mb-0.5">
                        {recipe.mealList.slice(0, 2).map((meal, index) => (
                          <span
                            key={index}
                            className="text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-1 py-0.5 rounded-full"
                          >
                            {meal.mealName}
                          </span>
                        ))}
                        {recipe.mealList.length > 2 && (
                          <span className="text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-1 py-0.5 rounded-full">
                            +{recipe.mealList.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-2.5">
                  <svg className="w-5 h-5 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    {searchTerm ? 'No recipes match your search.' : 'No recipes available.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Conditional Right Content */}
        {!selectedRecipe ? (
          /* Empty State - Full right column */
          <div className="xl:col-span-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center shadow-sm h-full flex items-center justify-center">
              <div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-1.5">
                  No Recipe Selected
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Choose a recipe from the list to view detailed cost analysis, ingredients, and cooking instructions.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Upper Right Column - Recipe Details, Cost Summary, Portion Adjustment */}
            <div className="xl:col-span-4 space-y-3">
              {recipeDetailsLoading && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 shadow-sm">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                    <div className="h-2.5 bg-gray-300 dark:bg-gray-600 rounded w-full mb-1"></div>
                    <div className="h-2.5 bg-gray-300 dark:bg-gray-600 rounded w-5/6 mb-3"></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    </div>
                  </div>
                </div>
              )}
              {/* Recipe Details */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-gray-800 dark:text-white">
                    Recipe Details
                  </h2>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${getStatusInfo(selectedRecipe.status || 'A').color} animate-pulse`}
                         title={getStatusInfo(selectedRecipe.status || 'A').text}></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {getStatusInfo(selectedRecipe.status || 'A').text}
                    </span>
                  </div>
                </div>
                {/* Recipe Name */}
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                  {selectedRecipe.recipeName}
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {/* Categories - Fixed height with scroll */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                      <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Categories
                    </h4>
                    <div className="max-h-20 overflow-y-auto">
                      <div className="flex flex-wrap gap-1">
                        {selectedRecipe.categoryListName.length > 0 ? (
                          selectedRecipe.categoryListName.map((categoryName, index) => (
                            <span
                              key={index}
                              className="text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full"
                            >
                              {categoryName}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500 dark:text-gray-400 italic">No categories assigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Meal Types */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                      <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Meal Types
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedRecipe.mealList.length > 0 ? (
                        selectedRecipe.mealList.map((meal, index) => (
                          <span
                            key={index}
                            className="text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full"
                          >
                            {meal.mealName}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400 italic">No meal types assigned</span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Specifications Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-2">
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-0.5">Meal Portion</p>
                      <p className="text-xs font-semibold text-gray-800 dark:text-white">
                        {formatQuantity(selectedRecipe.portionSize || 0, 4)}
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-2">
                      <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-0.5">Finished Product</p>
                      <p className="text-xs font-semibold text-gray-800 dark:text-white">
                        {formatQuantity(selectedRecipe.finishedProduct || 0, 4)} {selectedRecipe.uom}
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-2">
                      <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-0.5">UOM</p>
                      <p className="text-xs font-semibold text-gray-800 dark:text-white">{selectedRecipe.uom}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-2">
                      <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-0.5">Base Quantity</p>
                      <p className="text-xs font-semibold text-gray-800 dark:text-white">
                        {formatQuantity(selectedRecipe.baseQuantity || 0, 4)} {selectedRecipe.uom}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Cost Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Cost Summary
                </h3>
               
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <div className="text-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-2.5 text-white">
                    <p className="text-xs opacity-90 mb-0.5">Base Total Cost</p>
                    <p className="text-base font-bold">{formatAmount(costSummary.baseTotalCost, 4)}</p>
                  </div>
                  <div className="text-center bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-2.5 text-white">
                    <p className="text-xs opacity-90 mb-0.5">Adjusted Total Cost</p>
                    <p className="text-base font-bold">{formatAmount(costSummary.adjustedTotalCost, 4)}</p>
                  </div>
                  <div className="text-center bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-2.5 text-white">
                    <p className="text-xs opacity-90 mb-0.5">Cost per Portion (Base)</p>
                    <p className="text-base font-bold">{formatAmount(costSummary.costPerPortionBase, 4)}</p>
                  </div>
                  <div className="text-center bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-2.5 text-white">
                    <p className="text-xs opacity-90 mb-0.5">Cost per Portion (Adjusted)</p>
                    <p className="text-base font-bold">{formatAmount(costSummary.costPerPortionAdjusted, 4)}</p>
                  </div>
                </div>
              </div>
              {/* Portion Adjustment */}
     <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 shadow-sm">
  <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-1">
    <svg className="w-3.5 h-3.5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
    Portion Adjustment
  </h3>
 
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
    {/* Base Portion - Read Only */}
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
        Base Portion
      </label>
      <div className="px-2 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-white font-medium text-xs">
        {formatQuantity(basePortion, 4)} {selectedRecipe.uom}
      </div>
    </div>
   
    {/* New Portion - Editable - Fixed to allow 0 */}
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
        New Portion
      </label>
      <input
        type="number"
        value={newPortion === 0 ? '0' : newPortion} // Explicitly show '0' when value is 0
        onChange={(e) => {
          const value = e.target.value;
          if (value === '' || value === '0' || /^\d*\.?\d*$/.test(value)) { // Allow empty and 0 explicitly
            const numValue = value === '' ? '' : (parseFloat(value) || 0);
            handlePortionChange(numValue);
          }
        }}
        onBlur={(e) => {
          const value = e.target.value;
          const numValue = value === '' ? 0 : (parseFloat(value) || 0);
          handlePortionChange(numValue);
        }}
        className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-xs bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        min="0"
        max="999999"
        step="any"
      />
    </div>
   
    {/* Multiplier - Editable - Fixed to allow 0 */}
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
        Multiplier
      </label>
      <input
        type="number"
        value={multiplier === 0 ? '0' : multiplier} // Explicitly show '0' when value is 0
        onChange={(e) => {
          const value = e.target.value;
          if (value === '' || value === '0' || /^\d*\.?\d*$/.test(value)) { // Allow empty and 0 explicitly
            const numValue = value === '' ? '' : (parseFloat(value) || 0);
            handleMultiplierChange(numValue);
          }
        }}
        onBlur={(e) => {
          const value = e.target.value;
          const numValue = value === '' ? 0 : (parseFloat(value) || 0);
          handleMultiplierChange(numValue);
        }}
        className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-xs bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        min="0"
        max="999999"
        step="any"
      />
    </div>
    {/* Adjusted Finished Product - Editable - Fixed to allow 0 */}
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
        Adjusted Finished Product
      </label>
      <div className="relative">
        <input
          type="number"
          value={adjustedFinishedProduct === 0 ? '0' : adjustedFinishedProduct} // Explicitly show '0' when value is 0
          onChange={(e) => {
            const value = e.target.value;
            if (value === '' || value === '0' || /^\d*\.?\d*$/.test(value)) { // Allow empty and 0 explicitly
              const numValue = value === '' ? '' : (parseFloat(value) || 0);
              handleAdjustedProductChange(numValue);
            }
          }}
          onBlur={(e) => {
            const value = e.target.value;
            const numValue = value === '' ? 0 : (parseFloat(value) || 0);
            handleAdjustedProductChange(numValue);
          }}
          className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-xs bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          min="0"
          max="999999"
          step="any"
        />
        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400">
          {selectedRecipe.uom}
        </span>
      </div>
    </div>
  </div>
</div>
            </div>
            {/* Full Width Lower Sections - Table and Cooking Instructions */}
            <div className="xl:col-span-6 space-y-3">
              {/* Raw Materials Table - Optimized Widths */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1.5 shadow-sm">
                <div className="flex justify-between items-center mb-2 px-1.5">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Raw Materials
                  </h3>
                  <div className="relative w-48">
                    <input
                      type="text"
                      placeholder="Search raw materials..."
                      value={tableSearchTerm}
                      onChange={(e) => setTableSearchTerm(e.target.value)}
                      className="w-full px-2 py-1.5 pl-7 border border-gray-300 dark:border-gray-600 rounded-lg text-xs bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <svg className="absolute left-2 top-2 w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
               
                <div className="overflow-x-auto w-full">
                  <div className="max-h-60 overflow-y-auto w-full">
                    <table className="w-full text-xs min-w-max">
                      <thead>
                        <tr className="border-b-2 border-gray-300 dark:border-gray-600 sticky top-0 bg-blue-500 dark:bg-gray-700 z-10">
                          <th
                            className="px-1 py-1.5 text-left font-semibold text-white dark:text-gray-300 whitespace-nowrap w-[120px] cursor-pointer hover:bg-blue-600 transition-colors"
                            onClick={() => handleSort('itemName')}
                          >
                            ITEM NAME {sortConfig?.key === 'itemName' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                          </th>
                             <th
                            className="px-1 py-1.5 text-left font-semibold text-white dark:text-gray-300 whitespace-nowrap w-[80px] cursor-pointer hover:bg-blue-600 transition-colors"
                            onClick={() => handleSort('category')}
                          >
                            CATEGORY {sortConfig?.key === 'category' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                          </th>
                          <th
                            className="px-1 py-1.5 text-left font-semibold text-white dark:text-gray-300 whitespace-nowrap w-[60px] cursor-pointer hover:bg-blue-600 transition-colors"
                            onClick={() => handleSort('packageId')}
                          >
                            PACKAGE ID {sortConfig?.key === 'packageId' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                          </th>
                          <th
                            className="px-1 py-1.5 text-left font-semibold text-white dark:text-gray-300 whitespace-nowrap w-[70px] cursor-pointer hover:bg-blue-600 transition-colors"
                            onClick={() => handleSort('packagePrice')}
                          >
                            PKG PRICE {sortConfig?.key === 'packagePrice' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                          </th>
                          <th
                            className="px-1 py-1.5 text-left font-semibold text-white dark:text-gray-300 whitespace-nowrap w-[60px] cursor-pointer hover:bg-blue-600 transition-colors"
                            onClick={() => handleSort('chefUnit')}
                          >
                            UNIT {sortConfig?.key === 'chefUnit' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                          </th>
                          <th
                            className="px-1 py-1.5 text-left font-semibold text-white dark:text-gray-300 whitespace-nowrap w-[70px] cursor-pointer hover:bg-blue-600 transition-colors"
                            onClick={() => handleSort('costPrice')}
                          >
                            COST PRICE {sortConfig?.key === 'costPrice' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                          </th>
                          <th
                            className="px-1 py-1.5 text-left font-semibold text-white dark:text-gray-300 whitespace-nowrap w-[60px] cursor-pointer hover:bg-blue-600 transition-colors"
                            onClick={() => handleSort('baseQuantity')}
                          >
                            BASE QTY {sortConfig?.key === 'baseQuantity' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                          </th>
                          <th
                            className="px-1 py-1.5 text-left font-semibold text-white dark:text-gray-300 whitespace-nowrap w-[60px] cursor-pointer hover:bg-blue-600 transition-colors"
                            onClick={() => handleSort('adjustedQuantity')}
                          >
                            ADJ QTY {sortConfig?.key === 'adjustedQuantity' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                          </th>
                          <th
                            className="px-1 py-1.5 text-left font-semibold text-white dark:text-gray-300 whitespace-nowrap w-[80px] cursor-pointer hover:bg-blue-600 transition-colors"
                            onClick={() => handleSort('baseTotal')}
                          >
                            BASE TOTAL {sortConfig?.key === 'baseTotal' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                          </th>
                          <th
                            className="px-1 py-1.5 text-left font-semibold text-white dark:text-gray-300 whitespace-nowrap w-[80px] cursor-pointer hover:bg-blue-600 transition-colors"
                            onClick={() => handleSort('adjustedTotal')}
                          >
                            ADJUSTED TOTAL {sortConfig?.key === 'adjustedTotal' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                          </th>
                      
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                        {sortedRawMaterials.length > 0 ? (
                          sortedRawMaterials.map((material, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                              <td className="px-1 py-1.5 text-gray-600 dark:text-gray-400 w-[120px]">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-gray-800 dark:text-white text-[10px] leading-tight">
                                    {material.itemCode}
                                  </span>
                                  <span className="text-[10px] leading-tight break-words">
                                    {material.itemName}
                                  </span>
                                </div>
                              </td>
                                  <td className="px-1 py-1.5 font-bold text-gray-600 dark:text-gray-400 w-[80px] text-[11px] break-words">
                                {material.category}
                              </td>
                              <td className="px-1 py-1.5 text-gray-600 font-bold dark:text-gray-400 w-[60px] text-[10px]">
                                {material.packageId}
                              </td>
                              <td className="px-1 py-1.5 text-gray-600 font-bold dark:text-gray-400 w-[70px] text-[10px] text-center">
                                {formatAmount(material.packagePrice, 2)}
                              </td>
                              <td className="px-1 py-1.5 text-gray-600 font-bold dark:text-gray-400 w-[60px] text-[10px] text-center">
                                {material.chefUnit}
                              </td>
                              <td className="px-1 py-1.5 text-gray-600 font-bold dark:text-gray-400 w-[70px] text-[10px] text-center">
                                {formatAmount(material.costPrice, 2)}
                              </td>
                              <td className="px-1 py-1.5 text-gray-600 font-bold dark:text-gray-400 w-[60px] text-[10px] text-center">
                                {formatQuantity(material.baseQuantity, 2)}
                              </td>
                              <td className="px-1 py-1.5 font-bold text-blue-600 dark:text-blue-400 w-[60px] text-[10px] text-center">
                                {formatQuantity(material.adjustedQuantity, 2)}
                              </td>
                              <td className="px-1 py-1.5 font-bold text-gray-800 dark:text-white w-[80px] text-[10px] text-center">
                                {formatAmount(material.baseTotal, 2)}
                              </td>
                              <td className="px-1 py-1.5 font-bold text-green-600 dark:text-green-400 w-[80px] text-[10px] text-center">
                                {formatAmount(material.adjustedTotal, 2)}
                              </td>
                         
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={10} className="px-1 py-3 text-center text-gray-500 dark:text-gray-400 text-xs">
                              {tableSearchTerm ? 'No raw materials match your search.' : 'No raw materials data available'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              {/* Cooking Instructions - Full Width, Below Table */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Cooking Instructions
                </h3>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2.5 border border-yellow-200 dark:border-yellow-800">
                  <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {selectedRecipe.cookingInstruction || "No cooking instructions provided."}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default RecipeEnquiry;