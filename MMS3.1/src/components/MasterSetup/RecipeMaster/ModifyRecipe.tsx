// ModifyRecipe.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
} from 'lucide-react';
import { useAuth, useCredentials, useFormatAmount, useFormatDate, useFormatQuantity } from "src/context/AuthContext";
import { BiMoney } from 'react-icons/bi';
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
interface FormData {
  recipeName: string;
  referenceNo: string;
  country: string;
  categories: string[];
  mealTypes: string[];
  baseQuantity: string;
  uom: string;
  finishedProduct: string;
  portionSize: string;
  calories: string;
  protein: string;
  carb: string;
  fat: string;
}
interface ModalProps {
  onClose: () => void;
}
interface SuccessModalProps extends ModalProps {
  message: string;
}
interface ErrorModalProps extends ModalProps {
  message: string;
}
interface Country {
  pk: number;
  name: string;
}
interface MealTypeOption {
  pk: number;
  name: string;
}
// Modal Components
const SessionExpiredModal: React.FC<ModalProps> = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
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
const SuccessModal: React.FC<SuccessModalProps> = ({ message, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Success!</h2>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
        {message}
      </p>
      <button
        onClick={onClose}
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
      >
        OK
      </button>
    </div>
  </div>
);
const ErrorModal: React.FC<ErrorModalProps> = ({ message, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Error</h2>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
        {message}
      </p>
      <button
        onClick={onClose}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
      >
        OK
      </button>
    </div>
  </div>
);
interface RecipeData {
  id?: number;
  recipeName?: string;
  refNo?: string;
  cuisineName?: string;
  baseQuantity?: number;
  uom?: string;
  finishedProduct?: number;
  portionSize?: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  cookingInstruction?: string;
  imageUrl?: string;
  uniqueNo?: string;
  countryOriginFk?: number;
  baseQuantityFk?: number;
  categoryList?: string[];
  mealtype?: string[];
  recipeSubList?: Array<{
    itemFk?: number;
    itemCode?: string;
    itemName?: string;
    itemCategoryFk?: number;
    itemCategoryName?: string;
    packageId?: string;
    packagePrice?: number;
    packageSecondaryUnit?: string;
    packageSecondaryCost?: number;
    chefUnit?: string;
    secondaryQuantity?: number;
    quantity?: number;
    total?: number;
    costPrice?: number;
  }>;
}
const ModifyRecipe: React.FC = () => {
  // ========== ALL HOOKS AT TOP LEVEL ==========
  const location = useLocation();
  const navigate = useNavigate();
  const initialRecipe = location.state?.recipe as { id: number } | undefined;
  const isEditMode = !!initialRecipe?.id;
  // Modal states
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
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
  // Separate state for country PK
  const [countryId, setCountryId] = useState<string>('');
  // Separate state for baseQuantity PK
  const [baseQuantityId, setBaseQuantityId] = useState<string>('');
  // Raw recipe data for edit mode
  const [rawRecipeData, setRawRecipeData] = useState<RecipeData | null>(null);
  // Ingredients state
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  // Image preview for edit mode
  const [imagePreview, setImagePreview] = useState<string>('');
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [selectedQuantities, setSelectedQuantities] = useState<{ [key: number]: string }>({});
  const [searchItemTerm, setSearchItemTerm] = useState<string>('');
  const [modalTotalCost, setModalTotalCost] = useState<string>('0.00');
  // Base Quantity options state
  const [baseQuantityOptions, setBaseQuantityOptions] = useState<BaseQuantityOption[]>([]);
  // Loading states
  const [loadingBaseQty, setLoadingBaseQty] = useState<boolean>(false);
  const [loadingItems, setLoadingItems] = useState<boolean>(false);
  const [loadingMealTypes, setLoadingMealTypes] = useState<boolean>(false);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);
  const [loadingCountries, setLoadingCountries] = useState<boolean>(false);
  const [savingRecipe, setSavingRecipe] = useState<boolean>(false);
  const [loadingRecipeData, setLoadingRecipeData] = useState<boolean>(false);
  // Error states
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  // Data states
  const [fullCuisineData, setFullCuisineData] = useState<Country[]>([]);
  const [fullCategoriesData, setFullCategoriesData] = useState<Category[]>([]);
  const [mealTypesOptions, setMealTypesOptions] = useState<MealTypeOption[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  // Cooking Instructions
  const [cookingInstructions, setCookingInstructions] = useState<string[]>([
    '', '', '', '', ''
  ]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  // Dropdown states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchCategory, setSearchCategory] = useState<string>('');
  const [isCategoryOpen, setIsCategoryOpen] = useState<boolean>(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const [searchMealType, setSearchMealType] = useState<string>('');
  const [isMealTypeOpen, setIsMealTypeOpen] = useState<boolean>(false);
  const mealTypeRef = useRef<HTMLDivElement>(null);
  const credentials = useCredentials();
  const userId = credentials?.userId || 0;
  const { projectSettings } = useAuth();
  const formatDate = useFormatDate();
  const formatAmount = useFormatAmount();
  const formatQuantity = useFormatQuantity();
  // ========== HELPER FUNCTIONS ==========
  const checkAuth = (): boolean => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      setSessionExpired(true);
      return false;
    }
    return true;
  };
  const calculatePortionSize = (): string => {
    const baseQty = parseFloat(formData.baseQuantity) || 0;
    const finishedProd = parseFloat(formData.finishedProduct) || 0;
    return baseQty > 0 ? (finishedProd / baseQty).toFixed(4) : '0.0000';
  };
  // FIXED: Function to get country name by ID
  const getCountryNameById = (countryId: number): string => {
    if (!countryId || fullCuisineData.length === 0) return '';
    const country = fullCuisineData.find(c => c.pk === countryId);
    return country ? country.name : '';
  };
  // NEW: Handle Refresh to reset to original/default values
  const handleRefresh = (): void => {
    if (isEditMode && rawRecipeData) {
      // Reset to original data for edit mode
      populateBasics(rawRecipeData);
      // Repopulate categories
      let categoryIds: number[] = [];
      if (rawRecipeData.categoryList && Array.isArray(rawRecipeData.categoryList)) {
        categoryIds = rawRecipeData.categoryList
          .map(id => parseInt(id))
          .filter(id => !isNaN(id) && fullCategoriesData.some((c) => c.pk === id));
      }
      setSelectedCategories(categoryIds);
      const categoryNames = categoryIds
        .map((id) => fullCategoriesData.find((c) => c.pk === id)?.name || '')
        .filter(Boolean);
      setFormData((prev) => ({ ...prev, categories: categoryNames }));
      // Repopulate meal types
      let mealTypeIds: number[] = [];
      if (rawRecipeData.mealtype && Array.isArray(rawRecipeData.mealtype)) {
        mealTypeIds = rawRecipeData.mealtype
          .map(id => parseInt(id))
          .filter(id => !isNaN(id) && mealTypesOptions.some((m) => m.pk === id));
      }
      setFormData((prev) => ({
        ...prev,
        mealTypes: mealTypeIds.map(String),
      }));
      // Repopulate ingredients
      if (rawRecipeData.recipeSubList && Array.isArray(rawRecipeData.recipeSubList) && items.length > 0) {
        const populatedIngredients = rawRecipeData.recipeSubList
          .map((ing: any, index: number) => {
            if (!ing.itemFk || ing.itemFk <= 0) return null;
            const fullItem = items.find(item => item.id === ing.itemFk);
            let itemData: Partial<Item>;
            if (fullItem && fullItem.itemName) {
              itemData = fullItem;
            } else {
              itemData = {
                id: ing.itemFk,
                itemCode: ing.itemCode || '',
                itemName: ing.itemName || '',
                itemCategoryFk: ing.itemCategoryFk || 1,
                itemCategoryName: ing.itemCategoryName || '',
                packageId: ing.packageId || '',
                packagePrice: ing.packagePrice || 0,
                packageSecondaryUnit: ing.packageSecondaryUnit || ing.chefUnit || '',
                packageSecondaryCost: ing.packageSecondaryCost || 0,
                chefUnit: ing.chefUnit || ing.packageSecondaryUnit || '',
              };
            }
            if (!itemData.itemName) return null;
            const quantity = ing.secondaryQuantity || 0;
            const savedTotal = ing.total || 0;
            let costPrice: number;
            if (quantity > 0 && savedTotal > 0) {
              costPrice = savedTotal / quantity;
            } else {
              costPrice = ing.packageSecondaryCost || (itemData as Item).packageSecondaryCost || 0;
            }
            const categoryFk = ing.itemCategoryFk || (itemData as Item).itemCategoryFk || 1;
            const categoryName = ing.itemCategoryName || (itemData as Item).itemCategoryName || '';
            const total = quantity > 0 && savedTotal > 0 ? savedTotal.toFixed(2) : (quantity * costPrice).toFixed(2);
            return {
              ...({ id: ing.itemFk } as Ingredient),
              itemCode: (itemData as Item).itemCode || ing.itemCode || '',
              itemName: (itemData as Item).itemName || ing.itemName || '',
              itemCategoryFk: Number(categoryFk),
              itemCategoryName: categoryName,
              packageId: (itemData as Item).packageId || ing.packageId || '',
              packagePrice: (itemData as Item).packagePrice || ing.packagePrice || 0,
              packageSecondaryUnit: (itemData as Item).packageSecondaryUnit || ing.packageSecondaryUnit || (itemData as Item).chefUnit || '',
              packageSecondaryCost: costPrice,
              chefUnit: (itemData as Item).chefUnit || ing.chefUnit || ing.packageSecondaryUnit || '',
              quantity: String(quantity),
              total,
              costPrice,
            };
          })
          .filter(Boolean) as Ingredient[];
        setSelectedIngredients(populatedIngredients);
      }
      // Reset image
      setSelectedImage(null);
      setImagePreview(rawRecipeData.imageUrl || '');
      // Clear errors
      setErrors({});
    } else {
      // Reset to defaults for new mode
      setFormData({
        recipeName: '',
        referenceNo: '',
        country: '',
        categories: [],
        mealTypes: [],
        baseQuantity: '',
        uom: '',
        finishedProduct: '0',
        portionSize: '0.0000',
        calories: '0',
        protein: '0',
        carb: '0',
        fat: '0',
      });
      setCountryId('');
      setBaseQuantityId('');
      setSelectedCategories([]);
      setSelectedIngredients([]);
      setCookingInstructions(['', '', '', '', '']);
      setSelectedImage(null);
      setImagePreview('');
      setErrors({});
    }
  };
  const fetchRecipeData = async (id: number): Promise<void> => {
    setLoadingRecipeData(true);
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setSessionExpired(true);
        return;
      }
      const res = await fetch(
        `https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/recipeMasterViewById/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (!res.ok) {
        if (res.status === 401 || res.status === 403 || res.status === 404) {
          setSessionExpired(true);
          return;
        }
        throw new Error(`Failed to fetch recipe: ${res.status}`);
      }
      const result: { success: boolean; data?: RecipeData } = await res.json();
      console.log('Recipe data response:', result);
      if (result.success && result?.data) {
        setRawRecipeData(result.data);
        populateBasics(result.data);
      } else {
        console.error('No data in response:', result);
        setErrorMessage('Failed to load recipe data');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error fetching recipe data:', error);
      setErrorMessage('Error loading recipe data: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setShowErrorModal(true);
    } finally {
      setLoadingRecipeData(false);
    }
  };
  // FIXED: Enhanced populateBasics to handle country name lookup
  const populateBasics = (data: RecipeData): void => {
    console.log('Populating basic form data from API:', data);
    // Get country name using countryOriginFk
    const countryName = data.countryOriginFk ? getCountryNameById(data.countryOriginFk) : '';
    console.log('Country lookup - ID:', data.countryOriginFk, 'Name:', countryName);
    setFormData({
      recipeName: data.recipeName || '',
      referenceNo: data.refNo || '',
      country: countryName,
      categories: [], // Will be populated by the useEffect
      mealTypes: [], // Will be populated by the useEffect
      baseQuantity: String(data.baseQuantity || ''),
      uom: data.uom || '',
      finishedProduct: String(data.finishedProduct || '0'),
      portionSize: String(data.portionSize || '0.0000'),
      calories: String(data.calories || '0'),
      protein: String(data.protein || '0'),
      carb: String(data.carbs || '0'),
      fat: String(data.fat || '0'),
    });
    // Set country ID
    if (data.countryOriginFk && data.countryOriginFk > 0) {
      setCountryId(String(data.countryOriginFk));
      console.log('Setting countryId from countryOriginFk:', data.countryOriginFk);
    }
    // Set base quantity ID
    if (data.baseQuantityFk && data.baseQuantityFk > 0) {
      setBaseQuantityId(String(data.baseQuantityFk));
      console.log('Setting baseQuantityId from baseQuantityFk:', data.baseQuantityFk);
    }
    const instructionsText = data.cookingInstruction || '';
    const steps = instructionsText
      .split('\n')
      .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
      .filter(step => step && step !== '***')
      .slice(0, 20);
    while (steps.length < 5) steps.push('');
    setCookingInstructions(steps);
    if (data.imageUrl) {
      setImagePreview(data.imageUrl);
    }
  };
  const fetchItems = async (): Promise<void> => {
    setLoadingItems(true);
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setSessionExpired(true);
        return;
      }
      const res = await fetch(
        'https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/itemList',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!res.ok) {
        if (res.status === 401 || res.status === 403 || res.status === 404) {
          setSessionExpired(true);
          return;
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data: { success: boolean; data: any[] } = await res.json();
      console.log('Items API Response:', data);
      if (data.success && Array.isArray(data.data)) {
        const cleanData: Item[] = data.data
          .filter((item: any) => item.itemName && item.itemFk)
          .map((item: any) => {
            // Ensure we have proper category data
            const categoryFk = item.itemCategoryFk || item.categoryFk || item.categoryId || 1;
            const categoryName = item.itemCategoryName || item.categoryName || '';
     
            return {
              id: item.itemFk,
              itemCode: item.itemCode || '',
              itemName: item.itemName || '',
              itemCategoryFk: categoryFk,
              itemCategoryName: categoryName,
              packageId: item.packageId || '',
              packagePrice: parseFloat(item.packagePrice || 0),
              packageSecondaryUnit: item.packageSecondaryUnit || item.chefUnit || '',
              packageSecondaryCost: parseFloat(item.packageSecondaryCost || item.costPrice || 0),
              chefUnit: item.packageSecondaryUnit || item.chefUnit || '',
            };
          });
 
        console.log('Cleaned items data:', cleanData);
        setItems(cleanData);
      } else {
        console.warn('No valid items data received');
        setItems([]);
      }
    } catch (err) {
      console.error('Error fetching items:', err);
      setItems([]);
    } finally {
      setLoadingItems(false);
    }
  };
  // ========== USEFFECT HOOKS ==========
  useEffect(() => {
    fetchItems();
  }, []);
  useEffect(() => {
    const fetchBaseQuantities = async (): Promise<void> => {
      setLoadingBaseQty(true);
      try {
        if (!checkAuth()) return;
        const token = sessionStorage.getItem('token');
        const res = await fetch(
          'https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/loadBaseQuantityDropDown',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (!res.ok) {
          if (res.status === 401 || res.status === 403 || res.status === 404) {
            setSessionExpired(true);
            return;
          }
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const response = await res.json();
        console.log('Base Quantity API Response:', response);
        let baseQuantities: BaseQuantityOption[] = [];
 
        if (response.data && Array.isArray(response.data)) {
          baseQuantities = response.data
            .filter((item: any) => item.pk && item.quantity !== undefined)
            .map((item: any) => ({
              pk: item.pk,
              quantity: item.quantity,
            }));
        }
        setBaseQuantityOptions(baseQuantities);
        console.log('Processed base quantities:', baseQuantities);
      } catch (err) {
        console.error('Error fetching base quantities:', err);
        setBaseQuantityOptions([]);
      } finally {
        setLoadingBaseQty(false);
      }
    };
    fetchBaseQuantities();
  }, []);
  // FIXED: Enhanced country fetching function
  const fetchCountries = async (): Promise<void> => {
    setLoadingCountries(true);
    try {
      if (!checkAuth()) return;
      const token = sessionStorage.getItem('token');
      const res = await fetch(
        'https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/loadCountryDropDowm',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!res.ok) {
        if (res.status === 401 || res.status === 403 || res.status === 404) {
          setSessionExpired(true);
          return;
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const response = await res.json();
      console.log('Country API Response:', response);
      let countries: Country[] = [];
      // Handle different possible response structures
      if (response.data && Array.isArray(response.data)) {
        countries = response.data
          .filter((item: any) => item.pk && item.name)
          .map((item: any) => ({
            pk: item.pk,
            name: item.name,
          }));
      } else if (response.data && response.data.countryList && Array.isArray(response.data.countryList)) {
        countries = response.data.countryList
          .filter((item: any) => item.pk && item.name)
          .map((item: any) => ({
            pk: item.pk,
            name: item.name,
          }));
      } else if (Array.isArray(response)) {
        countries = response
          .filter((item: any) => item.pk && item.name)
          .map((item: any) => ({
            pk: item.pk,
            name: item.name,
          }));
      }
      console.log('Processed countries:', countries);
      setFullCuisineData(countries);
      // If we're in edit mode and have raw recipe data, update the country name
      if (isEditMode && rawRecipeData?.countryOriginFk && countries.length > 0) {
        const countryName = getCountryNameById(rawRecipeData.countryOriginFk);
        if (countryName) {
          setFormData(prev => ({ ...prev, country: countryName }));
        }
      }
    } catch (err) {
      console.error('Error fetching countries:', err);
      setFullCuisineData([]);
    } finally {
      setLoadingCountries(false);
    }
  };
  useEffect(() => {
    fetchCountries();
  }, []);
  useEffect(() => {
    const fetchCategories = async (): Promise<void> => {
      setLoadingCategories(true);
      try {
        if (!checkAuth()) return;
        const token = sessionStorage.getItem('token');
        const res = await fetch(
          'https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/loadCategoryDropDown',
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!res.ok) {
          if (res.status === 401 || res.status === 403 || res.status === 404) {
            setSessionExpired(true);
            return;
          }
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data: { success: boolean; data: any[] } = await res.json();
        console.log('Categories API Response:', data);
        if (data.success && Array.isArray(data.data)) {
          const cleanData: Category[] = data.data.map((item: any) => ({
            pk: item.pk,
            name: item.categoryName || item.name || item.locationName || '',
          }));
          setFullCategoriesData(cleanData);
        } else {
          setFullCategoriesData([]);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);
  useEffect(() => {
    const fetchMealTypes = async (): Promise<void> => {
      setLoadingMealTypes(true);
      try {
        if (!checkAuth()) return;
        const token = sessionStorage.getItem('token');
        const res = await fetch(
          'https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/loadMealTypeDropDown',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (!res.ok) {
          if (res.status === 401 || res.status === 403 || res.status === 403) {
            setSessionExpired(true);
            return;
          }
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data: { success: boolean; data: any[] } = await res.json();
        console.log('Meal Types API Response:', data);
        if (data.success && Array.isArray(data.data)) {
          const cleanData: MealTypeOption[] = data.data.map((item: any) => ({
            pk: item.pk,
            name: item.name,
          }));
          setMealTypesOptions(cleanData);
        } else {
          setMealTypesOptions([]);
        }
      } catch (err) {
        console.error('Error fetching meal types:', err);
        setMealTypesOptions([]);
      } finally {
        setLoadingMealTypes(false);
      }
    };
    fetchMealTypes();
  }, []);
  useEffect(() => {
    if (isEditMode && initialRecipe?.id) {
      fetchRecipeData(initialRecipe.id);
    }
  }, [isEditMode, initialRecipe?.id]);
  // FIXED: Enhanced useEffect to update country when countries data is loaded
  useEffect(() => {
    if (rawRecipeData && fullCuisineData.length > 0) {
      console.log('Updating country name with loaded countries data');
      const countryName = getCountryNameById(rawRecipeData.countryOriginFk || 0);
      if (countryName) {
        setFormData(prev => ({ ...prev, country: countryName }));
      }
    }
  }, [fullCuisineData, rawRecipeData]);
  useEffect(() => {
    if (rawRecipeData && fullCategoriesData.length > 0 && mealTypesOptions.length > 0) {
      console.log('Populating categories and meal types from raw data:', rawRecipeData);
      // Populate categories - NEW: categoryList is now string[]
      let categoryIds: number[] = [];
      if (rawRecipeData.categoryList && Array.isArray(rawRecipeData.categoryList)) {
        categoryIds = rawRecipeData.categoryList
          .map(id => parseInt(id))
          .filter(id => !isNaN(id) && fullCategoriesData.some((c) => c.pk === id));
      }
      console.log('Final category IDs:', categoryIds);
      setSelectedCategories(categoryIds);
      const categoryNames = categoryIds
        .map((id) => fullCategoriesData.find((c) => c.pk === id)?.name || '')
        .filter(Boolean);
      setFormData((prev) => ({ ...prev, categories: categoryNames }));
      // Populate meal types - NEW: mealtype is now string[]
      let mealTypeIds: number[] = [];
      if (rawRecipeData.mealtype && Array.isArray(rawRecipeData.mealtype)) {
        mealTypeIds = rawRecipeData.mealtype
          .map(id => parseInt(id))
          .filter(id => !isNaN(id) && mealTypesOptions.some((m) => m.pk === id));
      }
      console.log('Final meal type IDs:', mealTypeIds);
      setFormData((prev) => ({
        ...prev,
        mealTypes: mealTypeIds.map(String),
      }));
    }
  }, [rawRecipeData, fullCategoriesData, mealTypesOptions]);
  useEffect(() => {
    if (rawRecipeData?.recipeSubList && Array.isArray(rawRecipeData.recipeSubList) && items.length > 0) {
      const populatedIngredients = rawRecipeData.recipeSubList
        .map((ing: any, index: number) => {
          if (!ing.itemFk || ing.itemFk <= 0) return null;
          const fullItem = items.find(item => item.id === ing.itemFk);
          let itemData: Partial<Item>;
          if (fullItem && fullItem.itemName) {
            itemData = fullItem;
          } else {
            itemData = {
              id: ing.itemFk,
              itemCode: ing.itemCode || '',
              itemName: ing.itemName || '',
              itemCategoryFk: ing.itemCategoryFk || 1,
              itemCategoryName: ing.itemCategoryName || '',
              packageId: ing.packageId || '',
              packagePrice: ing.packagePrice || 0,
              packageSecondaryUnit: ing.packageSecondaryUnit || ing.chefUnit || '',
              packageSecondaryCost: ing.packageSecondaryCost || 0,
              chefUnit: ing.chefUnit || ing.packageSecondaryUnit || '',
            };
          }
          if (!itemData.itemName) return null;
          const quantity = ing.secondaryQuantity || 0;
          const savedTotal = ing.total || 0;
          let costPrice: number;
          if (quantity > 0 && savedTotal > 0) {
            costPrice = savedTotal / quantity;
          } else {
            costPrice = ing.packageSecondaryCost || (itemData as Item).packageSecondaryCost || 0;
          }
          const categoryFk = ing.itemCategoryFk || (itemData as Item).itemCategoryFk || 1;
          const categoryName = ing.itemCategoryName || (itemData as Item).itemCategoryName || '';
          const total = quantity > 0 && savedTotal > 0 ? savedTotal.toFixed(2) : (quantity * costPrice).toFixed(2);
          return {
            ...({ id: ing.itemFk } as Ingredient),
            itemCode: (itemData as Item).itemCode || ing.itemCode || '',
            itemName: (itemData as Item).itemName || ing.itemName || '',
            itemCategoryFk: Number(categoryFk),
            itemCategoryName: categoryName,
            packageId: (itemData as Item).packageId || ing.packageId || '',
            packagePrice: (itemData as Item).packagePrice || ing.packagePrice || 0,
            packageSecondaryUnit: (itemData as Item).packageSecondaryUnit || ing.packageSecondaryUnit || (itemData as Item).chefUnit || '',
            packageSecondaryCost: costPrice,
            chefUnit: (itemData as Item).chefUnit || ing.chefUnit || ing.packageSecondaryUnit || '',
            quantity: String(quantity),
            total,
            costPrice,
          };
        })
        .filter(Boolean) as Ingredient[];
      console.log('Populated ingredients:', populatedIngredients);
      setSelectedIngredients(populatedIngredients);
    }
  }, [rawRecipeData, items]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
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
  useEffect(() => {
    const portionSize = calculatePortionSize();
    setFormData(prev => ({ ...prev, portionSize }));
  }, [formData.finishedProduct, formData.baseQuantity]);
  // ========== MODAL FUNCTIONS ==========
  const openModal = (): void => {
    setIsModalOpen(true);
    setSelectedItemIds([]);
    setSelectedQuantities({});
    setSearchItemTerm('');
    setModalTotalCost('0.00');
  };
  const closeModal = (): void => {
    setIsModalOpen(false);
    setSelectedItemIds([]);
    setSelectedQuantities({});
    setSearchItemTerm('');
    setModalTotalCost('0.00');
  };
  // FIXED: Only show items that are NOT already in selectedIngredients
  const isItemAlreadySelected = (itemId: number): boolean => {
    return selectedIngredients.some((ing) => ing.id === itemId);
  };
  // FIXED: Enhanced toggle function to handle row clicks
  const toggleItemSelection = (itemId: number, event?: React.MouseEvent): void => {
    if (event) {
      event.stopPropagation();
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
        newQuantities = { ...selectedQuantities, [itemId]: '1' };
      }
      setSelectedQuantities(newQuantities);
      calculateModalTotal(newSelected, newQuantities);
      return newSelected;
    });
  };
  // NEW: Handle row click for selection
  const handleRowClick = (itemId: number): void => {
    toggleItemSelection(itemId);
  };
  const handleQuantityChange = (itemId: number, quantity: string, event?: React.MouseEvent): void => {
    if (event) {
      event.stopPropagation();
    }
    const parsedQuantity = parseFloat(quantity);
    const validQuantity = isNaN(parsedQuantity) || parsedQuantity < 0 ? '0' : quantity;
    setSelectedQuantities((prev) => {
      const newQuantities = { ...prev, [itemId]: validQuantity };
      calculateModalTotal(selectedItemIds, newQuantities);
      return newQuantities;
    });
  };
  const calculateModalTotal = (ids: number[], quantities: { [key: number]: string }): void => {
    let total = 0;
    ids.forEach((id) => {
      const item = items.find((i) => i.id === id);
      const qty = parseFloat(quantities[id] || '0');
      const cost = item ? item.packageSecondaryCost : 0;
      total += qty * cost;
    });
    setModalTotalCost(total.toFixed(2));
  };
  const handleSelectAllItems = (): void => {
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
          newQuantities[id] = '1';
        }
      });
      setSelectedItemIds(allIds);
      setSelectedQuantities(newQuantities);
      calculateModalTotal(allIds, newQuantities);
    }
  };
  const addSelectedItems = (): void => {
    const itemsToAdd = selectedItemIds
      .map((id) => {
        const item = items.find((i) => i.id === id);
        const quantity = selectedQuantities[id] || '0';
        if (!item || parseFloat(quantity) <= 0) return null;
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
      setErrorMessage('Please add at least one item with quantity greater than 0');
      setShowErrorModal(true);
      return;
    }
    setSelectedIngredients((prev) => {
      const newIngredients = [...prev, ...itemsToAdd.map(ing => ({ ...ing }))];
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
  const calculateTotalCost = (): number => {
    return selectedIngredients.reduce((sum, item) => sum + parseFloat(item.total || '0'), 0);
  };
  const updateIngredientQuantity = (index: number, quantity: string): void => {
    const parsedQuantity = parseFloat(quantity);
    const validQuantity = isNaN(parsedQuantity) || parsedQuantity < 0 ? '0' : quantity;
    setSelectedIngredients((prev) => {
      const updated = prev.map((ing, i) =>
        i === index ? { ...ing, quantity: validQuantity, total: (Math.max(0, parseFloat(validQuantity) || 0) * (ing.costPrice || 0)).toFixed(2) } : ing
      );
      return updated;
    });
  };
  const removeIngredient = (index: number): void => {
    setSelectedIngredients((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated;
    });
  };
  // ========== MEAL TYPES FUNCTIONS ==========
  const filteredMealTypes: MealTypeOption[] = mealTypesOptions.filter((meal) =>
    meal.name.toLowerCase().includes(searchMealType.toLowerCase()),
  );
  const toggleMealType = (pk: number): void => {
    setFormData((prev) => {
      const isSelected = prev.mealTypes.includes(String(pk));
      const updated = isSelected
        ? prev.mealTypes.filter((id) => id !== String(pk))
        : [...prev.mealTypes, String(pk)];
      return { ...prev, mealTypes: updated };
    });
  };
  const handleSelectAllMealTypes = (): void => {
    setFormData((prev) => {
      if (prev.mealTypes.length === mealTypesOptions.length) {
        return { ...prev, mealTypes: [] };
      } else {
        return { ...prev, mealTypes: mealTypesOptions.map((m) => String(m.pk)) };
      }
    });
  };
  // ========== CATEGORIES FUNCTIONS ==========
  const filteredCategories: Category[] = fullCategoriesData.filter((cat) =>
    cat.name.toLowerCase().includes(searchCategory.toLowerCase()),
  );
  const toggleCategory = (pk: number, name: string): void => {
    setSelectedCategories((prev) => {
      let updatedSelected: number[];
      if (prev.includes(pk)) {
        updatedSelected = prev.filter((id) => id !== pk);
      } else {
        updatedSelected = [...prev, pk];
      }
      const updatedNames = updatedSelected.map(id => {
        const category = fullCategoriesData.find(cat => cat.pk === id);
        return category ? category.name : '';
      }).filter(Boolean);
      setFormData(prevForm => ({ ...prevForm, categories: updatedNames }));
      return updatedSelected;
    });
  };
  const handleSelectAllCategories = (): void => {
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
  // ========== COUNTRIES FUNCTIONS ==========
  const filteredCountries: Country[] = fullCuisineData.filter((country) =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  // ========== FORM HANDLERS ==========
  const handleSessionExpired = (): void => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    navigate('/');
  };
  const handleSuccessModalClose = (): void => {
    setShowSuccessModal(false);
    navigate('/Master/RecipeMaster');
  };
  const handleErrorModalClose = (): void => {
    setShowErrorModal(false);
  };
  const handleInputChange = (field: keyof FormData, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };
  // NEW: Helper for decimal numeric input (no letters, allow decimals with limits)
  const handleDecimalInput = (field: keyof FormData, rawValue: string): string => {
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
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size if needed
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please select a valid image file.');
        setShowErrorModal(true);
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrorMessage('Image size must be less than 5MB.');
        setShowErrorModal(true);
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  const removeImage = (): void => {
    setSelectedImage(null);
    setImagePreview('');
  };
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.recipeName.trim()) newErrors.recipeName = 'Recipe Name is required';
    if (!formData.referenceNo.trim()) newErrors.referenceNo = 'Reference No is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (formData.categories.length === 0) newErrors.categories = 'At least one category is required';
    if (formData.mealTypes.length === 0) newErrors.mealTypes = 'At least one meal type is required';
    if (!formData.baseQuantity.trim()) newErrors.baseQuantity = 'Base Quantity is required';
    if (!formData.uom.trim()) newErrors.uom = 'UOM is required';
    if (parseFloat(formData.finishedProduct) <= 0) newErrors.finishedProduct = 'Finished Product must be greater than 0';
    if (parseFloat(formData.portionSize) <= 0) newErrors.portionSize = 'Portion Size must be greater than 0';
    if (selectedIngredients.length === 0) newErrors.ingredients = 'At least one ingredient is required';
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
    console.log('Validating - countryId:', countryId, 'baseQuantityId:', baseQuantityId);
    if (!countryId || countryId === '0') {
      setErrorMessage('Please select a country');
      setShowErrorModal(true);
      return false;
    }
    if (!baseQuantityId || baseQuantityId === '0') {
      setErrorMessage('Please select a base quantity');
      setShowErrorModal(true);
      return false;
    }
    if (selectedCategories.length === 0) {
      setErrorMessage('Please select at least one category');
      setShowErrorModal(true);
      return false;
    }
    if (formData.mealTypes.length === 0) {
      setErrorMessage('Please select at least one meal type');
      setShowErrorModal(true);
      return false;
    }
    if (selectedIngredients.length === 0) {
      setErrorMessage('Please add at least one ingredient');
      setShowErrorModal(true);
      return false;
    }
    return true;
  };
  const saveRecipe = async (): Promise<void> => {
    console.log(' saveRecipe function STARTED');
    if (!validateForm()) {
      setErrorMessage('Please fill in all required fields.');
      setShowErrorModal(true);
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
      // FIXED: Ensure proper categoryFk is sent in recipeSubList
      const recipeSubList = selectedIngredients.map((ingredient) => {
        // Use the actual category FK from the ingredient
        const validCategoryFk = ingredient.itemCategoryFk && ingredient.itemCategoryFk > 0
          ? ingredient.itemCategoryFk
          : 1;
  
        return {
          itemCategoryFk: validCategoryFk, // This is the FIX - using the correct category FK
          itemFk: ingredient.id,
          secondaryQuantity: parseFloat(ingredient.quantity) || 0,
          total: parseFloat(ingredient.total) || 0
        };
      });
      console.log(' Recipe SubList being sent:', JSON.stringify(recipeSubList, null, 2));
      const totalCostValue = calculateTotalCost();
      const finishedProductValue = parseFloat(formData.finishedProduct) || 0;
      const perPortionCostValue = finishedProductValue > 0 ? totalCostValue / finishedProductValue : 0;
      const validMealTypes = formData.mealTypes
        .map(id => parseInt(id))
        .filter(id => !isNaN(id));
      const recipeData: any = {
        recipeName: formData.recipeName,
        refNo: formData.referenceNo,
        cookingInstruction: cookingInstructions.filter(step => step.trim() !== '').map((step, i) => `${i + 1}. ${step}`).join('\n') || 'No instructions provided',
        countryOriginFk: parseInt(countryId) || 1,
        baseQuantityFk: parseInt(baseQuantityId) || 1,
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
        createdBy: userId,
        categoryList: selectedCategories.map(id => String(id)), // NEW: Convert to string array
        mealtype: validMealTypes.map(id => String(id)), // NEW: Convert to string array
        recipeSubList: recipeSubList
      };
      if (isEditMode && initialRecipe?.id) {
        recipeData.id = initialRecipe.id;
        if (rawRecipeData) {
          recipeData.uniqueNo = rawRecipeData.uniqueNo;
          recipeData.imageUrl = rawRecipeData.imageUrl;
        }
      }
      console.log('📦 Full Recipe Data being sent:', recipeData);
      const endpoint = isEditMode
        ? 'https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/recipeMasterModify'
        : 'https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/recipeMasterSave';
      console.log('🎯 Sending to endpoint:', endpoint);
      // FIXED: Always send as FormData to ensure consistent backend handling; append file only if present
      const formDataToSend = new FormData();
      formDataToSend.append('metadata', JSON.stringify(recipeData));
      if (selectedImage) {
        formDataToSend.append('file', selectedImage); // FIXED: Reverted to 'file' as expected by backend
        console.log('🖼️ Image appended to FormData:', selectedImage.name, selectedImage.size);
      } else {
        // Append empty file or flag for no image update
        formDataToSend.append('file', new File([''], 'no-image.jpg', { type: 'image/jpeg' }));
        console.log('📄 No new image, appending placeholder');
      }
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });
      console.log('📨 Response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      console.log('✅ API Success Response:', data);
      setSuccessMessage(isEditMode ? 'Recipe updated successfully!' : 'Recipe saved successfully!');
      setShowSuccessModal(true);
    } catch (err) {
      console.error('💥 Error saving recipe:', err);
      setErrorMessage('Error saving recipe: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setShowErrorModal(true);
    } finally {
      setSavingRecipe(false);
    }
  };
  // Image preview cleanup
  useEffect(() => {
    return () => {
      if (imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);
  // ========== CONDITIONAL RENDER (MUST BE AFTER ALL HOOKS) ==========
  if (loadingRecipeData && isEditMode) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="ml-4 text-gray-600 dark:text-gray-400">Loading recipe data...</p>
      </div>
    );
  }
  // ========== MAIN COMPONENT RETURN ==========
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Render Modals */}
      {sessionExpired && <SessionExpiredModal onClose={handleSessionExpired} />}
      {showSuccessModal && <SuccessModal message={successMessage} onClose={handleSuccessModalClose} />}
      {showErrorModal && <ErrorModal message={errorMessage} onClose={handleErrorModalClose} />}
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{isEditMode ? 'Edit Recipe' : 'Add New Recipe'}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {isEditMode ? 'Update your recipe details' : 'Create and manage your recipe details'}
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
              onClick={handleRefresh}
              className="flex items-center gap-2 bg-yellow-300 dark:bg-gray-700 hover:bg-gray-300 px-2 py-2 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 p-2.5 rounded-lg transition-all duration-200"
              title="Refresh"
            >
              <RefreshCw size={18} />
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
                <Utensils
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Enter recipe name"
                  value={formData.recipeName}
                  onChange={(e) => handleInputChange('recipeName', e.target.value)}
                  maxLength={30}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${
                    errors.recipeName
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                  }`}
                />
              </div>
              {errors.recipeName && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.recipeName}</p>
              )}
              <p className={`text-xs ${30 - formData.recipeName.length <= 0 ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {Math.max(0, 30 - formData.recipeName.length)} Characters remaining
              </p>
            </div>
            {/* Reference No */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Reference No <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Hash
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Enter reference number"
                  value={formData.referenceNo}
                  disabled
                  onChange={(e) => handleInputChange('referenceNo', e.target.value)}
                  maxLength={30}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${
                    errors.referenceNo
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                  }`}
                />
              </div>
              {errors.referenceNo && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.referenceNo}</p>
              )}
              {/* <p className={`text-xs ${30 - formData.referenceNo.length <= 0 ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {Math.max(0, 30 - formData.referenceNo.length)} Characters remaining
              </p> */}
            </div>
            {/* Country */}
            <div className="space-y-2 relative" ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Country <span className="text-red-500">*</span>
              </label>
              <div
                className={`w-full h-12 px-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-between cursor-pointer ${
                  errors.country
                    ? 'border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                onClick={() => setIsOpen(!isOpen)}
              >
                <span className="text-sm truncate">{formData.country || 'Select Country'}</span>
                <ChevronDown
                  className={`transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  } text-gray-500`}
                  size={18}
                />
              </div>
              {errors.country && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.country}</p>
              )}
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
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  {loadingCountries ? (
                    <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                      <Loader2 className="animate-spin mx-auto mb-2" size={16} />
                      Loading countries...
                    </div>
                  ) : filteredCountries.length > 0 ? (
                    filteredCountries.map((country, index) => (
                      <div
                        key={country.pk || index}
                        onClick={() => {
                          handleInputChange('country', country.name);
                          setCountryId(String(country.pk));
                          setIsOpen(false);
                          setSearchTerm('');
                        }}
                        className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-600 ${
                          formData.country === country.name
                            ? 'bg-blue-50 dark:bg-gray-600 font-medium'
                            : ''
                        }`}
                      >
                        {country.name}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      No country found
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
                  errors.categories
                    ? 'border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              >
                <span className="text-sm truncate">
                  {formData.categories.length
                    ? `${formData.categories.length} selected`
                    : 'Select Categories'}
                </span>
                <ChevronDown
                  className={`transition-transform duration-200 ${
                    isCategoryOpen ? 'rotate-180' : ''
                  } text-gray-500`}
                  size={18}
                />
              </div>
              {errors.categories && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.categories}</p>
              )}
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
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div
                    className="flex items-center px-4 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-600"
                    onClick={handleSelectAllCategories}
                  >
                    <input
                      type="checkbox"
                      readOnly
                      checked={
                        selectedCategories.length === fullCategoriesData.length &&
                        fullCategoriesData.length > 0
                      }
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
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat.pk)}
                          readOnly
                          className="mr-2"
                        />
                        <span className="text-sm">{cat.name}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      No categories found
                    </div>
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
                  errors.mealTypes
                    ? 'border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                onClick={() => setIsMealTypeOpen(!isMealTypeOpen)}
              >
                <span className="text-sm truncate">
                  {formData.mealTypes.length
                    ? `${formData.mealTypes.length} selected`
                    : 'Select Meal Types'}
                </span>
                <ChevronDown
                  className={`transition-transform duration-200 ${
                    isMealTypeOpen ? 'rotate-180' : ''
                  } text-gray-500`}
                  size={18}
                />
              </div>
              {errors.mealTypes && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.mealTypes}</p>
              )}
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
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div
                    className="flex items-center px-4 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-600"
                    onClick={handleSelectAllMealTypes}
                  >
                    <input
                      type="checkbox"
                      readOnly
                      checked={formData.mealTypes.length === mealTypesOptions.length}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium">Select All</span>
                  </div>
                  {loadingMealTypes ? (
                    <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                      <Loader2 className="animate-spin mx-auto mb-2" size={16} />
                      Loading meal types...
                    </div>
                  ) : filteredMealTypes.length > 0 ? (
                    filteredMealTypes.map((meal) => (
                      <div
                        key={meal.pk}
                        className="flex items-center px-4 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-600"
                        onClick={() => toggleMealType(meal.pk)}
                      >
                        <input
                          type="checkbox"
                          readOnly
                          checked={formData.mealTypes.includes(String(meal.pk))}
                          className="mr-2"
                        />
                        <span className="text-sm">{meal.name}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      No meal types found
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Base Quantity */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Base Quantity <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Maximize
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  size={18}
                />
                <select
                  value={formData.baseQuantity}
                  onChange={(e) => {
                    const selectedQuantity = e.target.value;
                    const option = baseQuantityOptions.find(opt => String(opt.quantity) === selectedQuantity);
                    if (option) {
                      handleInputChange('baseQuantity', selectedQuantity);
                      setBaseQuantityId(String(option.pk));
                      console.log('Selected base quantity:', selectedQuantity, 'ID:', option.pk);
                    } else {
                      handleInputChange('baseQuantity', selectedQuantity);
                      setBaseQuantityId('');
                    }
                  }}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 ${
                    errors.baseQuantity
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                  }`}
                >
                  <option value="">Select Base Quantity</option>
                  {loadingBaseQty ? (
                    <option disabled>Loading...</option>
                  ) : baseQuantityOptions.map((opt) => (
                    <option key={opt.pk} value={String(opt.quantity)}>
                      {formatQuantity(opt.quantity, projectSettings?.quantityDecimalPlaces || 2)}
                    </option>
                  ))}
                </select>
              </div>
              {errors.baseQuantity && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.baseQuantity}</p>
              )}
            </div>
            {/* UOM */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                UOM <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Package
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  size={18}
                />
                <select
                  value={formData.uom}
                  onChange={(e) => handleInputChange('uom', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 ${
                    errors.uom
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                  }`}
                >
                  <option value="">Select UOM</option>
                  <option value="g">g</option>
                  <option value="Kg">Kg</option>
                  <option value="Liter">Liter</option>
                  <option value="Piece">Piece</option>
                </select>
              </div>
              {errors.uom && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.uom}</p>
              )}
            </div>
            {/* Finished Product */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Finished Product <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <BiMoney
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  size={18}
                />
                <input
                  type="text"
                  value={formData.finishedProduct}
                  onChange={(e) => {
                    const filteredValue = handleDecimalInput('finishedProduct', e.target.value);
                    if (filteredValue.toString().length <= 4) {
                      handleInputChange('finishedProduct', filteredValue);
                    }
                  }}
                  maxLength={4}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 ${
                    errors.finishedProduct
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                  }`}
                />
              </div>
              {errors.finishedProduct && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.finishedProduct}</p>
              )}
              <p className={`text-xs ${4 - formData.finishedProduct.length <= 0 ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {Math.max(0, 4 - formData.finishedProduct.length)} Characters remaining
              </p>
            </div>
            {/* Portion Size */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Portion Size <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Users
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  size={18}
                />
                <input
                  type="text"
                  value={formData.portionSize}
                  readOnly
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none bg-gray-100 dark:bg-gray-600 cursor-not-allowed text-gray-900 dark:text-white transition-all duration-200 ${
                    errors.portionSize
                      ? 'border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
              </div>
              {errors.portionSize && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.portionSize}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">Auto-calculated: Finished Product / Base Quantity</p>
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
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Recipe Ingredients
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add ingredients to your recipe
                </p>
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
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    S NO
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Item Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Item Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Package ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Package Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Chef Unit
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Cost Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Quantity <span className="text-red-500">*</span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {selectedIngredients.length > 0 ? (
                  selectedIngredients.map((ingredient, index) => (
                    <tr key={`${ingredient.id}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {ingredient.itemCode}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {ingredient.itemName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {ingredient.itemCategoryName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {ingredient.packageId}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {formatAmount(ingredient.packagePrice || 0, projectSettings?.decimalPlaces || 2)}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {ingredient.chefUnit || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {formatAmount(ingredient.costPrice || 0, projectSettings?.decimalPlaces || 2)}
                      </td>
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
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatAmount(parseFloat(ingredient.total || '0'), projectSettings?.decimalPlaces || 2)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => removeIngredient(index)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                        >
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
              Total Cost: <span className="text-blue-600 dark:text-blue-400">{formatAmount(calculateTotalCost(), projectSettings?.decimalPlaces || 2)}</span>
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
              <div
                className={`border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 transition-all duration-200 ${
                  imagePreview ? 'border-blue-300 dark:border-blue-700' : ''
                }`}
              >
                {imagePreview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={imagePreview}
                      alt="Recipe preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors duration-200"
                    >
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
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm font-medium">
                        {unit}
                      </span>
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
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                          Quantity
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {loadingItems ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
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
                                {formatAmount(item.packagePrice || 0, projectSettings?.decimalPlaces || 2)}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                                {item.chefUnit}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                                {formatAmount(item.packageSecondaryCost || 0, projectSettings?.decimalPlaces || 2)}
                              </td>
                              <td className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="number"
                                  step="0.001"
                                  min="0"
                                  value={quantity}
                                  onChange={(e) => handleQuantityChange(item.id, e.target.value, e)}
                                  placeholder="0"
                                  className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
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
                    Total Cost: <span className="text-blue-600 dark:text-blue-400">{formatAmount(parseFloat(modalTotalCost), projectSettings?.decimalPlaces || 2)}</span>
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
export default ModifyRecipe;