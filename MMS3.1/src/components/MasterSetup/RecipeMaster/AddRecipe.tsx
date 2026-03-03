// AddRecipe.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  RefreshCw,
  ArrowLeft,
  Save,
  Image as ImageIcon,
  Heart,
  FileText,
  Hash,
  Maximize,
  Users,
  ChefHat,
  Upload,
  Trash2,
  Search,
  Plus,
  Utensils,
  Package,
  DollarSign,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { BiMoney } from 'react-icons/bi';
import { useCredentials } from 'src/context/AuthContext';
// Interfaces
interface Category {
  pk: number;
  name: string;
}
interface Item {
  id: number;
  itemCode: string;
  itemName: string;
  itemCategoryFk: number;
  itemCategoryName: string;
  packageId: string;
  packagePrice: number;
  packageSecondaryUnit: string;
  packageSecondaryCost: number;
  chefUnit: string;
}
interface BaseQuantityOption {
  pk: number;
  quantity: number;
}
interface Ingredient {
  id: number;
  itemCode: string;
  itemName: string;
  itemCategoryFk: number;
  itemCategoryName: string;
  packageId: string;
  packagePrice: number;
  packageSecondaryUnit: string;
  packageSecondaryCost: number;
  chefUnit: string;
  quantity: string;
  total: string;
  costPrice: number;
}
interface Country {
  pk: number;
  name: string;
}
interface MealType {
  pk: number;
  name: string;
}
// Modal Components
const SessionExpiredModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
      <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Session Expired</h2>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
        Your session has expired. Please login again to continue.
      </p>
      <button
        onClick={onClose}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Go to Login
      </button>
    </div>
  </div>
);
const MessageModal = ({
  message,
  onClose,
  type = 'success',
  navigateAfter = false
}: {
  message: { title: string; body: string };
  onClose: () => void;
  type?: 'success' | 'error';
  navigateAfter?: boolean;
}) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
      {type === 'success' ? (
        <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
      ) : (
        <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
      )}
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">{message.title}</h2>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{message.body}</p>
      <button
        onClick={onClose}
        className={`mt-4 px-4 py-2 rounded-lg transition ${
          type === 'success'
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        OK
      </button>
    </div>
  </div>
);
const AddRecipe = () => {
  const navigate = useNavigate();
  // State declarations
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageModal, setMessageModal] = useState({
    title: '',
    body: '',
    type: 'success' as 'success' | 'error',
  });
  const [shouldNavigateAfterClose, setShouldNavigateAfterClose] = useState(false);
  const [formData, setFormData] = useState({
    recipeName: '',
    referenceNo: '',
    country: '',
    categories: [] as string[],
    mealTypes: [] as string[],
    baseQuantity: '',
    uom: '',
    finishedProduct: '0',
    portionSize: '0.0000',
    calories: '0',
    protein: '0',
    carb: '0',
    fat: '0',
  });
  const [countryId, setCountryId] = useState('');
  const [baseQuantityId, setBaseQuantityId] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [cookingInstructions, setCookingInstructions] = useState(['', '', '', '', '']);
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [selectedQuantities, setSelectedQuantities] = useState<{ [key: number]: string }>({});
  const [searchItemTerm, setSearchItemTerm] = useState('');
  const [modalTotalCost, setModalTotalCost] = useState('0.00');
  // Dropdown data states
  const [baseQuantityOptions, setBaseQuantityOptions] = useState<BaseQuantityOption[]>([]);
  const [mealTypesOptions, setMealTypesOptions] = useState<MealType[]>([]);
  const [fullCategoriesData, setFullCategoriesData] = useState<Category[]>([]);
  const [fullCuisineData, setFullCuisineData] = useState<Country[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  // Dropdown UI states
  const [isOpen, setIsOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMealTypeOpen, setIsMealTypeOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchMealType, setSearchMealType] = useState('');
  // Loading states
  const [loadingBaseQty, setLoadingBaseQty] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingMealTypes, setLoadingMealTypes] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [savingRecipe, setSavingRecipe] = useState(false);
  // Error states
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  // Reference No validation states
  const [isValidatingRefNo, setIsValidatingRefNo] = useState(false);
  const [refNoValidationStatus, setRefNoValidationStatus] = useState<'valid' | 'invalid' | 'unchecked'>('unchecked');
  const [refNoExists, setRefNoExists] = useState(false);
  const [refNoValidationError, setRefNoValidationError] = useState('');
  const credentials = useCredentials();
  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const mealTypeRef = useRef<HTMLDivElement>(null);
  const refNoRef = useRef<HTMLInputElement>(null);
  // Calculate portion size based on finished product and base quantity
  useEffect(() => {
    const base = parseFloat(formData.baseQuantity) || 0;
    const finished = parseFloat(formData.finishedProduct) || 0;
    const portion = base > 0 ? finished / base : 0;
    setFormData(prev => ({ ...prev, portionSize: portion.toFixed(4) }));
  }, [formData.baseQuantity, formData.finishedProduct]);
  // Image preview cleanup
  useEffect(() => {
    return () => {
      if (imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);
  // Modal handlers
  const handleSessionExpired = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    navigate('/');
  };
  const handleMessageModalClose = () => {
    setShowMessageModal(false);
    if (shouldNavigateAfterClose) {
      navigate('/Master/RecipeMaster');
      setShouldNavigateAfterClose(false);
    }
  };
  const showMessage = (title: string, body: string, type: 'success' | 'error' = 'success', navigateAfter = false) => {
    setMessageModal({ title, body, type });
    setShouldNavigateAfterClose(navigateAfter);
    setShowMessageModal(true);
  };
  // API call function with error handling
  const apiCall = async (url: string, options: RequestInit = {}) => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      setSessionExpired(true);
      throw new Error('No authentication token found');
    }
    const defaultOptions: RequestInit = {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    };
    const response = await fetch(url, defaultOptions);
    if (!response.ok) {
      if (response.status === 401 || response.status === 403 || response.status === 404) {
        setSessionExpired(true);
        throw new Error('Session expired');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  };
  // Fetch Base Quantities
  useEffect(() => {
    const fetchBaseQuantities = async () => {
      setLoadingBaseQty(true);
      try {
        const data = await apiCall(
          'https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/loadBaseQuantityDropDown'
        );
   
        if (Array.isArray(data.data)) {
          setBaseQuantityOptions(data.data.map((item: any) => ({
            pk: item.pk,
            quantity: item.quantity,
          })));
        } else {
          setBaseQuantityOptions([]);
        }
      } catch (err) {
        console.error('Error fetching base quantities:', err);
        if (!(err instanceof Error && err.message === 'Session expired')) {
          showMessage('Error', 'Session Expired Back To Login.', 'error');
        }
        setBaseQuantityOptions([]);
      } finally {
        setLoadingBaseQty(false);
      }
    };
    fetchBaseQuantities();
  }, []);
  // Fetch Countries
  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingCountries(true);
      try {
        const data = await apiCall(
          'https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/loadCountryDropDowm'
        );
        let countries: Country[] = [];
   
        // Handle different response formats
        if (Array.isArray(data.data)) {
          countries = data.data;
        } else if (data.data && Array.isArray(data.data.countryList)) {
          countries = data.data.countryList;
        } else if (Array.isArray(data)) {
          countries = data;
        }
        setFullCuisineData(countries);
      } catch (err) {
        console.error('Error fetching countries:', err);
        if (!(err instanceof Error && err.message === 'Session expired')) {
          showMessage('Error', 'Failed to load countries. Please try again.', 'error');
        }
        setFullCuisineData([]);
      } finally {
        setLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);
  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const data = await apiCall(
          'https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/loadCategoryDropDown'
        );
        if (Array.isArray(data.data)) {
          setFullCategoriesData(data.data);
        } else {
          setFullCategoriesData([]);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        if (!(err instanceof Error && err.message === 'Session expired')) {
          showMessage('Error', 'Failed to load categories. Please try again.', 'error');
        }
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);
  // Fetch Meal Types
  useEffect(() => {
    const fetchMealTypes = async () => {
      setLoadingMealTypes(true);
      try {
        const data = await apiCall(
          'https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/loadMealTypeDropDown'
        );
        if (Array.isArray(data.data)) {
          setMealTypesOptions(data.data.map((item: any) => ({
            pk: item.pk,
            name: item.name,
          })));
        } else {
          setMealTypesOptions([]);
        }
      } catch (err) {
        console.error('Error fetching meal types:', err);
        if (!(err instanceof Error && err.message === 'Session expired')) {
          showMessage('Error', 'Failed to load meal types. Please try again.', 'error');
        }
        setMealTypesOptions([]);
      } finally {
        setLoadingMealTypes(false);
      }
    };
    fetchMealTypes();
  }, []);
  // Fetch Items for Modal
  const fetchItems = async () => {
    setLoadingItems(true);
    try {
      const data = await apiCall(
        'https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/itemList'
      );
      if (Array.isArray(data.data)) {
        const cleanData = data.data
          .filter((item: any) => item.itemName)
          .map((item: any) => ({
            id: item.itemFk,
            itemCode: item.itemCode,
            itemName: item.itemName,
            itemCategoryFk: item.itemCategoryFk,
            itemCategoryName: item.itemCategoryName,
            packageId: item.packageId,
            packagePrice: item.packagePrice,
            packageSecondaryUnit: item.packageSecondaryUnit || item.chefUnit || '',
            packageSecondaryCost: item.packageSecondaryCost || item.costPrice || 0,
            chefUnit: item.packageSecondaryUnit || item.chefUnit || '',
          })) as Item[];
        setItems(cleanData);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error('Error fetching items:', err);
      if (!(err instanceof Error && err.message === 'Session expired')) {
        showMessage('Error', 'Failed to load items. Please try again.', 'error');
      }
      setItems([]);
    } finally {
      setLoadingItems(false);
    }
  };
  // Reference No validation
const checkRefNo = async (refNo: string) => {
  console.log('checkRefNo called with:', refNo);
 
  if (!refNo.trim()) {
    console.log('RefNo is empty, resetting validation');
    setRefNoValidationStatus('unchecked');
    setRefNoExists(false);
    setRefNoValidationError('');
    setIsValidatingRefNo(false);
    return;
  }
 
  console.log('Starting validation...');
  setIsValidatingRefNo(true);
  setRefNoValidationStatus('unchecked');
  setRefNoValidationError('');
 
  try {
    const token = sessionStorage.getItem('token');
    console.log('Token available:', !!token);
   
    if (!token) {
      console.log('No token found, session expired');
      setSessionExpired(true);
      setIsValidatingRefNo(false);
      return;
    }
   
    console.log('Making API call to checkCode endpoint');
    const requestBody = JSON.stringify({ refNo });
    console.log('Request body:', requestBody);
   
    const response = await fetch(
      'https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/checkCode',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: requestBody,
      },
    );
   
    console.log('Response status:', response.status, response.statusText);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
   
    const responseText = await response.text();
    console.log('Raw response text:', responseText);
   
    if (!response.ok) {
      console.error('HTTP error:', response.status, responseText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
   
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Parsed JSON response:', data);
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError, 'Raw:', responseText);
      throw new Error('Invalid JSON response from server');
    }
   
    // Check different possible response formats
    console.log('Response analysis:', {
      data,
      hasStatusCode: 'statusCode' in data,
      hasSuccess: 'success' in data,
      hasMessage: 'message' in data,
      statusCode: data.statusCode,
      message: data.message,
      success: data.success
    });
   
    // Handle different response formats
    if (data.success === false || data.message === 'Failed' || data.statusCode === 2000) {
      console.log('Validation failed - reference exists');
      setRefNoValidationStatus('invalid');
      setRefNoExists(true);
      setRefNoValidationError(data.apistatusmsg || data.message || 'Reference number already exists');
    }
    else if (data.success === true || data.message === 'success' || data.statusCode === 1025) {
      console.log('Validation successful - reference available');
      setRefNoValidationStatus('valid');
      setRefNoExists(false);
      setRefNoValidationError('');
    }
    else {
      console.warn('Unexpected response format:', data);
      setRefNoValidationStatus('unchecked');
      setRefNoExists(false);
      setRefNoValidationError('');
    }
   
  } catch (error) {
    console.error('Error validating reference number:', error);
    console.error('Error details:', error instanceof Error ? error.message : error);
   
    setRefNoValidationStatus('unchecked');
    setRefNoExists(false);
    setRefNoValidationError('Error checking reference number. Please try again.');
   
    // Show error message but not for network errors
    if (error instanceof Error && !error.message.includes('Network')) {
      showMessage('Validation Error', 'Failed to validate reference number. Please try again.', 'error');
    }
   
  } finally {
    console.log('Validation complete, setting isValidatingRefNo to false');
    setIsValidatingRefNo(false);
  }
};
const handleRefNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  console.log('handleRefNoChange:', value);
 
  if (value.length <= 30) {
    setFormData(prev => ({ ...prev, referenceNo: value }));
   
    // Clear errors
    if (errors.referenceNo) {
      setErrors(prev => ({ ...prev, referenceNo: '' }));
    }
   
    // Reset validation states when user starts typing
    if (value.trim() !== formData.referenceNo.trim()) {
      console.log('Resetting validation states');
      setRefNoExists(false);
      setRefNoValidationError('');
      setRefNoValidationStatus('unchecked');
      setIsValidatingRefNo(false);
    }
  }
};
const handleRefNoBlur = () => {
  console.log('handleRefNoBlur called, refNo:', formData.referenceNo);
 
  if (formData.referenceNo.trim()) {
    console.log('Calling checkRefNo...');
    checkRefNo(formData.referenceNo);
  } else {
    console.log('RefNo is empty, resetting validation');
    setRefNoValidationStatus('unchecked');
    setRefNoExists(false);
    setRefNoValidationError('');
    setIsValidatingRefNo(false);
  }
};
  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (mealTypeRef.current && !mealTypeRef.current.contains(event.target as Node)) {
        setIsMealTypeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  // Form handlers
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };
  // NEW: Helper for decimal numeric input (no letters, allow decimals with limits)
  const handleDecimalInput = (field: keyof typeof formData, rawValue: string): string => {
    // Remove non-numeric characters except decimal point
    let value = rawValue.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    // Limit decimal places based on field
    if (field === 'finishedProduct') {
      // 2 decimal places for finished product
      const [integer, decimal = ''] = value.split('.');
      if (decimal.length > 2) {
        value = integer + '.' + decimal.slice(0, 2);
      }
    } else if (['calories', 'protein', 'carb', 'fat'].includes(field)) {
      // 1 decimal place for nutritional info
      const [integer, decimal = ''] = value.split('.');
      if (decimal.length > 1) {
        value = integer + '.' + decimal.slice(0, 1);
      }
    }
    return value;
  };
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview('');
  };
  // Category handlers
  const toggleCategory = (pk: number, name: string) => {
    setSelectedCategories((prev) => {
      const isSelected = prev.includes(pk);
      let updatedSelected: number[];
      let updatedNames: string[];
      if (isSelected) {
        updatedSelected = prev.filter((id) => id !== pk);
        updatedNames = formData.categories.filter((catName) => catName !== name);
      } else {
        updatedSelected = [...prev, pk];
        updatedNames = [...formData.categories, name];
      }
      handleInputChange('categories', updatedNames);
      return updatedSelected;
    });
  };
  const handleSelectAllCategories = () => {
    if (selectedCategories.length === fullCategoriesData.length) {
      setSelectedCategories([]);
      setFormData(prev => ({ ...prev, categories: [] }));
    } else {
      const allIds = fullCategoriesData.map((cat) => cat.pk);
      setSelectedCategories(allIds);
      setFormData(prev => ({
        ...prev,
        categories: fullCategoriesData.map(cat => cat.name)
      }));
    }
  };
  // Meal Type handlers
  const toggleMealType = (pk: number) => {
    setFormData((prev) => {
      const isSelected = prev.mealTypes.includes(String(pk));
      const updated = isSelected
        ? prev.mealTypes.filter((id) => id !== String(pk))
        : [...prev.mealTypes, String(pk)];
      return { ...prev, mealTypes: updated };
    });
  };
  const handleSelectAllMealTypes = () => {
    setFormData((prev) => {
      if (prev.mealTypes.length === mealTypesOptions.length) {
        return { ...prev, mealTypes: [] };
      } else {
        return { ...prev, mealTypes: mealTypesOptions.map((m) => String(m.pk)) };
      }
    });
  };
  // ========== MODAL FUNCTIONS WITH FIXES ==========
  // FIXED: Check if item is already in ingredients
  const isItemAlreadySelected = (itemId: number): boolean => {
    return selectedIngredients.some((ing) => ing.id === itemId);
  };
  const openModal = () => {
    setIsModalOpen(true);
    fetchItems();
    setSelectedItemIds([]);
    setSelectedQuantities({});
    setSearchItemTerm('');
    setModalTotalCost('0.00');
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItemIds([]);
    setSelectedQuantities({});
    setSearchItemTerm('');
    setModalTotalCost('0.00');
  };
  // FIXED: Enhanced toggle function to handle row clicks and prevent duplicates
  const toggleItemSelection = (itemId: number, event?: React.MouseEvent): void => {
    if (event) {
      event.stopPropagation();
    }
    // Check if item is already in ingredients
    if (isItemAlreadySelected(itemId)) {
      showMessage('Item Already Added', 'This item is already added to the recipe. You can edit its quantity in the ingredients table.', 'error');
      return;
    }
    setSelectedItemIds((prev) => {
      const isSelected = prev.includes(itemId);
      let newSelected: number[];
      let newQuantities: { [key: number]: string };
 
      if (isSelected) {
        newSelected = prev.filter((id) => id !== itemId);
        newQuantities = { ...selectedQuantities };
        delete newQuantities[itemId];
      } else {
        newSelected = [...prev, itemId];
        newQuantities = { ...selectedQuantities, [itemId]: '1' }; // Default to 1 instead of 0
      }
 
      setSelectedQuantities(newQuantities);
      calculateModalTotal(newSelected, newQuantities);
      return newSelected;
    });
  };
  // FIXED: Handle row click for selection
  const handleRowClick = (itemId: number): void => {
    toggleItemSelection(itemId);
  };
  const handleQuantityChange = (itemId: number, quantity: string, event?: React.MouseEvent): void => {
    if (event) {
      event.stopPropagation();
    }
    const validQuantity = parseFloat(quantity) < 0 ? '0' : quantity;
    setSelectedQuantities((prev) => {
      const newQuantities = { ...prev, [itemId]: validQuantity };
      calculateModalTotal(selectedItemIds, newQuantities);
 
      return newQuantities;
    });
  };
  const calculateModalTotal = (ids: number[], quantities: { [key: number]: string }) => {
    let total = 0;
    ids.forEach((id) => {
      const item = items.find((i) => i.id === id);
      const qty = parseFloat(quantities[id] || '0');
      const cost = item ? item.packageSecondaryCost : 0;
      total += qty * cost;
    });
    setModalTotalCost(total.toFixed(2));
  };
  // FIXED: Enhanced Select All functionality
  const handleSelectAllItems = () => {
    const filtered = filteredItems;
    const allIds = filtered.map((item) => item.id);
    if (selectedItemIds.length === allIds.length) {
      setSelectedItemIds([]);
      setSelectedQuantities({});
      setModalTotalCost('0.00');
    } else {
      const newQuantities = { ...selectedQuantities };
      allIds.forEach((id) => {
        if (!selectedItemIds.includes(id)) {
          newQuantities[id] = '1'; // Default to 1 instead of 0
        }
      });
      setSelectedItemIds(allIds);
      setSelectedQuantities(newQuantities);
      calculateModalTotal(allIds, newQuantities);
    }
  };
  // FIXED: Enhanced addSelectedItems function
  const addSelectedItems = () => {
    const itemsToAdd = selectedItemIds
      .map((id) => {
        const item = items.find((i) => i.id === id);
        const quantity = selectedQuantities[id] || '0';
   
        // Skip items with quantity 0 or invalid
        if (!item || parseFloat(quantity) <= 0 || isNaN(parseFloat(quantity))) {
          return null;
        }
   
        const costPrice = item.packageSecondaryCost;
        const total = (parseFloat(quantity) * costPrice).toFixed(2);
   
        return {
          ...item,
          quantity,
          total,
          costPrice,
        };
      })
      .filter(Boolean) as Ingredient[];
    if (itemsToAdd.length === 0) {
      showMessage('Validation Error', 'Please add at least one item with quantity greater than 0', 'error');
      return;
    }
    setSelectedIngredients((prev) => {
      const newIngredients = [...prev, ...itemsToAdd];
      return newIngredients;
    });
    closeModal();
  };
  // FIXED: Filter out items that are already in selectedIngredients
  const filteredItems: Item[] = items.filter(
    (item) =>
      !isItemAlreadySelected(item.id) &&
      (item.itemName.toLowerCase().includes(searchItemTerm.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchItemTerm.toLowerCase()) ||
      item.itemCategoryName.toLowerCase().includes(searchItemTerm.toLowerCase())),
  );
  // ========== INGREDIENTS TABLE FUNCTIONS ==========
  const calculateTotalCost = () => {
    return selectedIngredients.reduce((sum, item) => sum + parseFloat(item.total || '0'), 0);
  };
  const updateIngredientQuantity = (index: number, quantity: string) => {
    setSelectedIngredients((prev) => {
      const updated = prev.map((ing, i) =>
        i === index ? {
          ...ing,
          quantity,
          total: (Math.max(0, parseFloat(quantity) || 0) * (ing.costPrice || 0)).toFixed(2)
        } : ing
      );
      return updated;
    });
  };
  const removeIngredient = (index: number) => {
    setSelectedIngredients((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated;
    });
  };
  // Validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.recipeName.trim()) newErrors.recipeName = 'Recipe Name is required';
    if (!formData.referenceNo.trim()) newErrors.referenceNo = 'Reference No is required';
    else if (formData.referenceNo.length > 30) newErrors.referenceNo = 'Reference No cannot exceed 30 characters';
    else if (refNoExists) newErrors.referenceNo = 'Reference No already exists';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (formData.categories.length === 0) newErrors.categories = 'At least one category is required';
    if (formData.mealTypes.length === 0) newErrors.mealTypes = 'At least one meal type is required';
    if (!formData.baseQuantity.trim()) newErrors.baseQuantity = 'Base Quantity is required';
    if (!formData.uom.trim()) newErrors.uom = 'UOM is required';
    if (parseFloat(formData.finishedProduct) <= 0) newErrors.finishedProduct = 'Finished Product must be greater than 0';
    if (parseFloat(formData.portionSize) <= 0) newErrors.portionSize = 'Portion Size must be greater than 0';
    if (selectedIngredients.length === 0) newErrors.ingredients = 'At least one ingredient is required';
    // Check if all ingredients have valid quantities
    const invalidIngredients = selectedIngredients.filter(ing =>
      parseFloat(ing.quantity) <= 0 || isNaN(parseFloat(ing.quantity))
    );
    if (invalidIngredients.length > 0) {
      newErrors.ingredients = 'All ingredients must have valid quantities greater than 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const validateBeforeSave = (): boolean => {
    if (!countryId || countryId === '0') {
      showMessage('Validation Error', 'Please select a country', 'error');
      return false;
    }
    if (!baseQuantityId || baseQuantityId === '0') {
      showMessage('Validation Error', 'Please select a base quantity', 'error');
      return false;
    }
    if (selectedCategories.length === 0) {
      showMessage('Validation Error', 'Please select at least one category', 'error');
      return false;
    }
    if (formData.mealTypes.length === 0) {
      showMessage('Validation Error', 'Please select at least one meal type', 'error');
      return false;
    }
    if (selectedIngredients.length === 0) {
      showMessage('Validation Error', 'Please add at least one ingredient', 'error');
      return false;
    }
    return true;
  };
  // Save Recipe - FIXED with proper image handling
const saveRecipe = async () => {
  if (!validateForm()) {
    return;
  }
  if (!validateBeforeSave()) {
    return;
  }
  setSavingRecipe(true);
  try {
    const token = sessionStorage.getItem('token');
    if (!token) {
      setSessionExpired(true);
      return;
    }
    // Prepare recipe data
    const recipeSubList = selectedIngredients.map((ingredient) => ({
      itemCategoryFk: ingredient.itemCategoryFk,
      itemFk: ingredient.id,
      secondaryQuantity: parseFloat(ingredient.quantity) || 0,
      total: parseFloat(ingredient.total) || 0
    }));
    // Calculate costs
    const totalCostValue = calculateTotalCost();
    const finishedProductValue = parseFloat(formData.finishedProduct) || 0;
    const perPortionCostValue = finishedProductValue > 0 ? totalCostValue / finishedProductValue : 0;
    const recipeData = {
      recipeName: formData.recipeName,
      refNo: formData.referenceNo,
      cookingInstruction: cookingInstructions.filter(step => step.trim() !== '').map((step, i) => `${i + 1}. ${step}`).join('\n') || 'No instructions provided',
      countryOriginFk: parseInt(countryId),
      baseQuantityFk: parseInt(baseQuantityId),
      baseQuantity: parseFloat(formData.baseQuantity) || 100,
      uom: formData.uom,
      finishedProduct: finishedProductValue,
      portionSize: parseFloat(formData.portionSize) || 0,
      totalCost: parseFloat(totalCostValue.toFixed(2)),
      perPortionCost: parseFloat(perPortionCostValue.toFixed(2)),
      calories: parseFloat(formData.calories) || 0,
      protein: parseFloat(formData.protein) || 0,
      carbs: parseFloat(formData.carb) || 0,
      fat: parseFloat(formData.fat) || 0,
      createdBy: credentials.userId,
      categoryList: selectedCategories.map(cat => String(cat)),
      mealtype: formData.mealTypes,
      recipeSubList: recipeSubList
    };
    console.log('Sending recipe data:', recipeData);
    // FIXED: Create FormData exactly like ProjectSettingsConfiguration
    const formDataToSend = new FormData();
    // Add JSON data as blob
    const jsonBlob = new Blob([JSON.stringify(recipeData)], { type: 'application/json' });
    formDataToSend.append('data', jsonBlob, 'data.json');
    // FIXED: Handle image upload exactly like ProjectSettingsConfiguration
    if (selectedImage instanceof File) {
      formDataToSend.append('file', selectedImage);
      console.log('Appending recipe image file:', selectedImage.name, selectedImage.size, selectedImage.type);
    } else {
      // Append empty blob to prevent null on backend - CRITICAL FIX
      const emptyBlob = new Blob([], { type: 'application/octet-stream' });
      formDataToSend.append('file', emptyBlob, 'empty.txt');
      console.log('Appending empty blob for file field (no image selected)');
    }
    // Debug: Log FormData entries
    console.log('FormData entries for recipe:');
    for (let [key, value] of formDataToSend.entries()) {
      if (value instanceof File) {
        console.log(key, '-> File:', value.name, value.size, value.type);
      } else {
        console.log(key, '->', value);
      }
    }
    const response = await fetch(
      'https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/recipeMasterSave',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // DO NOT set Content-Type - let browser set multipart boundary
        },
        body: formDataToSend,
      }
    );
 if (!response.ok) {
  if (response.status === 401 || response.status === 403 || response.status === 404) {
    setSessionExpired(true);
    return;
  }
  const errorText = await response.text();
  console.error('Full server error response:', errorText);
  throw new Error(`HTTP ${response.status}: ${errorText}`);
}
const data = await response.json();
console.log('API Response:', data);
// MODIFIED RESPONSE HANDLING
if (data.success === true) {
  showMessage('Success', 'Recipe saved successfully!', 'success', true);
} else if (data.success === false) {
  showMessage('Error', data.message || 'Recipe save failed. Please try again.', 'error');
} else {
  // Fallback for unexpected response structure
  showMessage('Error', 'Unexpected response from server', 'error');
}
  } catch (err) {
    console.error('Error saving recipe:', err);
    showMessage('Error', err instanceof Error ? err.message : 'Unknown error occurred', 'error');
  } finally {
    setSavingRecipe(false);
  }
};
  // Clear all form data
  const handleClearAll = () => {
    setFormData({
      recipeName: '',
      referenceNo: '',
      country: '',
      categories: [],
      mealTypes: [],
      baseQuantity: '',
      uom: '',
      finishedProduct: '0.00',
      portionSize: '0.0000',
      calories: '0.0',
      protein: '0.0',
      carb: '0.0',
      fat: '0.0',
    });
    setCountryId('');
    setBaseQuantityId('');
    setSelectedIngredients([]);
    setSelectedImage(null);
    setImagePreview('');
    setCookingInstructions(['', '', '', '', '']);
    setSelectedCategories([]);
    setFormData(prev => ({ ...prev, categories: [], mealTypes: [] }));
    setErrors({});
    setRefNoValidationStatus('unchecked');
    setRefNoExists(false);
    setRefNoValidationError('');
    if (refNoRef.current) refNoRef.current.value = '';
  };
  // Filtered data
  const filteredCountries = fullCuisineData.filter((country) =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const filteredCategories = fullCategoriesData.filter((cat) =>
    cat.name.toLowerCase().includes(searchCategory.toLowerCase()),
  );
  const filteredMealTypes = mealTypesOptions.filter((meal) =>
    meal.name.toLowerCase().includes(searchMealType.toLowerCase()),
  );
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Modals */}
      {sessionExpired && <SessionExpiredModal onClose={handleSessionExpired} />}
      {showMessageModal && (
        <MessageModal
          message={messageModal}
          onClose={handleMessageModalClose}
          type={messageModal.type}
          navigateAfter={shouldNavigateAfterClose}
        />
      )}
 
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Add New Recipe</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Create and manage your recipe details
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/Master/RecipeMaster')}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              className="flex items-center gap-2 bg-yellow-300 dark:bg-gray-700 hover:bg-gray-300 px-2 py-2 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 p-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
              title="Reset"
              onClick={handleClearAll}
            >
              <RefreshCw size={18} className="w-4 h-4" />
            </button>
            <button
              onClick={saveRecipe}
              disabled={savingRecipe}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-2 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
              title="Save Recipe"
            >
              {savingRecipe ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {savingRecipe ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
      {/* Form Content */}
      <div className="mt-4 max-w-7xl mx-auto">
        {/* Basic Information Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6 transition-all duration-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <ChefHat className="text-blue-600 dark:text-blue-400" size={22} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                Basic Information
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Essential details about your recipe
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Recipe Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Recipe Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Utensils className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="Enter recipe name"
                  value={formData.recipeName}
                  onChange={(e) => handleInputChange('recipeName', e.target.value)}
                  maxLength={30}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${
                    errors.recipeName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                  }`}
                />
              </div>
              {errors.recipeName && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.recipeName}</p>}
              <p className={`text-xs ${30 - formData.recipeName.length <= 0 ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {Math.max(0, 30 - formData.recipeName.length)} Characters remaining
              </p>
            </div>
            {/* Reference No */}
           {/* Reference No */}
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
   <div className='flex gap-4'> <div>Reference No <span className="text-red-500">*</span> </div><div className="min-h-[0px]">
   
    {!isValidatingRefNo && refNoValidationStatus === 'invalid' && (
      <p className="text-xs text-red-500 dark:text-red-400 mt-1">
        {'(already exists)'}
      </p>
    )}
    
    {(errors.referenceNo && !isValidatingRefNo && refNoValidationStatus !== 'invalid') && (
      <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.referenceNo}</p>
    )}
  </div></div>
    
  </label>
  <div className="relative">
    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
    <input
      ref={refNoRef}
      type="text"
      placeholder="Enter reference number"
      value={formData.referenceNo}
      onChange={handleRefNoChange}
      onBlur={handleRefNoBlur}
      maxLength={30}
      className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${
        errors.referenceNo || refNoExists ? 'border-red-500 focus:ring-red-500' :
        refNoValidationStatus === 'valid' ? 'border-green-500 focus:ring-green-500' :
        'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
      }`}
    />
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
      {isValidatingRefNo ? (
        <Loader2 className="animate-spin h-5 w-5 text-blue-500" />
      ) : refNoValidationStatus === 'valid' ? (
        <CheckCircle className="h-5 w-5 text-green-500" />
      ) : refNoValidationStatus === 'invalid' ? (
        <AlertCircle className="h-5 w-5 text-red-500" />
      ) : null}
    </div>
  </div>
 
  {/* Validation Messages */}
 
 
  <p className={`text-xs ${30 - formData.referenceNo.length <= 0 ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
    {Math.max(0, 30 - formData.referenceNo.length)} Characters remaining
  </p>
</div>
            {/* Country */}
            <div className="space-y-2 relative" ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Country <span className="text-red-500">*</span>
              </label>
              <div
                className={`w-full h-12 px-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-700 flex items-center justify-between cursor-pointer ${
                  errors.country ? 'border-red-500 focus-within:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus-within:ring-blue-500'
                }`}
                onClick={() => setIsOpen(!isOpen)}
              >
                <span className="text-sm truncate">{formData.country || 'Select Country'}</span>
                <ChevronDown className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} text-gray-500`} size={18} />
              </div>
              {errors.country && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.country}</p>}
              {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div className="flex items-center px-3 py-2 border-b border-gray-200 dark:border-gray-600 sticky top-0 bg-white dark:bg-gray-700">
                    <Search size={16} className="text-gray-500 mr-2" />
                    <input
                      type="text"
                      placeholder="Search country..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200"
                    />
                  </div>
                  {loadingCountries ? (
                    <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                      <Loader2 className="animate-spin mx-auto mb-2" size={16} />
                      Loading countries...
                    </div>
                  ) : filteredCountries.length > 0 ? (
                    filteredCountries.map((country) => (
                      <div
                        key={country.pk}
                        onClick={() => {
                          handleInputChange('country', country.name);
                          setCountryId(String(country.pk));
                          setIsOpen(false);
                          setSearchTerm('');
                        }}
                        className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-600 ${
                          formData.country === country.name ? 'bg-blue-50 dark:bg-gray-600 font-medium' : ''
                        }`}
                      >
                        {country.name}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      No countries found
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Categories */}
            <div className="space-y-2 relative" ref={categoryRef}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Categories <span className="text-red-500">*</span>
              </label>
              <div
                className={`w-full h-12 pl-3 pr-3 border rounded-lg bg-white dark:bg-gray-700 flex items-center justify-between cursor-pointer ${
                  errors.categories ? 'border-red-500 focus-within:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus-within:ring-blue-500'
                }`}
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              >
                <span className="text-sm truncate">
                  {formData.categories.length ? `${formData.categories.length} selected` : 'Select Categories'}
                </span>
                <ChevronDown className={`transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''} text-gray-500`} size={18} />
              </div>
              {errors.categories && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.categories}</p>}
              {isCategoryOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-72 overflow-y-auto">
                  <div className="flex items-center px-3 py-2 border-b border-gray-200 dark:border-gray-600 sticky top-0 bg-white dark:bg-gray-700">
                    <Search size={16} className="text-gray-500 mr-2" />
                    <input
                      type="text"
                      placeholder="Search category..."
                      value={searchCategory}
                      onChange={(e) => setSearchCategory(e.target.value)}
                      className="w-full bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200"
                    />
                  </div>
                  <div
                    className="flex items-center px-4 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-600"
                    onClick={handleSelectAllCategories}
                  >
                    <input
                      type="checkbox"
                      readOnly
                      checked={selectedCategories.length === fullCategoriesData.length && fullCategoriesData.length > 0}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium">Select All</span>
                  </div>
                  {loadingCategories ? (
                    <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                      <Loader2 className="animate-spin mx-auto mb-2" size={16} />
                      Loading categories...
                    </div>
                  ) : filteredCategories.length > 0 ? (
                    filteredCategories.map((cat) => (
                      <div
                        key={cat.pk}
                        className="flex items-center px-4 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-600"
                        onClick={() => toggleCategory(cat.pk, cat.name)}
                      >
                        <input type="checkbox" checked={selectedCategories.includes(cat.pk)} readOnly className="mr-2" />
                        <span className="text-sm">{cat.name}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">No categories found</div>
                  )}
                </div>
              )}
            </div>
            {/* Meal Types */}
            <div className="space-y-2 relative" ref={mealTypeRef}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Meal Types <span className="text-red-500">*</span>
              </label>
              <div
                className={`w-full h-12 pl-3 pr-3 border rounded-lg bg-white dark:bg-gray-700 flex items-center justify-between cursor-pointer ${
                  errors.mealTypes ? 'border-red-500 focus-within:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus-within:ring-blue-500'
                }`}
                onClick={() => setIsMealTypeOpen(!isMealTypeOpen)}
              >
                <span className="text-sm truncate">
                  {formData.mealTypes.length ? `${formData.mealTypes.length} selected` : 'Select Meal Types'}
                </span>
                <ChevronDown className={`transition-transform duration-200 ${isMealTypeOpen ? 'rotate-180' : ''} text-gray-500`} size={18} />
              </div>
              {errors.mealTypes && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.mealTypes}</p>}
              {isMealTypeOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-72 overflow-y-auto">
                  <div className="flex items-center px-3 py-2 border-b border-gray-200 dark:border-gray-600 sticky top-0 bg-white dark:bg-gray-700">
                    <Search size={16} className="text-gray-500 mr-2" />
                    <input
                      type="text"
                      placeholder="Search meal type..."
                      value={searchMealType}
                      onChange={(e) => setSearchMealType(e.target.value)}
                      className="w-full bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200"
                    />
                  </div>
                  <div className="flex items-center px-4 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-600" onClick={handleSelectAllMealTypes}>
                    <input type="checkbox" readOnly checked={formData.mealTypes.length === mealTypesOptions.length} className="mr-2" />
                    <span className="text-sm font-medium">Select All</span>
                  </div>
                  {loadingMealTypes ? (
                    <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                      <Loader2 className="animate-spin mx-auto mb-2" size={16} />
                      Loading meal types...
                    </div>
                  ) : filteredMealTypes.map((meal) => (
                    <div key={meal.pk} className="flex items-center px-4 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-600" onClick={() => toggleMealType(meal.pk)}>
                      <input type="checkbox" readOnly checked={formData.mealTypes.includes(String(meal.pk))} className="mr-2" />
                      <span className="text-sm">{meal.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Base Quantity */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Base Quantity <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Maximize className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                <select
                  value={formData.baseQuantity}
                  onChange={(e) => {
                    const selectedQuantity = e.target.value;
                    const option = baseQuantityOptions.find(opt => String(opt.quantity) === selectedQuantity);
                    if (option) {
                      handleInputChange('baseQuantity', selectedQuantity);
                      setBaseQuantityId(String(option.pk));
                    }
                  }}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 ${
                    errors.baseQuantity ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                  }`}
                >
                  <option value="">Select Base Quantity</option>
                  {loadingBaseQty ? <option disabled>Loading...</option> : baseQuantityOptions.map((opt) => (
                    <option key={opt.pk} value={String(opt.quantity)}>{opt.quantity}</option>
                  ))}
                </select>
              </div>
              {errors.baseQuantity && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.baseQuantity}</p>}
            </div>
            {/* UOM */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                UOM <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                <select
                  value={formData.uom}
                  onChange={(e) => handleInputChange('uom', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 ${
                    errors.uom ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                  }`}
                >
                  <option value="">Select UOM</option>
                  <option value="g">g</option>
                  <option value="Kg">Kg</option>
                  <option value="Liter">Liter</option>
                  <option value="Piece">Piece</option>
                </select>
              </div>
              {errors.uom && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.uom}</p>}
            </div>
            {/* Finished Product */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Finished Product <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <BiMoney className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                <input
                  type="text"
                  value={formData.finishedProduct}
                  onChange={(e) => {
                    const filteredValue = handleDecimalInput('finishedProduct', e.target.value);
                    handleInputChange('finishedProduct', filteredValue);
                  }}
                  maxLength={4}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 ${
                    errors.finishedProduct ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                  }`}
                />
              </div>
              {errors.finishedProduct && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.finishedProduct}</p>}
               <p className={`text-xs ${4 - formData.finishedProduct.length <= 0 ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {Math.max(0, 4 - formData.finishedProduct.length)} Characters remaining
              </p>
       
            </div>
            {/* Portion Size */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Portion Size (Calculated) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                <input
                  type="text"
                  value={formData.portionSize}
                  readOnly
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed transition-all duration-200 ${
                    errors.portionSize ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
              </div>
              {/* {errors.portionSize && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.portionSize}</p>} */}
              <p className="text-xs text-gray-500 dark:text-gray-400">Calculated as Finished Product ÷ Base Quantity</p>
            </div>
          </div>
        </div>
        {/* Recipe Ingredients Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6 transition-all duration-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <Package className="text-blue-600 dark:text-blue-400" size={22} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Recipe Ingredients</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Add ingredients to your recipe</p>
              </div>
            </div>
            <button
              onClick={openModal}
              disabled={loadingItems}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
            >
              {loadingItems ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
              <span>{loadingItems ? 'Loading...' : 'Select Items'}</span>
            </button>
          </div>
          {errors.ingredients && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{errors.ingredients}</p>
            </div>
          )}
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">S NO</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Item Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Item Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Package ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Package Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Chef Unit</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Cost Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Quantity <span className="text-red-500">*</span></th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {selectedIngredients.length > 0 ? (
                  selectedIngredients.map((ingredient, index) => (
                    <tr key={ingredient.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{ingredient.itemCode}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{ingredient.itemName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{ingredient.itemCategoryName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{ingredient.packageId}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{ingredient.packagePrice?.toFixed(2) || '0.00'}</td>
                      <td className="px-5 py-3 text-sm text-gray-900 dark:text-gray-100">{ingredient.chefUnit || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{ingredient.costPrice?.toFixed(2) || '0.00'}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          value={ingredient.quantity}
                          onChange={(e) => updateIngredientQuantity(index, e.target.value)}
                          placeholder="0"
                          className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{ingredient.total || '0.00'}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => removeIngredient(index)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                        <Package size={48} className="mb-3 opacity-50" />
                        <p className="text-lg font-medium">No ingredients added yet</p>
                        <p className="text-sm">Click "Select Items" to add ingredients to your recipe</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-right">
            <span className="text-lg font-semibold text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg">
              Total Cost: <span className="text-blue-600 dark:text-blue-400">{calculateTotalCost().toFixed(2)}</span>
            </span>
          </div>
        </div>
        {/* Bottom Section - 3 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recipe Image */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <ImageIcon className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recipe Image</h3>
            </div>
            <div className="space-y-4">
              <label className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-lg border border-blue-200 dark:border-blue-800 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200">
                <Upload size={18} />
                <span>Choose Image</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
              <div className={`border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 transition-all duration-200 ${imagePreview ? 'border-blue-300 dark:border-blue-700' : ''}`}>
                {imagePreview ? (
                  <div className="relative w-full h-full">
                    <img src={imagePreview} alt="Recipe preview" className="w-full h-full object-cover rounded-lg" />
                    <button onClick={removeImage} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors duration-200">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon size={48} className="text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No image selected</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Upload a photo of your recipe</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Nutritional Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
  <div className="flex items-center gap-3 mb-4">
    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
      <Heart className="text-blue-600 dark:text-blue-400" size={20} />
    </div>
    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Nutritional Information</h3>
  </div>
  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Per serving values</p>
  <div className="space-y-4">
    {[
      { label: 'Calories (per serving)', value: 'calories' as const, unit: 'kcal' },
      { label: 'Protein', value: 'protein' as const, unit: 'g' },
      { label: 'Carbohydrates', value: 'carb' as const, unit: 'g' },
      { label: 'Fat', value: 'fat' as const, unit: 'g' },
    ].map(({ label, value, unit }) => {
      const currentLength = formData[value]?.toString().length || 0;
      const remainingChars = Math.max(0, 4 - currentLength);
      
      return (
        <div key={value} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
          <div className="relative">
            <input
              type="text"
              value={formData[value]}
              onChange={(e) => {
                const filteredValue = handleDecimalInput(value, e.target.value);
                // Additional check for character limit
                if (filteredValue.toString().length <= 4) {
                  handleInputChange(value, filteredValue);
                }
              }}
              maxLength={4}
              className="w-full pl-4 pr-16 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm font-medium">{unit}</span>
          </div>
          <p className={`text-xs ${remainingChars <= 0 ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {remainingChars} Character{remainingChars !== 1 ? 's' : ''} remaining
          </p>
        </div>
      );
    })}
  </div>
</div>
          {/* Cooking Instructions */}
<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
      <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
        <FileText className="text-blue-600 dark:text-blue-400" size={20} />
      </div>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Cooking Instructions</h3>
    </div>
    <button
      type="button"
      onClick={() => {
        const newInstructions = [...cookingInstructions, ''];
        if (newInstructions.length <= 20) {
          setCookingInstructions(newInstructions);
          setTimeout(() => {
            const textareas = document.querySelectorAll('textarea');
            if (textareas.length > 0) {
              (textareas[textareas.length - 1] as HTMLTextAreaElement).focus();
            }
          }, 50);
        }
      }}
      className="flex items-center justify-center w-9 h-9 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200"
    >
      <Plus size={16} />
    </button>
  </div>
  
  {/* Fixed height container with scroll - always fixed height */}
  <div className="h-[400px] overflow-y-auto pr-2">
    <div className="space-y-3 pb-1">
      {cookingInstructions.map((instruction, index) => {
        const stepNumber = index + 1;
        return (
          <div key={index} className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium flex-shrink-0 mt-1">
              {stepNumber}
            </div>
            <div className="flex-1 flex items-start gap-2 min-w-0">
              <div className="flex-1 min-w-0">
                <textarea
                  rows={3}
                  value={instruction || ''}
                  onChange={(e) => {
                    const newInstructions = [...cookingInstructions];
                    newInstructions[index] = e.target.value;
                    setCookingInstructions(newInstructions);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none transition-all duration-200 font-medium"
                  placeholder={`Enter step ${stepNumber}...`}
                  onKeyDown={(e) => {
                    // Tab key moves to next step
                    if (e.key === 'Tab' && !e.shiftKey) {
                      e.preventDefault();
                      if (index < cookingInstructions.length - 1) {
                        const nextTextarea = document.querySelectorAll('textarea')[index + 1];
                        if (nextTextarea) {
                          (nextTextarea as HTMLTextAreaElement).focus();
                        }
                      }
                    }
                    // Shift+Tab moves to previous step
                    else if (e.key === 'Tab' && e.shiftKey) {
                      e.preventDefault();
                      if (index > 0) {
                        const prevTextarea = document.querySelectorAll('textarea')[index - 1];
                        if (prevTextarea) {
                          (prevTextarea as HTMLTextAreaElement).focus();
                        }
                      }
                    }
                  }}
                />
              </div>
              {cookingInstructions.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const newInstructions = cookingInstructions.filter((_, i) => i !== index);
                    setCookingInstructions(newInstructions);
                  }}
                  className="mt-1 px-3 py-1.5 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 transition-colors duration-200 flex-shrink-0 whitespace-nowrap"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        );
      })}
      
      {/* Empty state */}
      {cookingInstructions.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[300px] text-gray-400 dark:text-gray-500">
          <FileText size={48} className="mb-3 opacity-50" />
          <p className="text-lg font-medium mb-1">No instructions added yet</p>
          <p className="text-sm">Click the "+" button above to add your first step</p>
        </div>
      )}
    </div>
  </div>
  
  {/* Step counter */}
  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
    <p className="text-sm text-gray-500 dark:text-gray-400">
      Steps: {cookingInstructions.length}/20
    </p>
  </div>
</div>
        </div>
      </div>
      {/* Select Items Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={closeModal}
            />
       
            {/* Modal Panel */}
            <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-6xl w-full max-w-6xl mx-4">
              {/* Header */}
              <div className="bg-white dark:bg-gray-800 px-4 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {loadingItems ? 'Loading Items...' : 'Select Items'}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              {/* Body */}
              <div className="p-4 max-h-[70vh] overflow-y-auto">
                {/* Search */}
                <div className="mb-4">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Search by name, code, or category..."
                      value={searchItemTerm}
                      onChange={(e) => setSearchItemTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                {/* Select All */}
                <div className="mb-4 flex items-center">
                  <input
                    type="checkbox"
                    checked={
                      selectedItemIds.length === filteredItems.length && filteredItems.length > 0
                    }
                    onChange={handleSelectAllItems}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select All ({filteredItems.length} items)
                  </span>
                </div>
                {/* Table */}
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                          Select
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                          Item Code
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                          Item
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                          Category
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                          Package Price
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                          Chef Unit
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                          Cost Price
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {loadingItems ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                            <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                            Loading items...
                          </td>
                        </tr>
                      ) : filteredItems.length > 0 ? (
                        filteredItems.map((item) => {
                          const isSelected = selectedItemIds.includes(item.id);
                          const quantity = selectedQuantities[item.id] || '0';
                          return (
                            <tr
                              key={item.id}
                              className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                                isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                              }`}
                              onClick={() => handleRowClick(item.id)}
                            >
                              <td className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => toggleItemSelection(item.id, e)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                                {item.itemCode}
                              </td>
                              <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">
                                {item.itemName}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                                {item.itemCategoryName}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                                {item.packagePrice?.toFixed(2) || '0.00'}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                                {item.chefUnit}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                                {item.packageSecondaryCost?.toFixed(2) || '0.00'}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                            <Package size={48} className="mx-auto mb-3 opacity-50" />
                            <p>No items found</p>
                            <p className="text-sm mt-1">Try adjusting your search terms</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Total Cost */}
                <div className="mt-4 text-right">
                  <span className="text-lg font-semibold text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg">
                    Total Cost: <span className="text-blue-600 dark:text-blue-400">{modalTotalCost}</span>
                  </span>
                </div>
              </div>
              {/* Footer */}
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-t border-gray-200 dark:border-gray-600 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={selectedItemIds.filter((id) => parseFloat(selectedQuantities[id] || '0') > 0).length === 0}
                  onClick={addSelectedItems}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed border border-transparent rounded-md hover:bg-blue-700 disabled:hover:bg-gray-400 transition-colors duration-200"
                >
                  Add Selected ({selectedItemIds.filter((id) => parseFloat(selectedQuantities[id] || '0') > 0).length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AddRecipe;