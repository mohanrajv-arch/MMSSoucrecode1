import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { Search, Plus, Trash2, X, Users, ChefHat, DollarSign, Scale, PlayCircle, Eye, List, Grid, BarChart2, AlertCircle, Layers, TrendingUp, ArrowLeft, BarChart3, Package, Filter, Download, RefreshCw, ChevronDown, CheckCircle, ChevronUp } from 'lucide-react';
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import plateChart from "D:/Esfita/Projects/MMS Simulation/src/assets/images/Plate chart/plateChart.png";
import { useAuth, useFormatAmount, useFormatDate, useFormatQuantity } from 'src/context/AuthContext';
import { BiMoney } from 'react-icons/bi';
// Removed import for SearchableSelect since we're replacing with custom dropdowns

interface MealType {
  pk: number;
  code: string;
  name: string;
}
interface Category {
  pk: number;
  code: string;
  name: string;
}
interface Recipe {
  recipeFk: number;
  recipeName: string;
  categoryName: string;
  cuisineName: string;
  portionSize: number;
  uom: string;
  perPortionCost: number;
  categoryList: CategoryItem[];
  ingList: IngredientItem[];
}
interface CategoryItem {
  categoryName: string;
  categoryFk: number;
}
interface IngredientItem {
  itemCategoryName: string;
  itemCode: string;
  itemName: string;
  packageId: string;
  packagePrice: number;
  packageBaseFactor: number;
  packageBaseUnit: string;
  packageSecondaryFactor: number;
  packageSecondaryUnit: string;
  packageSecondaryCost: number;
  baseQuantity: number;
  secondaryQuantity: number;
  totalCost: number;
  mainCategory?: string;
}
interface TableItem extends Recipe {
  id: string;
  pobParticipation: number;
  finalCost: number;
  selectedCategory: string;
  participationPercentage: number;
}
interface MealTab {
  pk: number;
  name: string;
  items: TableItem[];
  pob: number;
  total: number;
}

