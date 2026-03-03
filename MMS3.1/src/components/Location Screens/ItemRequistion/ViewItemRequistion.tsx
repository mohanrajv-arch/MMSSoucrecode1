import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Search, Calendar, Utensils, List, ShoppingBag, Plus, DollarSign, FileText, Minus } from 'lucide-react';
import { useCredentials, useFormatAmount, useFormatDate, useFormatQuantity } from 'src/context/AuthContext';
import { useAuth } from "src/context/AuthContext";

interface MenuSummary {
    date: string;
    mealType: string;
    menu: string;
    items: number;
    pob: number;
}

interface Item {
    category: string;
    itemCode: string;
    packageId: string;
    packagePrice: number;
    baseFactor: number;
    baseUnit: string;
    factor: number;
    secondaryUnit: string;
    secondaryCost: number;
    baseQuantity: number;
    quantity: number;
    totalCost: number;
    additional?: number;
    requestType?: number;
    itemName?: string;
}

interface ConsolidatedItem extends Item {
    adjBaseQuantity: number;
    adjQuantity: number;
    adjCost: number;
    finalCost: number;
    originalBaseQuantity: number;
    originalQuantity: number;
    originalTotalCost: number;
    additionalBaseQuantity: number;
    additionalQuantity: number;
    additionalCost: number;
    isNegativeAdjustment: boolean;
}

interface ApiResponse {
    success: boolean;
    message: string;
    data: {
        id: number;
        remarks: string;
        fromDates: string;
        toDates: string;
        menuFkList: number[];
        menuList: {
            id: number;
            mealTypeFk: number;
            mealType: string;
            menuFk: number;
            menuName: string;
            date: string;
            pob: number;
            itemCount: number;
        }[];
        itemList: any[];
        additionalItems: any[];
        summaryItemList: any[];
        totalPob: number;
        locationFk?: number;
        locationCode?: string;
        locationName?: string;
    };
}

