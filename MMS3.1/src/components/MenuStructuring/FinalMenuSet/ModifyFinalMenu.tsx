import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, ArrowLeft, RefreshCw, Save, CheckCircle, XCircle, ChevronDown, Loader2, Eye, Calculator, Filter, AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { useAuth, useCredentials, useFormatAmount } from 'src/context/AuthContext';
import SearchableSelect from 'src/components/Spa Components/DropdownSearch';

interface MealType {
  pk: number;
  code: string;
  name: string;
}

interface MenuOption {
  pk: number;
  code: string | null;
  name: string;
  count?: number;
  cost?: number;
  fk?: number;
}

interface TemplateOption {
  pk: number;
  code: string;
  name: string;
}

interface SelectedMenu {
  id: string;
  menuPk: number;
  menuName: string;
  totalRecipes: number;
  totalCost: number;
  detailList: any[];
  templateFk: number;
  templateName: string;
  mealTypeFk: number;
  mealTypeName: string;
  categoryCount: number;
}

const ModifyFinalMenu = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [menuOptions, setMenuOptions] = useState<MenuOption[]>([]);
  const [selectedMenuPk, setSelectedMenuPk] = useState<number | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedMenus, setSelectedMenus] = useState<SelectedMenu[]>([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentViewMenuPk, setCurrentViewMenuPk] = useState<number | null>(null);
  const [isLoadingMealTypes, setIsLoadingMealTypes] = useState(true);
  const [isLoadingMenus, setIsLoadingMenus] = useState(false);
  const [isLoadingAdd, setIsLoadingAdd] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);
  const [generalModal, setGeneralModal] = useState({ isOpen: false, type: 'success', message: '' });

  const credentials = useCredentials();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const userId = credentials?.userId || 0;

  const { projectSettings } = useAuth();
  const formatAmount = useFormatAmount();
  const baseUrl = 'https://kelvinmms.com:8443/api-gateway-mms/menu-creation-service/finalMenuSetController';
  const mealSetMenuUrl = 'https://kelvinmms.com:8443/api-gateway-mms/menu-creation-service/mealSetMenuController';

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Centralised API fetch with token + session handling
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

  // Fetch Meal Types
  useEffect(() => {
    const fetchMealTypes = async () => {
      setIsLoadingMealTypes(true);
      setErrorMessage('');
      try {
        const data = await apiFetch(`${baseUrl}/loadMealTypeDropDown`, { method: 'GET' });
        if (data.success && data.data && Array.isArray(data.data)) {
          const enhancedMealTypes = [{ pk: 0, code: '', name: 'Select Type Option' }, ...data.data];
          setMealTypes(enhancedMealTypes);
        } else {
          setErrorMessage('No meal types found.');
        }
      } catch (error: any) {
        console.error('Error loading meal types:', error);
        if (error.message.includes('Session expired')) {
          // SessionExpiredModal will handle
        } else {
          setErrorMessage(error.message || 'Failed to load meal types.');
        }
      } finally {
        setIsLoadingMealTypes(false);
      }
    };
    fetchMealTypes();
  }, []);

  // Set selectedMealType from first loaded menu if editing