// Custom Dropdown Component (replaces SearchableSelect for immediate close on selection)
const CustomDropdown: React.FC<{
  options: { label: string; value: string | number }[];
  value: string | number | null;
  onChange: (value: string | number | null) => void;
  placeholder: string;
  className?: string;
  dropdownKey?: string;
}> = ({ options, value, onChange, placeholder, className = '', dropdownKey = 'default' }) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setOpen(!open);

  const handleSelect = (selectedValue: string | number) => {
    onChange(selectedValue);
    setOpen(false); // Immediately close on selection
    setSearchTerm(''); // Reset search
  };

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-left flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-500 transition-colors text-gray-700 dark:text-gray-300 text-sm relative"
      >
        <span className="truncate">
          {value ? options.find(opt => opt.value === value)?.label || placeholder : placeholder}
        </span>
        <ChevronDown size={16} className={`text-gray-500 dark:text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto top-full left-0">
          <div className="p-2 border-b border-gray-200 dark:border-gray-600">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-500 rounded bg-gray-50 dark:bg-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors text-sm"
              >
                {opt.label}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">No options found</div>
          )}
        </div>
      )}
    </div>
  );
};

const MenuSimulation: React.FC = () => {
  const formatAmount = useFormatAmount();
  const formatQuantity = useFormatQuantity();
  const formatDate = useFormatDate();
    const { projectSettings } = useAuth();
  const [name, setName] = useState('');
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>({ pk: 0, code: 'All Categories', name: 'All Categories' });
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [mealTabs, setMealTabs] = useState<MealTab[]>([]);
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedModalCategory, setSelectedModalCategory] = useState<string>('');
  const [sidebarCollapsed] = useState(false);
  const [globalPob, setGlobalPob] = useState(100);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TableItem | null>(null);
  const [showSimulation, setShowSimulation] = useState(false);
  const [currentChartData, setCurrentChartData] = useState<any[]>([]);
  const [currentLevel, setCurrentLevel] = useState<'main' | 'sub' | 'item'>('main');
  const [selectedMain, setSelectedMain] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [aggSearchTerm, setAggSearchTerm] = useState('');
  const [aggSortConfig, setAggSortConfig] = useState({ key: 'totalCost', direction: 'desc' });
  const [mealChartLevel, setMealChartLevel] = useState<'meal' | 'recipe' | 'ingredient'>('meal');
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [selectedMealRecipe, setSelectedMealRecipe] = useState<string | null>(null);
  const [mealChartData, setMealChartData] = useState<any[]>([]);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [generalModal, setGeneralModal] = useState({ isOpen: false, type: 'success', message: '' });
  const navigate = useNavigate();
  const categoryChartRef = useRef<any>(null);
  const baseUrl = 'https://kelvinmms.com:8443/api-gateway-mms/menu-creation-service/menuSimulationController';
  // Enhanced color palette for professional look
  const professionalColors = {
    primary: '#4F46E5',
    secondary: '#6366F1',
    accent: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4',
    dark: '#1F2937',
    light: '#F9FAFB'
  };
  const richColors = [
    '#4F46E5', '#3B82F6', '#10B981', '#F59E0B', '#EC4899',
    '#EF4444', '#06B6D4', '#8B5CF6', '#D97706', '#14B8A6',
    '#84CC16', '#A855F7', '#E11D48', '#0EA5E9', '#6366F1',
    '#22C55E', '#F97316', '#DB2777', '#2563EB', '#FACC15',
    '#2DD4BF', '#A21CAF', '#EA580C', '#0C4A6E', '#4D7C0F'
  ];
  const categoryColors = [
    '#6366f1', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6',
    '#ec4899', '#eab308', '#14b8a6', '#ef4444', '#06b6d4',
    '#f97316', '#db2777', '#2563eb', '#facc15', '#2dd4bf',
    '#a855f7', '#f97316', '#db2777', '#2563eb', '#facc15',
    '#2dd4bf', '#a855f7', '#f97316', '#db2777', '#2563eb',
    '#facc15', '#2dd4bf', '#a855f7', '#f97316', '#db2777',
  ];
  // Plate design colors from the image
  const platePieColors = [
    '#F4D03F', // yellow for fats
    '#3498DB', // blue for protein
    '#2ECC71', // green for fruits & vegetables
    '#D35400', // brown for cellulose
    ...categoryColors // fallback for more slices
  ];
  // Enhanced metric cards with AED currency
  const metricCards = [
    {
      title: "Total Cost",
      value: "0.00",
      icon: BiMoney,
      color: professionalColors.primary,
      bgColor: "bg-gradient-to-br from-indigo-50 to-blue-50",
      currency: "AED"
    },
    {
      title: "Total Items",
      value: "0",
      icon: Package,
      color: professionalColors.success,
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50"
    },
    {
      title: "Cost Per Person",
      value: "0.00",
      icon: BarChart3,
      color: professionalColors.warning,
      bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
      currency: "AED"
    },
    {
      title: "Categories",
      value: "0",
      icon: Layers,
      color: professionalColors.info,
      bgColor: "bg-gradient-to-br from-cyan-50 to-blue-50"
    },
    {
      title: "Meal Types",
      value: "0",
      icon: ChefHat,
      color: professionalColors.accent,
      bgColor: "bg-gradient-to-br from-purple-50 to-violet-50"
    }
  ];
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
    if (data.success === false && data.message === "Session expired or invalid. Please login again.") {
      setSessionExpired(true);
      throw new Error(data.message);
    }
    return data;
  };
  // Session Expired Modal Component
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
  // Clear localStorage on component unmount to reset data when leaving the screen
  useEffect(() => {
    return () => {
      localStorage.removeItem('mealPlanningData');
    };
  }, []);
  // Fetch meal types
  useEffect(() => {
    const fetchMealTypes = async () => {
      try {
        const data = await apiFetch(`${baseUrl}/loadMealTypeDropDown`, { method: 'GET' });
        if (data.success) {
          setMealTypes(data.data);
        }
      } catch (error) {
        console.error('Error fetching meal types:', error);
        setSessionExpired(true);
      }
    };
    fetchMealTypes();
  }, []);
  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiFetch(`${baseUrl}/loadCategoryDropDown`, { method: 'GET' });
        if (data.data) {
          const allCategories = [{ pk: 0, code: 'All Categories', name: 'All Categories' }, ...data.data];
          setCategories(allCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setSessionExpired(true);
      }
    };
    fetchCategories();
  }, []);
  // Helper function to format recipe data and reduce nesting
  function formatRecipeData(data: any[]): Recipe[] {
    return data
      .filter((item: any) => item.recipeName && item.recipeName.trim() !== '')
      .map((item: any) => {
        const formattedIngList = (item.ingList || []).map((ing: any) => ({
          ...ing,
          mainCategory: ing.mainCategory || 'Food', // Keep default, assume API provides variety if available
          // Ensure all numeric fields are parsed as floats to avoid string issues
          packagePrice: parseFloat(ing.packagePrice) || 0,
          packageBaseFactor: parseFloat(ing.packageBaseFactor) || 0,
          packageSecondaryFactor: parseFloat(ing.packageSecondaryFactor) || 0,
          packageSecondaryCost: parseFloat(ing.packageSecondaryCost) || 0,
          baseQuantity: parseFloat(ing.baseQuantity) || 0,
          secondaryQuantity: parseFloat(ing.secondaryQuantity) || 0,
          totalCost: parseFloat(ing.totalCost) || 0,
        }));
        return {
          recipeFk: item.recipeFk || 0,
          recipeName: item.recipeName || 'Unnamed Recipe',
          categoryName: item.categoryName || '',
          cuisineName: item.cuisineName || 'N/A',
          portionSize: parseFloat(item.portionSize) || 0,
          uom: item.uom || 'Kg',
          perPortionCost: parseFloat(item.perPortionCost) || 0,
          categoryList: item.categoryList || [],
          ingList: formattedIngList
        };
      });
  }
  // Fetch recipes based on category
  useEffect(() => {
    const fetchRecipes = async () => {
      if (selectedCategory) {
        setLoading(true);
        try {
          const body = {
            categoryFk: selectedCategory.pk
          };
          const data = await apiFetch(`${baseUrl}/recipeList`, {
            method: 'POST',
            body: JSON.stringify(body),
          });
     
          if (data && data.success && data.data && Array.isArray(data.data)) {
            const formattedRecipes = formatRecipeData(data.data);
            setRecipes(formattedRecipes);
          } else {
            setRecipes([]);
          }
        } catch (error) {
          console.error('Error fetching recipes:', error);
          setSessionExpired(true);
          setRecipes([]);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchRecipes();
  }, [selectedCategory]);
  // Fixed POB change handler
  const handleGlobalPobChange = (newPob: number) => {
    if (newPob < 1) {
      console.warn('POB cannot be less than 1');
      return;
    }
    setGlobalPob(newPob);
    setMealTabs(prev => prev.map(tab => {
      const updatedItems = tab.items.map(item => {
        const effectiveParticipation = (newPob * item.participationPercentage) / 100;
        const finalCost = item.perPortionCost * effectiveParticipation;
        return {
          ...item,
          pobParticipation: newPob,
          finalCost: Number(finalCost.toFixed(2))
        };
      });
      const total = Number(updatedItems.reduce((sum, item) => sum + item.finalCost, 0).toFixed(2));
      return {
        ...tab,
        pob: newPob,
        items: updatedItems,
        total
      };
    }));
 
  };
  const handleMealTypeSelect = (mealType: MealType) => {
    setSelectedMealType(mealType);
    const existingTab = mealTabs.find(tab => tab.pk === mealType.pk);
    if (existingTab) {
      setActiveTab(mealType.pk);
      return;
    }
    const newTab: MealTab = {
      pk: mealType.pk,
      name: mealType.name,
      items: [],
      pob: globalPob,
      total: 0
    };
    setMealTabs(prev => [...prev, newTab]);
    setActiveTab(mealType.pk);
  };
  const handleParticipationChange = (tabPk: number, itemId: string, newPercentage: number) => {
    setMealTabs(prev => prev.map(tab => {
      if (tab.pk === tabPk) {
        const updatedItems = tab.items.map(item => {
          if (item.id === itemId) {
            const effectiveParticipation = (item.pobParticipation * newPercentage) / 100;
            const finalCost = item.perPortionCost * effectiveParticipation;
            return {
              ...item,
              participationPercentage: newPercentage,
              finalCost: Number(finalCost.toFixed(2))
            };
          }
          return item;
        });
        const total = Number(updatedItems.reduce((sum, item) => sum + item.finalCost, 0).toFixed(2));
        return { ...tab, items: updatedItems, total };
      }
      return tab;
    }));
  };
  const getDisplayCategory = (recipe: Recipe) => {
    if (recipe.categoryName && recipe.categoryName.trim() !== '') {
      return recipe.categoryName;
    }
    if (recipe.categoryList && recipe.categoryList.length > 0) {
      const firstCategory = recipe.categoryList.find(cat => cat.categoryName && cat.categoryName.trim() !== '');
      return firstCategory?.categoryName || '';
    }
    return '';
  };
  const addRecipeToTable = (recipe: Recipe, categoryName: string) => {
    const activeTabData = mealTabs.find(tab => tab.pk === activeTab);
    if (!activeTabData) return;
    const existingItem = activeTabData.items.find(item => item.recipeFk === recipe.recipeFk && item.recipeName === recipe.recipeName);
    if (existingItem) {
      alert('This recipe is already added to this meal tab!');
      return;
    }
    const participationPercentage = 100;
    const effectiveParticipation = (globalPob * participationPercentage) / 100;
    const finalCost = recipe.perPortionCost * effectiveParticipation;
    const newItem: TableItem = {
      ...recipe,
      id: `${recipe.recipeFk}_${Date.now()}`,
      pobParticipation: globalPob,
      finalCost: Number(finalCost.toFixed(2)),
      selectedCategory: categoryName,
      participationPercentage
    };
    setMealTabs(prev => prev.map(tab => {
      if (tab.pk === activeTab) {
        const updatedItems = [...tab.items, newItem];
        const total = Number(updatedItems.reduce((sum, item) => sum + item.finalCost, 0).toFixed(2));
        return { ...tab, items: updatedItems, total };
      }
      return tab;
    }));
    setShowModal(false);
    setSelectedRecipe(null);
    setSelectedModalCategory('');
  };
  const openRecipeModal = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setShowModal(true);
    if (recipe.categoryList && recipe.categoryList.length > 0) {
      setSelectedModalCategory(recipe.categoryList[0].categoryName);
    } else {
      setSelectedModalCategory('');
    }
  };
  const getAvailableCategories = (recipe: Recipe) => {
    if (recipe.categoryList && recipe.categoryList.length > 0) {
      return recipe.categoryList.filter(cat => cat.categoryName && cat.categoryName.trim() !== '');
    }
    return categories.filter(cat => cat.name !== 'All Categories').map(cat => ({
      categoryName: cat.name,
      categoryFk: cat.pk
    }));
  };
  const removeItemFromTable = (tabPk: number, itemId: string) => {
    setMealTabs(prev => prev.map(tab => {
      if (tab.pk === tabPk) {
        const updatedItems = tab.items.filter(item => item.id !== itemId);
        const total = Number(updatedItems.reduce((sum, item) => sum + item.finalCost, 0).toFixed(2));
        return { ...tab, items: updatedItems, total };
      }
      return tab;
    }));
  };
  const deleteTab = (tabPk: number) => {
    setMealTabs(prev => prev.filter(tab => tab.pk !== tabPk));
    if (activeTab === tabPk) {
      const remainingTabs = mealTabs.filter(tab => tab.pk !== tabPk);
      setActiveTab(remainingTabs.length > 0 ? remainingTabs[0].pk : null);
    }
  };
  const handleRunSimulation = () => {
    if (totalItems === 0) {
      setGeneralModal({ isOpen: true, type: 'error', message: 'Please add at least one recipe to run the simulation.' });
      return;
    }
    setShowSimulation(true);
    setTimeout(() => {
      document.getElementById('simulation')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  const handleDownloadError = async (response) => {
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
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
      setGeneralModal({
        isOpen: true,
        type: 'error',
        message: `Download failed (${response.status}): ${text}`,
      });
      return true;
    }
    return false;
  };
  const handleExportData = async () => {
    const costPerPerson = globalPob > 0 ? (totalOverallCost / globalPob) : 0;
    const payload = {
      pob: globalPob,
      totalCost: totalOverallCost.toFixed(2),
      itemCount: totalItems,
      categoriesCount: uniqueCategories,
      perPortionCost:costPerPersonNew,
      costPerPerson: costPerPerson,
      mealTypeList: mealTabs.map(tab => ({
        mealTypeName: tab.name,
        totalCost: tab.total,
        recipes: tab.items.map(item => ({
          categoryName: item.selectedCategory,
          recipeName: item.recipeName,
          portionSize: item.portionSize,
          uom: item.uom,
          perPortionCost: item.perPortionCost,
          pobParticipation: (globalPob * item.participationPercentage) / 100
        }))
      })),
      itemList: aggregatedItems.map(item => ({
        itemCategoryName: item.itemCategoryName,
        itemCode: item.itemCode,
        itemName: item.itemName,
        packageId: item.packageId,
        packagePrice: item.packagePrice,
        packageBaseFactor: item.packageBaseFactor,
        packageBaseUnit: item.packageBaseUnit,
        packageSecondaryFactor: item.packageSecondaryFactor,
        packageSecondaryUnit: item.packageSecondaryUnit,
        packageSecondaryCost: item.packageSecondaryCost,
        baseQuantity: item.baseQuantity,
        secondaryQuantity: item.secondaryQuantity,
        totalCost: item.totalCost
      }))
    };
    console.log('Export payload:', payload);
    const token = sessionStorage.getItem('token');
    if (!token) {
      setSessionExpired(true);
      return;
    }
    try {
      const response = await fetch(`${baseUrl}/exportMenuSimulationExcel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        await handleDownloadError(response);
        return;
      }
      const contentType = response.headers.get('Content-Type') || '';
      console.log('Content-Type:', contentType);
      const blob = await response.blob();
      console.log('Blob size:', blob.size, 'type:', blob.type);
      if (blob.size < 100) {
        const text = await blob.text();
        console.error('Small blob content:', text);
        setGeneralModal({ isOpen: true, type: 'error', message: 'Received small file, likely error: ' + text });
        return;
      }
      const validateBlob = async (blob: Blob) => {
        const bytes = new Uint8Array(await blob.slice(0, 8).arrayBuffer());
        if (bytes[0] === 80 && bytes[1] === 75 && bytes[2] === 3 && bytes[3] === 4) {
          return '.xlsx';
        } else if (bytes[0] === 208 && bytes[1] === 207 && bytes[2] === 17 && bytes[3] === 224 && bytes[4] === 161 && bytes[5] === 177 && bytes[6] === 26 && bytes[7] === 225) {
          return '.xls';
        } else {
          return null;
        }
      };
      const extension = await validateBlob(blob);
      if (!extension) {
        const text = await blob.text();
        setGeneralModal({ isOpen: true, type: 'error', message: 'Invalid file format. Content: ' + text });
        return;
      }
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `menu_simulation${extension}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setGeneralModal({ isOpen: true, type: 'success', message: 'Export successful!' });
    } catch (error) {
      console.error('Export error:', error);
      setGeneralModal({ isOpen: true, type: 'error', message: 'Failed to export data: ' + (error instanceof Error ? error.message : String(error)) });
    }
  };
  const handleRefresh = () => {
    setName('');
    setMealTabs([]);
    setActiveTab(null);
    setSelectedCategory({ pk: 0, code: 'All Categories', name: 'All Categories' });
    setSearchTerm('');
    setGlobalPob(100);
    setSelectedMealType(null);
    setShowSimulation(false);
    localStorage.removeItem('mealPlanningData');
    // Refetch initial data
    fetchMealTypes();
    fetchCategories();
    setRecipes([]);
  };
  const filteredRecipes = recipes.filter(recipe =>
    recipe.recipeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.cuisineName?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const activeTabData = mealTabs.find(tab => tab.pk === activeTab);
  const totalOverallCost = mealTabs.reduce((sum, tab) => sum + tab.total, 0);
  const totalItems = mealTabs.reduce((sum, tab) => sum + tab.items.length, 0);
  const uniqueCategories = new Set(mealTabs.flatMap(tab => tab.items.map(item => item.selectedCategory))).size;
  const avgCostPerItem = totalItems > 0 ? (totalOverallCost / totalItems).toFixed(2) : '0.00';
  // Compute repeat items
  const recipeTabCount = new Map<number, { name: string; count: number }>();
  mealTabs.forEach(tab => {
    tab.items.forEach(item => {
      if (recipeTabCount.has(item.recipeFk)) {
        const entry = recipeTabCount.get(item.recipeFk)!;
        recipeTabCount.set(item.recipeFk, { ...entry, count: entry.count + 1 });
      } else {
        recipeTabCount.set(item.recipeFk, { name: item.recipeName, count: 1 });
      }
    });
  });
  const allScaledIngs = useMemo(() => {
    let ings: any[] = [];
    mealTabs.forEach(tab => {
      tab.items.forEach(item => {
        const effective = (tab.pob * item.participationPercentage) / 100;
        item.ingList.forEach(ing => {
          ings.push({
            ...ing,
            scaledBaseQuantity: (ing.baseQuantity || 0) * effective,
            scaledSecondaryQuantity: (ing.secondaryQuantity || 0) * effective,
            scaledTotalCost: (ing.totalCost || 0) * effective,
            mainCategory: ing.mainCategory || 'Unknown',
            itemCategoryName: ing.itemCategoryName || 'Unknown',
            recipeCategory: item.selectedCategory,
          });
        });
      });
    });
    return ings;
  }, [mealTabs, globalPob]);
  const hierarchy = useMemo(() => {
    const h: any = {};
    allScaledIngs.forEach(ing => {
      const main = ing.mainCategory;
      const sub = ing.itemCategoryName;
      const itemKey = `${ing.itemName}-${ing.itemCode}`;
      if (!h[main]) h[main] = { sum: 0, subs: {} };
      h[main].sum += ing.scaledTotalCost;
      if (!h[main].subs[sub]) h[main].subs[sub] = { sum: 0, items: {} };
      h[main].subs[sub].sum += ing.scaledTotalCost;
      if (!h[main].subs[sub].items[itemKey]) h[main].subs[sub].items[itemKey] = { sum: 0, details: ing };
      h[main].subs[sub].items[itemKey].sum += ing.scaledTotalCost;
    });
    return h;
  }, [allScaledIngs]);
  const aggregatedItems = useMemo(() => {
    const map = new Map<string, any>();
    allScaledIngs.forEach(ing => {
      const key = `${ing.itemCategoryName}_${ing.itemCode}`;
      if (!map.has(key)) {
        map.set(key, {
          itemCategoryName: ing.itemCategoryName,
          itemCode: ing.itemCode,
          itemName: ing.itemName,
          packageId: ing.packageId,
          packagePrice: ing.packagePrice,
          packageBaseFactor: ing.packageBaseFactor,
          packageBaseUnit: ing.packageBaseUnit,
          packageSecondaryFactor: ing.packageSecondaryFactor,
          packageSecondaryUnit: ing.packageSecondaryUnit,
          packageSecondaryCost: ing.packageSecondaryCost,
          baseQuantity: 0,
          secondaryQuantity: 0,
          totalCost: 0,
        });
      }
      const agg = map.get(key);
      agg.baseQuantity += ing.scaledBaseQuantity;
      agg.secondaryQuantity += ing.scaledSecondaryQuantity;
      agg.totalCost += ing.scaledTotalCost;
    });
    return Array.from(map.values());
  }, [allScaledIngs]);
  const uniqueItemCount = aggregatedItems.length;
  const uniqueSubCategoryCount = new Set(allScaledIngs.map(ing => ing.itemCategoryName)).size;
  const costPerPersonNew = globalPob > 0 ? (totalOverallCost / globalPob).toFixed(2) : '0.00';
  const highCostItems = [...aggregatedItems].sort((a, b) => b.totalCost - a.totalCost).slice(0, 5);
  // Enhanced chart data computation
  const computeChartData = (chartData: any[], total: number) => {
    return chartData.map(d => ({
      name: d.name,
      y: d.y,
      percent: total > 0 ? ((d.y / total) * 100).toFixed(1) : 0,
      color: d.color,
      value: d.y
    }));
  };
  const chartData = useMemo(() => {
    if (currentLevel === 'main') {
      return Object.keys(hierarchy).map((main, index) => ({
        name: main,
        y: hierarchy[main].sum,
        color: richColors[index % richColors.length]
      }));
    } else if (currentLevel === 'sub' && selectedMain) {
      return Object.keys(hierarchy[selectedMain].subs).map((sub, index) => ({
        name: sub,
        y: hierarchy[selectedMain].subs[sub].sum,
        color: richColors[index % richColors.length]
      }));
    } else if (currentLevel === 'item' && selectedMain && selectedSub) {
      return Object.keys(hierarchy[selectedMain].subs[selectedSub].items).map((itemKey, index) => ({
        name: hierarchy[selectedMain].subs[selectedSub].items[itemKey].details.itemName,
        y: hierarchy[selectedMain].subs[selectedSub].items[itemKey].sum,
        color: richColors[index % richColors.length]
      }));
    }
    return [];
  }, [currentLevel, selectedMain, selectedSub, hierarchy]);
  // Enhanced center total calculation based on current level
  const centerTotal = useMemo(() => {
    if (currentLevel === 'main') {
      return totalOverallCost;
    } else if (currentLevel === 'sub' && selectedMain) {
      return hierarchy[selectedMain]?.sum || 0;
    } else if (currentLevel === 'item' && selectedMain && selectedSub) {
      return hierarchy[selectedMain].subs[selectedSub]?.sum || 0;
    }
    return 0;
  }, [currentLevel, selectedMain, selectedSub, hierarchy, totalOverallCost]);
  useEffect(() => {
    setCurrentChartData(computeChartData(chartData, centerTotal));
  }, [chartData, centerTotal]);
  const getChartTitle = () => {
    if (currentLevel === 'main') return 'Main Categories Distribution';
    if (currentLevel === 'sub') return `${selectedMain} - Sub Categories`;
    if (currentLevel === 'item') return `${selectedSub} - Items Distribution`;
    return 'Cost Distribution';
  };
  const getChartBadgeText = () => {
    if (currentLevel === 'main') return 'Main Level';
    if (currentLevel === 'sub') return 'Category Level';
    if (currentLevel === 'item') return 'Item Level';
    return 'Segregated';
  };
  // Enhanced category chart options with dynamic center total
  const categoryChartOptions = useMemo(() => {
    const currentTotal = centerTotal;
    return {
      colors: richColors,
      chart: {
        type: 'pie',
        height: 350,
        backgroundColor: 'transparent',
        events: {
          load: function (this: any) {
            this.renderer.text(
              `Total Cost<br><span style="font-size: 16px; font-weight: bold;"> ${currentTotal.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}</span>`,
              this.plotLeft + this.plotWidth / 2,
              this.plotTop + this.plotHeight / 2
            ).attr({
              align: 'center',
              zIndex: 5
            }).css({
              fontSize: '12px',
              color: professionalColors.dark,
              fontWeight: 600,
              textAlign: 'center'
            }).add();
          }
        }
      },
      title: {
        text: null
      },
      tooltip: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        shadow: true,
        padding: 12,
        useHTML: true,
        formatter: function(this: any) {
          return `
            <div style="font-weight: 600; color: ${this.color}">${this.key}</div>
            <div>Value: <b> ${this.y.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></div>
            <div>Percentage: <b>${this.percentage.toFixed(1)}%</b></div>
          `;
        }
      },
      credits: { enabled: false },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          borderWidth: 2,
          borderColor: '#ffffff',
          innerSize: '60%',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f}%',
            distance: 20,
            style: {
              fontSize: '10px',
              fontWeight: '600',
              textOutline: '1px contrast'
            }
          },
          showInLegend: false,
          point: {
            events: {
              click: function (this: any) {
                if (currentLevel === 'main') {
                  setSelectedMain(this.name);
                  setCurrentLevel('sub');
                } else if (currentLevel === 'sub') {
                  setSelectedSub(this.name);
                  setCurrentLevel('item');
                }
              }
            }
          }
        }
      },
      series: [{
        name: currentLevel === 'main' ? 'Main Categories' : currentLevel === 'sub' ? 'Sub Categories' : 'Items',
        innerSize: '60%',
        data: chartData.map(item => ({
          name: item.name,
          y: item.y,
          color: item.color
        }))
      }],
      responsive: {
        rules: [{
          condition: { maxWidth: 500 },
          chartOptions: {
            plotOptions: {
              pie: {
                dataLabels: { enabled: false }
              }
            }
          }
        }]
      }
    };
  }, [currentLevel, chartData, centerTotal]);
  // Meal Chart Data
  const mealChartRawData = useMemo(() => {
    if (mealChartLevel === 'meal') {
      return mealTabs.map((tab, index) => ({
        name: tab.name,
        y: tab.total,
        color: platePieColors[index % platePieColors.length]
      }));
    } else if (mealChartLevel === 'recipe' && selectedMeal) {
      const tab = mealTabs.find(t => t.name === selectedMeal);
      if (tab) {
        return tab.items.map((item, index) => ({
          name: item.recipeName,
          y: item.finalCost,
          color: platePieColors[index % platePieColors.length]
        }));
      }
    } else if (mealChartLevel === 'ingredient' && selectedMeal && selectedMealRecipe) {
      const tab = mealTabs.find(t => t.name === selectedMeal);
      if (tab) {
        const item = tab.items.find(i => i.recipeName === selectedMealRecipe);
        if (item) {
          const effective = (tab.pob * item.participationPercentage) / 100;
          return item.ingList.map((ing, index) => ({
            name: ing.itemName,
            y: ing.totalCost * effective,
            color: platePieColors[index % platePieColors.length]
          }));
        }
      }
    }
    return [];
  }, [mealChartLevel, selectedMeal, selectedMealRecipe, mealTabs]);
  const mealCenterTotal = useMemo(() => {
    if (mealChartLevel === 'meal') {
      return totalOverallCost;
    } else if (mealChartLevel === 'recipe' && selectedMeal) {
      const tab = mealTabs.find(t => t.name === selectedMeal);
      return tab?.total || 0;
    } else if (mealChartLevel === 'ingredient' && selectedMeal && selectedMealRecipe) {
      const tab = mealTabs.find(t => t.name === selectedMeal);
      if (tab) {
        const item = tab.items.find(i => i.recipeName === selectedMealRecipe);
        return item?.finalCost || 0;
      }
    }
    return 0;
  }, [mealChartLevel, selectedMeal, selectedMealRecipe, mealTabs, totalOverallCost]);
  useEffect(() => {
    setMealChartData(computeChartData(mealChartRawData, mealCenterTotal));
  }, [mealChartRawData, mealCenterTotal]);
  const getMealChartTitle = () => {
    if (mealChartLevel === 'meal') return 'Meal Types Distribution';
    if (mealChartLevel === 'recipe') return `${selectedMeal} - Recipes`;
    if (mealChartLevel === 'ingredient') return `${selectedMealRecipe} - Ingredients`;
    return 'Cost Distribution';
  };
  const getMealChartBadgeText = () => {
    if (mealChartLevel === 'meal') return 'Meal Level';
    if (mealChartLevel === 'recipe') return 'Recipe Level';
    if (mealChartLevel === 'ingredient') return 'Ingredient Level';
    return 'Segregated';
  };
  // Meal Type Breakdown Chart Options - Modified to match the plate pie chart design
const mealChartOptions = useMemo(() => {
  return {
    colors: platePieColors,
    chart: {
      type: 'pie',
      height: 350,
      backgroundColor: '#ADD8E6',
      animation: {
        duration: 1000,
        easing: 'easeOutBounce'
      },
      events: {
        load: function (this: Highcharts.Chart) {
          // Get chart dimensions
          const chartWidth = this.chartWidth;
          const chartHeight = this.chartHeight;
     
          // Plate dimensions
          const plateWidth = 400;
          const plateHeight = 400; // Make it square for better centering
     
          // Calculate center position for plate
          const plateX = (chartWidth - plateWidth) / 2;
          const plateY = (chartHeight - plateHeight) / 2;
     
          // Add the plate image centered behind the pie
          this.renderer.image(
            plateChart,
            plateX,
            plateY,
            plateWidth,
            plateHeight
          ).attr({
            zIndex: -1,
            preserveAspectRatio: "xMidYMid slice" // Better aspect ratio handling
          }).add();
        },
      },
    },
    title: {
      text: null
    },
    tooltip: {
      backgroundColor: '#ffffff',
      borderRadius: 8,
      shadow: true,
      padding: 12,
      pointFormat:
        '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.1f}%</b><br>' +
        "Value: <b> {point.value:,.2f}</b>",
    },
    credits: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        borderWidth: 2,
        borderColor: "#ffffff",
        center: ["50%", "50%"], // Center the pie in the chart
        size: '65%', // Adjust size to fit nicely within the plate
        innerSize: 0,
        dataLabels: {
          enabled: true,
          distance: -35,
          format: "{point.percentage:.0f}% <br> {point.name}",
          style: {
            fontSize: '11px',
            fontWeight: 'bold',
            textOutline: 'none',
            color: 'black',
          },
        },
        showInLegend: false,
        point: {
          events: {
            click: function (this: any) {
              if (mealChartLevel === 'meal') {
                setSelectedMeal(this.name);
                setMealChartLevel('recipe');
              } else if (mealChartLevel === 'recipe') {
                setSelectedMealRecipe(this.name);
                setMealChartLevel('ingredient');
              }
            }
          }
        }
      },
    },
    series: [{
      name: mealChartLevel === 'meal' ? 'Meal Types' : mealChartLevel === 'recipe' ? 'Recipes' : 'Ingredients',
      data: mealChartRawData.map(item => ({
        name: item.name,
        y: mealCenterTotal > 0 ? (item.y / mealCenterTotal) * 100 : 0,
        value: item.y,
        color: item.color,
      })),
    }],
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 500,
          },
          chartOptions: {
            plotOptions: {
              pie: {
                center: ["50%", "50%"],
                size: '70%', // Slightly larger on mobile
                dataLabels: {
                  enabled: false,
                },
              },
            },
          },
        },
      ],
    },
  };
}, [mealChartLevel, mealChartRawData, mealCenterTotal]);
  const handleItemClick = (name: string) => {
    if (currentLevel === 'main') {
      setSelectedMain(name);
      setCurrentLevel('sub');
    } else if (currentLevel === 'sub') {
      setSelectedSub(name);
      setCurrentLevel('item');
    }
  };
  const handleCategoryBack = () => {
    if (currentLevel === 'item') {
      setCurrentLevel('sub');
      setSelectedSub(null);
    } else if (currentLevel === 'sub') {
      setCurrentLevel('main');
      setSelectedMain(null);
    }
  };
  const handleMealChartBack = () => {
    if (mealChartLevel === 'ingredient') {
      setMealChartLevel('recipe');
      setSelectedMealRecipe(null);
    } else if (mealChartLevel === 'recipe') {
      setMealChartLevel('meal');
      setSelectedMeal(null);
    }
  };
  const handleAggSort = (key: string) => {
    setAggSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  const filteredAggregatedItems = useMemo(() => {
    let filtered = aggregatedItems.filter(item =>
      Object.values(item).some(value =>
        value?.toString().toLowerCase().includes(aggSearchTerm.toLowerCase())
      )
    );
    filtered.sort((a, b) => {
      let valueA = a[aggSortConfig.key];
      let valueB = b[aggSortConfig.key];
      if (typeof valueA === 'string') valueA = valueA.toLowerCase();
      if (typeof valueB === 'string') valueB = valueB.toLowerCase();
      if (valueA < valueB) return aggSortConfig.direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return aggSortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [aggregatedItems, aggSearchTerm, aggSortConfig]);
  // Enhanced Recipe Card Component with AED
  const RecipeCard: React.FC<{ recipe: Recipe; index: number }> = ({ recipe }) => (
    <div className="group bg-white rounded-xl border border-gray-200 p-3 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-xs mb-1 line-clamp-2" title={recipe.recipeName}>
            {recipe.recipeName}
          </h4>
          <div className="flex flex-wrap gap-1">
            <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
              {recipe.cuisineName}
            </span>
            {getDisplayCategory(recipe) && (
              <span className="inline-flex items-center px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">
                {getDisplayCategory(recipe)}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => openRecipeModal(recipe)}
          disabled={!activeTab}
          className="ml-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white p-1.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 flex-shrink-0"
          title={!activeTab ? "Please select a meal type first" : "Add to table"}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
 
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
        <div className="flex items-center space-x-1">
          <span className="truncate">{formatQuantity(recipe.portionSize, projectSettings?.quantityDecimalPlaces || 2)} {recipe.uom}</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>{formatAmount(recipe.perPortionCost , projectSettings?.costDecimalPlaces || 2)}</span>
        </div>
      </div>
    </div>
  );
  // Enhanced Table Row Component with AED
// Replace the existing TableRow component with this fixed version
const TableRow: React.FC<{ item: TableItem; tabPk: number }> = ({ item, tabPk }) => {
  const [localPercentage, setLocalPercentage] = useState(item.participationPercentage.toString());
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // Handle input change with proper validation
  const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
  
    // Allow empty input during editing
    if (value === '') {
      setLocalPercentage('');
      return;
    }
  
    // Validate format: up to 5 digits before decimal, up to 4 after decimal
    const regex = /^(\d{0,5})(\.\d{0,4})?$/;
    if (regex.test(value)) {
      setLocalPercentage(value);
    }
  };
  // Handle blur - apply the final value
  const handleBlur = () => {
    setIsEditing(false);
  
    // If empty, reset to original value
    if (localPercentage === '') {
      setLocalPercentage(item.participationPercentage.toString());
      return;
    }
  
    const numValue = parseFloat(localPercentage);
  
    // Validate range 0-100
    if (!isNaN(numValue)) {
      const clampedValue = Math.min(100, Math.max(0, numValue));
      handleParticipationChange(tabPk, item.id, clampedValue);
      setLocalPercentage(clampedValue.toFixed(4));
    } else {
      // Reset to original if invalid
      setLocalPercentage(item.participationPercentage.toString());
    }
  };
  // Handle key press (Enter to submit)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  };
  // Sync with prop changes
  useEffect(() => {
    if (!isEditing) {
      setLocalPercentage(item.participationPercentage.toString());
    }
  }, [item.participationPercentage, isEditing]);
  const effectiveParticipation = (globalPob * item.participationPercentage) / 100;
  return (
    <tr className="border-b border-gray-100 hover:bg-indigo-50 transition-colors duration-150 group">
      <td className="py-2 px-3">
        <span className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full border border-indigo-200">
          {item.selectedCategory}
        </span>
      </td>
      <td className="py-2 px-3">
        <div>
          <div className="font-semibold text-gray-900 text-xs">{item.recipeName}</div>
          <div className="text-xs text-gray-500 mt-0.5">{item.cuisineName}</div>
        </div>
      </td>
      <td className="py-2 px-3 text-xs font-medium text-gray-700">
        {formatQuantity(item.portionSize, projectSettings?.quantityDecimalPlaces || 2)} {item.uom}
      </td>
      <td className="py-2 px-3 text-xs font-medium text-gray-700">
        {formatAmount(item.perPortionCost, projectSettings?.costDecimalPlaces || 2)}
      </td>
      <td className="py-2 px-3">
        <div className="flex items-center space-x-3">
          <span className="text-xs text-gray-600 whitespace-nowrap">{globalPob} ×</span>
          <div className="flex items-center space-x-2 bg-white rounded-lg px-3 py-1 border border-gray-200 shadow-sm">
            <input
              ref={inputRef}
              type="text"
              value={localPercentage}
              onChange={handleLocalChange}
              onFocus={() => setIsEditing(true)}
              onBlur={handleBlur}
              onKeyPress={handleKeyPress}
              className="w-16 bg-transparent border-0 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded text-center"
              inputMode="decimal"
              placeholder="0.0000"
              title="Enter percentage (0-100) with up to 4 decimal places"
            />
            <span className="text-gray-400 text-xs">%</span>
          </div>
          <span className="font-semibold text-indigo-600 text-xs bg-white px-2 py-1 rounded border border-indigo-200">
            {formatQuantity(effectiveParticipation, projectSettings?.quantityDecimalPlaces || 2)}
          </span>
        </div>
      </td>
      <td className="py-2 px-3 font-semibold text-indigo-600 text-xs">
        {formatAmount(item.finalCost, projectSettings?.costDecimalPlaces || 2)}
      </td>
      <td className="py-2 px-3">
        <div className="flex space-x-1">
          <button
            onClick={() => {
              setSelectedItem(item);
              setShowViewModal(true);
            }}
            className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            title="View Ingredients"
          >
            <Eye className="w-3 h-3" />
          </button>
          <button
            onClick={() => removeItemFromTable(tabPk, item.id)}
            className="text-red-600 hover:text-red-800 p-1.5 hover:bg-red-50 rounded-lg transition-colors duration-200"
            title="Remove Item"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </td>
    </tr>
  );
};
  // Enhanced Metric Cards with real data and AED
  const enhancedMetricCards = useMemo(() => [
    {
      ...metricCards[0],
      value: formatAmount(totalOverallCost, projectSettings?.costDecimalPlaces || 2),
      description: "Total menu cost",
      currency: "AED"
    },
    {
      ...metricCards[1],
      value: totalItems.toString(),
      description: "Total recipes added"
    },
    {
      ...metricCards[2],
      value: formatAmount(costPerPersonNew, projectSettings?.costDecimalPlaces || 2),
      description: "Cost per person",
      currency: "AED"
    },
    {
      ...metricCards[3],
      value: uniqueCategories.toString(),
      description: "Unique categories used"
    },
    {
      ...metricCards[4],
      value: mealTabs.length.toString(),
      description: "Active meal types"
    }
  ], [totalOverallCost, totalItems, costPerPersonNew, uniqueCategories, mealTabs.length]);
  return (
    <div className="max-w-8xl mx-auto p-3 sm:p-4">
        {sessionExpired && <SessionExpiredModal />}
        {generalModal.isOpen && <GeneralStatusModal />}
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Menu Planning Dashboard</h1>
              <p className="text-gray-600 mt-1">Plan and analyze your meal costs efficiently</p>
            </div>
            <div className="flex items-center space-x-2">
                <button
                            className="flex items-center gap-1 bg-yellow-300 dark:bg-gray-700 hover:bg-gray-300 px-3 py-2 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200"
                            title="Reload"
   onClick={handleRefresh} >
                            <RefreshCw size={20} />
                          </button>
              <button
                onClick={handleRunSimulation}
                disabled={totalItems === 0}
                className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:cursor-not-allowed flex items-center space-x-2 text-xs"
              >
                <PlayCircle className="w-5 h-5" />
              </button>
                <button
                onClick={handleExportData}
                className="px-3 py-2 bg-gradient-to-r from-green-600 to-green-600 text-white rounded-lg hover:from-green-700 hover:to-green-700 font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2 text-xs"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
          {/* Enhanced Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
            {enhancedMetricCards.map((card, index) => (
              <div
                key={index}
                className={`${card.bgColor} rounded-xl p-4 border border-white shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1`}
              >
                <div className="flex items-center justify-between mb-2">
                  <card.icon className="w-5 h-5" style={{ color: card.color }} />
                  <div className="text-xs font-medium text-gray-500 bg-white/50 px-2 py-0.5 rounded-full">
                    {card.title}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xl font-bold text-gray-900">
                    {card.currency ? `${card.value}` : card.value}
                  </div>
                  <div className="text-xs text-gray-600">{card.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Panel - Recipe Selection */}
          <div className={`lg:col-span-3 space-y-4 transition-all duration-300 ${sidebarCollapsed ? 'col-span-1' : ''}`}>
            {/* Recipe Selection Section */}
            {!sidebarCollapsed && (
              <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 h-[500px] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center">
                    <Search className="w-4 h-4 mr-1 text-indigo-600" />
                    Recipe Selection
                  </h3>
                  <span className="bg-indigo-100 text-indigo-800 rounded-full px-2 py-0.5 text-xs font-medium">
                    {filteredRecipes.length} recipes
                  </span>
                </div>
           
                <div className="space-y-3 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                    <input
                      type="text"
                      placeholder="Search recipes by name or cuisine..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm bg-white shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center">
                      <Filter className="w-3 h-3 mr-1 text-gray-500" />
                      Category Filter
                    </label>
                    <CustomDropdown
                      options={categories.map(c => ({ label: c.name, value: c.pk.toString() }))}
                      value={selectedCategory.pk ? selectedCategory.pk.toString() : null}
                      onChange={(val) => {
                        const category = categories.find(c => c.pk.toString() === val);
                        if (category) setSelectedCategory(category);
                      }}
                      placeholder="Select Category"
                      dropdownKey="categoryFilter"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                      <div className="text-gray-500 text-xs">Loading recipes...</div>
                    </div>
                  ) : filteredRecipes.length > 0 ? (
                    filteredRecipes.map((recipe, index) => (
                      <RecipeCard key={`${recipe.recipeFk}_${index}`} recipe={recipe} index={index} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ChefHat className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                      <div className="text-xs font-medium mb-1">No recipes found</div>
                      <div className="text-xs">Try changing your search or category filter</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          {/* Right Panel - Main Content */}
          <div className={`${sidebarCollapsed ? 'col-span-11' : 'lg:col-span-9'} space-y-4`}>
            {/* Planning Board */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden h-[500px] flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50/50">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Plan Name</label>
                    <input
                      type="text"
                      placeholder="Enter plan name..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Meal Type</label>
                    <CustomDropdown
                      options={mealTypes.map(mt => ({ label: mt.name, value: mt.pk.toString() }))}
                      value={selectedMealType?.pk ? selectedMealType.pk.toString() : null}
                      onChange={(val) => {
                        const mealType = mealTypes.find(mt => mt.pk.toString() === val);
                        if (mealType) handleMealTypeSelect(mealType);
                      }}
                      placeholder="Select Meal Type"
                      dropdownKey="mealType"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">POB</label>
                    <input
                      type="number"
                      value={globalPob}
                      onChange={(e) => handleGlobalPobChange(parseInt(e.target.value) || 100)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white shadow-sm"
                      min="1"
                    />
                  </div>
                </div>
              </div>
              {/* Tabs Navigation */}
              {mealTabs.length > 0 && (
                <div className="border-b border-gray-200 px-4 bg-white">
                  <div className="flex space-x-1 overflow-x-auto">
                    {mealTabs.map((tab) => (
                      <div key={tab.pk} className="relative flex-shrink-0">
                        <button
                          onClick={() => setActiveTab(tab.pk)}
                          className={`px-4 py-2 font-semibold text-xs border-b-2 transition-all duration-200 relative group min-w-[120px] flex items-center justify-between ${
                            activeTab === tab.pk
                              ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                              : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                          }`}
                        >
                          <span className="truncate flex-1 text-left">{tab.name}</span>
                          <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            activeTab === tab.pk
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {tab.items.length}
                          </span>
                        </button>
                        <button
                          onClick={() => deleteTab(tab.pk)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-opacity duration-200 shadow-sm border border-white text-xs"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Table Content */}
              <div className="flex-1 overflow-auto">
                {activeTabData ? (
                  <div className="p-3 flex flex-col h-full">
                    <div className="overflow-x-auto rounded-xl border border-gray-200 flex-1 min-h-0">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-indigo-600 text-white sticky">
                          <tr>
                            <th className="text-left py-1.5 px-2.5 font-semibold text-xs uppercase tracking-wider">Category</th>
                            <th className="text-left py-1.5 px-2.5 font-semibold text-xs uppercase tracking-wider">Recipe</th>
                            <th className="text-left py-1.5 px-2.5 font-semibold text-xs uppercase tracking-wider">Portion Size</th>
                            <th className="text-left py-1.5 px-2.5 font-semibold text-xs uppercase tracking-wider">Cost/Portion</th>
                            <th className="text-center py-1.5 px-2.5 font-semibold text-xs uppercase tracking-wider">Participation</th>
                            <th className="text-left py-1.5 px-2.5 font-semibold text-xs uppercase tracking-wider">Final Cost</th>
                            <th className="text-left py-1.5 px-2.5 font-semibold text-xs uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {activeTabData.items.map((item) => (
                            <TableRow key={item.id} item={item} tabPk={activeTabData.pk} />
                          ))}
                        </tbody>
                      </table>
                      {activeTabData.items.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <ChefHat className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                          <div className="text-md font-medium mb-1">No recipes added yet</div>
                          <div className="text-xs">Select recipes from the left panel</div>
                        </div>
                      )}
                    </div>
                    {/* Tab Footer */}
                    {activeTabData.items.length > 0 && (
                      <div className="mt-1 flex justify-between items-center p-2 border-t border-gray-200 bg-gray-50/80">
                        <div className="text-xs text-gray-600">
                          <span className="font-semibold">{activeTabData.items.length}</span> recipes
                        </div>
                        <div className="text-sm font-bold text-gray-600">
                          Total: {formatAmount(activeTabData.total, projectSettings?.costDecimalPlaces || 2)}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500 flex-1 flex items-center justify-center">
                    <div>
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <h3 className="text-base font-medium mb-1">Welcome to Menu Planning</h3>
                      <p className="text-gray-600 max-w-md mx-auto text-xs">
                        Select a meal type to create your first plan.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Enhanced Simulation Section */}
        {showSimulation && (
          <div id="simulation" className="mt-6 space-y-6">
            {/* Meal Type Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-6 bg-white rounded-xl shadow-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {mealChartLevel !== 'meal' && (
                      <button
                        onClick={handleMealChartBack}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 transition-all duration-200 text-xs font-medium border border-indigo-200"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        <span>Back</span>
                      </button>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{getMealChartTitle()}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="bg-indigo-100 text-indigo-800 rounded-full px-2 py-0.5 text-xs font-medium">
                          {getMealChartBadgeText()}
                        </span>
                        <span className="text-xs text-gray-600">
                          {mealChartData.length} {mealChartLevel === 'meal' ? 'types' : mealChartLevel === 'recipe' ? 'recipes' : 'ingredients'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-indigo-600">
                      {formatAmount(mealCenterTotal, projectSettings?.costDecimalPlaces || 2)}
                    </div>
                    <div className="text-xs text-gray-600">Total Cost</div>
                  </div>
                </div>
                <HighchartsReact highcharts={Highcharts} options={mealChartOptions} />
              </div>
         
              <div className="lg:col-span-6 space-y-4">
                <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                    <Grid className="w-4 h-4 mr-1 text-indigo-600" />
                    Menu Overview
                    <span className="ml-1 bg-gray-100 text-gray-800 rounded-full px-2 py-0.5 text-xs font-medium">
                      Summary
                    </span>
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                      <span className="text-gray-700 flex items-center">
                        <Layers className="w-3 h-3 mr-1 text-gray-500" />
                        Total Recipes:
                      </span>
                      <span className="font-semibold text-gray-900">{totalItems}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                      <span className="text-gray-700 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1 text-gray-500" />
                        Categories:
                      </span>
                      <span className="font-semibold text-gray-900">{uniqueCategories}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                      <span className="text-gray-700 flex items-center">
                        <BiMoney className="w-3 h-3 mr-1 text-gray-500" />
                        Avg. Cost/Item:
                      </span>
                      <span className="font-semibold text-gray-900">{formatAmount(avgCostPerItem, projectSettings?.costDecimalPlaces || 2)}</span>
                    </div>
           
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                    <BarChart2 className="w-4 h-4 mr-1 text-indigo-600" />
                    Meal Breakdown
                    <span className="ml-1 bg-indigo-100 text-indigo-800 rounded-full px-2 py-0.5 text-xs font-medium">
                      {mealTabs.length} Meals
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {mealTabs.map((tab, index) => {
                      const percentage = totalOverallCost > 0 ? (tab.total / totalOverallCost) * 100 : 0;
                      const tabColor = categoryColors[index % categoryColors.length];
                      return (
                        <div key={tab.pk} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-700 font-medium">{tab.name} ({tab.items.length} items)</span>
                            <span className="font-semibold text-gray-900"> {formatAmount(tab.total, projectSettings?.costDecimalPlaces || 2)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%`, backgroundColor: tabColor }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 text-right">
                            {percentage.toFixed(1)}% of total
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            {/* Category Donut Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8 bg-white rounded-xl shadow-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {currentLevel !== 'main' && (
                      <button
                        onClick={handleCategoryBack}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 transition-all duration-200 text-xs font-medium border border-indigo-200"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        <span>Back</span>
                      </button>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{getChartTitle()}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="bg-indigo-100 text-indigo-800 rounded-full px-2 py-0.5 text-xs font-medium">
                          {getChartBadgeText()}
                        </span>
                        <span className="text-xs text-gray-600">
                          {currentChartData.length} {currentLevel === 'main' ? 'categories' : currentLevel === 'sub' ? 'sub-categories' : 'items'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-indigo-600">
                      {formatAmount(centerTotal, projectSettings?.costDecimalPlaces || 2)}
                    </div>
                    <div className="text-xs text-gray-600">Total Cost</div>
                  </div>
                </div>
           
                <div className="h-[350px]">
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={categoryChartOptions}
                    ref={categoryChartRef}
                    containerProps={{ style: { height: '100%' } }}
                  />
                </div>
              </div>
              <div className="lg:col-span-4 bg-white rounded-xl shadow-lg p-4 border border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                  <List className="w-4 h-4 mr-1 text-indigo-600" />
                  Distribution Details
                  <span className="ml-1 bg-gray-100 text-gray-800 rounded-full px-2 py-0.5 text-xs font-medium">
                    {currentChartData.length} Items
                  </span>
                </h3>
           
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {currentChartData.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-xl border border-gray-200 hover:border-indigo-300 transition-all duration-200 cursor-pointer hover:shadow-md bg-white"
                      onClick={() => handleItemClick(item.name)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-medium text-gray-900 max-w-[200px] text-xs truncate flex-1" title={item.name}>
                            {item.name}
                          </span>
                        </div>
                        <span className="font-semibold text-indigo-600 text-xs">
                          {item.percent}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-600">
                        <span>Value: {formatAmount(item.y, projectSettings?.costDecimalPlaces || 2)}</span>
                        <span>{item.percent}% of total</span>
                      </div>
                      <div className="mt-1 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Additional Simulation Sections */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 shadow-lg border border-indigo-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-3">
                  <BiMoney className="w-5 h-5 text-indigo-600 mr-2" />
                  <h4 className="text-xs font-semibold text-gray-900">Total Cost</h4>
                  <span className="ml-auto bg-indigo-100 text-indigo-800 rounded-full px-2 py-0.5 text-xs font-medium">Overall</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{formatAmount(totalOverallCost, projectSettings?.costDecimalPlaces || 2)}</p>
                <p className="text-xs text-gray-600 mt-1">Overall menu expenditure</p>
              </div>
         
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-3">
                  <Package className="w-5 h-5 text-green-600 mr-2" />
                  <h4 className="text-xs font-semibold text-gray-900">Items</h4>
                  <span className="ml-auto bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs font-medium">Distinct</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{uniqueItemCount}</p>
                <p className="text-xs text-gray-600 mt-1">Distinct ingredients used</p>
              </div>
         
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 shadow-lg border border-amber-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-3">
                  <BarChart3 className="w-5 h-5 text-amber-600 mr-2" />
                  <h4 className="text-xs font-semibold text-gray-900">Cost Per Person</h4>
                  <span className="ml-auto bg-amber-100 text-amber-800 rounded-full px-2 py-0.5 text-xs font-medium">Average</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{formatAmount(costPerPersonNew, projectSettings?.costDecimalPlaces || 2)}</p>
                <p className="text-xs text-gray-600 mt-1">Cost per person</p>
              </div>
         
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 shadow-lg border border-cyan-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-3">
                  <Layers className="w-5 h-5 text-cyan-600 mr-2" />
                  <h4 className="text-xs font-semibold text-gray-900">Categories</h4>
                  <span className="ml-auto bg-cyan-100 text-cyan-800 rounded-full px-2 py-0.5 text-xs font-medium">Overall</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{uniqueSubCategoryCount}</p>
                <p className="text-xs text-gray-600 mt-1">Distinct sub-categories</p>
              </div>
         
              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 shadow-lg border border-red-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <h4 className="text-xs font-semibold text-gray-900">High Cost Items</h4>
                  <span className="ml-auto bg-red-100 text-red-800 rounded-full px-2 py-0.5 text-xs font-medium">Top 5</span>
                </div>
                <ul className="text-xs text-gray-700 space-y-1">
                  {highCostItems.length > 0 ? highCostItems.map((item, idx) => (
                    <li key={idx} className="flex justify-between items-center">
                      <span className="truncate flex-1">{item.itemName}</span>
                      <span className="font-semibold text-gray-900 ml-1">{formatAmount(item.totalCost, projectSettings?.costDecimalPlaces || 2)}</span>
                    </li>
                  )) : <li className="text-gray-500">No high cost items</li>}
                </ul>
              </div>
            </div>
            {/* Aggregated Items Table */}
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                <List className="w-4 h-4 mr-1 text-indigo-600" />
                Aggregated Items Overview
                <span className="ml-1 bg-indigo-100 text-indigo-800 rounded-full px-2 py-0.5 text-xs font-medium">
                  {aggregatedItems.length} Items
                </span>
              </h3>
              <div className="mb-3 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                <input
                  type="text"
                  placeholder="Search aggregated items..."
                  value={aggSearchTerm}
                  onChange={(e) => setAggSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm bg-white shadow-sm"
                />
              </div>
              <div className="overflow-x-auto max-h-80 rounded-lg border border-gray-200">
                <table className="min-w-full table-auto divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer whitespace-nowrap" onClick={() => handleAggSort('itemCategoryName')}>
                        Category {aggSortConfig.key === 'itemCategoryName' && (aggSortConfig.direction === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer whitespace-nowrap" onClick={() => handleAggSort('itemCode')}>
                        Code {aggSortConfig.key === 'itemCode' && (aggSortConfig.direction === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer whitespace-nowrap" onClick={() => handleAggSort('itemName')}>
                        Name {aggSortConfig.key === 'itemName' && (aggSortConfig.direction === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer whitespace-nowrap" onClick={() => handleAggSort('packageId')}>
                        Package ID {aggSortConfig.key === 'packageId' && (aggSortConfig.direction === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer whitespace-nowrap" onClick={() => handleAggSort('packagePrice')}>
                        Package Price {aggSortConfig.key === 'packagePrice' && (aggSortConfig.direction === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer whitespace-nowrap" onClick={() => handleAggSort('baseQuantity')}>
                        Base Qty {aggSortConfig.key === 'baseQuantity' && (aggSortConfig.direction === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer whitespace-nowrap" onClick={() => handleAggSort('secondaryQuantity')}>
                        Sec Qty {aggSortConfig.key === 'secondaryQuantity' && (aggSortConfig.direction === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer whitespace-nowrap" onClick={() => handleAggSort('totalCost')}>
                        Total Cost {aggSortConfig.key === 'totalCost' && (aggSortConfig.direction === 'asc' ? '▲' : '▼')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAggregatedItems.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-3 py-2 text-xs text-gray-900">{item.itemCategoryName}</td>
                        <td className="px-3 py-2 text-xs text-gray-900">{item.itemCode}</td>
                        <td className="px-3 py-2 text-xs text-gray-900">{item.itemName}</td>
                        <td className="px-3 py-2 text-xs text-gray-900">{item.packageId}</td>
                        <td className="px-3 py-2 text-xs text-gray-900">{formatAmount(item.packagePrice, projectSettings?.costDecimalPlaces || 2)}</td>
                        <td className="px-3 py-2 text-xs text-gray-900">{formatQuantity(item.baseQuantity, projectSettings?.quantityDecimalPlaces || 2)}</td>
                        <td className="px-3 py-2 text-xs text-gray-900">{formatQuantity(item.secondaryQuantity, projectSettings?.quantityDecimalPlaces || 2)}</td>
                        <td className="px-3 py-2 text-xs font-semibold text-indigo-600">{formatAmount(item.totalCost, projectSettings?.costDecimalPlaces || 2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredAggregatedItems.length === 0 && (
                  <div className="text-center py-6 text-gray-500 text-xs">No items found</div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Enhanced Modals */}
        {showModal && selectedRecipe && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-auto shadow-2xl border border-gray-200 transform transition-all duration-300 scale-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Add Recipe to Menu</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <h4 className="font-bold text-gray-900 text-base mb-2">{selectedRecipe.recipeName}</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-700 font-medium">Cuisine:</span>
                      <span className="text-gray-900">{selectedRecipe.cuisineName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Scale className="w-3 h-3 text-gray-500" />
                      <span>{formatQuantity(selectedRecipe.portionSize, projectSettings?.quantityDecimalPlaces || 2)} {selectedRecipe.uom}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BiMoney className="w-3 h-3 text-gray-500" />
                      <span>{formatAmount(selectedRecipe.perPortionCost, projectSettings?.costDecimalPlaces || 2)} per portion</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-3 h-3 text-gray-500" />
                      <span>{globalPob} persons</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Category Assignment</label>
                  <CustomDropdown
                    options={getAvailableCategories(selectedRecipe).map(cat => ({ label: cat.categoryName, value: cat.categoryName }))}
                    value={selectedModalCategory || null}
                    onChange={(val) => setSelectedModalCategory(val || '')}
                    placeholder="Select a category..."
                    dropdownKey="modalCategory"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => addRecipeToTable(selectedRecipe, selectedModalCategory)}
                  disabled={!selectedModalCategory}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Add to {activeTabData?.name || 'Menu'}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* View Ingredients Modal - Updated Structure */}
        {showViewModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Ingredients for {selectedItem.recipeName}</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              {/* Body */}
              <div className="flex-1 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                    <tr>
                      {[
                        "Category",
                        "Code",
                        "Name",
                        "Package ID",
                        "Package Price",
                        "Base Factor",
                        "Base Unit",
                        "Secondary Factor",
                        "Secondary Unit",
                        "Secondary Cost",
                        "Base Qty (Scaled)",
                        "Sec Qty (Scaled)",
                        "Total Cost (Scaled)",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                    {selectedItem.ingList.map((ing, index) => {
                      const effectiveParticipation = (globalPob * selectedItem.participationPercentage) / 100;
                      const scaledBaseQty = ing.baseQuantity * effectiveParticipation;
                      const scaledSecQty = ing.secondaryQuantity * effectiveParticipation;
                      const scaledTotalCost = ing.totalCost * effectiveParticipation;
                      return (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600 text-xs text-gray-900 dark:text-gray-100">{ing.itemCategoryName}</td>
                          <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600 text-xs text-gray-900 dark:text-gray-100">{ing.itemCode}</td>
                          <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600 text-xs text-gray-900 dark:text-gray-100">{ing.itemName}</td>
                          <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600 text-xs text-gray-900 dark:text-gray-100">{ing.packageId}</td>
                          <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600 text-xs text-gray-900 dark:text-gray-100">{formatAmount(ing.packagePrice, projectSettings?.costDecimalPlaces || 2)}</td>
                          <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600 text-xs text-gray-900 dark:text-gray-100">{ing.packageBaseFactor}</td>
                          <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600 text-xs text-gray-900 dark:text-gray-100">{ing.packageBaseUnit}</td>
                          <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600 text-xs text-gray-900 dark:text-gray-100">{ing.packageSecondaryFactor}</td>
                          <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600 text-xs text-gray-900 dark:text-gray-100">{ing.packageSecondaryUnit}</td>
                          <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600 text-xs text-gray-900 dark:text-gray-100">{formatAmount(ing.packageSecondaryCost, projectSettings?.costDecimalPlaces || 2)}</td>
                          <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600 text-xs text-gray-900 dark:text-gray-100">{formatQuantity(scaledBaseQty, projectSettings?.quantityDecimalPlaces || 2)}</td>
                          <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600 text-xs text-gray-900 dark:text-gray-100">{formatQuantity(scaledSecQty, projectSettings?.quantityDecimalPlaces || 2)}</td>
                          <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600 text-indigo-600 dark:text-indigo-400 font-medium text-xs">
                            {formatAmount(scaledTotalCost, projectSettings?.costDecimalPlaces || 2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Footer */}
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-between items-center border-t border-gray-200 dark:border-gray-600">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Grand Total:{" "}
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                    {formatAmount(selectedItem.ingList.reduce((sum, ing) => sum + (ing.totalCost * (globalPob * selectedItem.participationPercentage / 100)), 0), projectSettings?.costDecimalPlaces || 2)}
                  </span>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 flex items-center gap-2 transition-colors"
                >
                  <X size={18} /> Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
};
export default MenuSimulation;