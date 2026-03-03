import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, Edit, RotateCcw, X, ArrowLeft } from 'lucide-react';
import { MdCompareArrows } from 'react-icons/md';
import { useAuth, useFormatAmount, useFormatDate, useFormatQuantity } from "src/context/AuthContext";

const RecipeHistory = () => {
    
    const location = useLocation();
    const navigate = useNavigate();
    const recipe = location.state?.recipe || {};
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [currentVersion, setCurrentVersion] = useState(null);
    const [keyChanges, setKeyChanges] = useState([]);
    const [versions, setVersions] = useState([]);
    const [totalVersions, setTotalVersions] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { projectSettings } = useAuth();
    const formatDate = useFormatDate();
    const formatAmount = useFormatAmount();
    const formatQuantity = useFormatQuantity();

    // Move these to top for use in functions
    const costDecimalPlaces = projectSettings?.costDecimalPlaces || 2;
    const quantityDecimalPlaces = projectSettings?.quantityDecimalPlaces || 2;

    const baseUrlList = 'https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/recipeVersionList';
    const baseUrlView = 'https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/versionView';
    const baseUrlCompare = 'https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/versionCompare';
  
    // Session modal state
    const [sessionExpired, setSessionExpired] = useState(false);  

    // Session Expired Modal Component
    const SessionExpiredModal = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Session Expired</h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Your session has expired. Please login again to continue.
                </p>
                <button
                    onClick={() => {
                        localStorage.removeItem('LoginToken');
                        sessionStorage.removeItem('token');
                        navigate('/');
                    }}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Go to Login
                </button>
            </div>
        </div>
    );

    // Local time formatting function
    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
                return '';
            }
            return date.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit', 
                hour12: true 
            });
        } catch (error) {
            console.error('Error formatting time:', error);
            return '';
        }
    };

    // Check session and get token - Fixed token retrieval to match RecipeDetails
    const getToken = () => {
        const token = sessionStorage.getItem("token") || localStorage.getItem("LoginToken");
        if (!token) {
            setSessionExpired(true);
            return null;
        }
        return token;
    };

    // Handle API errors
    const handleApiError = (error, response = null) => {
        console.error('API Error:', error);
        if (response && (response.status === 401 || response.status === 403 || response.status === 404)) {
            setSessionExpired(true);
            return true;
        }
        if (error.message && (error.message.includes('401') || error.message.includes('403')|| error.message.includes('404'))) {
            setSessionExpired(true);
            return true;
        }
        return false;
    };

    // Get user name from recipe data
    const getModifiedBy = (versionData) => {
        // Try to get userName, if not available use createdBy, otherwise show 'Unknown User'
        if (versionData.userName) return versionData.userName;
        return 'Unknown User';
    };

    // Get dates from recipe - with better fallbacks
    const getRecipeDates = () => {
        // Try multiple possible date fields
        const createdDate = recipe.createdDate || recipe.created_date;
        const updatedDate = recipe.updatedDate || recipe.updated_date || recipe.lastUpdated;
        
        console.log('Recipe date fields:', {
            createdDate: recipe.createdDate,
            updatedDate: recipe.updatedDate,
            fullRecipe: recipe
        });

        return {
            createdDate: createdDate ? formatDate(new Date(createdDate)) : 'N/A',
            updatedDate: updatedDate ? formatDate(new Date(updatedDate)) : 'N/A',
            createdTime: formatTime(createdDate),
            updatedTime: formatTime(updatedDate),
            rawCreated: createdDate,
            rawUpdated: updatedDate
        };
    };

    const recipeDates = getRecipeDates();

    // Function to generate key changes based on differences between versions - Moved up
    const generateKeyChanges = (oldVersion, currentVersion) => {
        const changes = [];
        
        // Compare basic info
        if (oldVersion.basicInfo.calories !== currentVersion.basicInfo.calories) {
            changes.push(`Calories changed from ${formatQuantity(oldVersion.basicInfo.calories, 1)} kcal to ${formatQuantity(currentVersion.basicInfo.calories, 1)} kcal`);
        }
        if (oldVersion.basicInfo.totalCost !== currentVersion.basicInfo.totalCost) {
            changes.push(`Total cost changed from ${formatAmount(oldVersion.basicInfo.totalCost, costDecimalPlaces)} to ${formatAmount(currentVersion.basicInfo.totalCost, costDecimalPlaces)}`);
        }
        if (oldVersion.basicInfo.costPerPortion !== currentVersion.basicInfo.costPerPortion) {
            changes.push(`Cost per portion changed from ${formatAmount(oldVersion.basicInfo.costPerPortion, costDecimalPlaces)} to ${formatAmount(currentVersion.basicInfo.costPerPortion, costDecimalPlaces)}`);
        }
        if (oldVersion.basicInfo.baseQuantity !== currentVersion.basicInfo.baseQuantity) {
            changes.push(`Base quantity changed from ${formatQuantity(oldVersion.basicInfo.baseQuantity, quantityDecimalPlaces)} ${oldVersion.basicInfo.uom} to ${formatQuantity(currentVersion.basicInfo.baseQuantity, quantityDecimalPlaces)} ${currentVersion.basicInfo.uom}`);
        }
        if (oldVersion.basicInfo.finishedProduct !== currentVersion.basicInfo.finishedProduct) {
            changes.push(`Finished product changed from ${formatQuantity(oldVersion.basicInfo.finishedProduct, quantityDecimalPlaces)} to ${formatQuantity(currentVersion.basicInfo.finishedProduct, quantityDecimalPlaces)}`);
        }
        
        // Compare cuisine
        if (oldVersion.cuisine !== currentVersion.cuisine) {
            changes.push(`Cuisine changed from "${oldVersion.cuisine || 'Not set'}" to "${currentVersion.cuisine || 'Not set'}"`);
        }
        
        // Compare categories
        const oldCategories = oldVersion.categories || [];
        const currentCategories = currentVersion.categories || [];

        // Compare meal types
        const oldMealTypes = oldVersion.mealTypes || [];
        const currentMealTypes = currentVersion.mealTypes || [];
    
        
        // Compare ingredients
        const oldIngredients = oldVersion.ingredients || [];
        const currentIngredients = currentVersion.ingredients || [];
        
        // Find added ingredients
        currentIngredients.forEach(currentIng => {
            const oldIng = oldIngredients.find(oi => oi.name === currentIng.name);
            if (!oldIng) {
                changes.push(`Added new ingredient: ${currentIng.name} (${formatQuantity(currentIng.quantity, quantityDecimalPlaces)} ${currentIng.unit})`);
            }
        });
        
        // Find removed ingredients
        oldIngredients.forEach(oldIng => {
            const currentIng = currentIngredients.find(ci => ci.name === oldIng.name);
            if (!currentIng) {
                changes.push(`Removed ingredient: ${oldIng.name}`);
            }
        });
        
        // Find quantity changes
        oldIngredients.forEach(oldIng => {
            const currentIng = currentIngredients.find(ci => ci.name === oldIng.name);
            if (currentIng && oldIng.quantity !== currentIng.quantity) {
                changes.push(`Quantity changed for ${oldIng.name}: ${formatQuantity(oldIng.quantity, quantityDecimalPlaces)} ${oldIng.unit} → ${formatQuantity(currentIng.quantity, quantityDecimalPlaces)} ${currentIng.unit}`);
            }
        });
        
        // Find cost changes
        oldIngredients.forEach(oldIng => {
            const currentIng = currentIngredients.find(ci => ci.name === oldIng.name);
            if (currentIng && oldIng.cost !== currentIng.cost) {
                changes.push(`Cost changed for ${oldIng.name}: ${formatAmount(oldIng.cost, costDecimalPlaces)} → ${formatAmount(currentIng.cost, costDecimalPlaces)}`);
            }
        });
        
        return changes.length > 0 ? changes : ['No significant changes detected'];
    };

    // Helper to get the master recipe ID
    const getMasterRecipeId = () => {
        return recipe.recipeFk || recipe.recipeHistoryFk || recipe.id;
    };

    useEffect(() => {
        const fetchVersions = async () => {
            const recipePk = getMasterRecipeId();
            if (!recipePk) {
                console.warn('No recipe ID found');
                setError('No recipe ID found');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            
            const token = getToken();
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                console.log('Fetching versions for recipePk:', recipePk);
                const response = await fetch(`${baseUrlList}/${recipePk}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('Response status:', response.status);

                if (!response.ok) {
                    if (handleApiError(new Error(`HTTP error! status: ${response.status}`), response)) {
                        setLoading(false);
                        return;
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Versions API Response:', data);
                
                let versionData;
                if (data.success && data.data) {
                    versionData = data.data;
                } else if (data.data) {
                    // Handle case where success flag is missing but data exists
                    versionData = data.data;
                } else {
                    throw new Error();
                }

                const versionList = versionData.versionList || [];
                
                console.log('Processed version data:', {
                    versionData: versionData,
                    versionList: versionList,
                    totalVersions: versionData.versionNo
                });

                // Set total versions from the main object
                setTotalVersions(versionData.versionNo || versionList.length || 1);
                
                if (Array.isArray(versionList) && versionList.length > 0) {
                    const processedVersions = versionList.map((v) => {
                        const versionNum = v.versionNo || parseInt(v.version?.split(' ')[1]) || 1;
                        const versionDate = v.updatedDate || v.createdDate || recipe.updatedDate;
                        
                        console.log(`Processing version ${versionNum}:`, {
                            version: v,
                            date: versionDate,
                            formattedDate: versionDate ? formatDate(new Date(versionDate)) : 'N/A'
                        });

                        return {
                            version: versionNum,
                            modifiedBy: getModifiedBy(v),
                            modifiedDate: versionDate ? formatDate(new Date(versionDate)) : 'N/A',
                            modifiedTime: formatTime(versionDate),
                            // Preserve original data for API calls
                            originalData: v,
                            // Store the updatedDate for comparison
                            updatedDate: versionDate
                        };
                    }).sort((a, b) => b.version - a.version); // Sort descending to show newest first
                    setVersions(processedVersions);
                    console.log('Final processed versions:', processedVersions);
                } else {
                    console.warn('No versions in list or unexpected structure');
                    setVersions([]);
                    setError('No version history available for this recipe');
                }
            } catch (error) {
                console.error('Error fetching recipe versions:', error);
                if (!handleApiError(error)) {
                    setError(error instanceof Error ? error.message : 'Failed to load recipe versions');
                }
                setVersions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchVersions();
    }, [recipe?.recipeFk, recipe?.recipeHistoryFk, recipe?.id]); // Simplified dependency

    const handleViewVersion = async (ver) => {
        const recipeId = getMasterRecipeId();
        const verNo = ver.version;
        
        if (!recipeId) {
            setError('Recipe ID not found');
            return;
        }

        const token = getToken();
        if (!token) return;

        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`${baseUrlView}/${recipeId}/${verNo}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (handleApiError(new Error(`HTTP error! status: ${response.status}`), response)) {
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('View version API response:', data);
            
            if ((data.success && data.data) || data.data) {
                const versionData = data.success ? data.data : data.data;
                navigate('/Master/RecipeHistoryDetails', { state: { recipe: versionData } });
            } else {
                console.warn('Failed to fetch version data');
                setError('Failed to load version details');
            }
        } catch (error) {
            console.error('Error fetching version:', error);
            if (!handleApiError(error)) {
                setError('Failed to load version details');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCompare = async (ver) => {
        const recipePk = getMasterRecipeId();
        const verNo = ver.version;
        
        if (!recipePk) {
            setError('Recipe ID not found');
            return;
        }

        const token = getToken();
        if (!token) return;

        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`${baseUrlCompare}/${recipePk}/${verNo}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (handleApiError(new Error(`HTTP error! status: ${response.status}`), response)) {
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Compare API Response:', data);
            
            let compareData;
            if (data.success && data.data) {
                compareData = data.data;
            } else if (data.data) {
                compareData = data.data;
            } else {
                throw new Error(data.message || 'No comparison data');
            }

            // Process old version (selected version for comparison)
            const oldVersionData = compareData.oldVersion || {};
            const processedOldVersion = {
                version: ver.version,
                modifiedBy: getModifiedBy(oldVersionData),
                modifiedDate: (oldVersionData.updatedDate || oldVersionData.createdDate) ? formatDate(new Date(oldVersionData.updatedDate || oldVersionData.createdDate)) : 'N/A',
                modifiedTime: formatTime(oldVersionData.updatedDate || oldVersionData.createdDate),
                basicInfo: {
                    calories: oldVersionData.calories || 0,
                    totalCost: oldVersionData.totalCost || 0,
                    costPerPortion: oldVersionData.perPortionCost || 0,
                    baseQuantity: oldVersionData.baseQuantity || 0,
                    uom: oldVersionData.uom || 'Kg',
                    finishedProduct: oldVersionData.finishedProduct || 0,
                    portionSize: oldVersionData.portionSize || 0
                },
                ingredients: (oldVersionData.recipeSubList || oldVersionData.recipeItems || []).map(ing => ({
                    name: (ing.itemName || '').toUpperCase(),
                    quantity: ing.quantity || 0,
                    unit: ing.chefUnit || ing.uom || 'KG',
                    cost: ing.total || ing.costPrice || 0
                })),
                categories: (oldVersionData.categoryListName || oldVersionData.categoryList || []).map(cat => cat.categoryName).filter(Boolean),
                mealTypes: (oldVersionData.mealList || []).map(meal => meal.mealName).filter(Boolean),
                cuisine: oldVersionData.cuisineName
            };

            // Process current version
            const currentVersionData = compareData.currentVersion || recipe;
            const processedCurrentVersion = {
                modifiedBy: getModifiedBy(currentVersionData),
                modifiedDate: (currentVersionData.updatedDate || currentVersionData.createdDate || recipe.updatedDate) ? formatDate(new Date(currentVersionData.updatedDate || currentVersionData.createdDate || recipe.updatedDate)) : 'N/A',
                modifiedTime: formatTime(currentVersionData.updatedDate || currentVersionData.createdDate || recipe.updatedDate),
                basicInfo: {
                    calories: currentVersionData.calories || 0,
                    totalCost: currentVersionData.totalCost || 0,
                    costPerPortion: currentVersionData.perPortionCost || 0,
                    baseQuantity: currentVersionData.baseQuantity || 0,
                    uom: currentVersionData.uom || 'Kg',
                    finishedProduct: currentVersionData.finishedProduct || 0,
                    portionSize: currentVersionData.portionSize || 0
                },
                ingredients: (currentVersionData.recipeSubList || currentVersionData.recipeItems || []).map(ing => ({
                    name: (ing.itemName || '').toUpperCase(),
                    quantity: ing.quantity || 0,
                    unit: ing.chefUnit || ing.uom || 'KG',
                    cost: ing.total || ing.costPrice || 0
                })),
                categories: (currentVersionData.categoryListName || currentVersionData.categoryList || []).map(cat => cat.categoryName).filter(Boolean),
                mealTypes: (currentVersionData.mealList || []).map(meal => meal.mealName).filter(Boolean),
                cuisine: currentVersionData.cuisineName
            };

            // Generate key changes based on differences
            const changes = generateKeyChanges(processedOldVersion, processedCurrentVersion);
            
            setSelectedVersion(processedOldVersion);
            setCurrentVersion(processedCurrentVersion);
            setKeyChanges(changes);
            setShowCompareModal(true);
        } catch (error) {
            console.error('Error fetching compare data:', error);
            if (!handleApiError(error)) {
                setError('Failed to load comparison data');
                
                // Fallback: Create basic comparison data from available version info
                const processedOldVersion = {
                    version: ver.version,
                    modifiedBy: ver.modifiedBy,
                    modifiedDate: ver.modifiedDate,
                    modifiedTime: ver.modifiedTime,
                    basicInfo: {
                        calories: 0,
                        totalCost: 0,
                        costPerPortion: 0,
                        baseQuantity: 0,
                        uom: 'Kg',
                        finishedProduct: 0,
                        portionSize: 0
                    },
                    ingredients: [],
                    categories: [],
                    mealTypes: [],
                    cuisine: ''
                };

                const processedCurrentVersion = {
                    modifiedBy: getModifiedBy(recipe),
                    modifiedDate: recipeDates.updatedDate,
                    modifiedTime: recipeDates.updatedTime,
                    basicInfo: {
                        calories: recipe.calories || 0,
                        totalCost: recipe.totalCost || 0,
                        costPerPortion: recipe.perPortionCost || 0,
                        baseQuantity: recipe.baseQuantity || 0,
                        uom: recipe.uom || 'Kg',
                        finishedProduct: recipe.finishedProduct || 0,
                        portionSize: recipe.portionSize || 0
                    },
                    ingredients: (recipe.recipeSubList || recipe.recipeItems || []).map(ing => ({
                        name: (ing.itemName || '').toUpperCase(),
                        quantity: ing.quantity || 0,
                        unit: ing.chefUnit || ing.uom || 'KG',
                        cost: ing.total || ing.costPrice || 0
                    })),
                    categories: (recipe.categoryListName || recipe.categoryList || []).map(cat => cat.categoryName).filter(Boolean),
                    mealTypes: (recipe.mealList || []).map(meal => meal.mealName).filter(Boolean),
                    cuisine: recipe.cuisineName
                };

                const fallbackChanges = generateKeyChanges(processedOldVersion, processedCurrentVersion);
                setSelectedVersion(processedOldVersion);
                setCurrentVersion(processedCurrentVersion);
                setKeyChanges(fallbackChanges.length > 0 ? fallbackChanges : ['Detailed comparison data not available']);
                setShowCompareModal(true);
            }
        } finally {
            setLoading(false);
        }
    };

    // Prepare display versions - use fetched versions or fallback to current recipe
    let displayVersions = [...versions];
    if (displayVersions.length === 0 && !loading) {
        // Fallback: Show at least the current version
        displayVersions = [{
            version: totalVersions,
            modifiedBy: getModifiedBy(recipe),
            modifiedDate: recipeDates.updatedDate,
            modifiedTime: recipeDates.updatedTime,
        }];
    }

    const statusClass = (recipe.statusStr === 'Active' 
        ? 'bg-green-100 text-green-800' 
        : recipe.statusStr === 'Inactive' 
        ? 'bg-red-100 text-red-800' 
        : 'bg-gray-100 text-gray-800');

    const statusColor = recipe.statusStr === 'Active' 
        ? 'text-green-600' 
        : recipe.statusStr === 'Inactive' 
        ? 'text-red-600' 
        : 'text-gray-600';

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            {sessionExpired && <SessionExpiredModal />}
            
            {/* Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-40">
                    <div className="bg-white rounded-lg p-4 shadow-lg">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-sm text-gray-600 mt-2">Loading...</p>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-lg max-w-6xl mx-auto overflow-hidden">
                {/* Header Section */}
                <div className="p-4 border-b border-gray-200 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">{recipe.recipeName || recipe.name}</h2>
                        <p className="text-gray-500 text-xs mb-1">Recipe Modification History</p>
                        <p className="text-gray-600 text-xs">Reference: {recipe.refNo || recipe.code}</p>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center justify-center gap-2 px-3 py-1.5 text-blue-600 dark:text-blue-400 border border-blue-600
                             dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-xs font-medium w-full sm:w-auto"
                        >
                            <ArrowLeft size={14} />
                            Back to Recipes
                        </button>
                        <span className={`px-3 py-1 mx-3 ${statusClass} rounded-full text-xs font-semibold`}>
                            {recipe.statusStr || 'Active'}
                        </span>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3 border-b border-gray-200 bg-gray-50">
                    <div>
                        <p className="text-xs text-gray-500 font-medium mb-0.5">Created By</p>
                        <p className="text-sm font-semibold text-gray-900">{getModifiedBy(recipe)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium mb-0.5">Created Date</p>
                        <p className="text-sm font-semibold text-gray-900">{recipeDates.createdDate}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium mb-0.5">Last Updated</p>
                        <p className="text-sm font-semibold text-gray-900">{recipeDates.updatedDate}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium mb-0.5">Total Versions</p>
                        <p className="text-sm font-semibold text-gray-900">{totalVersions}</p>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-400">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <X className="h-5 w-5 text-red-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modification History Section */}
                <div className="p-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <RotateCcw size={18} className="text-indigo-600" />
                        Modification History ({displayVersions.length} versions)
                    </h3>
                    
                    {displayVersions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No version history found
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-indigo-200"></div>
                            <div className="space-y-8">
                                {displayVersions.map((ver, index) => (
                                    <div key={ver.version} className="relative flex items-start gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center z-10">
                                            <span className="text-white text-xs font-bold">{ver.version}</span>
                                        </div>
                                        
                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                                                            Version {ver.version}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            Modified by {ver.modifiedBy}
                                                        </span>
                                                    </div>
                                                    <div className="text-right text-xs text-gray-500">
                                                        <div>{ver.modifiedDate}</div>
                                                        <div>{ver.modifiedTime}</div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 mt-3">
                                                    <button 
                                                        onClick={() => handleViewVersion(ver)} 
                                                        className="flex items-center gap-1 px-3 py-1.5 text-xs text-indigo-600 
                                                        border border-indigo-600 rounded hover:bg-indigo-50 font-medium transition-colors"
                                                        disabled={loading}
                                                    >
                                                        <Eye size={14} />
                                                        View This Version
                                                    </button>
                                                    {ver.version !== totalVersions && (
                                                        <button 
                                                            onClick={() => handleCompare(ver)} 
                                                            className="flex items-center gap-1 px-3 py-1.5 text-xs text-green-600 border border-green-600 rounded hover:bg-green-50 font-medium transition-colors"
                                                            disabled={loading}
                                                        >
                                                            <MdCompareArrows size={14} />
                                                            Compare with Current
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Actions Section */}
                <div className="p-4 bg-gray-50 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold mb-2 inline-block">
                            Current Version
                        </span>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Version Information</h4>
                        <p className="text-xs text-gray-600 mb-0.5">Version: {totalVersions} (Latest)</p>
                        <p className="text-xs text-gray-600 mb-0.5">Last Modified: {recipeDates.updatedDate} {recipeDates.updatedTime}</p>
                        <p className="text-xs text-gray-600 mb-0.5">Modified by: {getModifiedBy(recipe)}</p>
                        <p className="text-xs text-gray-600">
                            Status: <span className={`font-medium ${statusColor}`}>{recipe.statusStr || 'Active'}</span>
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Quick Actions</h4>
                        <button 
                            onClick={() => navigate('/Master/RecipeHistoryDetails', { state: { recipeId: getMasterRecipeId() } })} 
                            className="w-full mb-2 px-3 py-2 text-xs text-blue-600 bg-blue-50 rounded hover:bg-blue-100 flex items-center gap-2 transition-colors font-medium"
                            disabled={loading}
                        >
                            <Eye size={14} />
                            View Current Recipe
                        </button>
                        <button 
                            onClick={() => navigate('/Master/ModifyRecipe', { state: { recipe } })} 
                            className="w-full px-3 py-2 text-xs text-green-600 bg-green-50 rounded hover:bg-green-100 flex items-center gap-2 transition-colors font-medium"
                            disabled={loading}
                        >
                            <Edit size={14} />
                            Edit Recipe
                        </button>
                    </div>
                </div>
            </div>

            {/* Compare Modal */}
            {showCompareModal && selectedVersion && currentVersion && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="flex-none p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h3 className="text-sm font-semibold text-gray-800">
                                Compare Version {selectedVersion.version} with Current Version
                            </h3>
                            <button 
                                onClick={() => setShowCompareModal(false)} 
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                                disabled={loading}
                            >
                                <X size={18} />
                            </button>
                        </div>
                        
                        {/* Scrollable Content Area */}
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {/* Grid for Versions - Scrolls */}
                            <div className="flex-1 overflow-y-auto grid grid-cols-2 divide-x divide-gray-200">
                                {/* Selected Version */}
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold">
                                            Version {selectedVersion.version}
                                        </span>
                                        <div className="text-right text-xs text-gray-500">
                                            <div>Modified by: {selectedVersion.modifiedBy}</div>
                                            <div>{selectedVersion.modifiedDate}</div>
                                        </div>
                                    </div>
                                    
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Basic Information</h4>
                                    <table className="w-full text-xs mb-4">
                                        <tbody>
                                            <tr className="border-b border-gray-100">
                                                <td className="py-1.5 text-gray-600">Calories:</td>
                                                <td className="py-1.5 font-medium text-gray-900 text-right">{formatQuantity(selectedVersion.basicInfo.calories, 1)} kcal</td>
                                            </tr>
                                            <tr className="border-b border-gray-100">
                                                <td className="py-1.5 text-gray-600">Total Cost:</td>
                                                <td className="py-1.5 font-medium text-gray-900 text-right">{formatAmount(selectedVersion.basicInfo.totalCost, costDecimalPlaces)}</td>
                                            </tr>
                                            <tr className="border-b border-gray-100">
                                                <td className="py-1.5 text-gray-600">Cost Per Portion:</td>
                                                <td className="py-1.5 font-medium text-gray-900 text-right">{formatAmount(selectedVersion.basicInfo.costPerPortion, costDecimalPlaces)}</td>
                                            </tr>
                                            <tr className="border-b border-gray-100">
                                                <td className="py-1.5 text-gray-600">Base Quantity:</td>
                                                <td className="py-1.5 font-medium text-gray-900 text-right">{formatQuantity(selectedVersion.basicInfo.baseQuantity, quantityDecimalPlaces)} {selectedVersion.basicInfo.uom}</td>
                                            </tr>
                                            <tr>
                                                <td className="py-1.5 text-gray-600">Finished Product:</td>
                                                <td className="py-1.5 font-medium text-gray-900 text-right">{formatQuantity(selectedVersion.basicInfo.finishedProduct, quantityDecimalPlaces)}</td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    {selectedVersion.cuisine && (
                                        <div className="mb-3">
                                            <h4 className="text-sm font-semibold text-gray-900 mb-1">Cuisine</h4>
                                            <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded">{selectedVersion.cuisine}</p>
                                        </div>
                                    )}

                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Ingredients ({selectedVersion.ingredients.length})</h4>
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {selectedVersion.ingredients.length > 0 ? (
                                            selectedVersion.ingredients.map((ing, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-yellow-50 p-2 rounded text-xs border border-yellow-200">
                                                    <div>
                                                        <span className="text-gray-800 font-medium block">{ing.name}</span>
                                                        <span className="text-gray-600 text-xs">Cost: {formatAmount(ing.cost, costDecimalPlaces)}</span>
                                                    </div>
                                                    <span className="text-gray-600 font-semibold">{formatQuantity(ing.quantity, quantityDecimalPlaces)} {ing.unit}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-gray-500 text-center py-4 bg-gray-50 rounded">No ingredients found</p>
                                        )}
                                    </div>
                                </div>

                                {/* Current Version */}
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                                            Current Version
                                        </span>
                                        <div className="text-right text-xs text-gray-500">
                                            <div>Modified by: {currentVersion.modifiedBy}</div>
                                            <div>{currentVersion.modifiedDate}</div>
                                        </div>
                                    </div>
                                    
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Basic Information</h4>
                                    <table className="w-full text-xs mb-4">
                                        <tbody>
                                            <tr className="border-b border-gray-100">
                                                <td className="py-1.5 text-gray-600">Calories:</td>
                                                <td className="py-1.5 font-medium text-gray-900 text-right">{formatQuantity(currentVersion.basicInfo.calories, 1)} kcal</td>
                                            </tr>
                                            <tr className="border-b border-gray-100">
                                                <td className="py-1.5 text-gray-600">Total Cost:</td>
                                                <td className="py-1.5 font-medium text-gray-900 text-right">{formatAmount(currentVersion.basicInfo.totalCost, costDecimalPlaces)}</td>
                                            </tr>
                                            <tr className="border-b border-gray-100">
                                                <td className="py-1.5 text-gray-600">Cost Per Portion:</td>
                                                <td className="py-1.5 font-medium text-gray-900 text-right">{formatAmount(currentVersion.basicInfo.costPerPortion, costDecimalPlaces)}</td>
                                            </tr>
                                            <tr className="border-b border-gray-100">
                                                <td className="py-1.5 text-gray-600">Base Quantity:</td>
                                                <td className="py-1.5 font-medium text-gray-900 text-right">{formatQuantity(currentVersion.basicInfo.baseQuantity, quantityDecimalPlaces)} {currentVersion.basicInfo.uom}</td>
                                            </tr>
                                            <tr>
                                                <td className="py-1.5 text-gray-600">Finished Product:</td>
                                                <td className="py-1.5 font-medium text-gray-900 text-right">{formatQuantity(currentVersion.basicInfo.finishedProduct, quantityDecimalPlaces)}</td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    {currentVersion.cuisine && (
                                        <div className="mb-3">
                                            <h4 className="text-sm font-semibold text-gray-900 mb-1">Cuisine</h4>
                                            <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded">{currentVersion.cuisine}</p>
                                        </div>
                                    )}

                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Ingredients ({currentVersion.ingredients.length})</h4>
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {currentVersion.ingredients.length > 0 ? (
                                            currentVersion.ingredients.map((ing, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-yellow-50 p-2 rounded text-xs border border-yellow-200">
                                                    <div>
                                                        <span className="text-gray-800 font-medium block">{ing.name}</span>
                                                        <span className="text-gray-600 text-xs">Cost: {formatAmount(ing.cost, costDecimalPlaces)}</span>
                                                    </div>
                                                    <span className="text-gray-600 font-semibold">{formatQuantity(ing.quantity, quantityDecimalPlaces)} {ing.unit}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-gray-500 text-center py-4 bg-gray-50 rounded">No ingredients found</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Key Changes - Fixed at Bottom */}
                            <div className="flex-none p-4 border-t border-gray-200 bg-orange-50">
                                <h4 className="text-sm font-semibold text-orange-800 mb-2">Key Changes</h4>
                                <div className="space-y-1 text-xs text-orange-700 max-h-32 overflow-y-auto">
                                    {keyChanges.map((change, idx) => (
                                        <div key={idx} className="flex items-start gap-2">
                                            <span className="mt-0.5">›</span>
                                            <span>{change}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecipeHistory;