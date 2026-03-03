import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Users, ArrowLeft, Clock, Edit, RotateCcw, Loader2, AlertCircle, Zap, Dumbbell, Apple, Droplets } from "lucide-react";
import { BiCube } from "react-icons/bi";
import FoodImage from "src/assets/images/FoodImage/pizzaCard.jpg";
import { useAuth, useCredentials, useFormatAmount, useFormatDate, useFormatQuantity } from "src/context/AuthContext";

// ✅ Updated Interfaces to match the API response
export interface NestedRecipeItem {
  id: number;
  itemCategoryName?: string | null;
  itemName?: string | null;
  packageId?: string | null;
  quantity?: number;
  costPrice?: number;
  categoryName?: string | null;
  mealName?: string | null;
  itemCode?: string | null;
  chefUnit?: string | null;
  total?: number;
  packagePrice?: number | null; // Added packagePrice
}

export interface RecipeDetails {
  id: number;
  recipeFk: number;
  versionNo: number;
  uniqueNo: string | null;
  recipeName: string;
  refNo: string;
  cookingInstruction: string;
  countryOriginFk: number;
  baseQuantityFk: number;
  baseQuantity: number;
  uom: string;
  finishedProduct: number;
  portionSize: number;
  imageUrl: string | null;
  totalCost: number;
  perPortionCost: number;
  status: string | null;
  recipeType: string | null;
  createdBy?: number;
  createdDate?: string | null;
  updatedBy?: number;
  updatedDate?: string | null;
  recipeHistoryFk?: number;
  cuisineName?: string | null;
  statusStr?: string | null;
  categoryListName: NestedRecipeItem[];
  mealList: NestedRecipeItem[];
  recipeSubList: NestedRecipeItem[];
  userName?: string | null;
  calories?: number; // Added nutritional fields
  fat?: number;
  protein?: number;
  carbs?: number;
}