const ViewItemRequisition: React.FC = () => {
    const locationHook = useLocation();
      const { projectSettings } = useAuth();
      const formatDate = useFormatDate();
      const formatAmount = useFormatAmount();
      const formatQuantity = useFormatQuantity();
    const navigate = useNavigate();
    const { userId } = useCredentials();
    const requisitionId = locationHook.state?.ViewId as number | undefined;
    const [loading, setLoading] = useState(true);
    const [menuSummaries, setMenuSummaries] = useState<MenuSummary[]>([]);
    const [menuItems, setMenuItems] = useState<ConsolidatedItem[]>([]);
    const [additionalItems, setAdditionalItems] = useState<ConsolidatedItem[]>([]);
    const [searchQueryMenu, setSearchQueryMenu] = useState("");
    const [searchQueryAdd, setSearchQueryAdd] = useState("");
    const [totalPOB, setTotalPOB] = useState(0);
    const [remarks, setRemarks] = useState("");
    const [fromDates, setFromDates] = useState("");
    const [toDates, setToDates] = useState("");
    const [menuConsolidatedCost, setMenuConsolidatedCost] = useState(0);
    const [additionCost, setAdditionCost] = useState(0);
    const [totalCost, setTotalCost] = useState(0);
    const [sessionExpired, setSessionExpired] = useState(false);
    const [locationCode, setLocationCode] = useState("");
    const [locationName, setLocationName] = useState("");
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error'; show: boolean }>({
        message: '',
        type: 'error',
        show: false,
    });

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type, show: true });
        setTimeout(() => {
            setNotification({ message, type, show: false });
        }, 4000);
    };

    // Transform API menu data to MenuSummary format
    const transformMenuData = (apiMenuList: any[]): MenuSummary[] => {
        return apiMenuList.map(menu => ({
            date: menu.date,
            mealType: menu.mealType?.toUpperCase() || "UNKNOWN",
            menu: menu.menuName,
            items: menu.itemCount,
            pob: menu.pob
        }));
    };

    // Transform API item data to Item format
    const transformItemData = (apiItemList: any[]): Item[] => {
        return apiItemList.map(item => ({
            category: item.itemCategoryName,
            itemCode: item.itemCode,
            packageId: item.packageId,
            packagePrice: item.packagePrice,
            baseFactor: item.packageBaseFactor,
            baseUnit: item.packageBaseUnit,
            factor: item.packageSecondaryFactor,
            secondaryUnit: item.packageSecondaryUnit,
            secondaryCost: item.packageSecondaryCost,
            baseQuantity: item.baseQuantity,
            quantity: item.quantity || item.secondaryQuantity || 0,
            totalCost: item.baseTotal,
            additional: item.additional,
            requestType: item.requestType,
            itemName: item.itemName || item.itemCode || ''
        }));
    };

    // Calculate costs correctly
    const calculateCosts = (menuItems: ConsolidatedItem[], pureAdditionalItems: ConsolidatedItem[]) => {
        // Menu Consolidated Cost: Sum of finalCost from menu items (including adjustments)
        const menuConsolidatedTotal = menuItems.reduce((sum, item) => sum + item.finalCost, 0);
        
        // Addition Cost: Sum of finalCost from pure additional items
        // Note: For negative pure additional items, finalCost might be 0, so we use additionalCost
        const additionTotal = pureAdditionalItems.reduce((sum, item) => {
            if (item.isNegativeAdjustment) {
                // For negative pure additional items, use the negative additionalCost
                return sum + item.additionalCost;
            } else {
                return sum + item.finalCost;
            }
        }, 0);
        
        // Total Cost: Menu Consolidated Cost + Addition Cost
        const total = menuConsolidatedTotal + additionTotal;
        
        setMenuConsolidatedCost(menuConsolidatedTotal);
        setAdditionCost(additionTotal);
        setTotalCost(total);
    };

    // Merge menu items with additional items to calculate adjusted quantities
    const mergeItemsWithAdjustments = (menuItems: Item[], additionalItems: Item[]): { 
        consolidatedItems: ConsolidatedItem[], 
        pureAdditionalItems: ConsolidatedItem[] 
    } => {
        // Create maps for tracking
        const consolidatedMap = new Map<string, ConsolidatedItem>();
        const pureAdditionalMap = new Map<string, ConsolidatedItem>();
        
        // Process menu items first
        menuItems.forEach(item => {
            const key = `${item.itemCode}_${item.packageId}`;
            consolidatedMap.set(key, {
                ...item,
                adjBaseQuantity: item.baseQuantity,
                adjQuantity: item.quantity,
                adjCost: 0,
                finalCost: item.totalCost,
                originalBaseQuantity: item.baseQuantity,
                originalQuantity: item.quantity,
                originalTotalCost: item.totalCost,
                additionalBaseQuantity: 0,
                additionalQuantity: 0,
                additionalCost: 0,
                isNegativeAdjustment: false
            });
        });
        
        // Process additional items
        additionalItems.forEach(additionalItem => {
            const key = `${additionalItem.itemCode}_${additionalItem.packageId}`;
            const existingItem = consolidatedMap.get(key);
            
            if (existingItem) {
                // Item exists in both menu items and additional items
                // Check if it's a negative adjustment (if requestType indicates deduction)
                const isNegative = additionalItem.requestType === 2 || additionalItem.additional === 2;
                const additionalBaseQty = isNegative ? -Math.abs(additionalItem.baseQuantity) : additionalItem.baseQuantity;
                const additionalQty = isNegative ? -Math.abs(additionalItem.quantity) : additionalItem.quantity;
                const additionalCostVal = isNegative ? -Math.abs(additionalItem.totalCost) : additionalItem.totalCost;
                
                const newBaseQuantity = existingItem.originalBaseQuantity + additionalBaseQty;
                const newQuantity = existingItem.originalQuantity + additionalQty;
                const newTotalCost = existingItem.originalTotalCost + additionalCostVal;
                
                // Ensure quantities don't go below zero
                const finalBaseQty = Math.max(0, newBaseQuantity);
                const finalQty = Math.max(0, newQuantity);
                const finalTotalCost = Math.max(0, newTotalCost);
                
                existingItem.adjBaseQuantity = finalBaseQty;
                existingItem.adjQuantity = finalQty;
                existingItem.additionalBaseQuantity = additionalBaseQty;
                existingItem.additionalQuantity = additionalQty;
                existingItem.additionalCost = additionalCostVal;
                existingItem.adjCost = additionalCostVal;
                existingItem.baseQuantity = finalBaseQty;
                existingItem.quantity = finalQty;
                existingItem.totalCost = finalTotalCost;
                existingItem.finalCost = finalTotalCost;
                existingItem.isNegativeAdjustment = isNegative;
            } else {
                // Item only exists in additional items (pure additional)
                const isNegative = additionalItem.requestType === 2 || additionalItem.additional === 2;
                const additionalBaseQty = isNegative ? -Math.abs(additionalItem.baseQuantity) : additionalItem.baseQuantity;
                const additionalQty = isNegative ? -Math.abs(additionalItem.quantity) : additionalItem.quantity;
                const additionalCostVal = isNegative ? -Math.abs(additionalItem.totalCost) : additionalItem.totalCost;
                
                // For pure additional items
                if (isNegative) {
                    // Negative pure additional item - deduction from nothing
                    // We show it as a negative adjustment with final cost as 0
                    pureAdditionalMap.set(key, {
                        ...additionalItem,
                        adjBaseQuantity: 0,
                        adjQuantity: 0,
                        adjCost: 0,
                        finalCost: 0, // Final cost is 0 for negative pure additional
                        originalBaseQuantity: 0,
                        originalQuantity: 0,
                        originalTotalCost: 0,
                        additionalBaseQuantity: additionalBaseQty,
                        additionalQuantity: additionalQty,
                        additionalCost: additionalCostVal,
                        isNegativeAdjustment: true
                    });
                } else {
                    // Positive pure additional item
                    pureAdditionalMap.set(key, {
                        ...additionalItem,
                        adjBaseQuantity: 0,
                        adjQuantity: 0,
                        adjCost: 0,
                        finalCost: additionalItem.totalCost, // Final cost is the additional cost
                        originalBaseQuantity: 0,
                        originalQuantity: 0,
                        originalTotalCost: 0,
                        additionalBaseQuantity: additionalBaseQty,
                        additionalQuantity: additionalQty,
                        additionalCost: additionalCostVal,
                        isNegativeAdjustment: false
                    });
                }
            }
        });
        
        const consolidatedItems = Array.from(consolidatedMap.values());
        const pureAdditionalItems = Array.from(pureAdditionalMap.values());
        
        return { consolidatedItems, pureAdditionalItems };
    };

    // Fetch data from API
    useEffect(() => {
        const fetchRequisitionData = async () => {
            if (!requisitionId) {
                navigate("/Master/RequisitionHistory");
                return;
            }
            try {
                const token = sessionStorage.getItem("token");
                if (!token) {
                    console.error("No token found in session storage");
                    navigate("/login");
                    return;
                }
                const response = await fetch(
                    `https://kelvinmms.com:8443/api-gateway-mms/issue-menu-mms/itemRequisitionController/viewItemRequ/${requisitionId}`,
                    {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const apiResponse: ApiResponse = await response.json();
                if (apiResponse.success && apiResponse.data) {
                    const data = apiResponse.data;
                   
                    // Set location data
                    setLocationCode(data.locationCode || "");
                    setLocationName(data.locationName || "");
                   
                    setFromDates(data.fromDates || "");
                    setToDates(data.toDates || "");
                   
                    // Transform and set menu summaries
                    const transformedMenus = transformMenuData(data.menuList);
                    setMenuSummaries(transformedMenus);
                   
                    // Set total POB
                    setTotalPOB(data.totalPob || 0);
                   
                    // Transform menu items and additional items separately
                    const menuTransformed = transformItemData(data.itemList);
                    const addTransformed = transformItemData(data.additionalItems);
                    
                    // Merge items to calculate adjusted quantities
                    const { consolidatedItems, pureAdditionalItems } = mergeItemsWithAdjustments(menuTransformed, addTransformed);
                    setMenuItems(consolidatedItems);
                    setAdditionalItems(pureAdditionalItems);
                   
                    // Set remarks
                    setRemarks(data.remarks || "");
                   
                    // Calculate costs using the new logic
                    calculateCosts(consolidatedItems, pureAdditionalItems);
                } else {
                    throw new Error(apiResponse.message || "Failed to fetch data");
                }
            } catch (error) {
                console.error("Error fetching requisition data:", error);
                const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                showNotification(`Failed to load requisition: ${errorMsg}`, 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchRequisitionData();
    }, [requisitionId, navigate, userId]);

    const filteredMenuItems = useMemo(() => 
        menuItems.filter(
            (item) =>
                item.itemCode.toLowerCase().includes(searchQueryMenu.toLowerCase()) ||
                item.category.toLowerCase().includes(searchQueryMenu.toLowerCase()) ||
                (item.itemName || '').toLowerCase().includes(searchQueryMenu.toLowerCase())
        ),
    [menuItems, searchQueryMenu]);

    const filteredAdditionalItems = useMemo(() => 
        additionalItems.filter(
            (item) =>
                item.itemCode.toLowerCase().includes(searchQueryAdd.toLowerCase()) ||
                item.category.toLowerCase().includes(searchQueryAdd.toLowerCase()) ||
                (item.itemName || '').toLowerCase().includes(searchQueryAdd.toLowerCase())
        ),
    [additionalItems, searchQueryAdd]);


    const getMealTypeColor = (mealType: string) => {
        const type = mealType.toUpperCase();
        switch (type) {
            case "BREAKFAST":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            case "LUNCH":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
            case "DINNER":
                return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
        }
    };

    const getAdjustmentColor = (value: number) => {
        if (value > 0) {
            return "text-green-600 dark:text-green-400"; // Positive adjustment
        } else if (value < 0) {
            return "text-red-600 dark:text-red-400"; // Negative adjustment
        }
        return "text-gray-600 dark:text-gray-400"; // No adjustment
    };

    const getAdjustmentSign = (value: number) => {
        if (value > 0) return "+";
        return "";
    };

    const getAbsoluteValue = (value: number) => {
        return Math.abs(value);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading requisition details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen p-3 max-w-full overflow-x-hidden">
            {/* Notification Toast */}
            <div
                className={`fixed top-16 right-3 z-50 transition-all duration-300 transform ${
                    notification.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                }`}
            >
                <div className={`text-white px-4 py-2 rounded-md shadow-lg max-w-xs ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                    <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d={
                                    notification.type === 'success'
                                        ? 'M5 13l4 4L19 7'
                                        : 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                                }
                            />
                        </svg>
                        <span className="font-medium text-sm">{notification.message}</span>
                    </div>
                </div>
            </div>

            {/* Session Expired Modal */}
            {sessionExpired && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-xs w-full p-4 text-center">
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">Session Expired</h2>
                        <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-300">
                            Your session has expired. Please login again to continue.
                        </p>
                        <button
                            onClick={() => {
                                localStorage.removeItem('token');
                                sessionStorage.removeItem('token');
                                navigate('/');
                            }}
                            className="mt-3 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-xs"
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-4 w-full">
                <h1 className="text-base font-bold text-gray-900 dark:text-white">View Item Requisition</h1>
                <button
                    onClick={() => navigate("/Master/RequisitionHistory")}
            className="px-2.5 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                    <ChevronDown size={15} className="rotate-90" />
                </button>
            </div>

            {/* Location Display (Text only) */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 mb-4 w-full">
                <label className="block text-xs font-medium mb-1.5 text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Location
                </label>
                <div className="flex items-center gap-2">
                    {locationCode || locationName ? (
                        <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-900 dark:border-gray-600 w-full max-w-md">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {locationCode && locationName 
                                    ? `${locationCode} - ${locationName}`
                                    : locationCode || locationName}
                            </p>
                        </div>
                    ) : (
                        <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-900 dark:border-gray-600 w-full max-w-md">
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                No location information available
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Finalized Menus Summary */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 mb-4 w-full">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-0">Finalized Menus Summary</h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800">
                            Finalized Only
                        </span>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total POB</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{totalPOB.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                </div>
               
                {menuSummaries.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                        <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 shadow-sm">
                            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                Total Days
                            </div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {new Set(menuSummaries.map(s => s.date)).size}
                            </div>
                        </div>
                        <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 shadow-sm">
                            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                                <Utensils className="w-3.5 h-3.5" />
                                Meals
                            </div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {menuSummaries.length}
                            </div>
                        </div>
                        <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 shadow-sm">
                            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                                <List className="w-3.5 h-3.5" />
                                Menu Items
                            </div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {menuSummaries.reduce((acc, s) => acc + s.items, 0)}
                            </div>
                        </div>
                        <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 shadow-sm">
                            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                                <ShoppingBag className="w-3.5 h-3.5" />
                                Unique Items
                            </div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {menuItems.length + additionalItems.length}
                            </div>
                        </div>
                    </div>
                )}
               
                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-md w-full shadow-sm">
                    <table className="min-w-full text-xs w-full">
                        <thead className="bg-blue-800 dark:bg-blue-900 text-white">
                            <tr>
                                <th className="py-2 px-3 text-left font-medium">Date</th>
                                <th className="py-2 px-3 text-left font-medium">Meal Type</th>
                                <th className="py-2 px-3 text-left font-medium">Menu</th>
                                <th className="py-2 px-3 text-left font-medium">Items</th>
                                <th className="py-2 px-3 text-right font-medium">POB</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                            {menuSummaries.map((summary, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <td className="py-2 px-3">{formatDate(summary.date)}</td>
                                    <td className="py-2 px-3">
                                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getMealTypeColor(summary.mealType)}`}>
                                            {summary.mealType}
                                        </span>
                                    </td>
                                    <td className="py-2 px-3 font-medium truncate max-w-[150px]">{summary.menu}</td>
                                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                                        {summary.items} items
                                    </td>
                                    <td className="py-2 px-3 font-medium text-right">{summary.pob.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {fromDates && toDates && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                        <p className="text-xs text-blue-800 dark:text-blue-200 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Period: {formatDate(fromDates)} to {formatDate(toDates)}
                        </p>
                    </div>
                )}
            </div>

            {/* Consolidated Item List (Menu Items with Adjustments) */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 mb-4 w-full">
                <div className="flex items-start justify-between mb-4">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <Utensils className="w-4 h-4" />
                        Menu Items
                    </h2>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        Showing {filteredMenuItems.length} of {menuItems.length} items
                        {menuItems.some(item => item.isNegativeAdjustment) && (
                            <span className="ml-2 px-1.5 py-0.5 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded text-xs">
                                Includes negative adjustments
                            </span>
                        )}
                    </div>
                </div>
                <div className="mb-4 flex justify-end">
                    <div className="relative w-80">
                        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search by name or code..."
                            value={searchQueryMenu}
                            onChange={(e) => setSearchQueryMenu(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm text-xs"
                        />
                    </div>
                </div>
               
          <div className="overflow-x-auto max-h-80 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md w-full shadow-sm">
  <table className="w-full table-auto text-[11px]">
    <thead className="bg-blue-800 dark:bg-blue-900 text-white sticky top-0 text-[11px]">
      <tr>
        <th className="py-1 px-1 text-left font-medium w-10">Category</th>
        <th className="py-1 px-1 text-left font-medium w-14">Item Name</th>
        <th className="py-1 px-1 text-left font-medium w-10">Pkg ID</th>
        <th className="py-1 px-1 text-right font-medium w-8">Pkg Price</th>
        <th className="py-1 px-1 text-right font-medium w-6">B.Fec</th>
        <th className="py-1 px-1 text-left font-medium w-6">B.Unit</th>
        <th className="py-1 px-1 text-right font-medium w-6">S.Fec</th>
        <th className="py-1 px-1 text-left font-medium w-6">S.Unit</th>
        <th className="py-1 px-1 text-right font-medium w-8">S.Cost</th>
        <th className="py-1 px-1 text-right font-medium w-8">B.Qty</th>
        <th className="py-1 px-1 text-right font-medium w-8">S.Qty</th>
        <th className="py-1 px-1 text-right font-medium w-8">Adj B.Qty</th>
        <th className="py-1 px-1 text-right font-medium w-8">Adj S.Qty</th>
        <th className="py-1 px-1 text-right font-medium w-8">Adj Cost</th>
        <th className="py-1 px-1 text-right font-medium w-8">Final Cost</th>
      </tr>
    </thead>

    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 text-[10px]">
      {filteredMenuItems.length > 0 ? (
        filteredMenuItems.map((item, index) => {
          const hasAdjustment =
            item.additionalBaseQuantity !== 0 ||
            item.additionalQuantity !== 0 ||
            item.additionalCost !== 0;

          return (
            <tr
              key={index}
              className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <td className="py-1 px-1 font-medium">{item.category}</td>

              <td className="py-1 px-1 font-medium">
                <div className="max-w-[110px]">
                  <div className="text-[9px] text-gray-500 dark:text-gray-400">
                    {item.itemCode}
                  </div>
                  <div className="font-semibold text-[10px]">
                    {item.itemName}
                  </div>
                </div>
              </td>

              <td className="py-1 px-1 max-w-[36px]">{item.packageId}</td>

              <td className="py-1 px-1 text-right">
                {formatAmount(item.packagePrice, projectSettings?.costDecimalPlaces || 2)}
              </td>

              <td className="py-1 px-1 text-right">
                {formatQuantity(item.baseFactor, projectSettings?.quantityDecimalPlaces || 1)}
              </td>

              <td className="py-1 px-1">{item.baseUnit}</td>

              <td className="py-1 px-1 text-right">
                {formatQuantity(item.factor, projectSettings?.quantityDecimalPlaces || 1)}
              </td>

              <td className="py-1 px-1">{item.secondaryUnit}</td>

              <td className="py-1 px-1 text-right">
                {formatAmount(item.secondaryCost, projectSettings?.costDecimalPlaces || 2)}
              </td>

              {/* ORIGINAL QUANTITIES */}
              <td className="py-1 px-1 text-right">
                {formatQuantity(item.originalBaseQuantity, projectSettings?.quantityDecimalPlaces || 1)}
              </td>

              <td className="py-1 px-1 text-right">
                {formatQuantity(item.originalQuantity, projectSettings?.quantityDecimalPlaces || 1)}
              </td>

              {/* ADJ B.QTY */}
              <td className="py-1 px-1 text-right">
                {hasAdjustment ? (
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] text-gray-400">
                      {formatQuantity(item.originalBaseQuantity, projectSettings?.quantityDecimalPlaces || 1)}
                    </span>
                    <span className={`font-medium ${getAdjustmentColor(item.additionalBaseQuantity)}`}>
                      {getAdjustmentSign(item.additionalBaseQuantity)}
                      {formatQuantity(item.additionalBaseQuantity, projectSettings?.quantityDecimalPlaces || 1)}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400">0</span>
                )}
              </td>

              {/* ADJ S.QTY */}
              <td className="py-1 px-1 text-right">
                {hasAdjustment ? (
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] text-gray-400">
                      {formatQuantity(item.originalQuantity, projectSettings?.quantityDecimalPlaces || 1)}
                    </span>
                    <span className={`font-medium ${getAdjustmentColor(item.additionalQuantity)}`}>
                      {getAdjustmentSign(item.additionalQuantity)}
                      {formatQuantity(item.additionalQuantity, projectSettings?.quantityDecimalPlaces || 1)}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400">0</span>
                )}
              </td>

              {/* ADJ COST */}
              <td className="py-1 px-1 text-right">
                {hasAdjustment ? (
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] text-gray-400">
                      {formatAmount(item.originalTotalCost, projectSettings?.costDecimalPlaces || 1)}
                    </span>
                    <span className={`font-medium ${getAdjustmentColor(item.additionalCost)}`}>
                      {getAdjustmentSign(item.additionalCost)}
                      {formatAmount(item.additionalCost, projectSettings?.costDecimalPlaces || 1)}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400">0</span>
                )}
              </td>

              {/* FINAL COST */}
              <td className="py-1 px-1 text-right font-medium">
                {hasAdjustment ? (
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] line-through text-gray-400">
                      {formatAmount(item.originalTotalCost, projectSettings?.costDecimalPlaces || 1)}
                    </span>
                    <span className={`font-bold ${getAdjustmentColor(item.finalCost - item.originalTotalCost)}`}>
                      {formatAmount(item.finalCost, projectSettings?.costDecimalPlaces || 1)}
                    </span>
                  </div>
                ) : (
                  <span>
                    {formatAmount(item.finalCost, projectSettings?.costDecimalPlaces || 1)}
                  </span>
                )}
              </td>
            </tr>
          );
        })
      ) : (
        <tr>
          <td
            colSpan={17}
            className="py-2 px-2 text-center text-gray-500 dark:text-gray-400 text-[10px]"
          >
            <div className="flex flex-col items-center justify-center">
              <svg className="w-8 h-8 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              No menu items found matching the criteria.
            </div>
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

                
                {/* Summary note */}
                <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                        <span className="font-semibold">Note:</span> This table shows menu items with adjustments. 
                        B.Qty/S.Qty show original quantities, Adj columns show adjustments (+ for addition, - for deduction). 
                        Final Cost includes adjustments (original cost ± adjustment cost).
                    </p>
                </div>
            </div>

            {/* Additional Items Section */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 mb-4 w-full">
                <div className="flex items-start justify-between mb-4">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <Plus className="w-4 h-4" />
                        Additional Items
                    </h2>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        Showing {filteredAdditionalItems.length} of {additionalItems.length} items
                        {additionalItems.some(item => item.isNegativeAdjustment) && (
                            <span className="ml-2 px-1.5 py-0.5 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded text-xs">
                                Includes negative items
                            </span>
                        )}
                    </div>
                </div>
                <div className="mb-4 flex justify-end">
                    <div className="relative w-80">
                        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search by name or code..."
                            value={searchQueryAdd}
                            onChange={(e) => setSearchQueryAdd(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm text-xs"
                        />
                    </div>
                </div>
               
                <div className="overflow-x-auto max-h-80 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md w-full shadow-sm">
                    <table className="w-full table-auto text-xs">
                        <thead className="bg-blue-800 dark:bg-blue-900 text-white sticky top-0">
                            <tr>
                                <th className="py-1.5 px-1.5 text-left font-medium w-12">Category</th>
                                <th className="py-1.5 px-1.5 text-center font-medium w-16">Item</th>
                                <th className="py-1.5 px-1.5 text-center font-medium w-12">Pkg ID</th>
                                <th className="py-1.5 px-1.5 text-center font-medium w-8">Pkg Price</th>
                                <th className="py-1.5 px-1.5 text-center font-medium w-6">B.Fec</th>
                                <th className="py-1.5 px-1.5 text-center font-medium w-6">B.Unit</th>
                                <th className="py-1.5 px-1.5 text-center font-medium w-6">S.Fec</th>
                                <th className="py-1.5 px-1.5 text-center font-medium w-6">S.Unit</th>
                                <th className="py-1.5 px-1.5 text-center font-medium w-8">S.Cost</th>
                                <th className="py-1.5 px-1.5 text-center font-medium w-8">Add B.Qty</th>
                                <th className="py-1.5 px-1.5 text-center font-medium w-8">Add S.Qty</th>
                                <th className="py-1.5 px-1.5 text-center font-medium w-8">Add Cost</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                            {filteredAdditionalItems.length > 0 ? (
                                filteredAdditionalItems.map((item, index) => {
                                    const isNegative = item.isNegativeAdjustment;
                                    
                                    return (
                                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            <td className="py-1.5 px-1.5 font-medium">{item.category}</td>
                                              <td className="py-2 px-3 font-medium">
                                <div className="max-w-[120px]">
                                 
                                  <div className="text-xs text-gray-500 dark:text-gray-400">{item.itemCode}</div>
                                   <div className="font-semibold">{item.itemName}</div>
                               
                                </div>
                              </td>
                                           
                                            <td className="py-1.5 px-1.5 max-w-[70px]">{item.packageId}</td>
                                            <td className="py-1.5 px-1.5 text-right">{formatAmount(item.packagePrice, projectSettings?.costDecimalPlaces || 2)}</td>
                                            <td className="py-1.5 px-1.5 text-right">{formatQuantity(item.baseFactor, projectSettings?.quantityDecimalPlaces || 1)}</td>
                                            <td className="py-1.5 px-1.5 text-center">{item.baseUnit}</td>
                                            <td className="py-1.5 px-1.5 text-right">{formatQuantity(item.factor, projectSettings?.quantityDecimalPlaces || 1)}</td>
                                            <td className="py-1.5 px-1.5 text-center">{item.secondaryUnit}</td>
                                            <td className="py-1.5 px-1.5 text-right">{formatAmount(item.secondaryCost, projectSettings?.costDecimalPlaces || 2)}</td>
                                            
                                            {/* Additional Base Quantity */}
                                            <td className="py-1.5 px-1.5 text-right">
                                                <span className={`font-medium ${isNegative ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                                    {isNegative ? '-' : '+'}
                                                    {formatQuantity(item.additionalBaseQuantity, projectSettings?.quantityDecimalPlaces || 4)}
                                                </span>
                                            </td>
                                            
                                            {/* Additional Secondary Quantity */}
                                            <td className="py-1.5 px-1.5 text-right">
                                                <span className={`font-medium ${isNegative ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                                    {isNegative ? '-' : '+'}
                                                    {formatQuantity(item.additionalQuantity, projectSettings?.quantityDecimalPlaces || 4)}
                                                </span>
                                            </td>
                                            
                                            {/* Additional Cost */}
                                            <td className="py-1.5 px-1.5 text-right">
                                                <span className={`font-medium ${isNegative ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                                    {isNegative ? '-' : '+'}
                                                    {formatAmount(item.additionalCost, projectSettings?.costDecimalPlaces || 2)}
                                                </span>
                                            </td>
                                            
                                            {/* Type */}
                                         
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={14} className="py-3 px-3 text-center text-gray-500 dark:text-gray-400 text-xs">
                                        <div className="flex flex-col items-center justify-center">
                                            <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            No additional items found matching the criteria.
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Summary note */}
                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                        <span className="font-semibold">Note:</span> These items do not exist in the main menu items list. 
                        Positive (+) values indicate additions, negative (-) values indicate deductions.
                    </p>
                </div>
            </div>

            {/* Cost Summary */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 mb-4 w-full">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-1.5">
 <svg
  className="w-4 h-4"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  viewBox="0 0 24 24"
  xmlns="http://www.w3.org/2000/svg"
>
  <ellipse cx="12" cy="7" rx="6" ry="3" />
  <path d="M6 7v4c0 1.7 2.7 3 6 3s6-1.3 6-3V7" />
  <path d="M6 11v4c0 1.7 2.7 3 6 3s6-1.3 6-3v-4" />
</svg>                    Cost Summary
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 shadow-sm">
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                            <Utensils className="w-3.5 h-3.5" />
                            Menu Consolidated Cost
                        </div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                         {formatAmount(menuConsolidatedCost, projectSettings?.costDecimalPlaces || 2)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Menu items cost including adjustments
                        </div>
                    </div>
                    <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 shadow-sm">
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                            <Plus className="w-3.5 h-3.5" />
                            Addition Cost
                        </div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {formatAmount(additionCost, projectSettings?.costDecimalPlaces || 2)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Pure additional items only
                            {additionalItems.filter(item => !item.isNegativeAdjustment).length > 0 && (
                                <div>+{additionalItems.filter(item => !item.isNegativeAdjustment).length} additions</div>
                            )}
                            {additionalItems.filter(item => item.isNegativeAdjustment).length > 0 && (
                                <div>-{additionalItems.filter(item => item.isNegativeAdjustment).length} deductions</div>
                            )}
                        </div>
                    </div>
                    <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 shadow-sm">
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                             <svg
  className="w-4 h-4"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  viewBox="0 0 24 24"
  xmlns="http://www.w3.org/2000/svg"
>
  <ellipse cx="12" cy="7" rx="6" ry="3" />
  <path d="M6 7v4c0 1.7 2.7 3 6 3s6-1.3 6-3V7" />
  <path d="M6 11v4c0 1.7 2.7 3 6 3s6-1.3 6-3v-4" />
</svg>
                            Total Cost
                        </div>
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {formatAmount(totalCost, projectSettings?.costDecimalPlaces || 2)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Menu Consolidated + Addition Cost
                        </div>
                    </div>
                </div>
            </div>

            {/* Remarks Section */}
            {remarks && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 w-full">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-1.5">
                        <FileText className="w-4 h-4" />
                        Remarks
                    </h2>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">{remarks}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewItemRequisition;