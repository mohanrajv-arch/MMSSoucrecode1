import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { ChevronDown, MoreVertical, Eye, ArrowLeft, X, RefreshCw, Save, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import MenuScreenList from "./CalndeBoxdropDown";
import SearchableSelect from "src/components/Spa Components/DropdownSearch";
import { useAuth, useFormatAmount, useFormatQuantity } from "src/context/AuthContext";
// ──────────────────────────────────────────────────────────────
// SessionExpiredModal Component
// ──────────────────────────────────────────────────────────────
function SessionExpiredModal({ onLogin }) {
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Session Expired</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Your session has expired. Please login again to continue.
        </p>
        <button
          onClick={onLogin}
          className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}
// ──────────────────────────────────────────────────────────────
// DuplicateRecipeErrorModal Component
// ──────────────────────────────────────────────────────────────
function DuplicateRecipeErrorModal({ isOpen, onClose, duplicateRecipeName, mealTypeName }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-[60]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6 text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-red-500 dark:text-red-400" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Duplicate Recipe</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
          Recipe <span className="font-semibold text-red-600 dark:text-red-400">"{duplicateRecipeName}"</span> is already used in
        </p>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-4">{mealTypeName}</p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Please select a different recipe.
        </p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition w-full"
        >
          OK
        </button>
      </div>
    </div>
  );
}
// ──────────────────────────────────────────────────────────────
// CalendarDatePicker Component
// ──────────────────────────────────────────────────────────────
function CalendarDatePicker({ id, onChange, label, selected, minDate, maxDate, className = "", required = false, placeholder, placeholderText }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    selected ? (typeof selected === 'string' ? new Date(selected) : selected) : null
  );
  const [currentMonth, setCurrentMonth] = useState(
    selectedDate ? selectedDate.getMonth() : new Date().getMonth()
  );
  const [currentYear, setCurrentYear] = useState(
    selectedDate ? selectedDate.getFullYear() : new Date().getFullYear()
  );
  const calendarRef = useRef(null);
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  useEffect(() => {
    const newSelectedDate = selected ? (typeof selected === 'string' ? new Date(selected) : selected) : null;
    setSelectedDate(newSelectedDate);
    if (newSelectedDate) {
      setCurrentMonth(newSelectedDate.getMonth());
      setCurrentYear(newSelectedDate.getFullYear());
    }
  }, [selected]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-GB', {
      month: '2-digit',
      year: 'numeric'
    });
  };
  const handleMonthChange = (month) => {
    setCurrentMonth(month);
    const newDate = new Date(currentYear, month, 1);
    setSelectedDate(newDate);
    if (onChange) {
      onChange(newDate);
    }
  };
  const handleYearChange = (year) => {
    setCurrentYear(year);
    const newDate = new Date(year, currentMonth, 1);
    setSelectedDate(newDate);
    if (onChange) {
      onChange(newDate);
    }
  };
  const getYearOptions = () => {
    const currentYearActual = new Date().getFullYear();
    const startYear = minDate ? minDate.getFullYear() : currentYearActual - 10;
    const endYear = maxDate ? maxDate.getFullYear() : currentYearActual + 5;
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push(year);
    }
    return years;
  };
  const yearOptions = getYearOptions();
  return (
    <div className={`relative ${className}`} ref={calendarRef}>
      <fieldset className="relative border border-gray-300 dark:border-gray-600 rounded-md">
        {label && (
          <legend className="ml-2 px-1 text-xs text-gray-600 dark:text-gray-400">
            {label}
            {required && <span className="text-red-700 ml-1">*</span>}
          </legend>
        )}
    
        <div className="relative px-1">
          <input
            id={id}
            type="text"
            value={formatDate(selectedDate)}
            placeholder={placeholder || placeholderText || "mm-yyyy"}
            onClick={() => setIsOpen(!isOpen)}
            readOnly
            required={required}
            className="w-full bg-transparent border-0 outline-none focus:outline-none text-sm text-gray-900 dark:text-white cursor-pointer p-1"
          />
          <span className="absolute right-4 top-3 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </span>
        </div>
      </fieldset>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50 p-4 w-80">
          <div className="flex gap-2 mb-4">
            <select
              value={currentMonth}
              onChange={(e) => handleMonthChange(Number(e.target.value))}
              className="flex-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-transparent text-gray-900 dark:text-white outline-none focus:border-blue-500 dark:focus:border-blue-400"
            >
              {monthNames.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
            <select
              value={currentYear}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-transparent text-gray-900 dark:text-white outline-none focus:border-blue-500 dark:focus:border-blue-400"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
// ──────────────────────────────────────────────────────────────
// GeneralStatusModal Component
// ──────────────────────────────────────────────────────────────
function GeneralStatusModal({ modal, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
        <div className="flex justify-center mb-4">
          {modal.type === 'success' ? (
            <CheckCircle className="h-12 w-12 text-green-500 dark:text-green-400" />
          ) : (
            <AlertCircle className="h-12 w-12 text-red-500 dark:text-red-400" />
          )}
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {modal.type === 'success' ? 'Success!' : 'Error!'}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{modal.message}</p>
        <button
          onClick={onClose}
          className={`px-4 py-2 text-white rounded-lg hover:opacity-90 transition ${
            modal.type === 'success' ? 'bg-green-600 dark:bg-green-700' : 'bg-red-600 dark:bg-red-700'
          }`}
        >
          OK
        </button>
      </div>
    </div>
  );
}
// ──────────────────────────────────────────────────────────────
// RecipeChangeModal Component
// ──────────────────────────────────────────────────────────────
function RecipeChangeModal({
  isOpen,
  onClose,
  item,
  options,
  onSelect,
  formatQuantity,
  formatAmount,
  decimalPlaces,
  tempNewRecipe,
  newRecipeValue,
  onNewRecipeChange,
  onDuplicateCheck // Add this prop
}) {
  if (!isOpen) return null;
  const noChange = !tempNewRecipe ? !item.recipeFk : tempNewRecipe.pk === item.recipeFk;
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Change Recipe</h3>
      
        {/* Current Recipe */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Current Recipe:</h4>
          {!item.recipeFk ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">No recipe selected</p>
          ) : (
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <p className="font-medium text-gray-900 dark:text-white">{item.recipeName}</p>
              <p className="text-gray-600 dark:text-gray-300">
                Portion: {formatQuantity(item.portionSize || 0, decimalPlaces)} {item.uom || 'Kg'}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Cost: {formatAmount(item.perPortionCost || 0, decimalPlaces)}
              </p>
            </div>
          )}
        </div>
        {/* New Recipe */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Select New Recipe:</h4>
          <SearchableSelect
            options={options}
            value={newRecipeValue}
            onChange={onNewRecipeChange}
            placeholder="Select Recipe"
            displayKey="name"
            valueKey="name"
            className="w-full"
          />
          {tempNewRecipe && (
            <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="font-medium text-gray-900 dark:text-white mb-2">{tempNewRecipe.name}</p>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <p>Portion: {formatQuantity(tempNewRecipe.portionSize || 0, decimalPlaces)} {tempNewRecipe.uom || 'Kg'}</p>
                <p>Cost: {formatAmount(tempNewRecipe.perPortionCost || 0, decimalPlaces)}</p>
              </div>
            </div>
          )}
        </div>
        {/* Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={onSelect}
            disabled={noChange}
            className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors ${
              noChange
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800'
            }`}
          >
            Select
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
// ──────────────────────────────────────────────────────────────
// AddMenuScreen Component
// ──────────────────────────────────────────────────────────────
function AddMenuScreen({ selectedDate, onBack, apiFetch, baseUrl, selectedLocation, sessionExpired: parentSessionExpired, setParentSessionExpired, generalModal: parentGeneralModal, setGeneralModal: setParentGeneralModal }) {
  const { projectSettings } = useAuth();
  const formatAmount = useFormatAmount();
  const formatQuantity = useFormatQuantity();
  const decimalPlaces = projectSettings?.decimalPlaces || 2;
  const [activeTab, setActiveTab] = useState('BREAKFAST');
  const [menuDetails, setMenuDetails] = useState([]);
  const [loadingMenuDetails, setLoadingMenuDetails] = useState(false);
  const [multiplier, setMultiplier] = useState('100.0');
  const [rowMultipliers, setRowMultipliers] = useState({});
  const [changedRecipes, setChangedRecipes] = useState({});
  const [saving, setSaving] = useState(false);
  const [recipeOptionsByCategory, setRecipeOptionsByCategory] = useState({});
  const [formData, setFormData] = useState({
    date: '',
    finalMenuSet: 'Select Final Menu',
    finalMenuFk: null,
    customPOB: '100',
    priority: 'Normal',
    notes: ''
  });
  const [finalMenuSets, setFinalMenuSets] = useState([]);
  const [loadingFinalMenus, setLoadingFinalMenus] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(parentSessionExpired || false);
  const [generalModal, setGeneralModal] = useState({ isOpen: false, type: 'success' as 'success' | 'error', message: '' });
  // New states for recipe change modal
  const [editingIndex, setEditingIndex] = useState(null);
  const [newRecipeValue, setNewRecipeValue] = useState('Select Recipe');
  const [tempNewRecipe, setTempNewRecipe] = useState(null);
  // State for duplicate recipe error modal
  const [duplicateErrorModal, setDuplicateErrorModal] = useState({
    isOpen: false,
    duplicateRecipeName: '',
    mealTypeName: ''
  });
  const getMultiplier = (index) => {
    return rowMultipliers[index];
  };
  const pobValue = parseFloat(formData.customPOB) || 0;
  const handleSessionExpired = () => {
    setSessionExpired(true);
    if (setParentSessionExpired) setParentSessionExpired(true);
  };
  const localApiFetch = useCallback(async (url, options = {}) => {
    try {
      const data = await apiFetch(url, options);
      return data;
    } catch (error) {
      if (error.message?.includes('Session expired') || error.message?.includes('authentication') || error.message?.includes('Failed to fetch')) {
        handleSessionExpired();
      }
      throw error;
    }
  }, [apiFetch]);
  const resetToDefaults = useCallback(() => {
    setFormData({
      date: formData.date, // Keep the date
      finalMenuSet: 'Select Final Menu',
      finalMenuFk: null,
      customPOB: '',
      priority: 'Normal',
      notes: ''
    });
    setMenuDetails([]);
    setRowMultipliers({});
    setChangedRecipes({});
    setActiveTab('BREAKFAST');
    setLoadingMenuDetails(false);
  }, [formData.date]);
  const refreshMenuDetails = useCallback(async () => {
    const selectedMenu = finalMenuSets.find(m => m.name === formData.finalMenuSet);
    if (!selectedMenu) {
      // If no menu selected, reset to defaults explicitly
      setMenuDetails([]);
      setRowMultipliers({});
      setChangedRecipes({});
      setRecipeOptionsByCategory({});
      setLoadingMenuDetails(false);
      return;
    }
  
    setLoadingMenuDetails(true);
    try {
      const data = await localApiFetch(`${baseUrl}/finalMenuDetailsByPk/${selectedMenu.pk}`, { method: 'GET' });
      console.log('Menu details response:', data);
    
      if (data.success && data.data?.menuDetail && Array.isArray(data.data.menuDetail)) {
        // Map and add original fields
        let details = data.data.menuDetail.map(item => ({
          ...item,
          originalRecipeFk: item.recipeFk,
          originalRecipeName: item.recipeName,
          originalPortionSize: item.portionSize,
          originalUom: item.uom,
          originalPerPortionCost: item.perPortionCost,
          // Preserve addingStatus from backend, default to 0 if not provided
          addingStatus: item.addingStatus !== undefined ? item.addingStatus : 0,
        }));
        // Deduplicate based on unique combination of menuFk, categoryFk, mealTypeFk, and recipeFk (null as 'null')
        const seen = new Set();
        details = details.filter(item => {
          const key = `${item.menuFk}-${item.categoryFk}-${item.mealTypeFk}-${item.recipeFk || 'null'}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        console.log('Deduplicated menu details count:', details.length);
      
        setMenuDetails(details);
      
        // Initialize multipliers
        const init = {};
        details.forEach((_, i) => (init[i] = '100.0'));
        setRowMultipliers(init);
        setChangedRecipes({});
      
        // Fetch recipe options for all unique categories
        const uniqueCats = [...new Set(details.map(d => d.categoryFk))];
        const fetchAllRecipes = async () => {
          const promises = uniqueCats.map(cat =>
            localApiFetch(`${baseUrl}/loadRecipeMasterDropDown/${cat}`, { method: 'GET' }).then(res => ({ cat, data: res.data || [] }))
          );
          try {
            const results = await Promise.all(promises);
            const newOptions = {};
            results.forEach(({ cat, data }) => {
              newOptions[cat] = [
                { name: 'Select Recipe', pk: null },
                ...data.map(r => ({ ...r, name: r.name }))
              ];
            });
            setRecipeOptionsByCategory(newOptions);
          } catch (e) {
            console.error('Failed to load recipe options', e);
          }
        };
      
        fetchAllRecipes();
      } else {
        setMenuDetails([]);
        setRowMultipliers({});
        setChangedRecipes({});
        setRecipeOptionsByCategory({});
      }
    } catch (e) {
      console.error('Failed to load menu details', e);
      if (e.message?.includes('Session expired') || e.message?.includes('authentication') || e.message?.includes('Failed to fetch')) {
        handleSessionExpired();
      } else {
        setGeneralModal({ isOpen: true, type: 'error', message: e.message || 'Failed to load menu details' });
        setMenuDetails([]);
        setRowMultipliers({});
        setChangedRecipes({});
        setRecipeOptionsByCategory({});
      }
    } finally {
      setLoadingMenuDetails(false);
    }
  }, [formData.finalMenuSet, finalMenuSets, localApiFetch, baseUrl]);
  useEffect(() => {
    const fetchFinalMenus = async () => {
      setLoadingFinalMenus(true);
      try {
        const data = await localApiFetch(`${baseUrl}/loadFinalMenuDropDown`, { method: 'GET' });
        if (data.success && Array.isArray(data.data)) {
          const formatted = data.data
            .filter((item) => item.pk && item.name)
            .map((item) => ({ pk: item.pk, name: item.name }));
          setFinalMenuSets(formatted);
        }
      } catch (e) {
        console.error('Failed to load final menu sets', e);
        if (e.message?.includes('Session expired') || e.message?.includes('authentication') || e.message?.includes('Failed to fetch')) {
          handleSessionExpired();
        } else {
          setGeneralModal({ isOpen: true, type: 'error', message: e.message || 'Failed to load final menus' });
        }
      } finally {
        setLoadingFinalMenus(false);
      }
    };
    fetchFinalMenus();
  }, [localApiFetch, baseUrl]);
  useEffect(() => {
    if (finalMenuSets.length > 0 && formData.finalMenuSet === 'Select Final Menu') {
      // Keep default if no selection
    }
  }, [finalMenuSets]);
  useEffect(() => {
    if (formData.finalMenuSet && formData.finalMenuSet !== 'Select Final Menu' && finalMenuSets.length > 0) {
      setFormData(prev => ({ ...prev, finalMenuFk: finalMenuSets.find(m => m.name === formData.finalMenuSet)?.pk || null }));
      refreshMenuDetails();
    } else {
      setFormData(prev => ({ ...prev, finalMenuFk: null }));
      setMenuDetails([]);
    }
  }, [formData.finalMenuSet, finalMenuSets, refreshMenuDetails]);
  useEffect(() => {
    if (selectedDate) {
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const year = selectedDate.getFullYear();
      const formatted = `${day}/${month}/${year}`;
      setFormData(prev => ({ ...prev, date: formatted }));
    }
  }, [selectedDate]);
  const mealTypes = Array.from(
    new Set(menuDetails.map(d => d.mealTypeName))
  ).filter(Boolean).sort();
  const currentItems = menuDetails.filter(item => item.mealTypeName === activeTab);
  useEffect(() => {
    if (mealTypes.length > 0 && !mealTypes.includes(activeTab)) {
      setActiveTab(mealTypes[0]);
    }
  }, [mealTypes, activeTab]);
  // Function to check for duplicate recipes
  const checkForDuplicateRecipe = useCallback((recipePk, mealTypeName, currentIndex) => {
    if (!recipePk) return false;
  
    const duplicate = menuDetails.find((item, index) =>
      index !== currentIndex &&
      item.recipeFk === recipePk &&
      item.mealTypeName === mealTypeName
    );
  
    return duplicate;
  }, [menuDetails]);
  // New handlers for recipe change modal
  const openRecipeModal = useCallback((globalIndex) => {
    setEditingIndex(globalIndex);
    setNewRecipeValue('Select Recipe');
    setTempNewRecipe(null);
    // Close duplicate error modal if open
    setDuplicateErrorModal({ isOpen: false, duplicateRecipeName: '', mealTypeName: '' });
  }, []);
  const handleNewRecipeChange = useCallback((name) => {
    setNewRecipeValue(name);
    if (editingIndex === null) return;
  
    const item = menuDetails[editingIndex];
    const options = recipeOptionsByCategory[item.categoryFk] || [];
  
    if (name === 'Select Recipe') {
      setTempNewRecipe(null);
      return;
    }
  
    const newRec = options.find(o => o.name === name);
    setTempNewRecipe(newRec);
  
    // Check for duplicate when user selects a recipe
    if (newRec) {
      const duplicateItem = checkForDuplicateRecipe(newRec.pk, item.mealTypeName, editingIndex);
      if (duplicateItem) {
        setDuplicateErrorModal({
          isOpen: true,
          duplicateRecipeName: newRec.name,
          mealTypeName: item.mealTypeName
        });
      }
    }
  }, [editingIndex, menuDetails, recipeOptionsByCategory, checkForDuplicateRecipe]);
  const handleSelectNewRecipe = useCallback(() => {
    if (editingIndex === null) return;
  
    const item = menuDetails[editingIndex];
  
    // Check for duplicate before proceeding
    if (tempNewRecipe) {
      const duplicateItem = checkForDuplicateRecipe(tempNewRecipe.pk, item.mealTypeName, editingIndex);
      if (duplicateItem) {
        setDuplicateErrorModal({
          isOpen: true,
          duplicateRecipeName: tempNewRecipe.name,
          mealTypeName: item.mealTypeName
        });
        return; // Don't proceed if duplicate exists
      }
    }
  
    if (!tempNewRecipe) {
      // Clear the row
      const updated = [...menuDetails];
      updated[editingIndex] = {
        ...updated[editingIndex],
        recipeName: '',
        recipeFk: null,
        portionSize: 0,
        uom: '',
        perPortionCost: 0,
        addingStatus: item.addingStatus === 0 ? 1 : item.addingStatus,
      };
      setMenuDetails(updated);
    
      // Remove from changedRecipes
      setChangedRecipes(prev => {
        const newPrev = { ...prev };
        delete newPrev[editingIndex];
        return newPrev;
      });
    } else {
      // Update changedRecipes
      setChangedRecipes(prev => ({
        ...prev,
        [editingIndex]: {
          menuFk: item.menuFk,
          categoryFk: item.categoryFk,
          recipeFk: tempNewRecipe.pk,
        },
      }));
      // Update menuDetails
      const updated = [...menuDetails];
      updated[editingIndex] = {
        ...updated[editingIndex],
        recipeName: tempNewRecipe.name,
        recipeFk: tempNewRecipe.pk,
        portionSize: tempNewRecipe.portionSize,
        uom: tempNewRecipe.uom,
        perPortionCost: tempNewRecipe.perPortionCost,
        addingStatus: item.addingStatus,
      };
      setMenuDetails(updated);
    }
  
    // Close modal
    setEditingIndex(null);
    setTempNewRecipe(null);
    setNewRecipeValue('Select Recipe');
    // Close duplicate error modal if open
    setDuplicateErrorModal({ isOpen: false, duplicateRecipeName: '', mealTypeName: '' });
  }, [editingIndex, tempNewRecipe, menuDetails, checkForDuplicateRecipe]);
  const closeRecipeModal = useCallback(() => {
    setEditingIndex(null);
    setTempNewRecipe(null);
    setNewRecipeValue('Select Recipe');
    // Close duplicate error modal if open
    setDuplicateErrorModal({ isOpen: false, duplicateRecipeName: '', mealTypeName: '' });
  }, []);
  const closeDuplicateErrorModal = useCallback(() => {
    setDuplicateErrorModal({ isOpen: false, duplicateRecipeName: '', mealTypeName: '' });
  }, []);
  const handleSaveMenu = async () => {
    if (!formData.finalMenuFk || !selectedDate) {
      setGeneralModal({ isOpen: true, type: 'error', message: 'Please select a final menu set and date' });
      return;
    }
    setSaving(true);
    try {
      // Create date string in YYYY-MM-DD format
      const apiDate = selectedDate.toLocaleDateString('en-CA');
 
      console.log('Preparing to save menu for date:', apiDate, 'Selected date was:', selectedDate);
 
      // Build changedDetails array with ALL necessary fields
      const changedDetails = menuDetails.map((item, i) => ({
        menuFk: item.menuFk,
        categoryFk: item.categoryFk,
        categoryName : item.categoryName,
        recipeFk: item.recipeFk,
        pobParticipation: parseFloat(getMultiplier(i)) || 0,
        addingStatus: item.addingStatus, // Include addingStatus
        mealTypeFk: item.mealTypeFk, // Include mealTypeFk (CRITICAL for backend)
        mealTypeName: item.mealTypeName // Include mealTypeName
      }));
 
      // Build menuDetail array with ALL necessary fields
      const menuDetail = menuDetails.map((item, i) => ({
        menuFk: item.menuFk,
        categoryFk: item.categoryFk,
        categoryName : item.categoryName,
        recipeFk: item.recipeFk,
        pobParticipation: parseFloat(getMultiplier(i)) || 0,
        addingStatus: item.addingStatus, // Include addingStatus
        mealTypeFk: item.mealTypeFk, // Include mealTypeFk (CRITICAL for backend)
        mealTypeName: item.mealTypeName // Include mealTypeName
      }));
 
      const totalCost = menuDetails.reduce((sum, item, i) => {
        // Skip items marked for addition only (addingStatus: 1) AND have recipeFk = null
        if (item.addingStatus === 1 && !item.recipeFk) return sum;
      
        const mult = parseFloat(getMultiplier(i)) || 0;
        return sum + (item.perPortionCost || 0) * pobValue * mult / 100;
      }, 0);
 
      const saveData = {
        finalMenuFk: formData.finalMenuFk,
        notes: formData.notes || `Menu issued for ${apiDate}`,
        locationFk: selectedLocation || 1,
        pob: pobValue,
        totalCost: parseFloat(totalCost.toFixed(decimalPlaces)),
        createdBy: 659,
        menuIssuedDate: apiDate,
        changedDetails: changedDetails, // Include ALL fields
        menuDetail: menuDetail, // Include ALL fields
      };
 
      console.log('POST /saveIssuedMenu payload:', saveData);
 
      // Log the payload structure for debugging
      console.log('Payload structure check:');
      console.log('- changedDetails count:', changedDetails.length);
      console.log('- Sample changedDetail:', changedDetails[0]);
      console.log('- menuDetail count:', menuDetail.length);
      console.log('- Items with addingStatus=1:', changedDetails.filter(item => item.addingStatus === 1).length);
      console.log('- Items with recipeFk!=0 and addingStatus=1:',
        changedDetails.filter(item => item.addingStatus === 1 && item.recipeFk !== 0).length);
 
      const response = await localApiFetch(`${baseUrl}/saveIssuedMenu`, {
        method: 'POST',
        body: JSON.stringify(saveData),
      });
 
      if (response.success) {
        setGeneralModal({ isOpen: true, type: 'success', message: 'Menu saved successfully!' });
        setTimeout(() => {
          setGeneralModal({ isOpen: false, type: 'success', message: '' });
          onBack();
        }, 2000);
      } else {
        setGeneralModal({ isOpen: true, type: 'error', message: response.message || 'Failed to save menu' });
      }
    } catch (err) {
      console.error(err);
      if (err.message?.includes('Session expired') || err.message?.includes('authentication') || err.message?.includes('Failed to fetch')) {
        handleSessionExpired();
      } else {
        setGeneralModal({ isOpen: true, type: 'error', message: 'Error: ' + err.message });
      }
    } finally {
      setSaving(false);
    }
  };
  useEffect(() => {
    setChangedRecipes({});
  }, [formData.finalMenuSet]);
  const handleFinalMenuChange = (selectedName) => {
    if (selectedName === 'Select Final Menu') {
      setFormData({
        ...formData,
        finalMenuSet: selectedName,
        finalMenuFk: null
      });
      return;
    }
    const selected = finalMenuSets.find(m => m.name === selectedName);
    setFormData({
      ...formData,
      finalMenuSet: selectedName,
      finalMenuFk: selected?.pk || null
    });
  };
  const finalMenuOptionObjects = useMemo(() => [
    { name: 'Select Final Menu', pk: null },
    ...finalMenuSets.map(m => ({ ...m, name: m.name }))
  ], [finalMenuSets]);
  const totalRecipesCount = useMemo(() =>
    currentItems.filter(item => item.recipeFk != null).length, [currentItems]
  );
  const currentTotalCost = useMemo(() =>
    currentItems.reduce((sum, item) => {
      const globalIndex = menuDetails.findIndex(md =>
        md.menuFk === item.menuFk &&
        md.categoryFk === item.categoryFk &&
        md.mealTypeFk === item.mealTypeFk &&
        md.recipeFk === item.recipeFk
      );
      const multValue = parseFloat(getMultiplier(globalIndex)) || 0;
      const cost = (item.perPortionCost || 0) * (pobValue * multValue / 100);
      return sum + cost;
    }, 0), [currentItems, menuDetails, pobValue, rowMultipliers]
  );
  const editingItem = editingIndex !== null ? menuDetails[editingIndex] || null : null;
  const editingOptions = editingItem ? (recipeOptionsByCategory[editingItem.categoryFk] || []) : [];
  if (sessionExpired) {
    return <SessionExpiredModal onLogin={() => window.location.href = '/'} />;
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {generalModal.isOpen && (
        <GeneralStatusModal
          modal={generalModal}
          onClose={() => setGeneralModal({ isOpen: false, type: 'success', message: '' })}
        />
      )}
    
      {/* Duplicate Recipe Error Modal (appears on top) */}
      <DuplicateRecipeErrorModal
        isOpen={duplicateErrorModal.isOpen}
        onClose={closeDuplicateErrorModal}
        duplicateRecipeName={duplicateErrorModal.duplicateRecipeName}
        mealTypeName={duplicateErrorModal.mealTypeName}
      />
    
      {/* Recipe Change Modal */}
      <RecipeChangeModal
        isOpen={editingIndex !== null}
        onClose={closeRecipeModal}
        item={editingItem || {}}
        options={editingOptions}
        onSelect={handleSelectNewRecipe}
        formatQuantity={formatQuantity}
        formatAmount={formatAmount}
        decimalPlaces={decimalPlaces}
        tempNewRecipe={tempNewRecipe}
        newRecipeValue={newRecipeValue}
        onNewRecipeChange={handleNewRecipeChange}
      />
    
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Add Menu to Calendar</h1>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Issue menu for selected date and location</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1 px-3 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            onClick={resetToDefaults}
            disabled={saving}
            className="flex items-center gap-1 px-3 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg text-xs font-medium hover:bg-green-700 dark:hover:bg-green-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={loadingMenuDetails ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleSaveMenu}
            disabled={saving || !formData.finalMenuFk}
            className="flex items-center gap-1 px-3 py-2 bg-orange-600 dark:bg-orange-700 text-white rounded-lg text-xs font-medium hover:bg-orange-700 dark:hover:bg-orange-800 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={16} />}
          </button>
        </div>
      </div>
    
      {/* Main Content */}
      <div className="py-3 space-y-4 max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Menu Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
              <input
                type="text"
                value={formData.date}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Final Menu Set *</label>
              <SearchableSelect
                options={finalMenuOptionObjects}
                value={formData.finalMenuSet}
                onChange={handleFinalMenuChange}
                placeholder="Select Menu"
                disabled={loadingFinalMenus}
                displayKey="name"
                valueKey="name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Custom POB</label>
              <input
                type="text"
                value={formData.customPOB}
                onChange={(e) => {
                  const val = e.target.value;
                  // Allow only numbers (no decimal point), up to 5 digits
                  if (val === '' || /^\d{0,5}$/.test(val)) {
                    setFormData(prev => ({ ...prev, customPOB: val }));
                  }
                }}
                onBlur={(e) => {
                  // Ensure it's a valid number and format
                  const val = e.target.value;
                  if (val !== '' && /^\d+$/.test(val)) {
                    const numVal = parseInt(val, 10);
                    if (!isNaN(numVal)) {
                      // Keep as integer string
                      setFormData(prev => ({
                        ...prev,
                        customPOB: numVal.toString()
                      }));
                    }
                  } else if (val === '') {
                    setFormData(prev => ({ ...prev, customPOB: '0' }));
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              rows={2}
              placeholder="Additional notes..."
            />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Menu Items</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
                  Total: <span className="font-bold">{formatAmount(menuDetails.reduce((sum, item, i) => {
                    const mult = parseFloat(getMultiplier(i)) || 0;
                    return sum + (item.perPortionCost || 0) * pobValue * mult / 100;
                  }, 0), decimalPlaces)}</span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mb-3 border-b border-gray-200 dark:border-gray-700">
            {loadingMenuDetails ? (
              <div className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400">Loading menu details…</div>
            ) : mealTypes.length === 0 ? (
              <div className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400">No menu items</div>
            ) : (
              mealTypes.map(tab => {
                const tabItems = menuDetails.filter(item => item.mealTypeName === tab);
                const tabTotal = tabItems.reduce((sum, item) => {
                  const globalIndex = menuDetails.findIndex(md =>
                    md.menuFk === item.menuFk &&
                    md.categoryFk === item.categoryFk &&
                    md.mealTypeFk === item.mealTypeFk &&
                    md.recipeFk === item.recipeFk
                  );
                  const multValue = parseFloat(getMultiplier(globalIndex)) || 0;
                  const cost = (item.perPortionCost || 0) * (pobValue * multValue / 100);
                  return sum + cost;
                }, 0);
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 font-medium transition-colors text-sm ${
                      activeTab === tab
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    {tab} - Total: {formatAmount(tabTotal, decimalPlaces)}
                  </button>
                );
              })
            )}
          </div>
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">CATEGORY</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">RECIPE</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">PORTION</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">PORTION COST</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">POB PARTICIPATION %</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">COST</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {loadingMenuDetails ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-4 text-center text-xs">
                        <div className="flex flex-col items-center justify-center">
                          <Loader2 size={16} className="animate-spin text-gray-400 dark:text-gray-500 mb-1.5" />
                          <p className="text-xs text-gray-500 dark:text-gray-400">Loading…</p>
                        </div>
                      </td>
                    </tr>
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-6 text-center text-xs text-gray-500 dark:text-gray-400">No items for {activeTab}</td>
                    </tr>
                  ) : (
                    currentItems.map((item) => {
                      const globalIndex = menuDetails.findIndex(md =>
                        md.menuFk === item.menuFk &&
                        md.categoryFk === item.categoryFk &&
                        md.mealTypeFk === item.mealTypeFk &&
                        md.recipeFk === item.recipeFk
                      );
                      const multValue = parseFloat(getMultiplier(globalIndex)) || 0;
                      const portions = pobValue * multValue / 100;
                      const cost = (item.perPortionCost || 0) * portions;
                      const isChanged = item.recipeFk !== item.originalRecipeFk;
                      const isEmpty = !item.recipeFk;
                      const rowKey = `${item.menuFk}-${item.categoryFk}-${item.mealTypeFk}-${item.recipeFk || 'empty'}`;
                      return (
                        <tr key={rowKey} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 px-2 py-1.5 rounded mb-1">
                                {item.categoryName}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-medium ${isEmpty ? 'text-gray-400 italic' : 'text-gray-900 dark:text-white'}`}>
                                {isEmpty ? 'No Recipe' : item.recipeName}
                              </span>
                            </div>
                            {isChanged && !isEmpty && (
                              <span className="ml-0 text-xs text-green-600 dark:text-green-400">(Changed)</span>
                            )}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <span className={`text-sm font-medium ${isEmpty ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                {formatQuantity(item.portionSize || 0, decimalPlaces)}
                              </span>
                              <span className={`text-xs ${isEmpty ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>{item.uom || 'Kg'}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className={`text-sm font-medium ${isEmpty ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                              {formatAmount(item.perPortionCost || 0, decimalPlaces)}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1 font-mono text-xs">
                              <span className="font-semibold text-blue-600 dark:text-blue-400">{pobValue.toFixed(1)}</span>
                              <span>×</span>
                              <input
                                type="number"
                                value={getMultiplier(globalIndex)}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  // Allow: empty string or numbers with up to 3 digits before decimal and 2 after
                                  if (val === '' || /^\d{0,3}(\.\d{0,2})?$/.test(val)) {
                                    // Also validate max value (100000.00)
                                    const numVal = parseFloat(val);
                                    if (val === '' || (numVal >= 0 && numVal <= 100000)) {
                                      setRowMultipliers(prev => ({
                                        ...prev,
                                        [globalIndex]: val
                                      }));
                                    }
                                  }
                                }}
                                onBlur={(e) => {
                                  // Format on blur: ensure 2 decimal places if not empty
                                  const val = e.target.value;
                                  if (val && val !== '') {
                                    const numVal = parseFloat(val);
                                    if (!isNaN(numVal)) {
                                      setRowMultipliers(prev => ({
                                        ...prev,
                                        [globalIndex]: numVal.toFixed(2)
                                      }));
                                    }
                                  }
                                }}
                                className="w-16 px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                                min="0"
                                max="100000"
                                step="0.01"
                                placeholder="100.00"
                              />
                              <span>=</span>
                              <span className={`font-medium text-xs ${isEmpty ? 'text-gray-400' : 'text-green-600 dark:text-green-400'}`}>{formatQuantity(portions, decimalPlaces)}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-center">
                            <span className={`text-sm font-medium ${isEmpty ? 'text-gray-400' : 'text-green-600 dark:text-green-400'}`}>
                              {formatAmount(cost, decimalPlaces)}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-center">
                            <button
                              onClick={() => openRecipeModal(globalIndex)}
                              className="ml-2 px-2 py-1 text-xs rounded-full transition-colors flex items-center justify-center"
                            >
                              {isEmpty ? (
                                // Green plus icon for "Add"
                                <span className="flex items-center justify-center w-8 h-8 bg-green-100 hover:bg-green-200 text-green-600 hover:text-green-700 rounded-full transition-colors">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                  </svg>
                                </span>
                              ) : (
                                // Blue edit icon for "Change"
                                <span className="flex items-center justify-center w-8 h-8 bg-blue-100 hover:bg-blue-200 text-blue-600 hover:text-blue-700 rounded-full transition-colors">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                  </svg>
                                </span>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-600 px-3">
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Recipes: {totalRecipesCount}</div>
              <div className="text-right">
                <div className="text-green-600 dark:text-green-400 font-bold text-sm">Total Cost: {formatAmount(currentTotalCost, decimalPlaces)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// ──────────────────────────────────────────────────────────────
// MAIN COMPONENT: MenuLocationCalendar
// ──────────────────────────────────────────────────────────────
export default function MenuLocationCalendar() {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [menuDate, setMenuDate] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentViewDate, setCurrentViewDate] = useState(today);
  const [showMenuScreenList, setShowMenuScreenList] = useState(false);
  const [listDate, setListDate] = useState(null);
  const [dayMenuItems, setDayMenuItems] = useState({});
  const [loadingDayMenu, setLoadingDayMenu] = useState({});
  const [selectedMenuItem, setSelectedMenuItem] = useState<any>(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [locationError, setLocationError] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [generalModal, setGeneralModal] = useState({ isOpen: false, type: 'success' as 'success' | 'error', message: '' });
  const filteredLocations = useMemo(() => {
    if (!locationSearch) return locations;
    const lower = locationSearch.toLowerCase();
    return locations.filter(loc =>
      loc.code.toLowerCase().includes(lower) ||
      loc.name.toLowerCase().includes(lower)
    );
  }, [locations, locationSearch]);
  const baseUrl = 'https://kelvinmms.com:8443/api-gateway-mms/issue-menu-mms/issueMenuController';
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDayOfWeek = new Date(year, month, 1).getDay();
    return { daysInMonth, startingDayOfWeek, year, month };
  };

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

  // Fetch day menu with proper error handling
  const fetchDayMenu = useCallback(async (date, dayKey) => {
    if (!selectedLocation) return;
 
    const url = `${baseUrl}/issueMenuToLocationList/${selectedLocation}`;
    setLoadingDayMenu(prev => ({ ...prev, [dayKey]: true }));
    try {
      const data = await apiFetch(url, { method: 'GET' });
      if (data.success && Array.isArray(data.data)) {
        const isoDate = date.toLocaleDateString('en-CA');
        const filteredData = data.data.filter((item) => {
          if (!item.menuIssuedDate) return false;
 
          try {
            const itemDate = new Date(item.menuIssuedDate);
            const normalizedItemDate = itemDate.toLocaleDateString('en-CA');
            return normalizedItemDate === isoDate;
          } catch (e) {
            console.warn('Invalid date format:', item.menuIssuedDate);
            return false;
          }
        });
        setDayMenuItems(prev => ({ 
          ...prev, 
          [dayKey]: filteredData 
        }));
      } else {
        setDayMenuItems(prev => ({ 
          ...prev, 
          [dayKey]: [] 
        }));
      }
    } catch (e) {
      console.error('Error fetching day menu:', e);
 
      if (e.message?.includes('Session expired') || 
          e.message?.includes('authentication') || 
          e.message?.includes('Failed to fetch')) {
        setSessionExpired(true);
      } else if (!e.message?.includes('No authentication token')) {
        // Don't show modal for token errors (already handled)
        setGeneralModal({ 
          isOpen: true, 
          type: 'error', 
          message: e.message || 'Failed to load day menu' 
        });
      }
 
      setDayMenuItems(prev => ({ 
        ...prev, 
        [dayKey]: [] 
      }));
    } finally {
      setLoadingDayMenu(prev => ({ 
        ...prev, 
        [dayKey]: false 
      }));
    }
  }, [selectedLocation, baseUrl, apiFetch]);
  // Fetch all days for current month
  const fetchAllDaysForMonth = useCallback(() => {
    if (!selectedLocation) {
      setDayMenuItems({});
      setLoadingDayMenu({});
      return;
    }
 
    const { year, month, daysInMonth } = getDaysInMonth(currentViewDate);
    const newLoading = {};
    const newDayMenuItems = {};
 
    // Clear existing data first
    setDayMenuItems({});
 
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dayKey = d;
 
      newLoading[dayKey] = true;
      newDayMenuItems[dayKey] = []; // Initialize empty
 
      fetchDayMenu(date, dayKey);
    }
 
    setLoadingDayMenu(newLoading);
    setDayMenuItems(newDayMenuItems);
  }, [selectedLocation, currentViewDate, fetchDayMenu]);
  // Centralised API fetch with token + session handling

  useEffect(() => {
    const fetchLocations = async () => {
      setLoadingLocations(true);
      setLocationError(false);
      try {
        const data = await apiFetch(`${baseUrl}/loadLocationDropDown`, { method: 'GET' });
        if (data.success && data.data && Array.isArray(data.data)) {
          setLocations(data.data);
          if (data.data.length > 0 && selectedLocation === null) {
            setSelectedLocation(data.data[0].pk);
          }
        } else {
          setLocationError(true);
          setGeneralModal({ isOpen: true, type: 'error', message: 'No location records found in the response.' });
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        if (error.message?.includes('Session expired') || 
            error.message?.includes('authentication') || 
            error.message?.includes('Failed to fetch')) {
          setSessionExpired(true);
        } else {
          setLocationError(true);
          setGeneralModal({ 
            isOpen: true, 
            type: 'error', 
            message: error.message || 'Failed to load locations' 
          });
        }
      } finally {
        setLoadingLocations(false);
      }
    };
 
    fetchLocations();
  }, []);
  // Refresh day menus when location or month changes
  useEffect(() => {
    fetchAllDaysForMonth();
  }, [selectedLocation, currentViewDate.getMonth(), currentViewDate.getFullYear()]);
  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };
  const handleShowCalendar = () => setShowCalendar(true);
  useEffect(() => {
    if (selectedLocation !== null) setShowCalendar(true);
  }, [selectedLocation]);
  const openAddMenu = (date) => {
    setMenuDate(date);
    setShowAddMenu(true);
  };
  const openMenuScreenList = (date: Date, menuItem?: any) => {
    setListDate(date);
    setSelectedMenuItem(menuItem);
    setShowMenuScreenList(true);
  };
  const handleBackFromList = () => {
    setShowMenuScreenList(false);
    setListDate(null);
  };
  const handleBack = () => {
    setShowAddMenu(false);
    setMenuDate(null);
 
    // Refresh the specific day that was modified
    if (menuDate && selectedLocation) {
      const day = menuDate.getDate();
      const { year, month } = getDaysInMonth(currentViewDate);
 
      if (year === menuDate.getFullYear() && month === menuDate.getMonth()) {
        fetchDayMenu(menuDate, day);
      }
    }
  };
  if (showAddMenu) {
    return (
      <AddMenuScreen
        selectedDate={menuDate}
        onBack={handleBack}
        apiFetch={apiFetch}
        baseUrl={baseUrl}
        selectedLocation={selectedLocation}
        sessionExpired={sessionExpired}
        setParentSessionExpired={setSessionExpired}
        generalModal={generalModal}
        setGeneralModal={setGeneralModal}
      />
    );
  }
  if (showMenuScreenList && listDate) {
    return <MenuScreenList
      selectedDate={listDate}
      selectedMenuItem={selectedMenuItem}
      onBack={handleBackFromList}
      apiFetch={apiFetch}
      baseUrl={baseUrl}
    />;
  }
  // Show session expired modal if session is expired
  if (sessionExpired) {
    return <SessionExpiredModal onLogin={() => {
      sessionStorage.removeItem('token');
      localStorage.removeItem('token');
      window.location.href = '/';
    }} />;
  }
  if (generalModal.isOpen) {
    return <GeneralStatusModal modal={generalModal} onClose={() => setGeneralModal({ isOpen: false, type: 'success', message: '' })} />;
  }
  const navigate = (dir) => {
    const next = new Date(currentViewDate);
    next.setMonth(currentViewDate.getMonth() + dir);
    setCurrentViewDate(next);
  };
  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentViewDate);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const renderDays = () => {
    const cells = [];
    const prevMonthLast = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      cells.push(
        <div key={`prev-${i}`} className="border border-gray-200 dark:border-gray-700 p-2 min-h-[80px] bg-gray-50 dark:bg-gray-800">
          <div className="text-gray-400 dark:text-gray-500 text-xs">{prevMonthLast - i}</div>
        </div>
      );
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const cur = new Date(year, month, d);
      const dayKey = d;
      const isToday = cur.toDateString() === today.toDateString();
      cells.push(
        <div
          key={d}
          className={`border border-gray-200 dark:border-gray-700 p-2 min-h-[80px] bg-white dark:bg-gray-800 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 relative group overflow-hidden transition-all duration-200 ${isToday ? 'ring-2 ring-blue-200 dark:ring-blue-800 bg-blue-50 dark:bg-blue-900/20' : ''}`}
        >
          <div className="text-gray-700 dark:text-gray-300 text-xs font-medium mb-2">{d}</div>
          {loadingDayMenu[dayKey] ? (
            <div className="text-xs text-gray-500 dark:text-gray-400">Loading...</div>
          ) : dayMenuItems[dayKey]?.length > 0 ? (
            <div className="space-y-1 mb-2 max-h-16 overflow-y-auto">
              {dayMenuItems[dayKey].map((item) => (
                <div
                  key={item.id}
                  onClick={() => openMenuScreenList(cur, item)}
                  className="cursor-pointer px-1.5 py-0.5 text-xs bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-100 dark:hover:bg-blue-500 transition-colors border border-blue-200 dark:border-blue-700"
                >
                  {item.name}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-400 dark:text-gray-500 italic h-12 flex items-center justify-center">No menu issued</div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              openAddMenu(cur);
            }}
            className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-blue-600 dark:bg-blue-700 text-white text-sm font-light hover:bg-blue-700 dark:hover:bg-blue-800 opacity-0 group-hover:opacity-100 z-10 transition-all duration-200 shadow-md hover:shadow-lg"
            title="Add menu"
          >
            +
          </button>
        </div>
      );
    }
    const total = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;
    for (let i = cells.length; i < total; i++) {
      cells.push(
        <div key={`next-${i}`} className="border border-gray-200 dark:border-gray-700 p-2 min-h-[80px] bg-gray-50 dark:bg-gray-800">
          <div className="text-gray-400 dark:text-gray-500 text-xs">{i - cells.length + 1}</div>
        </div>
      );
    }
    return cells;
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      {generalModal.isOpen && <GeneralStatusModal modal={generalModal} onClose={() => setGeneralModal({ isOpen: false, type: 'success', message: '' })} />}
      <div className="max-w-7xl mx-auto">
        <h1
          onClick={handleShowCalendar}
          className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4 cursor-pointer hover:text-blue-700 dark:hover:text-blue-500 transition-colors"
        >
          Issue Menu To Location
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-3">
            <div className="relative flex-1 max-w-xs">
              <button
                onClick={() => toggleDropdown('location')}
                disabled={loadingLocations}
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-left flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-500 transition-colors text-gray-700 dark:text-gray-300 text-sm disabled:opacity-60"
              >
                <span className="truncate">
                  {loadingLocations
                    ? 'Loading locations...'
                    : locationError
                      ? 'Failed to load'
                      : selectedLocation === null
                        ? 'All Locations'
                        : `${locations.find(l => l.pk === selectedLocation)?.code} - ${locations.find(l => l.pk === selectedLocation)?.name}`}
                </span>
                <ChevronDown size={16} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
              </button>
              {openDropdown === 'location' && !loadingLocations && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  <div className="sticky top-0 bg-white dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 p-2">
                    <input
                      type="text"
                      placeholder="Search location..."
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setSelectedLocation(null);
                      setOpenDropdown(null);
                      setLocationSearch('');
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors text-sm font-medium"
                  >
                    All Locations
                  </button>
                  {filteredLocations.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">No locations found</div>
                  ) : (
                    filteredLocations.map(loc => (
                      <button
                        key={loc.pk}
                        onClick={() => {
                          setSelectedLocation(loc.pk);
                          setOpenDropdown(null);
                          setLocationSearch('');
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors text-sm"
                      >
                        {loc.code} - {loc.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            <CalendarDatePicker
              id="month-year-picker"
              label="Month/Year"
              selected={currentViewDate}
              onChange={(date) => {
                setCurrentViewDate(date);
                setSelectedDate(date);
              }}
              placeholder="MM/YYYY"
              className="flex-1 max-w-xs"
            />
          </div>
        </div>
        {showCalendar ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Calendar View</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-base font-semibold text-gray-700 dark:text-gray-300 min-w-[100px] text-center">
                  {year}-{String(month + 1).padStart(2, "0")}
                </span>
                <button
                  onClick={() => navigate(1)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-0 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-inner">
              {dayNames.map((day, idx) => (
                <div
                  key={day}
                  className={`border-r border-b border-gray-200 dark:border-gray-700 p-2 bg-gray-100 dark:bg-gray-700 text-center font-semibold text-gray-700 dark:text-gray-300 text-xs ${
                    idx === dayNames.length - 1 ? "border-r-0" : ""
                  }`}
                >
                  {day}
                </div>
              ))}
              {renderDays()}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-base text-gray-500 dark:text-gray-400">Click the title above or select a location to view the calendar.</p>
          </div>
        )}
      </div>
    </div>
  );
}