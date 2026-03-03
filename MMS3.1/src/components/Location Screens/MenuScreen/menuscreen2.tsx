import { useState, useEffect, useCallback } from "react";
import { Eye, ArrowLeft, X, Download, Save, FileDown, FileSpreadsheet, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth, useCredentials, useFormatAmount, useFormatDate, useFormatQuantity } from "src/context/AuthContext";
import SearchableSelect from "src/components/Spa Components/DropdownSearch";

interface DetailItem {
  id?: number;
  issueMenuDFk?: number;
  issueMenuHFk?: number;
  menuFk?: number;
  mealTypeFk: number;
  mealTypeName: string;
  menuName: string;
  categoryFk: number;
  categoryName: string;
  recipeFk: number | null;
  recipeName: string;
  pobParticipation: number;
  portionSize: number | null;
  perPortionCost: number | null;
  totalCost: number;
  locationName?: string;
  locationCode?: string;
  uom: string | null;
}

interface MenuScreenListProps {
  selectedDate: Date;
  selectedMenuItem?: any;
  onBack: () => void;
  apiFetch: (url: string, opts?: any) => Promise<any>;
  baseUrl: string;
}

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
          Recipe <span className="font-semibold text-red-600 dark:text-red-400">"{duplicateRecipeName}"</span> is already used
        </p>
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
// ChangeRecipeModal Component
// ──────────────────────────────────────────────────────────────
function ChangeRecipeModal({
  isOpen,
  onClose,
  currentRecipe,
  currentRecipeDetails,
  categoryFk,
  usedRecipes,
  currentRecipePk,
  formatAmount,
  formatQuantity,
  costDecimalPlaces,
  quantityDecimalPlaces,
  loading,
  selectedRecipeId,
  onSelectChange,
  recipeOptions,
  selectedRecipeDetails,
  onRecipeChange
}) {
  const handleApplyChange = () => {
    if (!selectedRecipeId || selectedRecipeId === '') {
      onRecipeChange(null);
    } else if (selectedRecipeDetails && onRecipeChange) {
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
                {currentRecipeDetails && currentRecipeDetails.pk !== '' ? `${formatQuantity(currentRecipeDetails.portionSize, quantityDecimalPlaces)} ${currentRecipeDetails.uom}` : 'N/A'}
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
              onChange={onSelectChange}
              placeholder={loading ? "Loading recipes..." : "Select Recipe"}
              disabled={loading}
              displayKey="name"
              valueKey="pk"
              className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {selectedRecipeDetails && selectedRecipeDetails.pk !== '' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                New Recipe Details
              </label>
              <div className="bg-gray-50 rounded-md p-4 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Portion:</div>
                  <div className="text-2xl font-semibold text-blue-600">
                    {formatQuantity(selectedRecipeDetails.portionSize, quantityDecimalPlaces)} {selectedRecipeDetails.uom}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Cost:</div>
                  <div className="text-2xl font-semibold text-blue-600">
                    {formatAmount(selectedRecipeDetails.perPortionCost || 0, costDecimalPlaces)}
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
            disabled={loading}
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

export default function MenuScreenList2({
  selectedDate,
  selectedMenuItem,
  onBack,
  apiFetch,
  baseUrl,
}: MenuScreenListProps) {
  const { projectSettings } = useAuth();
  const formatDate = useFormatDate();
  const formatAmount = useFormatAmount();
  const formatQuantity = useFormatQuantity();
  const showActionColumn = projectSettings?.recipeModify === 1;

  /* ------------------------------------------------------------------ */
  /* 1. STATE */
  /* ------------------------------------------------------------------ */
  const [loading, setLoading] = useState(true);
  const [menuInfo, setMenuInfo] = useState<any>(null);
  const [detailList, setDetailList] = useState<DetailItem[]>([]);
  const [activeMealTab, setActiveMealTab] = useState<string>("");
  const [pobValue, setPobValue] = useState<string>("0");
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [packageRows, setPackageRows] = useState<any[]>([]);
  const [selectedRecipeFk, setSelectedRecipeFk] = useState<number | null>(null);
  const [portions, setPortions] = useState<number>(0);
  // Session state
  const [sessionExpired, setSessionExpired] = useState(false);
  // General modal state
  const [generalModal, setGeneralModal] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error',
    message: ''
  });
  // Finalization state
  const [finalizeConfirmOpen, setFinalizeConfirmOpen] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<number | null>(null);
  const [issuedStatusStr, setIssuedStatusStr] = useState<string>("-");
  // Save state
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  // Editable participation - now using array index as key
  const [pobParticipation, setPobParticipation] = useState<Record<number, number>>({});
  const credentials = useCredentials();
  const userId = credentials?.userId || 0;
  // EXPORT MODAL STATE
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  // Change Recipe Modal State - using index
  const [isChangeRecipeOpen, setIsChangeRecipeOpen] = useState(false);
  const [currentRecipeIndex, setCurrentRecipeIndex] = useState<number | null>(null);
  const [currentRecipe, setCurrentRecipe] = useState('');
  const [currentRecipeFk, setCurrentRecipeFk] = useState<number | null>(null);
  const [currentCategoryFk, setCurrentCategoryFk] = useState<number | null>(null);
  const [usedRecipesForModal, setUsedRecipesForModal] = useState<number[]>([]);
  const [recipeOptions, setRecipeOptions] = useState([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [selectedRecipeDetails, setSelectedRecipeDetails] = useState(null);
  const [currentRecipeDetails, setCurrentRecipeDetails] = useState(null);
  // Duplicate error modal state
  const [duplicateErrorModal, setDuplicateErrorModal] = useState({
    isOpen: false,
    duplicateRecipeName: '',
    mealTypeName: ''
  });

  const decimalPlaces = projectSettings?.decimalPlaces || 2;
  const costDecimalPlaces = projectSettings?.costDecimalPlaces || 2;
  const quantityDecimalPlaces = projectSettings?.quantityDecimalPlaces || 2;

  // Computed: Check if status indicates finalized (string-based for robustness)
  const isStatusFinalized = issuedStatusStr.toLowerCase().includes('finalized');

  /* ------------------------------------------------------------------ */
  /* SESSION HANDLING */
  /* ------------------------------------------------------------------ */
  const handleSessionExpired = () => {
    setSessionExpired(true);
  };

  const localApiFetch = useCallback(async (url: string, options = {}) => {
    try {
      const data = await apiFetch(url, options);
      return data;
    } catch (error: any) {
      if (error.message?.includes('Session expired') ||
          error.message?.includes('authentication') ||
          error.message?.includes('Failed to fetch')) {
        handleSessionExpired();
      }
      throw error;
    }
  }, [apiFetch]);

  /* ------------------------------------------------------------------ */
  /* 2. FETCH MENU DETAIL - Reset state fully to prevent glitches */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!selectedMenuItem?.id) {
      // Reset everything if no item
      setLoading(false);
      setMenuInfo(null);
      setDetailList([]);
      setActiveMealTab("");
      setPobValue("0");
      setIssuedStatusStr("-");
      setApprovalStatus(null);
      setIsSaved(false);
      setPobParticipation({});
      return;
    }

    const fetchDetail = async () => {
      // Full reset before fetch to avoid partial renders/glitches
      setLoading(true);
      setMenuInfo(null);
      setDetailList([]);
      setActiveMealTab("");
      setPobValue("0");
      setIssuedStatusStr("-");
      setApprovalStatus(null);
      setIsSaved(false);
      setPobParticipation({});

      try {
        const data = await localApiFetch(
          `${baseUrl}/issueMenuToLocationUserTabList/${selectedMenuItem.id}`,
          { method: "GET" }
        );

        if (data.success && data.data) {
          const { pob, menuDetail: raw = [], approvalStatus: apiStatus, issuedStatusStr: apiIssuedStr, ...info } = data.data;

          setMenuInfo(info);
          setDetailList(raw);
          setPobValue(pob?.toString() ?? "0");

          const status = Number(apiStatus);
          setApprovalStatus(status);
          setIssuedStatusStr(apiIssuedStr ?? "-");

          const issueStatusValue = data.data.issueStatus;
          setIsSaved(issueStatusValue === 3);

          const firstMeal = raw[0]?.mealTypeName?.toUpperCase();
          if (firstMeal) setActiveMealTab(firstMeal);
        } else {
          setMenuInfo(null);
          setDetailList([]);
        }
      } catch (e: any) {
        console.error(e);
        setGeneralModal({
          isOpen: true,
          type: 'error',
          message: e.message || 'Failed to load menu details'
        });
        setMenuInfo(null);
        setDetailList([]);
      } finally {
        setLoading(false);
      }
    };

    // Small delay to ensure UI settles (prevents flash on rapid re-renders)
    const timer = setTimeout(fetchDetail, 50);
    return () => clearTimeout(timer);
  }, [selectedMenuItem?.id, localApiFetch, baseUrl]);

  /* ------------------------------------------------------------------ */
  /* 3. INITIALIZE PARTICIPATION MAP - using array indices */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const map: Record<number, number> = {};
    detailList.forEach((it, idx) => {
      map[idx] = it.pobParticipation ?? 100;
    });
    setPobParticipation(map);
  }, [detailList]);

  /* ------------------------------------------------------------------ */
  /* 4. HELPERS */
  /* ------------------------------------------------------------------ */
  const mealTypes = Array.from(
    new Set(detailList.map((i) => i.mealTypeName?.toUpperCase()).filter(Boolean))
  );
  const currentItems = detailList.filter(
    (i) => i.mealTypeName?.toUpperCase() === activeMealTab
  );
  const calcFinalCost = useCallback((item: DetailItem, globalIdx: number) => {
    const participation = pobParticipation[globalIdx] ?? item.pobParticipation ?? 100;
    const portions = (Number(pobValue) * participation) / 100;
    return (item.perPortionCost || 0) * portions;
  }, [pobValue, pobParticipation]);
  const totalForMeal = currentItems
    .reduce((sum, item) => {
      const globalIdx = detailList.findIndex(d => d === item);
      return sum + calcFinalCost(item, globalIdx);
    }, 0);
  const formattedDate = formatDate(selectedDate);

  /* ------------------------------------------------------------------ */
  /* 5. OPEN PACKAGE MODAL - UPDATED TO MATCH REFERENCE */
  /* ------------------------------------------------------------------ */
  const openPackageModal = async (issueMenuDFk: number, recipeFk: number, portions: number) => {
    console.log("[DEBUG] Opening modal → issueMenuDFk:", issueMenuDFk, "recipeFk:", recipeFk, "portions:", portions);
    setSelectedRecipeFk(recipeFk);
    setPortions(portions);
    setModalLoading(true);
    setModalOpen(true);
    setPackageRows([]);

    try {
      const payload = { issueMenuDFk, recipeFk };
      console.log("[DEBUG] POST payload →", payload);

      const data = await localApiFetch(`${baseUrl}/fetchIssuedMenuItemsByDFk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("[DEBUG] API response →", data);

      if (data.success && Array.isArray(data.data)) {
        // Filter out empty/zero rows (e.g., summary or empty lines with zeros)
        const filteredRows = data.data.filter((row: any) =>
          row.itemCode && row.itemName && (row.total || 0) > 0
        );
        setPackageRows(filteredRows);
      } else {
        setGeneralModal({
          isOpen: true,
          type: 'error',
          message: 'No package data available'
        });
      }
    } catch (e: any) {
      console.error("[DEBUG] fetch error →", e);
      setGeneralModal({
        isOpen: true,
        type: 'error',
        message: e.message || 'Failed to load package details'
      });
    } finally {
      setModalLoading(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* CHANGE RECIPE HANDLERS - adapted to use array index like AddMenuScreen */
  /* ------------------------------------------------------------------ */
  const handleChangeRecipe = useCallback((recipeName: string, idx: number, categoryFk: number, mealTypeName: string, recipeFk: number | null) => {
    if (isSaved || isStatusFinalized) return;
    const usedRecipes = detailList
      .filter((_, otherIdx) => otherIdx !== idx && detailList[otherIdx].mealTypeName?.toUpperCase() === mealTypeName.toUpperCase() && detailList[otherIdx].recipeFk !== null)
      .map((_, otherIdx) => detailList[otherIdx].recipeFk!);
    setCurrentRecipe(recipeName);
    setCurrentRecipeIndex(idx);
    setCurrentRecipeFk(recipeFk);
    setCurrentCategoryFk(categoryFk);
    setUsedRecipesForModal(usedRecipes);
    setIsChangeRecipeOpen(true);
  }, [detailList, isSaved, isStatusFinalized]);

  const checkForDuplicateRecipe = useCallback((recipePk: number, mealTypeName: string, currentIdx: number, categoryFk: number) => {
    if (recipePk <= 0) return null;

    for (let otherIdx = 0; otherIdx < detailList.length; otherIdx++) {
      if (otherIdx === currentIdx) continue;
      const item = detailList[otherIdx];
      if (item.recipeFk === recipePk &&
          item.mealTypeName?.toUpperCase() === mealTypeName.toUpperCase() &&
          item.categoryFk === categoryFk) {
        return item;
      }
    }

    return null;
  }, [detailList]);

  const handleSelectChange = useCallback((newValue: string) => {
    setSelectedRecipeId(newValue);
    if (newValue === '' || !newValue) {
      setSelectedRecipeDetails(null);
      return;
    }
    const newRecipeDetails = recipeOptions.find((r: any) => r.pk === newValue);
    if (!newRecipeDetails) {
      setSelectedRecipeDetails(null);
      return;
    }
    setSelectedRecipeDetails(newRecipeDetails);
    if (currentRecipeIndex === null) return;
    const currentItem = detailList[currentRecipeIndex];
    if (newRecipeDetails && currentItem) {
      const recipePk = parseInt(newValue);
      if (!isNaN(recipePk) && recipePk > 0) {
        const duplicateItem = checkForDuplicateRecipe(recipePk, currentItem.mealTypeName || '', currentRecipeIndex, currentItem.categoryFk);
        if (duplicateItem) {
          setDuplicateErrorModal({
            isOpen: true,
            duplicateRecipeName: newRecipeDetails.name,
            mealTypeName: currentItem.mealTypeName
          });
          // Revert selection on duplicate
          setSelectedRecipeId('');
          setSelectedRecipeDetails(null);
          return;
        }
      }
    }
  }, [recipeOptions, detailList, currentRecipeIndex, checkForDuplicateRecipe]);

  const handleRecipeChange = useCallback((newRecipeDetails: any) => {
    if (currentRecipeIndex === null) return;
    const currentIdx = currentRecipeIndex;
    const currentItem = detailList[currentIdx];
    if (!currentItem) return;
    if (newRecipeDetails) {
      if (newRecipeDetails.pk !== '' && newRecipeDetails.pk !== '0') {
        const recipePk = parseInt(newRecipeDetails.pk);
        if (!isNaN(recipePk) && recipePk > 0) {
          const duplicateItem = checkForDuplicateRecipe(recipePk, currentItem.mealTypeName || '', currentIdx, currentItem.categoryFk);
          if (duplicateItem) {
            setDuplicateErrorModal({
              isOpen: true,
              duplicateRecipeName: newRecipeDetails.name,
              mealTypeName: currentItem.mealTypeName
            });
            return;
          }
        }
      }
    }
    const updatedRecipeFk = newRecipeDetails && newRecipeDetails.pk !== '' ? parseInt(newRecipeDetails.pk) : null;
    const updatedPortionSize = newRecipeDetails && newRecipeDetails.pk !== '' ? newRecipeDetails.portionSize : null;
    const updatedUom = newRecipeDetails && newRecipeDetails.pk !== '' ? newRecipeDetails.uom : null;
    const updatedPerPortionCost = newRecipeDetails && newRecipeDetails.pk !== '' ? newRecipeDetails.perPortionCost : null;
    const updatedRecipeName = newRecipeDetails && newRecipeDetails.pk !== '' ? newRecipeDetails.name : 'No Recipe';
    setDetailList(prev => {
      const newList = [...prev];
      newList[currentIdx] = {
        ...newList[currentIdx],
        recipeName: updatedRecipeName,
        recipeFk: updatedRecipeFk,
        portionSize: updatedPortionSize,
        uom: updatedUom,
        perPortionCost: updatedPerPortionCost,
      };
      return newList;
    });
    setIsChangeRecipeOpen(false);
    setCurrentRecipeIndex(null);
    setCurrentCategoryFk(null);
    setCurrentRecipeFk(null);
    setCurrentRecipe('');
    setUsedRecipesForModal([]);
    setSelectedRecipeId('');
    setSelectedRecipeDetails(null);
    setCurrentRecipeDetails(null);
  }, [currentRecipeIndex, detailList, checkForDuplicateRecipe]);

  const closeDuplicateErrorModal = useCallback(() => {
    setDuplicateErrorModal({ isOpen: false, duplicateRecipeName: '', mealTypeName: '' });
  }, []);

  /* ------------------------------------------------------------------ */
  /* RECIPE MODAL EFFECTS */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!currentCategoryFk || !isChangeRecipeOpen) {
      setLoadingRecipes(false);
      setRecipeOptions([]);
      setSelectedRecipeId('');
      setSelectedRecipeDetails(null);
      setCurrentRecipeDetails(null);
      return;
    }
    setLoadingRecipes(true);
    const fetchRecipes = async () => {
      try {
        console.log('Fetching recipes for categoryFk:', currentCategoryFk);
        const response = await localApiFetch(
          `${baseUrl}/loadRecipeMasterDropDown/${currentCategoryFk}`,
          { method: 'GET' }
        );
        console.log('Recipe API full response:', response);
        if (Array.isArray(response.data)) {
          let allOptions = response.data.map((r: any) => ({ ...r, pk: String(r.pk) }));
          // No filtering of used recipes - allow all and check on select
          setRecipeOptions([
            { name: 'No Recipe', pk: '' },
            ...allOptions
          ]);
          const currentStr = currentRecipeFk !== null && currentRecipeFk !== undefined && currentRecipeFk !== 0 ? String(currentRecipeFk) : '';
          const current = allOptions.find((r: any) => r.pk === currentStr);
          if (currentStr === '' || currentRecipeFk === null) {
            setCurrentRecipeDetails(null);
            setSelectedRecipeId('');
            setSelectedRecipeDetails(null);
          } else if (current) {
            setCurrentRecipeDetails(current);
            setSelectedRecipeId(currentStr);
            setSelectedRecipeDetails(current);
          } else {
            setSelectedRecipeId(currentStr);
            setSelectedRecipeDetails(current);
          }
        } else {
          console.warn('No recipes found or invalid response:', response);
          setRecipeOptions([{ name: 'No Recipe', pk: '' }]);
          setSelectedRecipeId('');
          setSelectedRecipeDetails(null);
          setCurrentRecipeDetails(null);
        }
      } catch (error) {
        console.error('Failed to load recipes:', error);
        setRecipeOptions([{ name: 'No Recipe', pk: '' }]);
        setSelectedRecipeId('');
        setSelectedRecipeDetails(null);
        setCurrentRecipeDetails(null);
      } finally {
        setLoadingRecipes(false);
      }
    };
    fetchRecipes();
  }, [currentCategoryFk, isChangeRecipeOpen, currentRecipeFk, localApiFetch, baseUrl]);

  useEffect(() => {
    if (selectedRecipeId && recipeOptions.length > 0) {
      const details = recipeOptions.find((recipe: any) => recipe.pk === selectedRecipeId);
      setSelectedRecipeDetails(selectedRecipeId === '' ? null : details);
    } else {
      setSelectedRecipeDetails(null);
    }
  }, [selectedRecipeId, recipeOptions]);

  useEffect(() => {
    if (recipeOptions.length > 0 && currentRecipeFk !== null && currentRecipeFk !== undefined && currentRecipeFk !== 0) {
      const currentStr = String(currentRecipeFk);
      const current = recipeOptions.find((r: any) => r.pk === currentStr);
      setCurrentRecipeDetails(current || null);
    } else {
      setCurrentRecipeDetails(null);
    }
  }, [recipeOptions, currentRecipeFk]);

  /* ------------------------------------------------------------------ */
  /* 6. FINALIZE MENU */
  /* ------------------------------------------------------------------ */
  const startFinalize = () => setFinalizeConfirmOpen(true);
  const cancelFinalize = () => setFinalizeConfirmOpen(false);
  const performFinalize = async () => {
    setFinalizing(true);
    try {
      const payload = {
        id: selectedMenuItem.id,
        approvalStatus: 3,
        createdBy: userId ?? 0,
      };

      const res = await localApiFetch(
        `${baseUrl}/updateApprovalStatus`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (res.success) {
        // Trigger refetch
        if (selectedMenuItem?.id) {
          const data = await localApiFetch(
            `${baseUrl}/issueMenuToLocationUserTabList/${selectedMenuItem.id}`,
            { method: "GET" }
          );

          if (data.success && data.data) {
            const { menuDetail: raw = [], issuedStatusStr: apiIssuedStr } = data.data;
            setDetailList(raw);
            setIssuedStatusStr(apiIssuedStr ?? "-");
          }
        }

        setGeneralModal({
          isOpen: true,
          type: "success",
          message: "Menu finalized successfully!"
        });
      } else {
        throw new Error(res.message ?? "Failed");
      }
    } catch (err: any) {
      setGeneralModal({
        isOpen: true,
        type: "error",
        message: `Finalize failed: ${err.message}`
      });
    } finally {
      setFinalizing(false);
      setFinalizeConfirmOpen(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* 7. SAVE MENU DATA - using indices for participation */
  /* ------------------------------------------------------------------ */
  const handleSave = async () => {
    if (!selectedMenuItem?.id) {
      setGeneralModal({
        isOpen: true,
        type: 'error',
        message: 'No menu selected to save'
      });
      return;
    }

    if (isStatusFinalized) {
      setGeneralModal({
        isOpen: true,
        type: 'error',
        message: 'Cannot save - Menu is already finalized!'
      });
      return;
    }

    setSaving(true);

    try {
      const calculatedTotalCost = detailList.reduce((sum, item, idx) => {
        const participation = pobParticipation[idx] ?? item.pobParticipation ?? 100;
        const portions = (Number(pobValue) * participation) / 100;
        const itemCost = (item.perPortionCost || 0) * portions;
        return sum + itemCost;
      }, 0);

      const menuDetail = detailList.map((item, idx) => {
        const participation = pobParticipation[idx] ?? item.pobParticipation ?? 100;
        const portions = (Number(pobValue) * participation) / 100;
        const itemTotalCost = (item.perPortionCost || 0) * portions;

        return {
          issueMenuDFk: item.issueMenuDFk ?? item.id ?? 0,
          issueMenuHFk: item.issueMenuHFk || 0,
          menuFk: item.menuFk || selectedMenuItem.id,
          mealTypeFk: item.mealTypeFk,
          mealTypeName: item.mealTypeName,
          categoryFk: item.categoryFk,
          categoryName: item.categoryName,
          recipeFk: item.recipeFk || 0,
          pobParticipation: participation,
          totalCost: Number(itemTotalCost.toFixed(2))
        };
      });

      const payload = {
        id: selectedMenuItem.id,
        pob: Number(pobValue),
        menuIssuedDate: selectedDate,
        totalCost: Number(calculatedTotalCost.toFixed(2)),
        createdBy: userId ?? 0,
        menuDetail: menuDetail
      };
      console.log("[DEBUG] Save payload →", payload);

      const res = await localApiFetch(
        `${baseUrl}/updateIssueMenu`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (res.success) {
        // Trigger refetch after save
        if (selectedMenuItem?.id) {
          const data = await localApiFetch(
            `${baseUrl}/issueMenuToLocationUserTabList/${selectedMenuItem.id}`,
            { method: "GET" }
          );

          if (data.success && data.data) {
            const { menuDetail: raw = [] } = data.data;
            setDetailList(raw);
          }
        }

        setGeneralModal({
          isOpen: true,
          type: "success",
          message: "Menu saved successfully!"
        });
      } else {
        throw new Error(res.message ?? "Failed to save");
      }
    } catch (err: any) {
      setGeneralModal({
        isOpen: true,
        type: "error",
        message: `Save failed: ${err.message}`
      });
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* 8. EXPORT: CSV & EXCEL DOWNLOAD */
  /* ------------------------------------------------------------------ */
  const downloadFile = async (url: string, filename: string) => {
    setDownloading(true);
    try {
      const token = sessionStorage.getItem('token');
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await fetch(url, { method: 'GET', headers });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(downloadUrl);

      setGeneralModal({
        isOpen: true,
        type: "success",
        message: `${filename.split('.').pop()?.toUpperCase()} downloaded successfully!`
      });
    } catch (error: any) {
      setGeneralModal({
        isOpen: true,
        type: "error",
        message: `Download failed: ${error.message}`
      });
    } finally {
      setDownloading(false);
      setExportModalOpen(false);
    }
  };

  const downloadCSV = () => {
    const id = selectedMenuItem.id;
    const url = `${baseUrl}/printexcelreportForMaterial/${id}/${credentials.userId}`;
    downloadFile(url, `menu-${id}-report.csv`);
  };

  const downloadExcel = () => {
    const id = selectedMenuItem.id;
    const url = `${baseUrl}/printSlieExcelreport/${id}/${credentials.userId}`;
    downloadFile(url, `menu-${id}-material.xlsx`);
  };

  /* ------------------------------------------------------------------ */
  /* 9. RENDER */
  /* ------------------------------------------------------------------ */
  if (sessionExpired) {
    return <SessionExpiredModal onLogin={() => window.location.href = '/'} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600 dark:text-gray-400 mb-2" />
          <div className="text-lg text-gray-600 dark:text-gray-300">Loading menu…</div>
        </div>
      </div>
    );
  }

  if (!menuInfo || detailList.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg text-red-600 dark:text-red-400">No menu selected</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {generalModal.isOpen && (
        <GeneralStatusModal
          modal={generalModal}
          onClose={() => setGeneralModal({ isOpen: false, type: 'success', message: '' })}
        />
      )}
      {duplicateErrorModal.isOpen && (
        <DuplicateRecipeErrorModal
          isOpen={duplicateErrorModal.isOpen}
          onClose={closeDuplicateErrorModal}
          duplicateRecipeName={duplicateErrorModal.duplicateRecipeName}
          mealTypeName={duplicateErrorModal.mealTypeName}
        />
      )}

      {/* ---------- HEADER ---------- */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Menu Screen List</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-2 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            {!isStatusFinalized && (
              <button
                onClick={handleSave}
                disabled={saving}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${
                  saving
                    ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    : "bg-emerald-600 dark:bg-emerald-700 hover:bg-emerald-700 dark:hover:bg-emerald-800 text-white"
                }`}
                title={saving ? "Saving..." : "Save Menu"}
              >
                <Save size={18} />
                {saving ? "Saving..." : "Save"}
              </button>
            )}
            {/* EXPORT BUTTON → OPENS MODAL */}
            <button
              onClick={() => setExportModalOpen(true)}
              className="flex items-center gap-1 bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-800 text-white px-2 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              title="Export Menu"
            >
              <Download size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6">
        {/* MENU SET DETAILS */}
   <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
  <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex flex-wrap items-center gap-2">
    <span>Menu Set Details : {formattedDate}</span>||
    <span>
      {`${menuInfo.locationCode || ''} - ${menuInfo.locationName || ''}`.trim() || 'N/A'}
    </span>
  </h2>

  <div className="flex flex-wrap items-center justify-between gap-2">
    <div className="flex flex-col">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
        Menu Set Type:
      </span>
      <p className="text-sm font-semibold text-gray-900 dark:text-white">
        {menuInfo.name ?? "-"}
      </p>
    </div>

    <div className="flex flex-col">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
        Total Cost:
      </span>
      <p className="text-sm font-semibold text-green-600 dark:text-green-400">
        {formatAmount(totalForMeal || 0, costDecimalPlaces)}
      </p>
    </div>

    <div className="flex flex-col">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
        Estimated Prj:
      </span>
      <p className="text-sm font-semibold text-green-600 dark:text-green-400">
        {formatAmount((totalForMeal / Number(pobValue)) || 0, costDecimalPlaces)}
      </p>
    </div>

    <div className="flex flex-col">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
        Status:
      </span>
      <p className="text-sm font-semibold text-blue-600 dark:text-white">
        {issuedStatusStr}
      </p>
    </div>
  </div>
