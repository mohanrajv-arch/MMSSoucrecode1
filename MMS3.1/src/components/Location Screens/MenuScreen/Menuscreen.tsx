import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { ChevronDown, X, CheckCircle, AlertCircle } from "lucide-react";
import { useCredentials } from "src/context/AuthContext";
import MenuScreenList2 from "./menuscreen2";
import SearchableSelect from "src/components/Spa Components/DropdownSearch";
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
// GeneralStatusModal Component
// ──────────────────────────────────────────────────────────────
function GeneralStatusModal({ modal, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
        <div className="flex justify-center mb-4">
          {modal.type === 'success' ? (
            <CheckCircle className="h-12 w-12 text-green-500" />
          ) : (
            <AlertCircle className="h-12 w-12 text-red-500" />
          )}
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          {modal.type === 'success' ? 'Success!' : 'Error!'}
        </h2>
        <p className="text-sm text-gray-600 mb-4">{modal.message}</p>
        <button
          onClick={onClose}
          className={`px-4 py-2 text-white rounded-lg hover:opacity-90 transition ${
            modal.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
          }`}
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
function CalendarDatePicker({ id, onChange, label, selected, className = "", required = false, placeholder, placeholderText }) {
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
    const startYear = currentYearActual - 10;
    const endYear = currentYearActual + 5;
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push(year);
    }
    return years;
  };
  const yearOptions = getYearOptions();
  return (
    <div className={`relative ${className}`} ref={calendarRef}>
      <fieldset className="relative border border-gray-300 rounded-md">
        {label && (
          <legend className="ml-2 px-1 text-xs text-gray-600">
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
            className="w-full bg-transparent border-0 outline-none focus:outline-none text-sm text-gray-900 cursor-pointer p-1"
          />
          <span className="absolute right-4 top-3 -translate-y-1/2 text-gray-500 pointer-events-none">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </span>
        </div>
      </fieldset>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 p-4 w-80">
          <div className="flex gap-2 mb-4">
            <select
              value={currentMonth}
              onChange={(e) => handleMonthChange(Number(e.target.value))}
              className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded bg-transparent text-gray-900 outline-none focus:border-blue-500"
            >
              {monthNames.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
            <select
              value={currentYear}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded bg-transparent text-gray-900 outline-none focus:border-blue-500"
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
// ChangeRecipeModal Component
// ──────────────────────────────────────────────────────────────
function ChangeRecipeModal({
  isOpen,
  onClose,
  currentRecipe,
  categoryFk,
  usedRecipes,
  currentRecipePk,
  apiFetch,
  baseUrl,
  onRecipeChange,
  generalModal,
  setGeneralModal
}) {
  const decimalPlaces = 2;
  const formatAmount = (value, places) => Number(value || 0).toFixed(places);
  const formatQuantity = (value, places) => Number(value || 0).toFixed(places);
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [recipeOptions, setRecipeOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipeDetails, setSelectedRecipeDetails] = useState(null);
  useEffect(() => {
    if (currentRecipePk) {
      setSelectedRecipeId(currentRecipePk);
    } else {
      setSelectedRecipeId('');
    }
  }, [currentRecipePk]);
  useEffect(() => {
    const fetchRecipes = async () => {
      if (!categoryFk || !isOpen) return;
      setLoading(true);
      try {
        console.log('Fetching recipes for categoryFk:', categoryFk);
        const response = await apiFetch(
          `${baseUrl}/loadRecipeMasterDropDown/${categoryFk}`,
          { method: 'GET' }
        );
        console.log('Recipe API full response:', response);
        if (Array.isArray(response.data)) {
          let allOptions = response.data;
          const current = allOptions.find(r => r.pk === currentRecipePk);
          allOptions = allOptions.filter(r => r.pk === currentRecipePk || !usedRecipes.includes(r.pk));
          setRecipeOptions(allOptions);
          if (current) {
            setSelectedRecipeId(current.pk);
            setSelectedRecipeDetails(current);
          } else if (allOptions.length > 0) {
            const first = allOptions[0];
            setSelectedRecipeId(first.pk);
            setSelectedRecipeDetails(first);
          } else {
            setSelectedRecipeId('');
            setSelectedRecipeDetails(null);
          }
        } else {
          console.warn('No recipes found or invalid response:', response);
          setRecipeOptions([]);
          setSelectedRecipeId('');
          setSelectedRecipeDetails(null);
        }
      } catch (error) {
        console.error('Failed to load recipes:', error);
        if (error.message?.includes('Session expired') || error.message?.includes('authentication') || error.message?.includes('Failed to fetch')) {
          if (setGeneralModal) {
            setGeneralModal({ isOpen: true, type: 'error', message: 'Session expired. Please login again.' });
          }
        }
        setRecipeOptions([]);
        setSelectedRecipeId('');
        setSelectedRecipeDetails(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, [categoryFk, isOpen, currentRecipePk, apiFetch, baseUrl, usedRecipes]);
  useEffect(() => {
    if (selectedRecipeId && recipeOptions.length > 0) {
      const details = recipeOptions.find(recipe => recipe.pk === selectedRecipeId);
      setSelectedRecipeDetails(details);
    } else {
      setSelectedRecipeDetails(null);
    }
  }, [selectedRecipeId, recipeOptions]);
  const handleApplyChange = () => {
    if (selectedRecipeDetails && onRecipeChange) {
      onRecipeChange(selectedRecipeDetails);
    }
    onClose();
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Change Recipe</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Recipe
            </label>
            <div className="bg-gray-50 rounded-md p-4 flex justify-between items-center">
              <span className="text-gray-900 font-semibold">{currentRecipe || 'No recipe selected'}</span>
              <span className="text-gray-500">
                {selectedRecipeDetails ? `${formatQuantity(selectedRecipeDetails.portionSize, decimalPlaces)} ${selectedRecipeDetails.uom}` : 'Loading...'}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select New Recipe
            </label>
            <SearchableSelect
              options={recipeOptions}
              value={selectedRecipeId}
              onChange={(newValue) => setSelectedRecipeId(newValue)}
              placeholder={loading ? "Loading recipes..." : "Search and select recipe"}
              disabled={loading}
              displayKey="name"
              valueKey="pk"
              className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {selectedRecipeDetails && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                New Recipe Details
              </label>
              <div className="bg-gray-50 rounded-md p-4 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Portion:</div>
                  <div className="text-2xl font-semibold text-blue-600">
                    {formatQuantity(selectedRecipeDetails.portionSize, decimalPlaces)} {selectedRecipeDetails.uom}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Cost:</div>
                  <div className="text-2xl font-semibold text-blue-600">
                    {formatAmount(selectedRecipeDetails.perPortionCost || 0, decimalPlaces)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyChange}
            disabled={!selectedRecipeDetails || loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Apply Change
          </button>
        </div>
      </div>
    </div>
  );
}
// ──────────────────────────────────────────────────────────────
// AddMenuScreen Component
// ──────────────────────────────────────────────────────────────
function AddMenuScreen({ selectedDate, onBack, apiFetch, baseUrl, selectedLocation, sessionExpired: parentSessionExpired, setParentSessionExpired, generalModal: parentGeneralModal, setParentGeneralModal }) {
  const credentials = useCredentials();
  const userId = credentials?.userId || 659;
  const decimalPlaces = 2;
  const formatAmount = (value, places) => Number(value || 0).toFixed(places);
  const formatQuantity = (value, places) => Number(value || 0).toFixed(places);
  const [activeTab, setActiveTab] = useState('BREAKFAST');
  const [isChangeRecipeOpen, setIsChangeRecipeOpen] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState('');
  const [currentRecipeIndex, setCurrentRecipeIndex] = useState(null);
  const [currentRecipePk, setCurrentRecipePk] = useState(null);
  const [menuDetails, setMenuDetails] = useState([]);
  const [loadingMenuDetails, setLoadingMenuDetails] = useState(false);
  const [multiplier, setMultiplier] = useState('100.0');
  const [rowMultipliers, setRowMultipliers] = useState({});
  const [changedRecipes, setChangedRecipes] = useState({});
  const [saving, setSaving] = useState(false);
  const [currentCategoryFk, setCurrentCategoryFk] = useState<number | null>(null);
  const [sessionExpired, setSessionExpired] = useState(parentSessionExpired || false);
  const [generalModal, setGeneralModal] = useState(parentGeneralModal || { isOpen: false, type: 'success', message: '' });
  const [formData, setFormData] = useState({
    date: '',
    finalMenuSet: '',
    finalMenuFk: null,
    customPOB: '0',
    priority: 'Normal',
    notes: ''
  });
  const [finalMenuSets, setFinalMenuSets] = useState([]);
  const [loadingFinalMenus, setLoadingFinalMenus] = useState(true);
  const getMultiplier = (index) => {
    return rowMultipliers[index] ?? '100.0';
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
    const selectedMenu = finalMenuSets.find(m => m.name === formData.finalMenuSet);
    if (!selectedMenu) return;
    setFormData(prev => ({ ...prev, finalMenuFk: selectedMenu.pk }));
    const fetchMenuDetails = async () => {
      setLoadingMenuDetails(true);
      try {
        const data = await localApiFetch(`${baseUrl}/finalMenuDetailsByPk/${selectedMenu.pk}`, { method: 'GET' });
        console.log('Menu details response:', data);
        if (data.success && data.data?.menuDetail && Array.isArray(data.data.menuDetail)) {
          const details = data.data.menuDetail.map(item => ({
            ...item,
            originalRecipeFk: item.recipeFk,
            originalRecipeName: item.recipeName,
            originalPortionSize: item.portionSize,
            originalUom: item.uom,
            originalPerPortionCost: item.perPortionCost,
          }));
          setMenuDetails(details);
          const init = {};
          details.forEach((_, i) => (init[i] = '100.0'));
          setRowMultipliers(init);
        } else {
          setMenuDetails([]);
        }
      } catch (e) {
        console.error('Failed to load menu details', e);
        if (e.message?.includes('Session expired') || e.message?.includes('authentication') || e.message?.includes('Failed to fetch')) {
          handleSessionExpired();
        } else {
          setGeneralModal({ isOpen: true, type: 'error', message: e.message || 'Failed to load menu details' });
          setMenuDetails([]);
        }
      } finally {
        setLoadingMenuDetails(false);
      }
    };
    fetchMenuDetails();
  }, [formData.finalMenuSet, finalMenuSets, localApiFetch, baseUrl]);
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
  const handleChangeRecipe = (recipeName: string, index: number, categoryFk: number, mealTypeName: string) => {
    const row = menuDetails[index];
    const usedRecipes = menuDetails.filter((item, i) => i !== index && item.mealTypeName === mealTypeName).map(item => item.recipeFk);
    setCurrentRecipe(recipeName);
    setCurrentRecipePk(row.recipeFk);
    setCurrentRecipeIndex(index);
    setCurrentCategoryFk(categoryFk);
    setIsChangeRecipeOpen(true);
  };
  const handleRecipeChange = (newRecipeDetails: any) => {
    if (currentRecipeIndex === null) return;
    const idx = currentRecipeIndex;
    const row = menuDetails[idx];
    const existingInSameMealType = menuDetails.filter((item, i) =>
      i !== idx &&
      item.recipeFk === newRecipeDetails.pk &&
      item.mealTypeName === row.mealTypeName
    );
    if (existingInSameMealType.length > 0) {
      setGeneralModal({
        isOpen: true,
        type: 'error',
        message: `Recipe "${newRecipeDetails.name}" is already used in ${row.mealTypeName}. Please select another recipe.`
      });
      return;
    }
    setChangedRecipes(prev => ({
      ...prev,
      [idx]: {
        menuFk: row.menuFk,
        categoryFk: row.categoryFk,
        recipeFk: newRecipeDetails.pk,
      },
    }));
    const updated = [...menuDetails];
    updated[idx] = {
      ...updated[idx],
      recipeName: newRecipeDetails.name,
      recipeFk: newRecipeDetails.pk,
      portionSize: newRecipeDetails.portionSize,
      uom: newRecipeDetails.uom,
      perPortionCost: newRecipeDetails.perPortionCost,
      originalRecipeFk: row.originalRecipeFk,
      originalRecipeName: row.originalRecipeName,
      originalPortionSize: row.originalPortionSize,
      originalUom: row.originalUom,
      originalPerPortionCost: row.originalPerPortionCost,
    };
    setMenuDetails(updated);
  };
  const handleSaveMenu = async () => {
    if (!formData.finalMenuFk || !selectedDate) {
      setGeneralModal({ isOpen: true, type: 'error', message: 'Please select a final menu set and date' });
      return;
    }
    setSaving(true);
    try {
      const apiDate = selectedDate.toISOString().split('T')[0];
      const changedDetails = menuDetails.map((item, i) => ({
        menuFk: item.menuFk,
        categoryFk: item.categoryFk,
        recipeFk: item.recipeFk,
        pobParticipation: parseFloat(getMultiplier(i)) || 100.0,
      }));
      const menuDetail = menuDetails.map((item, i) => ({
        menuFk: item.menuFk,
        categoryFk: item.categoryFk,
        recipeFk: item.originalRecipeFk,
        pobParticipation: parseFloat(getMultiplier(i)) || 100.0,
      }));
      const totalCost = menuDetails.reduce((sum, item, i) => {
        const mult = parseFloat(getMultiplier(i)) || 0;
        return sum + item.perPortionCost * pobValue * mult / 100;
      }, 0);
      const saveData = {
        finalMenuFk: formData.finalMenuFk,
        notes: formData.notes || `Menu issued for ${apiDate}`,
        locationFk: selectedLocation || 1,
        pob: pobValue,
        totalCost: parseFloat(totalCost.toFixed(decimalPlaces)),
        createdBy: userId,
        menuIssuedDate: apiDate,
        changedDetails,
        menuDetail,
      };
      console.log('POST /saveIssuedMenu payload:', saveData);
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
  if (sessionExpired) {
    return <SessionExpiredModal onLogin={() => {
      sessionStorage.removeItem('token');
      localStorage.removeItem('token');
      window.location.href = '/';
    }} />;
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {generalModal.isOpen && (
        <GeneralStatusModal
          modal={generalModal}
          onClose={() => setGeneralModal({ isOpen: false, type: 'success', message: '' })}
        />
      )}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Add Menu to Calendar</h1>
        </div>
      </div>
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="text"
                value={formData.date}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Final Menu Set</label>
              <select
                value={formData.finalMenuSet}
                onChange={(e) => {
                  const selected = finalMenuSets.find(m => m.name === e.target.value);
                  setFormData({
                    ...formData,
                    finalMenuSet: e.target.value,
                    finalMenuFk: selected?.pk || null
                  });
                }}
                disabled={loadingFinalMenus}
                className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
              >
                <option value="">Select Menu</option>
                {finalMenuSets.map((menu) => (
                  <option key={menu.pk} value={menu.name}>
                    {menu.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Custom POB</label>
              <input
                type="text"
                value={formData.customPOB}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^\d{0,5}$/.test(val)) {
                    setFormData(prev => ({ ...prev, customPOB: val }));
                  }
                }}
                onBlur={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setFormData(prev => ({ ...prev, customPOB: '0' }));
                  } else if (/^\d+$/.test(val)) {
                    const numVal = parseInt(val, 10);
                    if (!isNaN(numVal)) {
                      setFormData(prev => ({ ...prev, customPOB: numVal.toString() }));
                    }
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option>Normal</option>
                <option>High</option>
                <option>Low</option>
              </select>
            </div>
          </div>
        
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={2}
              placeholder="Additional notes..."
            />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Menu Items</h2>
        
          <div className="flex gap-4 mb-4 border-b border-gray-200">
            {loadingMenuDetails ? (
              <div className="px-4 py-2 text-sm text-gray-500">Loading menu details…</div>
            ) : mealTypes.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500">No menu items</div>
            ) : (
              mealTypes.map(tab => {
                const tabItems = menuDetails.filter(item => item.mealTypeName === tab);
                const tabTotal = tabItems.reduce((sum, item, index) => {
                  const globalIndex = menuDetails.findIndex(md =>
                    md.menuFk === item.menuFk &&
                    md.categoryFk === item.categoryFk &&
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
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeTab === tab
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {tab} - Total: {formatAmount(tabTotal, decimalPlaces)}
                  </button>
                );
              })
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border border-gray-300">CATEGORY</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border border-gray-300">RECIPE</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border border-gray-300">PORTION</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border border-gray-300">PORTION COST</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border border-gray-300">POB PARTICIPATION %</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border border-gray-300">COST</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border border-gray-300">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {loadingMenuDetails ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading…</td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No items for {activeTab}</td>
                  </tr>
                ) : (
                  currentItems.map((item, index) => {
                    const globalIndex = menuDetails.findIndex(md =>
                      md.menuFk === item.menuFk &&
                      md.categoryFk === item.categoryFk &&
                      md.recipeFk === item.recipeFk
                    );
                  
                    const multValue = parseFloat(getMultiplier(globalIndex)) || 0;
                    const portions = pobValue * multValue / 100;
                    const cost = item.perPortionCost * portions;
                    return (
                      <tr key={globalIndex} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700 border border-gray-300">{item.categoryName}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 border border-gray-300">
                          {item.recipeName}
                          {changedRecipes[globalIndex] && (
                            <span className="ml-2 text-xs text-green-600">(Changed)</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 border border-gray-300">
                          {formatQuantity(item.portionSize, decimalPlaces)} {item.uom}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 border border-gray-300">
                          {formatAmount(item.perPortionCost || 0, decimalPlaces)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 border border-gray-300">
                          <div className="flex items-center gap-1 font-mono text-sm">
                            <span className="font-semibold text-blue-600">{pobValue}</span>
                            <span>×</span>
                            <input
                              type="text"
                              value={getMultiplier(globalIndex)}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === '' || /^\d{0,3}(\.\d{0,2})?$/.test(val)) {
                                  const numVal = parseFloat(val);
                                  if (val === '' || (numVal >= 0 && numVal <= 100000)) {
                                    setRowMultipliers(prev => ({ ...prev, [globalIndex]: val }));
                                  }
                                }
                              }}
                              onBlur={(e) => {
                                const val = e.target.value;
                                if (val === '') {
                                  setRowMultipliers(prev => ({ ...prev, [globalIndex]: '100.00' }));
                                } else {
                                  const numVal = parseFloat(val);
                                  if (!isNaN(numVal)) {
                                    setRowMultipliers(prev => ({ ...prev, [globalIndex]: numVal.toFixed(2) }));
                                  }
                                }
                              }}
                              className="w-16 px-1 py-0.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                              placeholder="100.00"
                            />
                            <span>=</span>
                            <span className="font-medium text-green-600">{formatQuantity(portions, decimalPlaces)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-green-600 border border-gray-300">
                          {formatAmount(cost, decimalPlaces)}
                        </td>
                        <td className="px-4 py-3 text-sm border border-gray-300">
                          <button
                            onClick={() => handleChangeRecipe(item.recipeName, globalIndex, item.categoryFk, item.mealTypeName)}
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            Change Recipe
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveMenu}
            disabled={saving || !formData.finalMenuFk}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {saving ? 'Saving...' : 'Save Menu'}
          </button>
        </div>
      </div>
      <ChangeRecipeModal
        isOpen={isChangeRecipeOpen}
        onClose={() => {
          setIsChangeRecipeOpen(false);
          setCurrentCategoryFk(null);
        }}
        currentRecipe={currentRecipe}
        categoryFk={currentCategoryFk}
        usedRecipes={[]}
        currentRecipePk={currentRecipePk}
        apiFetch={localApiFetch}
        baseUrl={baseUrl}
        onRecipeChange={handleRecipeChange}
        generalModal={generalModal}
        setGeneralModal={setGeneralModal}
      />
    </div>
  );
}
export default function Menu() {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [menuDate, setMenuDate] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const today = new Date();
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
  const [generalModal, setGeneralModal] = useState({ isOpen: false, type: 'success' as 'success' | 'error', message: '' });
  const [locationSearch, setLocationSearch] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const credentials = useCredentials();
  const userId = credentials?.userId || 659;
const filteredLocations = useMemo(() => {
    if (!locationSearch) return locations;
    const lower = locationSearch.toLowerCase();
    return locations.filter(loc =>
      loc.code.toLowerCase().includes(lower) ||
      loc.name.toLowerCase().includes(lower)
    );
  }, [locations, locationSearch]);
  const baseUrl = 'https://kelvinmms.com:8443/api-gateway-mms/issue-menu-mms/issueMenuController';

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
      } catch (e) {
        // Not JSON
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
  }, [selectedLocation, baseUrl]);

  // Fetch all days for current month
  const fetchAllDaysForMonth = useCallback(() => {
    if (!selectedLocation) {
      setDayMenuItems({});
      setLoadingDayMenu({});
      return;
    }
    
    const { year, month, daysInMonth } = getDaysInMonth(currentViewDate);
    const promises = [];
    const newLoading = {};
    const newDayMenuItems = {};
    
    // Clear existing data first
    setDayMenuItems({});
    
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dayKey = d;
      
      newLoading[dayKey] = true;
      newDayMenuItems[dayKey] = []; // Initialize empty
      
      promises.push(fetchDayMenu(date, dayKey));
    }
    
    setLoadingDayMenu(newLoading);
    setDayMenuItems(newDayMenuItems);
    
    // Optional: Wait for all promises if needed
    // Promise.allSettled(promises).then(results => {
    //   console.log('All day menu fetches completed');
    // });
  }, [selectedLocation, currentViewDate, fetchDayMenu]);

  // Load locations
  useEffect(() => {
    const fetchLocations = async () => {
      setLoadingLocations(true);
      setLocationError(false);
      try {
        const data = await apiFetch(`${baseUrl}/loadUserLocationDropDown/${userId}`, { 
          method: 'GET' 
        });
        
        if (data.success && data.data && Array.isArray(data.data)) {
          setLocations(data.data);
          if (data.data.length > 0 && selectedLocation === null) {
            setSelectedLocation(data.data[0].pk);
          }
        } else {
          setLocationError(true);
          setGeneralModal({ 
            isOpen: true, 
            type: 'error', 
            message: 'No location records found in the response.' 
          });
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
  }, [userId]);

  // Refresh day menus when location or month changes
  useEffect(() => {
    fetchAllDaysForMonth();
  }, [selectedLocation, currentViewDate.getMonth(), currentViewDate.getFullYear()]);

  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  useEffect(() => {
    if (selectedLocation !== null) {
      setShowCalendar(true);
    }
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

  if (sessionExpired) {
    return <SessionExpiredModal onLogin={() => {
      sessionStorage.removeItem('token');
      localStorage.removeItem('token');
      window.location.href = '/';
    }} />;
  }
  if (generalModal.isOpen && !showAddMenu && !showMenuScreenList) {
    return <GeneralStatusModal modal={generalModal} onClose={() => setGeneralModal({ isOpen: false, type: 'success', message: '' })} />;
  }
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
    return <MenuScreenList2
      selectedDate={listDate}
      selectedMenuItem={selectedMenuItem}
      onBack={handleBackFromList}
      apiFetch={apiFetch}
      baseUrl={baseUrl}
    />;
  }
  
 const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDayOfWeek = new Date(year, month, 1).getDay();
    return { daysInMonth, startingDayOfWeek, year, month };
  };

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
        <div key={`prev-${i}`} className="border border-gray-200 p-3 min-h-[100px] bg-gray-50">
          <div className="text-gray-400 text-sm">{prevMonthLast - i}</div>
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
          className={`border border-gray-200 p-3 min-h-[100px] bg-white hover:shadow-md hover:border-gray-300 relative group overflow-hidden transition-all duration-200 ${isToday ? 'ring-2 ring-blue-200 bg-blue-50' : ''}`}
        >
          <div className="text-gray-700 text-sm font-medium mb-3">{d}</div>
          {loadingDayMenu[dayKey] ? (
            <div className="text-xs text-gray-500">Loading...</div>
          ) : dayMenuItems[dayKey]?.length > 0 ? (
            <div className="space-y-1 mb-2 max-h-20 overflow-y-auto">
              {dayMenuItems[dayKey].map((item) => (
                <div
                  key={item.id}
                  onClick={() => openMenuScreenList(cur, item)}
                  className="cursor-pointer px-2 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors border border-blue-200"
                >
                  {item.name}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-400 italic h-16 flex items-center justify-center">No menu issued</div>
          )}
         
        </div>
      );
    }
    // Fill remaining cells
    const total = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;
    for (let i = cells.length; i < total; i++) {
      cells.push(
        <div key={`next-${i}`} className="border border-gray-200 p-3 min-h-[100px] bg-gray-50">
          <div className="text-gray-400 text-sm">{i - cells.length + 1}</div>
        </div>
      );
    }
    return cells;
  };
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {generalModal.isOpen && <GeneralStatusModal modal={generalModal} onClose={() => setGeneralModal({ isOpen: false, type: 'success', message: '' })} />}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-600 mb-6">
          Menu Screen
        </h1>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-xs">
              <button
                onClick={() => toggleDropdown('location')}
                disabled={loadingLocations}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-gray-400 transition-colors text-gray-700 text-sm disabled:opacity-60"
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
                <ChevronDown size={16} className="text-gray-500 flex-shrink-0" />
              </button>
              {openDropdown === 'location' && !loadingLocations && (
                <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b border-gray-200 p-2">
                    <input
                      type="text"
                      placeholder="Search location..."
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setSelectedLocation(null);
                      setOpenDropdown(null);
                      setLocationSearch('');
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 text-gray-700 transition-colors text-sm font-medium"
                  >
                    All Locations
                  </button>
                  {filteredLocations.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500">No locations found</div>
                  ) : (
                    filteredLocations.map(loc => (
                      <button
                        key={loc.pk}
                        onClick={() => {
                          setSelectedLocation(loc.pk);
                          setOpenDropdown(null);
                          setLocationSearch('');
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 text-gray-700 transition-colors text-sm"
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
              }}
              placeholder="MM/YYYY"
              className="flex-1 max-w-xs"
            />
          </div>
        </div>
        {showCalendar ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Calendar View</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-lg font-semibold text-gray-700 min-w-[100px] text-center">
                  {year}-{String(month + 1).padStart(2, "0")}
                </span>
                <button
                  onClick={() => navigate(1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
              {dayNames.map((day, idx) => (
                <div
                  key={day}
                  className={`border-r border-b border-gray-200 p-3 bg-gray-100 text-center font-semibold text-gray-700 text-sm ${
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
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <p className="text-lg text-gray-500">Click the title above or select a location to view the calendar.</p>
          </div>
        )}
      </div>
    </div>
  );
}