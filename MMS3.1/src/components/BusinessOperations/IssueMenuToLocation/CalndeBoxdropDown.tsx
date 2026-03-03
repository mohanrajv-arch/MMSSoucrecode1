import { useState, useEffect, useCallback } from "react";
import { Eye, ArrowLeft, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth, useFormatAmount, useFormatDate, useFormatQuantity } from "src/context/AuthContext";

interface DetailItem {
  id?: number;                    // fallback
  issueMenuHFk?: number;
  menuFk?: number;
  mealTypeFk: number;
  mealTypeName: string;
  categoryFk: number;
  categoryName: string;
  issueMenuDFk?: number;
  recipeFk: number;
  recipeName: string;
  portionSize: number;
  perPortionCost: number;
  totalCost?: number;
  uom: string;
  pobParticipation: number;
  addingStatus?: number;
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

export default function MenuScreenList({
  selectedDate,
  selectedMenuItem,
  onBack,
  apiFetch,
  baseUrl,
}: MenuScreenListProps) {
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
  const [sessionExpired, setSessionExpired] = useState(false);
  const [generalModal, setGeneralModal] = useState({ isOpen: false, type: 'success' as 'success' | 'error', message: '' });
  /* ------------------------------------------------------------------ */
  /* HOOKS */
  /* ------------------------------------------------------------------ */
  const { projectSettings } = useAuth();
  const formatDate = useFormatDate();
  const formatAmount = useFormatAmount();
  const formatQuantity = useFormatQuantity();
  const decimalPlaces = projectSettings?.decimalPlaces || 2;
  const costDecimalPlaces = projectSettings?.costDecimalPlaces || 2;
  const quantityDecimalPlaces = projectSettings?.quantityDecimalPlaces || 2;
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
    } catch (error) {
      if (error.message?.includes('Session expired') || error.message?.includes('authentication') || error.message?.includes('Failed to fetch')) {
        handleSessionExpired();
      }
      throw error;
    }
  }, [apiFetch]);
  /* ------------------------------------------------------------------ */
  /* 2. FETCH MENU DETAIL */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!selectedMenuItem?.id) {
      setLoading(false);
      return;
    }
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await localApiFetch(
          `${baseUrl}/issueMenuToLocationUserTabList/${selectedMenuItem.id}`,
          { method: "GET" }
        );
        if (data.success && data.data) {
          const { pob, menuDetail: raw = [], ...info } = data.data;
          setMenuInfo(info);
          setDetailList(raw);
          setPobValue(pob?.toString() ?? "0");
          const firstMeal = raw[0]?.mealTypeName?.toUpperCase();
          if (firstMeal) setActiveMealTab(firstMeal);
        }
      } catch (e: any) {
        console.error(e);
        setGeneralModal({ isOpen: true, type: 'error', message: e.message || 'Failed to load menu details' });
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [selectedMenuItem?.id, localApiFetch, baseUrl]);
  /* ------------------------------------------------------------------ */
  /* 3. HELPERS */
  /* ------------------------------------------------------------------ */
  const mealTypes = Array.from(
    new Set(detailList.map((i) => i.mealTypeName?.toUpperCase()).filter(Boolean))
  );
  const currentItems = detailList.filter(
    (i) => i.mealTypeName?.toUpperCase() === activeMealTab
  );
  const calcFinalCost = (item: DetailItem) => {
    const participation = item.pobParticipation ?? 100;
    const portions = (Number(pobValue) * participation) / 100;
    return item.perPortionCost * portions;
  };
  const totalForMeal = currentItems
    .reduce((sum, i) => sum + calcFinalCost(i), 0);
  const formattedDate = formatDate(selectedDate);
  /* ------------------------------------------------------------------ */
  /* 4. OPEN PACKAGE MODAL – CALL fetchIssuedMenuItemsByDFk */
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
        const filteredRows = data.data.filter((row: any) => row.itemCode && row.itemName && (row.total || 0) > 0);
        setPackageRows(filteredRows);
      } else {
        setGeneralModal({ isOpen: true, type: 'error', message: 'No package data available' });
      }
    } catch (e: any) {
      console.error("[DEBUG] fetch error →", e);
      setGeneralModal({ isOpen: true, type: 'error', message: e.message || 'Failed to load package details' });
    } finally {
      setModalLoading(false);
    }
  };
  /* ------------------------------------------------------------------ */
  /* 5. RENDER */
  /* ------------------------------------------------------------------ */
  if (sessionExpired) {
    return <SessionExpiredModal onLogin={() => window.location.href = '/'} />;
  }
  if (generalModal.isOpen) {
    return <GeneralStatusModal modal={generalModal} onClose={() => setGeneralModal({ isOpen: false, type: 'success', message: '' })} />;
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
  if (!menuInfo) {
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
      {/* ---------- HEADER ---------- */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Menu Screen List</h1>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Menu details for selected date</p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-3 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Calendar
        </button>
      </div>
      <div className="py-3 space-y-4 max-w-7xl mx-auto">
        {/* ---------- MENU SET DETAILS ---------- */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Menu Set Details : {formattedDate}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <div>
              <span className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Menu Set Type:</span>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{menuInfo.name ?? "-"}</p>
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Total Cost:</span>
              <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                {formatAmount(menuInfo.totalCost || 0, decimalPlaces)}
              </p>
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status:</span>
              <p className="text-sm">
                <span className="inline-block px-3 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-full">
                  {menuInfo.statusStr}
                </span>
              </p>
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Issued:</span>
              <p className="text-sm text-gray-900 dark:text-white">
                {menuInfo.issuedStatusStr ?? "-"}
              </p>
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Total POB:</span>
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{pobValue}</p>
            </div>
          </div>
          {menuInfo.priority && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Priority:</span>
              <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 inline ml-2">{menuInfo.priority}</p>
            </div>
          )}
        </div>
        {/* ---------- MEAL TABS ---------- */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Menu Items</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
            
                <span className="text-xs font-medium text-green-800 dark:text-green-200">
                  Total {activeMealTab}: <span className="font-bold">{formatAmount(totalForMeal || 0, decimalPlaces)}</span>
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {currentItems.length} items
              </div>
            </div>
          </div>
          <div className="flex gap-3 mb-3 border-b border-gray-200 dark:border-gray-700">
            {mealTypes.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveMealTab(tab)}
                className={`px-3 py-1 font-medium transition-colors text-sm ${
                  activeMealTab === tab
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          {/* ---------- TABLE ---------- */}
          <div className="overflow-x-auto overflow-y-visible border border-gray-200 dark:border-gray-700 rounded">
            <div className="min-w-full" style={{ maxWidth: '800px' }}>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider min-w-[120px] border border-gray-300 dark:border-gray-600">Category</th>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider min-w-[150px] border border-gray-300 dark:border-gray-600">Recipe</th>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider min-w-[80px] border border-gray-300 dark:border-gray-600">Ideal Portion</th>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider min-w-[100px] border border-gray-300 dark:border-gray-600">Cost/Portion</th>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider min-w-[150px] border border-gray-300 dark:border-gray-600">POB Participation %</th>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider min-w-[100px] border border-gray-300 dark:border-gray-600">Final Cost</th>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider min-w-[100px] border border-gray-300 dark:border-gray-600">Final Qty</th>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider min-w-[60px] border border-gray-300 dark:border-gray-600">View</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentItems.map((item, idx) => {
                    const portionsCalc = (Number(pobValue) * (item.pobParticipation ?? 100)) / 100;
                    const finalCost = calcFinalCost(item);
                    const totalQuantity = portionsCalc * (item.portionSize || 0);
                    const issueMenuDFk = item.issueMenuDFk ?? item.id;
                   
                    return (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-2 py-1.5 whitespace-nowrap min-w-[120px] border border-gray-300 dark:border-gray-600">
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 px-1.5 py-0.5 rounded">
                            {item.categoryName}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 text-left min-w-[150px] border border-gray-300 dark:border-gray-600">
                          <span className={`text-xs font-medium ${!item.recipeName || item.recipeName === '' ? 'text-gray-400 dark:text-gray-500 italic' : 'text-gray-900 dark:text-white'}`}>
                            {item.recipeName || 'No Recipe'}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-xs min-w-[80px] border border-gray-300 dark:border-gray-600">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-900 dark:text-white font-medium">
                              {formatQuantity(item.portionSize || 0, quantityDecimalPlaces)}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{item.uom || ''}</span>
                          </div>
                        </td>
                        <td className="px-2 py-1.5 whitespace-nowrap min-w-[100px] text-xs border border-gray-300 dark:border-gray-600">
                          <span className="text-xs text-gray-900 dark:text-white font-medium">
                            {formatAmount(item.perPortionCost || 0, costDecimalPlaces)}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 min-w-[150px] border border-gray-300 dark:border-gray-600">
                          <div className="flex items-center gap-1 font-mono text-xs">
                            <span className="font-semibold text-blue-600 dark:text-blue-400">{pobValue}</span>
                            <span className="text-gray-500 dark:text-gray-400"> × </span>
                            <span className="text-gray-400 dark:text-gray-500">{item.pobParticipation ?? 100}%</span>
                            <span className="text-gray-500 dark:text-gray-400"> = </span>
                            <span className="font-semibold text-blue-600 dark:text-blue-400">{formatQuantity(portionsCalc, quantityDecimalPlaces)}</span>
                          </div>
                        </td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-center min-w-[100px] border border-gray-300 dark:border-gray-600">
                          <span className="text-xs font-medium text-green-600 dark:text-green-400">
                            {formatAmount(finalCost || 0, costDecimalPlaces)}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-center min-w-[100px] border border-gray-300 dark:border-gray-600">
                          <span className="text-xs font-medium text-green-600 dark:text-green-400">
                            {formatQuantity(totalQuantity || 0, quantityDecimalPlaces)} {item.uom || ''}
                          </span>
                        </td>
                        {/* EYE BUTTON */}
                        <td className="px-2 py-1.5 text-center min-w-[60px] border border-gray-300 dark:border-gray-600">
                          <button
                            onClick={() => openPackageModal(issueMenuDFk!, item.recipeFk, portionsCalc)}
                            disabled={!issueMenuDFk || item.recipeFk === 0}
                            className={`${
                              !issueMenuDFk || item.recipeFk === 0
                                ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                                : "text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            } transition-colors flex items-center justify-center`}
                            title={!issueMenuDFk || item.recipeFk === 0 ? "No package available" : "View package details"}
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <td colSpan={5} className="px-2 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 text-right border border-gray-300 dark:border-gray-600">
                      Total {activeMealTab}:
                    </td>
                    <td className="px-2 py-1.5 text-sm font-bold text-green-600 dark:text-green-400 text-center border border-gray-300 dark:border-gray-600">{formatAmount(totalForMeal || 0, decimalPlaces)}</td>
                    <td className="px-2 py-1.5 text-center border border-gray-300 dark:border-gray-600"></td>
                    <td className="px-2 py-1.5 text-center border border-gray-300 dark:border-gray-600"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* ==================== PACKAGE DETAILS MODAL ==================== */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Package Details</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            {/* Body */}
            <div className="flex-1 overflow-auto">
              {modalLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-600 dark:text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">Loading package details…</p>
                </div>
              ) : packageRows.length === 0 ? (
                <p className="p-8 text-center text-red-600 dark:text-red-400">
                  No package data – check console for payload/response.
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                    <tr>
                      {[
                        "Code",
                        "Item Name",
                        "Package ID",
                        "Price",
                        "Base Factor",
                        "Sec. Factor",
                        "Base Unit",
                        "Sec. Unit",
                        "Sec. Cost",
                        "Base Qty",
                        "Sec. Qty",
                        "Total",
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
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600">{row.itemCode}</td>
                        <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600">{row.itemName}</td>
                        <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600">{row.packageId}</td>
                        <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600">{formatAmount(row.packagePrice || 0, costDecimalPlaces)}</td>
                        <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600">{formatQuantity(row.packageBaseFactor || 0, quantityDecimalPlaces)}</td>
                        <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600">{formatQuantity(row.packageSecondaryFactor || 0, quantityDecimalPlaces)}</td>
                        <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600">{row.packageBaseUnit}</td>
                        <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600">{row.packageSecondaryUnit}</td>
                        <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600">{formatAmount(row.packageSecondaryCost || 0, costDecimalPlaces)}</td>
                        <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600">{formatQuantity((row.baseQuantity || 0) * portions, quantityDecimalPlaces)}</td>
                        <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600">{formatQuantity((row.secondaryQuantity || 0) * portions, decimalPlaces)}</td>
                        <td className="px-3 py-2 border-b border-gray-300 dark:border-gray-600 text-green-600 dark:text-green-400 font-medium">
                          {formatAmount((row.total || 0) * portions, costDecimalPlaces)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {/* Footer */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-between items-center border-t border-gray-200 dark:border-gray-600">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Grand Total:{" "}
                <span className="text-green-600 dark:text-green-400 font-bold">
                  {formatAmount(
                    packageRows.reduce((s, r) => s + (Number(r.total) || 0) * portions, 0),
                    costDecimalPlaces
                  )}
                </span>
              </div>
              <button
                onClick={() => setModalOpen(false)}
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
}