</div>

     
        {/* POB INPUT */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Total POB (Persons On Board)
              </label>
              <input
                type="number"
                value={pobValue}
                onChange={(e) => !isSaved && !isStatusFinalized && setPobValue(e.target.value)}
                disabled={isSaved || isStatusFinalized}
                className={`w-32 px-3 py-2 border rounded-md text-sm ${
                  isSaved || isStatusFinalized
                    ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed"
                    : "border-gray-300 dark:border-gray-500"
                }`}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                POB Portions = POB × POB Participation %
              </p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total POB {pobValue}</p>
          </div>
        </div>
     
        {/* REMARKS */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Remarks :
              </label>
            </div>
          </div>
        </div>
     
        {/* MENU FINALIZATION - HIDE WHEN STATUS CONTAINS 'FINALIZED' */}
        {!isStatusFinalized && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Menu Finalization
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Once finalized, the menu cannot be edited. This action is irreversible.
                </p>
              </div>
              <button
                onClick={startFinalize}
                disabled={finalizing}
                className={`px-5 py-2 rounded-md font-medium transition-colors ${
                  finalizing
                    ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    : "bg-emerald-600 dark:bg-emerald-700 hover:bg-emerald-700 dark:hover:bg-emerald-800 text-white"
                }`}
              >
                {finalizing ? "Finalizing…" : "Finalize Menu"}
              </button>
            </div>
          </div>
        )}
     
        {/* MEAL TABS + TABLE - using global index */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap">
              {mealTypes.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveMealTab(tab)}
                  className={`px-4 sm:px-6 py-3 font-medium text-sm transition-colors flex-1 sm:flex-initial ${
                    activeMealTab === tab
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
       
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                    Recipe
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                    Ideal Portion
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                    Cost/Portion
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                    POB Participation %
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                    Final Cost
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                    Final Qty
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                    View
                  </th>
                  {showActionColumn && (
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                      Action
                    </th>
                  )}
                </tr>
              </thead>
           
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {currentItems.map((item) => {
                  const globalIdx = detailList.findIndex(d => d === item);
                  if (globalIdx === -1) return null;
                  const participation = pobParticipation[globalIdx] ?? item.pobParticipation ?? 100;
                  const portions = (Number(pobValue) * participation) / 100;
                  const finalCost = calcFinalCost(item, globalIdx);
                  const totalQuantity = portions * (item.portionSize || 0);
               
                  return (
                    <tr key={globalIdx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{item.categoryName}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{item.recipeName || 'No Recipe'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {formatQuantity(item.portionSize || 0, quantityDecimalPlaces)} {item.uom || ''}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {formatAmount(item.perPortionCost || 0, costDecimalPlaces)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">{pobValue}</span>
                        <span className="text-gray-500 dark:text-gray-400"> × </span>
                        {isSaved || isStatusFinalized ? (
                          <span className="text-gray-400 dark:text-gray-500">{participation}%</span>
                        ) : (
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={participation}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setPobParticipation((prev) => ({ ...prev, [globalIdx]: val }));
                            }}
                            className="w-16 px-1 py-0.5 border border-gray-300 dark:border-gray-500 rounded text-sm dark:bg-gray-700"
                          />
                        )}
                        <span className="text-gray-500 dark:text-gray-400"> = </span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {formatQuantity(portions, quantityDecimalPlaces)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-green-600 dark:text-green-400">
                        {formatAmount(finalCost || 0, costDecimalPlaces)}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-green-600 dark:text-green-400">
                        {formatQuantity(totalQuantity || 0, quantityDecimalPlaces)} {item.uom || ''}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openPackageModal(item.issueMenuDFk ?? 0, item.recipeFk || 0, portions)}
                          disabled={!item.recipeFk}
                          className={`${
                            !item.recipeFk
                              ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                              : "text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                          } transition-colors`}
                          title={!item.recipeFk ? "No recipe selected - Cannot view package" : "View package details"}
                        >
                          <Eye size={20} />
                        </button>
                      </td>
                      {showActionColumn && (
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleChangeRecipe(item.recipeName || 'No Recipe', globalIdx, item.categoryFk, item.mealTypeName, item.recipeFk)}
                            disabled={isSaved || isStatusFinalized}
                            className={`text-sm ${
                              isSaved || isStatusFinalized
                                ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                                : "text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            } transition-colors flex items-center gap-1`}
                            title={(isSaved || isStatusFinalized) ? "Cannot change - saved/finalized" : "Change Recipe"}
                          >
                            Change Recipe
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
           
              <tfoot className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 text-right">
                    Total {activeMealTab}:
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-green-600 dark:text-green-400">
                    {formatAmount(totalForMeal || 0, costDecimalPlaces)}
                  </td>
                  <td></td>
                  <td></td>
                  {showActionColumn && <td></td>}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* ==================== PACKAGE MODAL ==================== */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Package Details
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-white hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>
         
            <div className="flex-1 overflow-auto">
              {modalLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-600 dark:text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">Loading package details…</p>
                </div>
              ) : packageRows.length === 0 ? (
                <p className="p-8 text-center text-red-600 dark:text-red-400">
                  No package data – check console.
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                    <tr>
                      {[
                        "Code", "Item Name", "Package ID", "Price", "Base Factor",
                        "Sec. Factor", "Base Unit", "Sec. Unit", "Sec. Cost",
                        "Base Qty", "Sec. Qty", "Total",
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
               
                  <tbody>
                    {packageRows.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600">{row.itemCode}</td>
                        <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600">{row.itemName}</td>
                        <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600">{row.packageId}</td>
                        <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600">
                          {formatAmount(row.packagePrice || 0, costDecimalPlaces)}
                        </td>
                        <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600">
                          {formatQuantity(row.packageBaseFactor || 0, quantityDecimalPlaces)}
                        </td>
                        <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600">
                          {formatQuantity(row.packageSecondaryFactor || 0, quantityDecimalPlaces)}
                        </td>
                        <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600">{row.packageBaseUnit}</td>
                        <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600">{row.packageSecondaryUnit}</td>
                        <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600">
                          {formatAmount(row.packageSecondaryCost || 0, costDecimalPlaces)}
                        </td>
                        <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600">
                          {formatQuantity((row.baseQuantity || 0) * portions, quantityDecimalPlaces)}
                        </td>
                        <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600">
                          {formatQuantity((row.secondaryQuantity || 0) * portions, quantityDecimalPlaces)}
                        </td>
                        <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600 text-green-600 dark:text-green-400 font-medium">
                          {formatAmount((row.total || 0) * portions, costDecimalPlaces)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
         
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-between items-center border-t border-gray-200 dark:border-gray-600">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Grand Total:{" "}
                <span className="text-green-600 dark:text-green-400 font-bold">
                  {formatAmount(
                    packageRows.reduce((s, r) => s + (Number(r.total || 0) * portions), 0),
                    costDecimalPlaces
                  )}
                </span>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 flex items-center gap-2"
              >
                <X size={18} /> Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== EXPORT CHOICE MODAL ==================== */}
      {exportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white">
              <FileDown size={20} /> Export Menu
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Choose export format:</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={downloadCSV}
                disabled={downloading}
                className="flex items-center gap-2 px-5 py-2 bg-green-600 dark:bg-green-700 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-800 disabled:bg-gray-400 dark:disabled:bg-gray-600"
              >
                <FileSpreadsheet size={18} />
                {downloading ? "Downloading..." : "CSV"}
              </button>
              <button
                onClick={downloadExcel}
                disabled={downloading}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 disabled:bg-gray-400 dark:disabled:bg-gray-600"
              >
                <FileSpreadsheet size={18} />
                {downloading ? "Downloading..." : "Excel"}
              </button>
            </div>
            <div className="mt-4 text-right">
              <button
                onClick={() => setExportModalOpen(false)}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== FINALIZE CONFIRM MODAL ==================== */}
      {finalizeConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4 dark:text-white">Confirm Finalization</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to finalize this menu? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelFinalize}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={performFinalize}
                className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-800"
              >
                {finalizing ? "Finalizing..." : "Yes, Finalize"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CHANGE RECIPE MODAL ==================== */}
      <ChangeRecipeModal
        isOpen={isChangeRecipeOpen}
        onClose={() => {
          setIsChangeRecipeOpen(false);
          setCurrentRecipeIndex(null);
          setCurrentCategoryFk(null);
          setCurrentRecipeFk(null);
          setCurrentRecipe('');
          setUsedRecipesForModal([]);
          setSelectedRecipeId('');
          setSelectedRecipeDetails(null);
          setCurrentRecipeDetails(null);
        }}
        currentRecipe={currentRecipe}
        currentRecipeDetails={currentRecipeDetails}
        categoryFk={currentCategoryFk}
        usedRecipes={usedRecipesForModal}
        currentRecipePk={currentRecipeFk}
        formatAmount={formatAmount}
        formatQuantity={formatQuantity}
        costDecimalPlaces={costDecimalPlaces}
        quantityDecimalPlaces={quantityDecimalPlaces}
        loading={loadingRecipes}
        selectedRecipeId={selectedRecipeId}
        onSelectChange={handleSelectChange}
        recipeOptions={recipeOptions}
        selectedRecipeDetails={selectedRecipeDetails}
        onRecipeChange={handleRecipeChange}
      />
    </div>
  );
}