// Modal Component
const SessionExpiredModal = ({ onClose }: { onClose: () => void }) => (
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

const RecipeListingView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Debug location state
  console.log('Location state:', location.state);
  
  const stateData = location.state;
  const recipeId = stateData?.recipeId;
  const initialRecipe = stateData?.recipe;

  console.log('Recipe ID:', recipeId);
  console.log('Initial Recipe:', initialRecipe);

  const [details, setDetails] = useState<RecipeDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);

  const credentials = useCredentials();
  const userId = credentials?.userId || 0;
  console.log('User ID from credentials:', userId);
    
  const { projectSettings } = useAuth();
  const formatDate = useFormatDate();
  const formatAmount = useFormatAmount();
  const formatQuantity = useFormatQuantity();

  const handleSessionExpired = () => {
    localStorage.removeItem('LoginToken');
    sessionStorage.removeItem('LoginToken');
    navigate('/');
  };

  // Function to transform API data to match our interface
  const transformRecipeData = (apiData: any): RecipeDetails => {
    return {
      ...apiData,
      // Map createdBy to userName (since API doesn't provide userName)
      userName: apiData.userName,
      // Ensure imageUrl is properly handled
      imageUrl: apiData.imageUrl || null,
      // Nutritional values
      calories: apiData.calories || 0,
      fat: apiData.fat || 0,
      protein: apiData.protein || 0,
      carbs: apiData.carbs || 0,
      // Default cuisine if not present
      cuisineName: apiData.cuisineName || 'ARABIC',
    };
  };

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = sessionStorage.getItem("token") || localStorage.getItem("LoginToken");
        if (!token) {
          setSessionExpired(true);
          return;
        }

        console.log('Fetching recipe with ID:', recipeId);
        
        const response = await fetch(
          `https://kelvinmms.com:8443/api-gateway-mms/recipe-master/recipeController/recipeViewById/${recipeId}`,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            } 
          }
        );

        console.log('Response status:', response.status);

        if (!response.ok) {
          if (response.status === 401 || response.status === 403 || response.status === 404) {
            setSessionExpired(true);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('API Response:', result);

        if (result.success && result.data) {
          setDetails(transformRecipeData(result.data));
        } else if (result.data) {
          // Some APIs might return data directly without success flag
          setDetails(transformRecipeData(result.data));
        } else {
          throw new Error(result.message || 'No recipe data found');
        }
      } catch (error) {
        console.error("Error fetching recipe details:", error);
        setError(error instanceof Error ? error.message : 'Failed to load recipe details');
      } finally {
        setLoading(false);
      }
    };

    // If we have initial recipe data, use it directly
    if (initialRecipe) {
      console.log('Using initial recipe data');
      setDetails(transformRecipeData(initialRecipe));
      setLoading(false);
    } 
    // If we have a recipe ID but no initial data, fetch from API
    else if (recipeId) {
      console.log('Fetching recipe data from API');
      fetchRecipeDetails();
    } 
    // If no recipe ID or initial data, show error
    else {
      console.log('No recipe ID or initial data provided');
      setError('No recipe specified');
      setLoading(false);
    }
  }, [initialRecipe, recipeId]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={32} />
          <p className="text-gray-600 dark:text-gray-300">Loading recipe details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !details) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 max-w-md text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle size={48} className="mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Recipe Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error || 'The requested recipe could not be found.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              Back to Recipes
            </button>
            <button
              onClick={() => navigate('/Master/RecipeMaster')}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-sm"
            >
              Go to Recipe List
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Extract categories and meal types
  const categories = details.categoryListName?.map((c) => c.categoryName).filter(Boolean) || [];
  const mealTypes = details.mealList?.map((m) => m.mealName).filter(Boolean) || [];
  const ingredients = details.recipeSubList || [];

  const statusText = details.statusStr || (details.status === 'A' ? 'Active' : 'Inactive');
  const isActive = statusText === 'Active';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {sessionExpired && <SessionExpiredModal onClose={handleSessionExpired} />}
      
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 px-4 sm:px-2 py-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Recipe Listing View
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 border border-blue-600
             dark:border-blue-400 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all shadow-sm text-sm font-medium w-full sm:w-auto"
          >
            <ArrowLeft size={16} />
            Back to Recipes
          </button>
        </div>

        {/* Recipe Title Section */}
        <div className="flex items-start gap-4 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 dark:from-green-500 dark:to-teal-600 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md">
            {details.imageUrl ? (
              <img 
                src={details.imageUrl} 
                alt={details.recipeName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl">🍽️</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
              {details.recipeName}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {details.cuisineName || details.recipeType || "International"} Cuisine • Ref: {details.refNo}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ID: {details.id}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              isActive
                ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-lg'
                : 'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-lg'
            }`}>
              {statusText}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-2 sm:px-0 py-6 space-y-6">
        {/* Image & Basic Info */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-xl">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-shrink-0 w-full lg:w-72 h-72 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-600 shadow-lg">
              <img
                src={details.imageUrl}
                alt={details.recipeName}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoCard
                icon={<Users size={16} />}
                label="Servings"
                value={`${(details.finishedProduct || 0)} persons`}
                color="blue"
              />
              <InfoCard
                icon={<BiCube size={16} />}
                label="UOM"
                value={details.uom || "N/A"}
                color="purple"
              />
              <TagCard label="Categories" tags={categories} color="indigo" isMeal={false} />
              <TagCard label="Meal Types" tags={mealTypes} color="teal" isMeal={true} />
            </div>
          </div>
        </div>

        {/* Specifications */}
        <SpecGrid details={details} formatQuantity={formatQuantity} projectSettings={projectSettings} />

        {/* Nutritional Information */}
        <NutritionalInfo details={details} formatQuantity={formatQuantity} projectSettings={projectSettings} />

        {/* Ingredients */}
        <IngredientsTable ingredients={ingredients} formatQuantity={formatQuantity} formatAmount={formatAmount} projectSettings={projectSettings} />

        {/* Cost */}
        <CostAnalysis details={details} formatAmount={formatAmount} projectSettings={projectSettings} />

        {/* Instructions */}
        <Instructions text={details.cookingInstruction} />

  
     
      </div>
    </div>
  );
};

// UI Components
const InfoCard = ({ icon, label, value, color }: any) => (
  <div
    className={`bg-gradient-to-br from-${color}-50 to-${color}-100 dark:from-${color}-900/30 dark:to-${color}-800/30 rounded-xl p-4 border border-${color}-200/50 dark:border-${color}-700/50 shadow-md hover:shadow-lg transition-shadow`}
  >
    <div className={`flex items-center gap-2 text-${color}-700 dark:text-${color}-300 mb-2`}>
      {icon}
      <span className="text-sm font-semibold">{label}</span>
    </div>
    <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
  </div>
);

const getMealColorClasses = (meal: string) => {
  const lower = meal.toLowerCase();
  if (lower.includes('breakfast')) {
    return {
      light: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-200 dark:border-orange-800/50',
      darkHover: 'dark:hover:bg-orange-900/50'
    };
  } else if (lower.includes('lunch')) {
    return {
      light: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800/50',
      darkHover: 'dark:hover:bg-green-900/50'
    };
  } else if (lower.includes('dinner') || lower.includes('night')) {
    return {
      light: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800/50',
      darkHover: 'dark:hover:bg-blue-900/50'
    };
  } else {
    return {
      light: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700/50 dark:text-gray-200 dark:border-gray-600/50',
      darkHover: 'dark:hover:bg-gray-700/70'
    };
  }
};

const getCategoryColorClasses = (index: number) => {
  const colors = ['red', 'indigo', 'purple', 'pink', 'emerald', 'amber', 'rose'];
  const color = colors[index % colors.length];
  return {
    light: `text-${color}-800 dark:text-${color}-200`,
    darkHover: `dark:hover:bg-${color}-900/50`
  };
};

const TagCard = ({ label, tags, color, isMeal }: any) => {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const icon = isMeal ? <Clock size={16} /> : <Users size={16} />;
  return (
    <div
      className={`bg-gradient-to-br from-${color}-50 to-${color}-100 dark:from-${color}-900/30 dark:to-${color}-800/30 rounded-xl p-4 border border-${color}-200/50 dark:border-${color}-700/50 shadow-md hover:shadow-lg transition-shadow`}
    >
      <div className={`flex items-center gap-2 text-${color}-700 dark:text-${color}-300 mb-2`}>
        {icon}
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <div className="flex flex-col gap-2">
        {tags.length > 0 ? (
          isMeal ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((t: string, i: number) => {
                const colorClasses = getMealColorClasses(t);
                return (
                  <span
                    key={i}
                    className={`${colorClasses.light} px-3 py-1 rounded-full text-sm font-medium border hover:shadow-sm transition-all ${colorClasses.darkHover}`}
                  >
                    {t}
                  </span>
                );
              })}
            </div>
          ) : (
            showAllCategories ? (
              <div className="flex flex-col gap-2">
                <div className="max-h-32 overflow-y-auto flex flex-wrap gap-2 p-1 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  {tags.map((t: string, i: number) => {
                    const colorClasses = getCategoryColorClasses(i);
                    return (
                      <span
                        key={i}
                        className={`${colorClasses.light} px-3 py-1 rounded-full text-sm font-medium border hover:shadow-sm transition-all ${colorClasses.darkHover}`}
                      >
                        {t}
                      </span>
                    );
                  })}
                </div>
                <button
                  onClick={() => setShowAllCategories(false)}
                  className="self-end text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  Show Less
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                {tags.slice(0, 3).map((t: string, i: number) => {
                  const colorClasses = getCategoryColorClasses(i);
                  return (
                    <span
                      key={i}
                      className={`${colorClasses.light} px-3 py-1 rounded-full text-sm font-medium border hover:shadow-sm transition-all ${colorClasses.darkHover}`}
                    >
                      {t}
                    </span>
                  );
                })}
                {tags.length > 3 && (
                  <button
                    onClick={() => setShowAllCategories(true)}
                    className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-colors"
                  >
                    +{tags.length - 3}
                  </button>
                )}
              </div>
            )
          )
        ) : (
          <span className="text-sm text-gray-400">N/A</span>
        )}
      </div>
    </div>
  );
};

const SpecGrid = ({ details, formatQuantity, projectSettings }: { details: RecipeDetails; formatQuantity: any; projectSettings: any }) => (
  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-xl">
    <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
      <BiCube size={20} className="text-blue-500" />
      Recipe Specifications
    </h3>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
      <SpecItem label="Base Quantity" value={formatQuantity(details.baseQuantity || 0, projectSettings?.quantityDecimalPlaces || 2)} icon="📏" />
      <SpecItem label="Finished Product" value={(details.finishedProduct || 0)} icon="👥" />
      <SpecItem label="Portion Size" value={formatQuantity(details.portionSize || 0, projectSettings?.quantityDecimalPlaces || 2)} icon="🍽️" />
      <SpecItem label="Country Origin" value={details.cuisineName || "N/A"} icon="🌍" />
    </div>
  </div>
);

const SpecItem = ({ label, value, icon }: { label: string; value: any; icon?: string }) => (
  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 flex items-center justify-center gap-1">
      {icon && <span>{icon}</span>}
      {label}
    </div>
    <p className="text-lg font-bold text-gray-900 dark:text-white">{value ?? "N/A"}</p>
  </div>
);

const NutritionalInfo = ({ details, formatQuantity, projectSettings }: { details: RecipeDetails; formatQuantity: any; projectSettings: any }) => (
  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-xl">
    <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
      <Apple size={20} className="text-green-500" />
      Nutritional Information (per serving)
    </h3>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
      <NutriItem 
        label="Calories" 
        value={formatQuantity(details.calories || 0, projectSettings?.quantityDecimalPlaces || 2)} 
        icon={<Zap size={16} className="mx-auto mb-1 text-yellow-500" />} 
      />
      <NutriItem 
        label="Protein" 
        value={formatQuantity(details.protein || 0, projectSettings?.quantityDecimalPlaces || 2)} 
        icon={<Dumbbell size={16} className="mx-auto mb-1 text-purple-500" />} 
      />
      <NutriItem 
        label="Carbs" 
        value={formatQuantity(details.carbs || 0, projectSettings?.quantityDecimalPlaces || 2)} 
        icon={<Apple size={16} className="mx-auto mb-1 text-orange-500" />} 
      />
      <NutriItem 
        label="Fat" 
        value={formatQuantity(details.fat || 0, projectSettings?.quantityDecimalPlaces || 2)} 
        icon={<Droplets size={16} className="mx-auto mb-1 text-green-500" />} 
      />
    </div>
  </div>
);

const NutriItem = ({ label, value, icon }: { label: string; value: any; icon: any }) => (
  <div className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/30 dark:to-blue-900/30 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">{label}</div>
    {icon}
    <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{value ?? "0.0000"}</p>
  </div>
);

const IngredientsTable = ({ ingredients, formatQuantity, formatAmount, projectSettings }: { ingredients: NestedRecipeItem[]; formatQuantity: any; formatAmount: any; projectSettings: any }) => (
  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-xl overflow-hidden">
    <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
      <BiCube size={20} className="text-indigo-500" />
      Recipe Ingredients
      <span className="ml-auto text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full font-medium">
        {ingredients.length} items
      </span>
    </h3>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50/50 dark:bg-gray-700/50 border-b border-gray-200/50 dark:border-gray-600/50">
            <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-gray-300">Category</th>
            <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-gray-300">Item</th>
            <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-gray-300">Item Code</th>
            <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-gray-300">Package ID</th>
            <th className="text-right py-3 px-3 font-semibold text-gray-700 dark:text-gray-300">Package Price</th>
            <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-gray-300">Chef Unit</th>
            <th className="text-right py-3 px-3 font-semibold text-gray-700 dark:text-gray-300">Quantity</th>
            <th className="text-right py-3 px-3 font-semibold text-gray-700 dark:text-gray-300">Cost</th>
          </tr>
        </thead>
        <tbody>
          {ingredients.length > 0 ? (
            ingredients.map((ing, i) => (
              <tr key={i} className="border-b border-gray-100/50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="py-3 px-3 font-medium text-gray-900 dark:text-white">{ing.itemCategoryName || "N/A"}</td>
                <td className="py-3 px-3 font-semibold text-gray-900 dark:text-white">{ing.itemName || "N/A"}</td>
                <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{ing.itemCode || "N/A"}</td>
                <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{ing.packageId || "N/A"}</td>
                <td className="py-3 px-3 text-right font-medium">{formatAmount(ing.packagePrice || 0, projectSettings?.quantityDecimalPlaces || 2)}</td>
                <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{ing.chefUnit || "N/A"}</td>
                <td className="py-3 px-3 text-right font-medium">{formatQuantity(ing.quantity || 0, projectSettings?.quantityDecimalPlaces || 2)}</td>
                <td className="py-3 px-3 text-right font-bold text-gray-900 dark:text-white">{formatAmount(ing.total || ing.costPrice || 0, projectSettings?.costDecimalPlaces || 2)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="text-center py-8 text-gray-400">
                No ingredients available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const CostAnalysis = ({ details, formatAmount, projectSettings }: { details: RecipeDetails; formatAmount: any; projectSettings: any }) => (
  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-xl">
    <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
      <BiCube size={20} className="text-purple-500" />
      Cost Analysis
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
      <SpecItem label="Total Cost" value={`${formatAmount(details.totalCost || 0, projectSettings?.costDecimalPlaces || 2)}`} icon="💰" />
      <SpecItem label="Cost per Portion" value={`${formatAmount(details.perPortionCost || 0, projectSettings?.costDecimalPlaces || 2)}`} icon="📊" />
      <SpecItem label="Base UOM" value={details.uom} icon="🔧" />
    </div>
  </div>
);

const Instructions = ({ text }: { text: string }) => (
  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-xl">
    <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
      <Clock size={20} className="text-teal-500" />
      Cooking Instructions
    </h3>
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line shadow-inner">
      {text || "No instructions provided."}
    </div>
  </div>
);





export default RecipeListingView;