// Set selectedMealType from first loaded menu only if editing and user hasn't selected one
  useEffect(() => {
    if (mealTypes.length > 0 && selectedMenus.length > 0 && !selectedMealType) {
      const first = selectedMenus[0];
      const mt = mealTypes.find((m) => m.pk === first.mealTypeFk);
      if (mt) {
        setSelectedMealType(null);
      }
    }
  }, [mealTypes, selectedMenus, selectedMealType]);

  // Fetch existing data if id present
  const fetchExisting = async () => {
    if (!id) return;
    setErrorMessage('');
    try {
      const data = await apiFetch(`${baseUrl}/viewFinalSetMenuById/${id}`, { method: 'GET' });
      if (data.success && data.data) {
        const resData = data.data;
        setTemplateName(resData.menuSetName || '');
        setNotes(resData.notes || '');
        
        const processedSelectedMenus = resData.selectedMeals.map((sm: any) => ({
          id: (sm.id || Date.now() + Math.random()).toString(),
          menuPk: sm.menuFk || 0,
          menuName: sm.menuName || '',
          // Changed to match AddFinalMenu: count recipes where recipeFk is valid
          totalRecipes: sm.recipeCount || (sm.detailList ? sm.detailList.filter((d: any) => d.recipeFk !== null && d.recipeFk !== 0).length : 0),
          totalCost: sm.cost || 0,
          detailList: sm.detailList
            ? sm.detailList.map((dl: any) => ({
                categoryFk: dl.categoryFk || 0,
                categoryName: dl.categoryName || '',
                recipeFk: dl.recipeFk || 0,
                recipeName: dl.recipeName || '',
                portionSize: dl.portionSize || 0.0,
                perPortionCost: dl.perPortionCost || 0.0,
                uom: dl.uom || 'Kg',
              }))
            : [],
          templateFk: sm.templateFk || 0,
          templateName: sm.templateName || '',
          mealTypeFk: sm.mealTypeFk || 0,
          mealTypeName: sm.mealTypeName || '',
          // Count categories with valid recipes
          categoryCount: sm.categoryCount || (sm.detailList ? new Set(sm.detailList.filter((d: any) => d.recipeFk !== null && d.recipeFk !== 0).map((d: any) => d.categoryFk)).size : 0),
        })) as SelectedMenu[];
        setSelectedMenus(processedSelectedMenus);
      } else {
        setErrorMessage('No data found for this menu set.');
      }
    } catch (error: any) {
      console.error('Error loading existing menu set:', error);
      if (error.message.includes('Session expired')) {
        // SessionExpiredModal will handle
      } else {
        setErrorMessage(error.message || 'Failed to load existing menu set.');
      }
    }
  };

  useEffect(() => {
    if (id) {
      fetchExisting();
    }
  }, [id]);

  // Fetch Templates and Menus on meal type change
  useEffect(() => {
    if (selectedMealType) {
      const fetchTemplatesAndMenus = async () => {
        setIsLoadingMenus(true);
        setErrorMessage('');
        try {
          // Fetch templates
          const templatesData = await apiFetch(`${baseUrl}/loadMealSetTemplateDropDown/${selectedMealType.pk}`, { method: 'GET' });
          if (templatesData.success && templatesData.data && Array.isArray(templatesData.data)) {
            setTemplates(templatesData.data);
          }
          // Fetch menus
          const menusData = await apiFetch(`${baseUrl}/loadMealSetMenuDropDown/${selectedMealType.pk}`, { method: 'GET' });
          if (menusData.success && menusData.data && Array.isArray(menusData.data)) {
            const enhancedMenuOptions = [{ pk: 0, code: '', name: 'Select Menu Option' }, ...menusData.data];
            setMenuOptions(enhancedMenuOptions);
          } else {
            setErrorMessage('No menus found.');
          }
        } catch (error: any) {
          console.error('Error loading templates/menus:', error);
          if (error.message.includes('Session expired')) {
            // SessionExpiredModal will handle
          } else {
            setErrorMessage(error.message || 'Failed to load templates or menus.');
          }
        } finally {
          setIsLoadingMenus(false);
        }
      };
      fetchTemplatesAndMenus();
    } else {
      setTemplates([]);
      setMenuOptions([{ pk: 0, code: '', name: 'Select Menu Option' }]);
    }
  }, [selectedMealType]);

  const addMenu = async () => {
    if (!selectedMenuPk || selectedMenuPk === 0) {
      setErrorMessage('Please select a menu.');
      return;
    }
    
    const menuOpt = menuOptions.find((m) => m.pk === selectedMenuPk) as MenuOption;
    if (!menuOpt) {
      setErrorMessage('Selected menu not found.');
      return;
    }
    
    if (selectedMenus.some((m) => m.menuPk === selectedMenuPk)) {
      setErrorMessage('This menu is already added to the list.');
      return;
    }

    if (selectedMealType && selectedMenus.some((m) => m.mealTypeFk === selectedMealType.pk)) {
      setErrorMessage('Only one menu is allowed per meal type.');
      return;
    }
    
    setIsLoadingAdd(true);
    setErrorMessage('');
    try {
      const data = await apiFetch(`${baseUrl}/mealSetMenuEditByIdForMenuSet/${selectedMenuPk}`, { method: 'GET' });
      if (data.success && data.data) {
        const menuData = data.data;
        const detailList = menuData.detailList || [];
        const categorySet = new Set(detailList.map((d: any) => d.categoryFk));
        const categoryCount = categorySet.size;
        
        const template = templates.find((t) => t.pk === menuOpt.fk || menuData.templateFk);
        
        const newMenu: SelectedMenu = {
          id: Date.now().toString(),
          menuPk: selectedMenuPk,
          menuName: menuOpt.name,
          // Changed to match AddFinalMenu: use menuOpt.count or detailList.length
          totalRecipes: menuOpt.count || detailList.length,
          totalCost: menuOpt.cost || menuData.totalMenuCost || detailList.reduce(
            (sum: number, d: any) => sum + ((d.perPortionCost || 0) * (d.portionSize || 1)), 
            0
          ),
          detailList: detailList.filter((d: any) => d.recipeFk !== null && d.recipeFk !== 0)
            .map((dl: any) => ({
              ...dl,
              portionSize: dl.portionSize || 0,
              perPortionCost: dl.perPortionCost || 0,
              uom: dl.uom || 'Kg',
            })),
          templateFk: menuOpt.fk || menuData.templateFk,
          templateName: template?.name || '',
          mealTypeFk: selectedMealType?.pk || menuData.mealTypeFk,
          mealTypeName: selectedMealType?.name || '',
          categoryCount,
        };
        
        setSelectedMenus((prev) => [...prev, newMenu]);
        setSelectedMenuPk(null);
      } else {
        setErrorMessage('Failed to load menu details.');
      }
    } catch (error: any) {
      console.error('Error adding menu:', error);
      if (error.message.includes('Session expired')) {
        // SessionExpiredModal will handle
      } else {
        setErrorMessage(error.message || 'Failed to add menu.');
      }
    } finally {
      setIsLoadingAdd(false);
    }
  };

  const removeMenu = (id: string) => {
    setSelectedMenus((prev) => prev.filter((m) => m.id !== id));
  };

  const viewMenu = (menuPk: number) => {
    setCurrentViewMenuPk(menuPk);
    setShowViewModal(true);
  };

  const totalRecipes = selectedMenus.reduce((sum, m) => sum + m.totalRecipes, 0);
  const totalCost = selectedMenus.reduce((sum, m) => sum + m.totalCost, 0);

  const validateAndSave = async () => {
    const errors: string[] = [];
    
    if (!templateName.trim()) errors.push('Final Menu Set Name is required');
    else if (templateName.trim().length > 50) errors.push('Final Menu Set Name cannot exceed 50 characters');
    
    if (selectedMenus.length === 0) errors.push('At least one menu is required');
    
    if (errors.length > 0) {
      setGeneralModal({ isOpen: true, type: 'error', message: errors.join(', ') });
      return;
    }
    
    if (!id) {
      setGeneralModal({ isOpen: true, type: 'error', message: 'No ID found for modification.' });
      return;
    }
    
    setIsSaving(true);
    setErrorMessage('');
    
    try {
      const selectedMeals = selectedMenus.map((sm) => ({
        menuFk: sm.menuPk,
        menuName: sm.menuName,
        templateFk: sm.templateFk,
        templateName: sm.templateName,
        mealTypeFk: sm.mealTypeFk,
        mealTypeName: sm.mealTypeName,
        categoryCount: sm.categoryCount,
        recipeCount: sm.totalRecipes,
        cost: sm.totalCost,
        detailList: sm.detailList.map((dl: any) => ({
          categoryFk: dl.categoryFk,
          categoryName: dl.categoryName,
          recipeFk: dl.recipeFk,
          recipeName: dl.recipeName || '',
          portionSize: dl.portionSize || 0.0,
          perPortionCost: dl.perPortionCost || 0.0,
          uom: dl.uom || 'Kg',
        })),
      }));

      const payload = {
        id: parseInt(id),
        menuSetName: templateName.trim(),
        notes: notes.trim() || null,
        totalCost: totalCost,
        totalRecipeCount: totalRecipes,
        lastActBy: credentials?.userId || 1,
        selectedMeals,
      };
      
      console.log("🔍 Save Payload:", payload);
      
      const data = await apiFetch(`${baseUrl}/modifyFinalMenuSet`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      if (data.success) {
        setGeneralModal({ isOpen: true, type: 'success', message: 'Final Menu Set modified successfully!' });
        setTimeout(() => {
          setGeneralModal({ isOpen: false, type: 'success', message: '' });
          navigate('/Transaction/FinalMealSet');
        }, 2000);
      } else {
        console.error("❌ API Error Response:", data);
        throw new Error(data.message || 'Save failed');
      }
    } catch (error: any) {
      console.error('❌ Error modifying final menu set:', error);
      if (error.message.includes('Session expired')) {
        // SessionExpiredModal will handle
      } else {
        setGeneralModal({ isOpen: true, type: 'error', message: error.message || 'Failed to modify final menu set.' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    if (id) {
      await fetchExisting();
    }
  };

  // Handle meal type change - matches AddFinalMenu pattern
  const handleMealTypeChange = (selectedName: string) => {
    if (selectedName === 'Select Type Option') {
      setSelectedMealType(null);
      // Reset related selections like in AddFinalMenu
      setSelectedMenus([]);
      setSelectedMenuPk(null);
      setErrorMessage('');
      setSuccessMessage('');
      return;
    }
    const mealType = mealTypes.find((mt) => mt.name === selectedName);
    setSelectedMealType(mealType || null);
  };

  // View/Edit Modal Component
  const ViewMenuModal = ({ menuPk, finalSetId, onClose }: { menuPk: number; finalSetId: string | null; onClose: () => void }) => {
    const [viewData, setViewData] = useState<any>(null);
    const [viewMealTypes, setViewMealTypes] = useState<MealType[]>([]);
    const [viewTemplates, setViewTemplates] = useState<TemplateOption[]>([]);
    const [filterOptions, setFilterOptions] = useState<string[]>(['All Categories']);
    const [selectedFilterCategory, setSelectedFilterCategory] = useState('All Categories');
    const [tableData, setTableData] = useState<any[]>([]);
    const [isLoadingView, setIsLoadingView] = useState(true);
    const [localGeneralModal, setLocalGeneralModal] = useState({ isOpen: false, type: 'success', message: '' });

    // Local General Status Modal for View Modal
    const LocalGeneralStatusModal = () => (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
        <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
          <div className="flex justify-center mb-4">
            {localGeneralModal.type === 'success' ? (
              <CheckCircle className="h-12 w-12 text-green-500" />
            ) : (
              <AlertCircle className="h-12 w-12 text-red-500" />
            )}
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            {localGeneralModal.type === 'success' ? 'Success!' : 'Error!'}
          </h2>
          <p className="text-sm text-gray-600 mb-4">{localGeneralModal.message}</p>
          <button
            onClick={() => setLocalGeneralModal({ isOpen: false, type: 'success', message: '' })}
            className={`px-4 py-2 text-white rounded-lg hover:opacity-90 transition ${
              localGeneralModal.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            OK
          </button>
        </div>
      </div>
    );

    const filterOptionObjects = useMemo(() => {
      return filterOptions.map((opt) => ({ name: opt }));
    }, [filterOptions]);

    useEffect(() => {
      const fetchViewData = async () => {
        setIsLoadingView(true);
        try {
          // Fetch meal types
          const mtData = await apiFetch(`${baseUrl}/loadMealTypeDropDown`, { method: 'GET' });
          if (mtData.success && mtData.data) {
            const enhancedViewMealTypes = [{ pk: 0, code: '', name: 'Select Type Option' }, ...mtData.data];
            setViewMealTypes(enhancedViewMealTypes);
          }
          // Fetch menu data using appropriate API
          let menuData;
          if (finalSetId) {
            menuData = await apiFetch(`${baseUrl}/finalMenuRecipeEdit/${finalSetId}/${menuPk}`, { method: 'GET' });
          } else {
            menuData = await apiFetch(`${baseUrl}/mealSetMenuEditByIdForMenuSet/${menuPk}`, { method: 'GET' });
          }
          if (!menuData.success || !menuData.data) {
            throw new Error('Failed to load menu data');
          }
          setViewData(menuData.data);
          const mealTypeFk = menuData.data.mealTypeFk;
          const templateFk = menuData.data.templateFk;
          // Fetch templates
          const tempData = await apiFetch(`${baseUrl}/loadMealSetTemplateDropDown/${mealTypeFk}`, { method: 'GET' });
          if (tempData.success && tempData.data) {
            setViewTemplates(tempData.data);
          }
          // Fetch categories and recipes
          const catResponse = await fetch(`${mealSetMenuUrl}/categoryListByFk`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ templateFk }),
          });
          const catJson = await catResponse.json();
          let apiDetailList = [];
          if (catJson.success && catJson.data && catJson.data.length > 0) {
            const templateData = catJson.data[0];
            let rawDetailList = templateData.detailList || [];
            // Deduplicate categories by categoryFk to avoid duplicate rows
            const categoryMap = new Map();
            rawDetailList.forEach((category) => {
              if (!categoryMap.has(category.categoryFk)) {
                categoryMap.set(category.categoryFk, category);
              }
            });
            apiDetailList = Array.from(categoryMap.values());
          }
          // Prepare existing selections
          const existingDetailList = menuData.data.detailList || [];
          const existingSelections = new Map();
          existingDetailList.forEach((detail: any) => {
            const catFk = detail.categoryFk;
            if (!existingSelections.has(catFk)) {
              existingSelections.set(catFk, []);
            }
            existingSelections.get(catFk)?.push({
              recipeFk: detail.recipeFk,
              portionSize: detail.portionSize || 0.0,
            });
          });
          const processedData = processTableData(apiDetailList, existingSelections);
          setTableData(processedData);
          // Set filter options from apiDetailList
          const uniqueCategories = ['All Categories', ...new Set(apiDetailList.map((d: any) => d.categoryName))];
          setFilterOptions(uniqueCategories);
          setSelectedFilterCategory('All Categories');
        } catch (error: any) {
          console.error('Error loading view data:', error);
          if (error.message.includes('Session expired')) {
            // SessionExpiredModal will handle
          } else {
            setLocalGeneralModal({ isOpen: true, type: 'error', message: 'Failed to load menu details.' });
          }
        } finally {
          setIsLoadingView(false);
        }
      };
      fetchViewData();
    }, [menuPk, finalSetId]);

    const processTableData = (apiDetailList: any[], existingSelections: Map<number, any[]>) => {
      const processedData: any[] = [];
      let rowId = 0;
      apiDetailList.forEach((category: any) => {
        const { categoryName, categoryFk, recipes = [], recipeCount = 1 } = category;
        
        // Prepare recipe options with proper defaults
        const recipeOptions = [
          { 
            name: 'Select Recipe', 
            pk: null,
            portionSize: 0.0000,
            perPortionCost: 0.00,
            uom: 'Kg'
          },
          ...(recipes || []).map((recipe: any) => ({
            name: recipe.recipeName || 'Unnamed Recipe',
            pk: recipe.recipeFk,
            portionSize: Number(recipe.portionSize) || 0.0000,
            perPortionCost: Number(recipe.perPortionCost) || 0.00,
            uom: recipe.uom || 'Kg'
          }))
        ];

        // Get existing recipes for this category
        const existingRecipes = existingSelections.get(categoryFk) || [];

        // Create rows based on recipe count
        for (let i = 0; i < recipeCount; i++) {
          let selectedRecipe = null;
          let idealPortion = 0.0000;
          let costPerPortion = 0.00;

          if (i < existingRecipes.length) {
            // Use existing selection
            const existing = existingRecipes[i];
            const recipeOption = recipeOptions.find((opt: any) => opt.pk === existing.recipeFk);
            if (recipeOption && recipeOption.pk !== null) {
              selectedRecipe = recipeOption;
              idealPortion = existing.portionSize || recipeOption.portionSize || 0.0000;
              costPerPortion = recipeOption.perPortionCost || 0.00;
            } else {
              // No valid existing selection, set to null
              selectedRecipe = null;
              idealPortion = 0.0000;
              costPerPortion = 0.00;
            }
          } else {
            // For new rows, default to null
            selectedRecipe = null;
            idealPortion = 0.0000;
            costPerPortion = 0.00;
          }

          processedData.push({
            id: rowId++,
            categoryName,
            categoryFk,
            recipeOptions,
            selectedRecipe,
            idealPortion,
            costPerPortion,
          });
        }
      });
      return processedData;
    };

    const isRecipeDuplicate = (recipePk: number, currentRowId: number) => {
      return tableData.some((row: any) => row.id !== currentRowId && row.selectedRecipe?.pk === recipePk);
    };

    const handleRecipeChange = (rowId: number, selectedName: string) => {
      if (selectedName === '' || selectedName === 'Select Recipe') {
        setTableData((prev) =>
          prev.map((row) => {
            if (row.id === rowId) {
              return {
                ...row,
                selectedRecipe: null,
                idealPortion: 0.0000,
                costPerPortion: 0.00,
              };
            }
            return row;
          })
        );
        return;
      }

      setTableData((prev) => {
        const currentData = [...prev];
        const currentRow = currentData.find((r) => r.id === rowId);
        if (!currentRow) return prev;

        const recipe = currentRow.recipeOptions.find((opt: any) => opt.name === selectedName);
        if (!recipe) return prev;

        if (isRecipeDuplicate(recipe.pk, rowId)) {
          setLocalGeneralModal({ 
            isOpen: true, 
            type: 'error', 
            message: `Recipe "${recipe.name}" is already selected in another category. Please choose a different recipe.` 
          });
          return prev;
        }

        return currentData.map((r) => {
          if (r.id === rowId) {
            return {
              ...r,
              selectedRecipe: recipe,
              idealPortion: recipe.portionSize || 0.0000,
              costPerPortion: recipe.perPortionCost || 0.00,
            };
          }
          return r;
        });
      });
    };

    const displayedData = useMemo(() => {
      if (selectedFilterCategory === 'All Categories') {
        return tableData;
      }
      return tableData.filter((row: any) => row.categoryName === selectedFilterCategory);
    }, [tableData, selectedFilterCategory]);

    const selectedRows = useMemo(() => tableData.filter((row: any) => row.selectedRecipe && row.selectedRecipe.pk !== null), [tableData]);

    const totalCostMemo = useMemo(() => {
      return selectedRows.reduce((sum: number, row: any) => sum + (row.costPerPortion), 0);
    }, [selectedRows]);

    const totalRecipesMemo = useMemo(() => {
      return selectedRows.length;
    }, [selectedRows]);

    const handleClose = () => {
      // Update the selected menu with new data
      const newDetailList = selectedRows.map((row: any) => ({
        categoryFk: row.categoryFk,
        categoryName: row.categoryName,
        recipeFk: row.selectedRecipe.pk,
        recipeName: row.selectedRecipe.name,
        portionSize: row.idealPortion,
        perPortionCost: row.costPerPortion,
        recipeCount: 1,
        uom: row.selectedRecipe.uom || 'Kg',
      }));

      const newTotalCost = totalCostMemo;
      const newTotalRecipes = totalRecipesMemo;
      const newCategoryCount = new Set(newDetailList.map((d: any) => d.categoryFk)).size;

      const menuIndex = selectedMenus.findIndex((m) => m.menuPk === menuPk);
      if (menuIndex !== -1) {
        setSelectedMenus((prev) =>
          prev.map((m, i) =>
            i === menuIndex
              ? {
                  ...m,
                  detailList: newDetailList,
                  totalRecipes: newTotalRecipes,
                  totalCost: newTotalCost,
                  categoryCount: newCategoryCount,
                }
              : m
          )
        );
      }

      setShowViewModal(false);
      setCurrentViewMenuPk(null);
    };

    if (isLoadingView) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
            <Loader2 className="animate-spin mx-auto" size={24} />
          </div>
        </div>
      );
    }
    
    const selectedMealTypeView = viewMealTypes.find((mt: MealType) => mt.pk === viewData?.mealTypeFk);
    const selectedTemplateView = viewTemplates.find((t: TemplateOption) => t.pk === viewData?.templateFk);
    
    return (
      <>
        {localGeneralModal.isOpen && <LocalGeneralStatusModal />}
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">View & Edit Menu Details</h2>
              <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Meal Type</label>
                  <input
                    readOnly
                    value={selectedMealTypeView?.name || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Template</label>
                  <input
                    readOnly
                    value={selectedTemplateView?.name || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Menu Name</label>
                  <input
                    readOnly
                    value={viewData?.menuName || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Filter Category</label>
                  <SearchableSelect
                    options={filterOptionObjects}
                    value={selectedFilterCategory}
                    onChange={setSelectedFilterCategory}
                    placeholder="Filter by Category"
                    disabled={isLoadingView}
                    displayKey="name"
                    valueKey="name"
                  />
                </div>
              </div>
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recipe Selection</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded">
                      <Calculator size={14} className="text-blue-600 dark:text-blue-400" />
                                      <div className="text-sm text-gray-500 dark:text-gray-400">Total Recipes: {totalRecipesMemo}</div>

                      <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
                        Total: <span className="font-bold">{formatAmount(totalCostMemo, projectSettings?.costDecimalPlaces || 2)}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Category</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Recipe</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Portion</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Cost/Portion</th>
                </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                      {displayedData.length > 0 ? (
                        displayedData.map((row: any) => {
                          const rowTotal = (row.idealPortion * row.costPerPortion) || 0;
                          return (
                            <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                              <td className="px-3 py-2 whitespace-nowrap">
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 px-2 py-0.5 rounded">
                                  {row.categoryName}
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                <SearchableSelect
                                  options={row.recipeOptions}
                                  value={row.selectedRecipe?.name || ''}
                                  onChange={(newName) => handleRecipeChange(row.id, newName)}
                                  placeholder="Select Recipe"
                                  displayKey="name"
                                  valueKey="name"
                                  className="w-full"
                                  disabled={isLoadingView}
                                />
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <div className="flex items-center gap-1">
                                  <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                    {row.idealPortion.toFixed(4)}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">Kg</span>
                                </div>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                  {formatAmount(row.costPerPortion || 0, projectSettings?.costDecimalPlaces || 2)}
                                </span>
                              </td>
                            
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-3 py-6 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                              <div className="bg-gray-100 dark:bg-gray-600 p-2 rounded-full mb-2">
                                <Calculator size={16} className="text-gray-400 dark:text-gray-500" />
                              </div>
                              <p className="text-xs font-medium">No recipes available</p>
                              <p className="text-xs mt-0.5">Select recipes from the dropdowns</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Recipes: {totalRecipesMemo}</div>
                <div className="text-right">
                  <div className="text-green-600 dark:text-green-400 font-bold text-sm">Total Cost: {formatAmount(totalCostMemo, projectSettings?.costDecimalPlaces || 2)}</div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 flex justify-end">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium transition-colors"
              >
                Close & Update
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {sessionExpired && <SessionExpiredModal />}
      {generalModal.isOpen && <GeneralStatusModal />}
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Modify Final Menu Set
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              className="flex items-center gap-2 px-3 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              onClick={() => navigate('/Transaction/FinalMealSet')}
            >
              <ArrowLeft size={16} />
            </button>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              disabled={isSaving}
            >
              <RefreshCw size={16} />
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
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Final Menu Set Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                maxLength={50}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-sm placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Enter unique menu set name"
              />
              <p className={`text-xs mt-1 ${50 - templateName.length <= 0 ? 'text-red-500' : 'text-gray-500'}`}>
                {Math.max(0, 50 - templateName.length)} Characters remaining
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-sm placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Add any special notes or instructions"
                rows={3}
              />
            </div>
          </div>
          {/* Meal Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Meal Type Selection <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                  <SearchableSelect
                                 options={mealTypes}
                                 value={selectedMealType?.name || ''}
                                 onChange={(selectedName) => {
                                   if (selectedName === 'Select Type Option') {
                                     setSelectedMealType(null);
                                     handleRefresh();
                                     return;
                                   }
                                   const mealType = mealTypes.find((mt) => mt.name === selectedName);
                                   setSelectedMealType(mealType);
                                 }}
                                 placeholder="Select Meal Type"
                                 disabled={isLoadingMealTypes}
                                 displayKey="name"
                                 valueKey="name"
                               />
              </div>
              <div className="flex-1">
                <SearchableSelect
                  options={menuOptions}
                  value={menuOptions.find((m) => m.pk === selectedMenuPk)?.name || ''}
                  onChange={(selectedName) => {
                    if (selectedName === 'Select Menu Option') {
                      setSelectedMenuPk(null);
                      return;
                    }
                    const menu = menuOptions.find((m) => m.name === selectedName);
                    setSelectedMenuPk(menu?.pk || null);
                  }}
                  placeholder="Select Menu"
                  disabled={!selectedMealType || isLoadingMenus}
                  displayKey="name"
                  valueKey="name"
                />
              </div>
              <button
                onClick={addMenu}
                disabled={!selectedMenuPk || selectedMenuPk === 0 || isLoadingAdd || isLoadingMenus}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isLoadingAdd ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Add
              </button>
            </div>
          </div>
             {errorMessage && (
        <div className="mx-4 sm:mx-6 max-w-7xl p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-300 mb-4">
          <div className="flex items-center gap-2">
            <XCircle size={20} />
            {errorMessage}
          </div>
        </div>
      )}
          {/* Final Menu Set Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Calculator size={20} className="text-indigo-600" />
                Final Menu Set Summary
              </h3>
              <div className="border border-gray-200 dark:border-gray-600 rounded-md overflow-hidden bg-white dark:bg-gray-800">
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Selected Menus</h4>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-600 max-h-48 overflow-y-auto">
                  {selectedMenus.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      <Calculator size={24} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No menus added yet. Select and add from above.</p>
                    </div>
                  ) : (
                    selectedMenus.map((menu) => (
                      <div key={menu.id} className="px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900 dark:text-white">{menu.menuName}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{menu.templateName} • {menu.categoryCount} categories</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-green-600 dark:text-green-400 font-medium">{formatAmount(menu.totalCost || 0, projectSettings?.costDecimalPlaces || 2)}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ({menu.totalRecipes} recipes)
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => viewMenu(menu.menuPk)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                              title="View & Edit"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => removeMenu(menu.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                              title="Remove"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div>
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-md border border-gray-200 dark:border-gray-700">
                <div className="text-center mb-4">
                  <Calculator size={24} className="mx-auto text-indigo-600 mb-2" />
                  <h4 className="font-bold text-gray-900 dark:text-white">Overall Summary</h4>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600 dark:text-gray-400">Total Menus</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedMenus.length}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600 dark:text-gray-400">Total Recipes</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{totalRecipes}</span>
                  </div>
                  <div className="flex justify-between py-1 border-t border-gray-200 dark:border-gray-600 pt-1">
                    <span className="font-semibold">Total Daily Cost</span>
                    <span className="font-bold text-green-600 dark:text-green-400">{formatAmount(totalCost || 0, projectSettings?.costDecimalPlaces || 2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Meal Breakdown */}
       
        </div>
      </div>
      {/* View Modal */}
      {showViewModal && currentViewMenuPk && (
        <ViewMenuModal menuPk={currentViewMenuPk} finalSetId={id || null} onClose={() => setShowViewModal(false)} />
      )}
    </div>
  );
};

export default ModifyFinalMenu;