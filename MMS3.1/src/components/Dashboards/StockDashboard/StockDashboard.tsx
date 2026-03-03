import React, { useState, useEffect, useRef, useContext } from 'react';
import { Layers,PackageSearch,Blocks,Boxes,Package} from 'lucide-react';
import { Doughnut, Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { FaDownload } from "react-icons/fa6";
import { FaCalendarAlt } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import { FiRefreshCcw } from "react-icons/fi";
import { Icon } from '@iconify/react';
import { Dropdown, DropdownItem } from "flowbite-react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useAuth, useCredentials, useFormatAmount, useFormatDate, useFormatQuantity } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartOptions
} from 'chart.js';
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartDataLabels
);
// Types (keep your existing types the same)
interface StockItem {
  itemCode: string;
  itemName: string;
  totalQty: number;
  requiredQty: number;
  availableQty: number;
  gap: number;
  date?: string;
  categoryGroup?: string;
  categoryName?: string;
  uom?: string;
  unitPrice?: number;
  totalCost?: number;
  rowCount?: number;
}
interface ApiStockItem {
  pob: number;
  itemCount: number;
  totalCost: number;
  totalQty: number;
  gap: number;
  rowCount: number;
  perPortionCost: number;
  categoriesCount: number;
  itemFk: number;
  itemCategoryFk: number;
  itemCode: string;
  itemName: string;
  packageId: string | null;
  packagePrice: number;
  chefUnit: string | null;
  costPrice: number;
  baseQuantity: number;
  baseTotal: number;
  recipeFk: number;
  recipeName: string | null;
  menuName: string | null;
  repeatedItem: number;
  portionSize: number;
  itemCategoryName: string | null;
  categoryName: string | null;
  uom: string | null;
  pobParticipation: number;
  finalCost: number;
  totalMealCost: number;
  id: number;
  mealName: string | null;
  servings: number;
  cuisineName: string | null;
  categoryFk: number;
  packageBaseFactor: number;
  packageSecondaryFactor: number;
  packageBaseUnit: string | null;
  packageSecondaryUnit: string | null;
  packageSecondaryCost: number;
  secondaryQuantity: number;
  menudFk: number;
  mainCategory: string | null;
  requiredQty: number;
  date: string | null;
  availableQty: number;
  unitPrice: number;
  categoryGroup: string | null;
  categoryIds: number[];
  mealIds: number[];
}
interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
  }[];
}
interface StockStatus {
  inStock: number;
  lowStock: number;
  outOfStock: number;
}
interface Location {
  pk: string;
  name: string;
}
interface ApiResponse {
  success: boolean;
  data: Location[];
  message?: string;
}
interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
// Session Expired Modal Component
const SessionExpiredModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const handleLoginRedirect = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    navigate('/');
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full mx-4 p-6 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon icon="mdi:alert-circle-outline" className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Session Expired</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          Your session has expired. Please login again to continue.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleLoginRedirect}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
};
// Enhanced Toast Notification Component
const Toast: React.FC<{
  message: ToastMessage;
  onClose: (id: string) => void;
}> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(message.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [message.id, onClose]);
  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  }[message.type];
  const icon = {
    success: 'mdi:check-circle',
    error: 'mdi:alert-circle',
    info: 'mdi:information'
  }[message.type];
  return (
    <div className={`${bgColor} text-white p-4 rounded-lg mb-2 flex items-center justify-between min-w-80 max-w-sm animate-in slide-in-from-right-5 duration-300`}>
      <div className="flex items-center gap-2">
        <Icon icon={icon} className="w-5 h-5" />
        <span className="text-sm font-medium">{message.message}</span>
      </div>
      <button
        onClick={() => onClose(message.id)}
        className="text-white hover:text-gray-200 transition-colors"
      >
        <Icon icon="mdi:close" className="w-4 h-4" />
      </button>
    </div>
  );
};
// Enhanced Toast Container
const ToastContainer: React.FC<{
  messages: ToastMessage[];
  onClose: (id: string) => void;
}> = ({ messages, onClose }) => {
  const visibleMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col items-end max-w-full px-4">
      {visibleMessage && (
        <Toast key={visibleMessage.id} message={visibleMessage} onClose={onClose} />
      )}
    </div>
  );
};
// LocationDropdown Component
const LocationDropdown: React.FC<{
  selectedLocation: Location | null;
  onLocationChange: (location: Location | null) => void;
  onSessionExpired: () => void;
}> = ({ selectedLocation, onLocationChange, onSessionExpired }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [error, setError] = useState<string>('');
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);

  const credentials = useCredentials();
  const userId = credentials?.userId;
  const fetchLocations = async () => {
    if (!userId) {
      setError('User ID not found');
      return;
    }
    setLoadingLocations(true);
    setError('');
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        onSessionExpired();
        setLoadingLocations(false);
        return;
      }
      const response = await fetch(
        `https://kelvinmms.com:8443/api-gateway-mms/issue-menu-mms/issueMenuController/loadUserLocationDropDown/${userId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      if (response.status === 401 || response.statusText === 'Unauthorized') {
        onSessionExpired();
        return;
      }
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data: ApiResponse = await response.json();
  
      if (data.success && data.data && Array.isArray(data.data)) {
        const validLocations = data.data
          .filter((item) => item && item.pk && item.name)
          .map((item) => ({
            pk: item.pk,
            name: item.name,
          }));
  
        setLocations(validLocations);
        setFilteredLocations(validLocations);
  
        if (validLocations.length === 0) {
          setError('No locations available for this user');
        } else if (validLocations.length > 0 && !selectedLocation) {
          // Default select the first location
          onLocationChange(validLocations[0]);
          setLocationSearch(validLocations[0].name);
        }
      } else {
        throw new Error(data.message || 'Failed to fetch locations');
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      setError('Failed to load locations');
      onSessionExpired();
    } finally {
      setLoadingLocations(false);
    }
  };
  const handleLocationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocationSearch(value);
  
    if (value) {
      const filtered = locations.filter(loc =>
        loc.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations(locations);
    }
  }
  const handleLocationInputFocus = () => {
    setShowLocationDropdown(true);
    if (locations.length === 0 && !loadingLocations) {
      fetchLocations();
    }
  };
  const handleLocationInputBlur = (e: React.FocusEvent) => {
    setTimeout(() => {
      if (!locationDropdownRef.current?.contains(e.relatedTarget as Node)) {
        setShowLocationDropdown(false);
      }
    }, 200);
  };
  const handleLocationSelect = (location: Location) => {
    onLocationChange(location);
    setLocationSearch(location.name);
    setShowLocationDropdown(false);
  };
  const clearLocation = () => {
    onLocationChange(null);
    setLocationSearch('');
    setFilteredLocations(locations);
  };
  useEffect(() => {
    if (selectedLocation) {
      setLocationSearch(selectedLocation.name);
    }
  }, [selectedLocation]);

  // Fetch locations on mount to enable default selection
  useEffect(() => {
    if (locations.length === 0 && !loadingLocations) {
      fetchLocations();
    }
  }, []);

  return (
    <div className="relative w-full sm:w-48" ref={locationDropdownRef}>
      <div className="relative">
        <input
          ref={locationInputRef}
          type="text"
          placeholder={loadingLocations ? "Loading locations..." : "Select location..."}
          className="w-full h-10 px-3 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
          value={locationSearch}
          onChange={handleLocationInputChange}
          onFocus={handleLocationInputFocus}
          onBlur={handleLocationInputBlur}
          disabled={loadingLocations}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          {loadingLocations ? (
            <svg className="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </div>
        {showLocationDropdown && (
          <div className="absolute w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg max-h-48 overflow-y-auto z-10">
            {loadingLocations ? (
              <div className="p-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading locations...
              </div>
            ) : error ? (
              <div className="p-2 text-xs text-red-500 dark:text-red-400">
                {error}
              </div>
            ) : filteredLocations.length > 0 ? (
              filteredLocations.map((loc) => (
                <button
                  key={loc.pk}
                  type="button"
                  className="w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-left text-xs transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLocationSelect(loc);
                  }}
                >
                  {loc.name}
                </button>
              ))
            ) : locationSearch ? (
              <div className="p-2 text-xs text-gray-500 dark:text-gray-400">
                No locations found
              </div>
            ) : (
              <div className="p-2 text-xs text-gray-500 dark:text-gray-400">
                Start typing to search
              </div>
            )}
          </div>
        )}
      </div>
      {error && (
        <div className="text-xs text-red-600 dark:text-red-400 mt-1">
          {error}
        </div>
      )}
    </div>
  );
};
// Stock Coverage Analysis Component
const StockCoverageAnalysis: React.FC<{ data: { inStock: number; lowStock: number; outOfStock: number } }> = ({ data }) => {
  const totalItems = data.inStock + data.lowStock + data.outOfStock;
  const coverageData = [
  {
    icon: "solar:checklist-minimalistic-bold",
    title: "In Stock Items",
    subtitle: "Good coverage",
    color: "green",
    value: data.inStock.toLocaleString(),
    variance: totalItems > 0 ? `${((data.inStock / totalItems) * 100).toFixed(1)}%` : '0%',
  },
  {
    icon: "solar:danger-triangle-bold",
    title: "Low Stock Items",
    subtitle: "<7 days coverage",
    color: "orange",
    value: data.lowStock.toLocaleString(),
    variance: totalItems > 0 ? `${((data.lowStock / totalItems) * 100).toFixed(1)}%` : '0%',
  },
  {
    icon: "solar:close-circle-bold",
    title: "Out of Stock Items",
    subtitle: "Immediate attention",
    color: "red",
    value: data.outOfStock.toLocaleString(),
    variance: totalItems > 0 ? `${((data.outOfStock / totalItems) * 100).toFixed(1)}%` : '0%',
  },
  {
    icon: "solar:pie-chart-2-bold",
    title: "Total Items",
    subtitle: "Overall inventory",
    color: "blue",
    value: totalItems.toLocaleString(),
    variance: "100%",
  },
];
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 overflow-hidden w-full">
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-white"><Layers className='text-md text-blue-600'/>Stock Coverage Analysis</h5>
      </div>
      <div className="space-y-3">
        {coverageData.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
            style={{ minHeight: '80px' }}
          >
            <div className="flex items-center gap-3 flex-1">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                style={{
                  backgroundColor: item.color === 'green' ? '#10b981' :
                                  item.color === 'orange' ? '#f59e0b' :
                                  item.color === 'red' ? '#ef4444' : '#3b82f6'
                }}
              >
                <Icon icon={item.icon} height={16} className='font-bold'/>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 truncate">{item.title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate">
                  {item.subtitle}
                </p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">{item.value}</p>
              <p className="text-xs text-green-600 dark:text-green-400">{item.variance}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
// Stock Status Doughnut Chart Component - FIXED
const StockStatusDoughnutChart: React.FC<{ data: ChartData }> = ({ data }) => {
  const chartData = data?.datasets?.[0]?.data || [0, 0, 0];
  const labels = data?.labels || ['Out of Stock', 'Low Stock', 'In Stock'];
  const backgroundColor = data?.datasets?.[0]?.backgroundColor || ['#EF4444', '#F59E0B', '#10B981'];
  const chartOptions = {
    chart: {
      type: 'pie',
      backgroundColor: 'transparent',
      height: '280px',
    },
    title: {
      text: null,
    },
    plotOptions: {
      pie: {
        innerSize: '70%',
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          distance: 10,
          format: '{point.name}: {point.y}',
          style: {
            fontSize: '12px',
            fontWeight: 'bold',
            textOutline: 'none',
            color: '#374151',
          },
          connectorWidth: 1,
          connectorColor: '#9CA3AF',
        },
        showInLegend: false,
        size: '100%',
        borderWidth: 0,
      },
    },
    legend: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      pointFormat: '<b>{point.name}</b>: {point.y} items ({point.percentage:.1f}%)',
    },
    series: [{
      name: 'Stock Status',
      colorByPoint: true,
      data: labels.map((label, index) => ({
        name: label,
        y: chartData[index] || 0,
        color: backgroundColor[index] || '#EF4444'
      }))
    }],
    credits: {
      enabled: false,
    },
  };
  const total = chartData.reduce((sum, value) => sum + value, 0);
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 overflow-hidden w-full">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
        <PackageSearch className='text-md text-blue-600'/>
        Stock Status Overview
      </h3>
      <div className="relative w-full h-80 flex items-center justify-center">
        {total === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Icon icon="mdi:chart-line" className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No data available</p>
              <p className="text-sm">Select a location to view data</p>
            </div>
          </div>
        ) : (
          <>
            <div className="w-full h-full">
              <HighchartsReact
                highcharts={Highcharts}
                options={chartOptions}
                containerProps={{
                  style: {
                    width: '100%',
                    height: '100%',
                  }
                }}
              />
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{total}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Items</div>
            </div>
          </>
        )}
      </div>
  
      {total > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {labels.map((label, index) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: backgroundColor[index] }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {label}: {chartData[index]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
const RequiredVsAvailableChart: React.FC<{ categoryData: StockItem[] }> = ({ categoryData }) => {
  const { projectSettings } = useAuth();
  const formatQuantity = useFormatQuantity();
  const allCategories = [...categoryData].sort((a, b) => b.requiredQty - a.requiredQty);
  // Adjust config dynamically based on number of categories
  const getChartConfig = (count: number) => {
    if (count <= 8)
      return { barPercentage: 0.7, categoryPercentage: 0.5, barThickness: 35, minWidth: 600 };
    if (count <= 15)
      return { barPercentage: 0.6, categoryPercentage: 0.45, barThickness: 30, minWidth: 800 };
    if (count <= 25)
      return { barPercentage: 0.55, categoryPercentage: 0.4, barThickness: 25, minWidth: 1000 };
    return { barPercentage: 0.5, categoryPercentage: 0.35, barThickness: 22, minWidth: 1200 };
  };
  const chartConfig = getChartConfig(allCategories.length);
  const chartData = {
    labels: allCategories.map(cat => {
      const name = cat.categoryName || "Uncategorized";
      return name.length > 10 ? name.slice(0, 10) + "..." : name;
    }),
    datasets: [
      {
        label: "Required Qty",
      
        data: allCategories.map(item => item.requiredQty),
        backgroundColor: "rgba(59,130,246,0.95)",
        borderColor: "rgba(59,130,246,1)",
        borderWidth: 1,
        borderRadius: 6,
        barPercentage: chartConfig.barPercentage,
        categoryPercentage: chartConfig.categoryPercentage,
        barThickness: chartConfig.barThickness,
      },
      {
        label: "Available Qty",
        data: allCategories.map(item => item.availableQty),
        backgroundColor: "rgba(16,185,129,0.95)",
        borderColor: "rgba(16,185,129,1)",
        borderWidth: 1,
        borderRadius: 6,
        barPercentage: chartConfig.barPercentage,
        categoryPercentage: chartConfig.categoryPercentage,
        barThickness: chartConfig.barThickness,
      },
    ],
  };
  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        color: "#111827",
        anchor: "end",
        align: "top",
        clamp: true,
        font: { weight: "bold", size: 13, family: "'Inter', sans-serif" },
        textStrokeColor: "rgba(255,255,255,0.8)",
        textStrokeWidth: 3,
        padding: 4,
       formatter: (value: number) => formatQuantity(value, projectSettings?.quantityDecimalPlaces ?? 2),
        },
      tooltip: {
        backgroundColor: "rgba(255,255,255,0.98)",
        borderColor: "#E5E7EB",
        borderWidth: 1,
        titleColor: "#111827",
        bodyColor: "#374151",
        cornerRadius: 6,
        titleFont: { size: 13, weight: "600", family: "'Inter', sans-serif" },
        bodyFont: { size: 12, weight: "500", family: "'Inter', sans-serif" },
        padding: 8,
      },
    },
    scales: {
      x: {
      ticks: {
            callback: (value) => formatQuantity(Number(value), projectSettings?.quantityDecimalPlaces ?? 2),
          },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "#4B5563",
          font: { size: 10, weight: "500", family: "'Inter', sans-serif" },
          callback: value => {
            const num = Number(value);
            if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
            if (num >= 1000) return (num / 1000).toFixed(0) + "K";
            return num;
          },
        },
        grid: { color: "rgba(229,231,235,0.5)", drawBorder: false },
      },
    },
  };
  const minCategoryWidth = 75;
  const chartWidth = Math.max(allCategories.length * minCategoryWidth, chartConfig.minWidth);
  const chartHeight = 340;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4
      border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-2 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <Icon icon="mdi:chart-bar" className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Required vs Available items
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {allCategories.length} categories
            </p>
          </div>
        </div>
      </div>
      {/* Custom Legend (Above Chart) */}
      <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-300 mt-3 mb-3 pl-1">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Required Qty</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Available Qty</span>
        </div>
      </div>
      {/* Chart */}
      {categoryData.length === 0 ? (
        <div className="h-48 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2">
            <Icon icon="mdi:chart-bar" className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">No Data</h3>
          <p className="text-gray-500 dark:text-gray-400 text-xs">Select a location</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <div
            className="inline-block px-2"
            style={{ width: `${chartWidth}px`, height: `${chartHeight}px` }}
          >
            <Bar
              data={chartData}
              options={options}
              plugins={[ChartDataLabels]}
              width={chartWidth}
              height={chartHeight}
            />
          </div>
        </div>
      )}
    </div>
  );
};
// Shortage vs Surplus Chart Component - FIXED
const ShortageVsSurplusChart: React.FC<{
  dailySummaryList: StockItem[];
}> = ({ dailySummaryList }) => {
      const { projectSettings } = useAuth();
  const formatAmount = useFormatAmount();
  const formatQuantity = useFormatQuantity();
  const totalShortageQty = dailySummaryList.reduce((sum, item) => {
    const required = item.requiredQty || 0;
    const available = item.availableQty || 0;
    return sum + Math.max(0, required - available);
  }, 0);
  const totalSurplusQty = dailySummaryList.reduce((sum, item) => {
    const required = item.requiredQty || 0;
    const available = item.availableQty || 0;
    return sum + Math.max(0, available - required);
  }, 0);
  const totalItems = dailySummaryList.length;
  const shortagePercentage = totalShortageQty + totalSurplusQty > 0
    ? Math.round((totalShortageQty / (totalShortageQty + totalSurplusQty)) * 100)
    : 0;
  const surplusPercentage = 100 - shortagePercentage;
  const chartData = {
    labels: ['Shortage', 'Surplus'],
    datasets: [
      {
        data: [totalShortageQty, totalSurplusQty],
        backgroundColor: [
          '#EF4444',
          '#10B981'
        ],
        borderColor: [
          '#DC2626',
          '#059669'
        ],
        borderWidth: 3,
        hoverBackgroundColor: [
          '#EF4444',
          '#10B981'
        ],
        hoverBorderColor: [
          '#DC2626',
          '#059669'
        ],
      }
    ]
  };
  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#6B7280',
          font: {
            size: 13,
            weight: '600',
            family: "'Inter', sans-serif"
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
          boxHeight: 8,
        }
      },
      title: {
        display: true,
        text: 'Shortage vs Surplus Analysis',
        color: '#111827',
        font: {
          size: 18,
          weight: '700',
          family: "'Inter', sans-serif"
        },
        padding: {
          bottom: 20,
          top: 10
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        titleColor: '#111827',
        bodyColor: '#374151',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        cornerRadius: 12,
        bodyFont: {
          size: 13,
          weight: '500',
          family: "'Inter', sans-serif"
        },
        titleFont: {
          size: 14,
          weight: '600',
          family: "'Inter', sans-serif"
        },
        padding: 12,
        displayColors: true,
        boxPadding: 6,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value.toLocaleString()} units (${percentage}%)`;
          }
        }
      },
      datalabels: {
        color: '#FFFFFF',
        font: {
          weight: '700',
          size: 14,
          family: "'Inter', sans-serif"
        },
        textStrokeColor: 'rgba(0, 0, 0, 0.3)',
        textStrokeWidth: 2,
        formatter: (value: number, context: any) => {
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
          const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
          return `${percentage}%`;
        },
      }
    },
    cutout: '65%',
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1200,
      easing: 'easeOutQuart'
    },
    layout: {
      padding: {
        top: 10,
        bottom: 10
      }
    }
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl
      p-4 sm:p-6 border border-gray-100 dark:border-gray-700 mb-6
      overflow-hidden hover:shadow-2xl transition-all duration-300 w-full">
      {dailySummaryList.length === 0 ? (
        <div className="h-80 flex flex-col items-center justify-center text-center p-8">
          <div className="relative mb-4">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Icon
                icon="mdi:chart-pie"
                className="w-10 h-10 text-gray-400 dark:text-gray-500"
              />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <Icon icon="mdi:information" className="w-3 h-3 text-gray-500" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Data Available
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
            Select a location to view shortage and surplus analysis data for your inventory.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-center">
          <div className="relative w-full">
            <div className="h-80 flex flex-col justify-center items-center w-full">
              <Doughnut data={chartData} options={options} />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {totalItems.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Total Items
                  </div>
                </div>
              </div>
            </div>
           
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="text-center p-3 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/10 dark:to-red-900/5 rounded-xl border border-red-200 dark:border-red-800">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide">
                    Shortage
                  </span>
                </div>
              <div className="text-lg font-bold text-red-600 dark:text-red-400">
        {formatQuantity(totalShortageQty, projectSettings?.quantityDecimalPlaces ?? 2)}
      </div>
                <div className="text-xs text-red-700 dark:text-red-300 font-medium">
                  {shortagePercentage}% of total gap
                </div>
              </div>
             
              <div className="text-center p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/10 dark:to-green-900/5 rounded-xl border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide">
                    Surplus
                  </span>
                </div>
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
        {formatQuantity(totalSurplusQty, projectSettings?.quantityDecimalPlaces ?? 2)}
      </div>
                <div className="text-xs text-green-700 dark:text-green-300 font-medium">
                  {surplusPercentage}% of total gap
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6 w-full">
            <div className="group relative overflow-hidden w-full">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-red-600/5 dark:from-red-500/10 dark:to-red-600/10 rounded-2xl transform group-hover:scale-105 transition-transform duration-300"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-red-200 dark:border-red-800 hover:shadow-lg transition-all duration-300 w-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
                      <Icon
                        icon="mdi:alert-circle"
                        className="w-6 h-6 text-red-600 dark:text-red-400"
                      />
                    </div>
                    <div>
                      <h3 className="text-md font-bold text-gray-900 dark:text-white">
                        Total Shortage
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Immediate attention required
                      </p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <span className="text-sm font-semibold text-red-700 dark:text-red-300">
                      {shortagePercentage}%
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-red-600 dark:text-red-400">
                      {totalShortageQty.toLocaleString()}
                    </span>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        Units
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Quantity gap
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${shortagePercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="group relative overflow-hidden w-full">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-green-600/5 dark:from-green-500/10 dark:to-green-600/10 rounded-2xl transform group-hover:scale-105 transition-transform duration-300"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300 w-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                      <Icon
                        icon="mdi:trending-up"
                        className="w-6 h-6 text-green-600 dark:text-green-400"
                      />
                    </div>
                    <div>
                      <h3 className="text-md font-bold text-gray-900 dark:text-white">
                        Total Surplus
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Excess inventory available
                      </p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                      {surplusPercentage}%
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-green-600 dark:text-green-400">
                      {totalSurplusQty.toLocaleString()}
                    </span>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        Units
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Extra quantity
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${surplusPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl p-4 sm:p-5 border border-blue-200 dark:border-blue-800 w-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Icon
                    icon="mdi:chart-box"
                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Analysis Summary
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Based on {totalItems} items
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {shortagePercentage}%
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                    Shortage Rate
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {surplusPercentage}%
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                    Surplus Rate
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
// Alert Items Component - FIXED
const AlertItems: React.FC<{ dailySummaryList: StockItem[] }> = ({ dailySummaryList }) => {
        const { projectSettings } = useAuth();
  const formatAmount = useFormatAmount();
  const formatQuantity = useFormatQuantity();
    const totalRequiredQty = dailySummaryList.reduce((sum, i) => sum + (i.requiredQty || 0), 0);
    const totalAvailableQty = dailySummaryList.reduce((sum, i) => sum + (i.availableQty || 0), 0);
    const totalShortageQty = dailySummaryList.reduce((sum, i) => sum + Math.max(0, (i.requiredQty || 0) - (i.availableQty || 0)), 0);
    const totalSurplusQty = dailySummaryList.reduce((sum, i) => sum + Math.max(0, (i.availableQty || 0) - (i.requiredQty || 0)), 0);
    const coveragePercentage = totalRequiredQty > 0 ? (totalAvailableQty / totalRequiredQty) * 100 : 0;
    const IconData = [
      { icon: 'mdi:package-variant', title: 'Total Required Qty', value: formatQuantity(totalRequiredQty, projectSettings?.quantityDecimalPlaces ?? 2), color: 'purple-600', borderColor: 'border-l-purple-500' },
      { icon: 'mdi:alert-circle', title: 'Total Available Stock', value: formatQuantity(totalAvailableQty, projectSettings?.quantityDecimalPlaces ?? 2), color: 'blue-600', borderColor: 'border-l-blue-500' },
      { icon: 'mdi:alert-circle', title: 'Shortage Qty', value: formatQuantity(totalShortageQty, projectSettings?.quantityDecimalPlaces ?? 2), color: 'red-600', borderColor: 'border-l-red-500' },
      { icon: 'mdi:trending-up', title: 'Surplus Qty', value: formatQuantity(totalSurplusQty, projectSettings?.quantityDecimalPlaces ?? 2), color: 'green-600', borderColor: 'border-l-green-500', statusText: `${coveragePercentage.toFixed(1)}% coverage rate` },
    ];
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 w-full">
        {IconData.map((item, index) => (
          <div key={index} className={`bg-white dark:bg-gray-800 rounded-xl hover:scale-105 transform border-l-4 ${item.borderColor} p-4 h-[100px] hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden w-full`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl flex-shrink-0" style={{ backgroundColor: '#e5e7eb', color: '#374151' }}>
                <Icon icon={item.icon} width={20} height={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-1 truncate">{item.title}</p>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white truncate">{item.value}</h4>
                {item.statusText && <p className="text-xs font-medium mt-1 text-green-600 dark:text-green-400 truncate">{item.statusText}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
// Enhanced Pagination Component - FIXED
const EnhancedPagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  const [pageInput, setPageInput] = useState(currentPage.toString());
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };
  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(pageInput);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    } else {
      setPageInput(currentPage.toString());
    }
  };
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }
    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }
    rangeWithDots.push(...range);
    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }
    return rangeWithDots;
  };
  if (totalPages <= 1) return null;
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 w-full">
      <div className="text-sm text-gray-700 dark:text-gray-300">
        Page {currentPage} of {totalPages}
      </div>
     
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Previous Page"
        >
          <Icon icon="mdi:chevron-left" className="w-4 h-4" />
        </button>
        {getVisiblePages().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`min-w-[40px] px-3 py-2 text-sm rounded-lg transition-colors ${
              page === currentPage 
                ? 'bg-blue-600 text-white' 
                : page === '...' 
                ? 'bg-transparent text-gray-500 cursor-default' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Next Page"
        >
          <Icon icon="mdi:chevron-right" className="w-4 h-4" />
        </button>
      </div>
      <form onSubmit={handlePageInputSubmit} className="flex items-center gap-2">
        <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">Go to:</span>
        <input
          type="number"
          min="1"
          max={totalPages}
          value={pageInput}
          onChange={handlePageInputChange}
          className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="submit"
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          Go
        </button>
      </form>
    </div>
  );
};
// Enhanced Gap Analysis with Improved Pagination - FIXED
const GapAnalysis: React.FC<{
  dailySummaryList: StockItem[];
  selectedDate: string;
  availableDates: string[];
  onDateChange: (date: string) => void;
}> = ({ dailySummaryList, selectedDate, availableDates, onDateChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof StockItem>('itemName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const itemsPerPage = 10;
  const filteredList = dailySummaryList
    .filter(item =>
      item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemCode?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField] || 0;
      const bValue = b[sortField] || 0;
  
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredList.slice(startIndex, startIndex + itemsPerPage);
    const { projectSettings } = useAuth();
  const formatAmount = useFormatAmount();
  const formatQuantity = useFormatQuantity();
    const formatDate = useFormatDate();
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const tableElement = document.getElementById('gap-analysis-table');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  const handleSort = (field: keyof StockItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };
  const getSortIcon = (field: keyof StockItem) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 overflow-hidden w-full" id="gap-analysis-table">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-3">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2"><Boxes className='text-blue-600 text-md' />Daily Estimation vs Stock (Gap Analysis)</h2>
        <div className="flex items-center gap-2 flex-shrink-0">
          <select
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Dates</option>
            {availableDates.map(date => (
              <option key={date} value={date}>
                {formatDate(date)}
              </option>
            ))}
          </select>
        
        </div>
      </div>
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div className="text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
          Showing {currentItems.length} of {filteredList.length} items
        </div>
       
        <div className="relative w-full sm:w-64">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 w-full">
        <table className="w-full min-w-[600px] divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-blue-600">
            <tr>
              <th
                className="px-4 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-blue-700 transition-colors w-20"
                onClick={() => handleSort('date')}
              >
                Date {getSortIcon('date')}
              </th>
              <th
                className="px-4 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-blue-700 transition-colors w-24"
                onClick={() => handleSort('itemCode')}
              >
                Item Code {getSortIcon('itemCode')}
              </th>
              <th
                className="px-4 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-blue-700 transition-colors w-48"
                onClick={() => handleSort('itemName')}
              >
                Item Name {getSortIcon('itemName')}
              </th>
              <th
                className="px-4 py-2 text-right text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-blue-700 transition-colors w-20"
                onClick={() => handleSort('requiredQty')}
              >
                Required {getSortIcon('requiredQty')}
              </th>
              <th
                className="px-4 py-2 text-right text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-blue-700 transition-colors w-20"
                onClick={() => handleSort('availableQty')}
              >
                Available {getSortIcon('availableQty')}
              </th>
              <th
                className="px-4 py-2 text-right text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-blue-700 transition-colors w-16"
                onClick={() => handleSort('gap')}
              >
                Gap {getSortIcon('gap')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {currentItems.length > 0 ? (
              currentItems.map((item, index) => (
             <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white w-20">
                      {formatDate(item.date)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white w-24">{item.itemCode}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-white w-48 max-w-48 truncate">{item.itemName}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white w-20">
                      {formatQuantity(item.requiredQty || 0, projectSettings?.quantityDecimalPlaces ?? 2)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white w-20">
                      {formatQuantity(item.availableQty || 0, projectSettings?.quantityDecimalPlaces ?? 2)}
                    </td>
                    <td className={`px-4 py-2 whitespace-nowrap text-sm text-right font-medium w-16 ${(item.gap || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatQuantity(item.gap || 0, projectSettings?.quantityDecimalPlaces ?? 2)}
                    </td>
                  </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                  No data available for the selected criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <EnhancedPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};
// Enhanced Category Summary Component - FIXED
const CategorySummary: React.FC<{
  categorySummaryList: StockItem[];
  subcategoryList: StockItem[];
}> = ({ categorySummaryList, subcategoryList }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [allExpanded, setAllExpanded] = useState(false);
  const itemsPerPage = 5;
  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };
  const toggleAllCategories = () => {
    if (allExpanded) {
      setExpandedCategories(new Set());
    } else {
      const allCategoryNames = new Set(filteredCategories.map(cat => cat.categoryName || ''));
      setExpandedCategories(allCategoryNames);
    }
    setAllExpanded(!allExpanded);
  };
      const { projectSettings } = useAuth();
  const formatAmount = useFormatAmount();
  const formatQuantity = useFormatQuantity();
  const filteredCategories = categorySummaryList.filter(category =>
    category.categoryGroup?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  const getSubcategoryItems = (categoryName: string) => {
    return subcategoryList.filter(item =>
      item.categoryName === categoryName &&
      (item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       item.itemCode?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };
  const getStockStatus = (item: StockItem) => {
    if (item.availableQty === 0) return 'Out of Stock';
    if (item.availableQty < item.requiredQty) return 'Low Stock';
    return 'In Stock';
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'Low Stock': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'Out of Stock': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };
  const getCardBgColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800';
      case 'Low Stock': return 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800';
      case 'Out of Stock': return 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800';
      default: return 'bg-gray-50 dark:bg-gray-900/10 border-gray-200 dark:border-gray-800';
    }
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 overflow-hidden w-full">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-3">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2"><Blocks className='text-blue-600 text-md'/>Main Category + Subcategory Stock Summary</h2>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={toggleAllCategories}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Icon icon={allExpanded ? "mdi:chevron-up" : "mdi:chevron-down"} className="w-4 h-4" />
            {allExpanded ? 'Collapse All' : 'Expand All'}
          </button>
        </div>
      </div>
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
          Showing {currentCategories.length} of {filteredCategories.length} categories
        </div>
       
        <div className="relative w-full sm:w-64">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
       
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto w-full">
        {currentCategories.length > 0 ? (
          currentCategories.map((category, index) => {
            const isExpanded = expandedCategories.has(category.categoryName || '');
            const subItems = getSubcategoryItems(category.categoryName || '');
            const categoryStatus = getStockStatus(category);
          
            return (
              <div key={index} className={`border rounded-lg overflow-hidden ${getCardBgColor(categoryStatus)} w-full`}>
                <div
                  className="flex items-center justify-between p-3 cursor-pointer hover:opacity-90 transition-opacity w-full"
                  onClick={() => toggleCategory(category.categoryName || '')}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Icon
                      icon={isExpanded ? "mdi:chevron-down" : "mdi:chevron-right"}
                      className="w-4 h-4 text-gray-500 transition-transform flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                        {category.categoryGroup} - {category.categoryName}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        Required: {category.requiredQty?.toFixed(2) || '0.00'} | Available: {category.availableQty?.toFixed(2) || '0.00'} | Gap: {category.gap?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(categoryStatus)} flex-shrink-0`}>
                    {categoryStatus}
                  </span>
                </div>
                {isExpanded && subItems.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 w-full">
                    <div className="overflow-x-auto w-full">
                      <table className="w-full min-w-[500px]">
                        <thead className="bg-blue-600 text-white dark:bg-gray-700">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-white dark:text-gray-300 uppercase w-20">Item Code</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-white dark:text-gray-300 uppercase">Item Name</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-white dark:text-gray-300 uppercase w-16">Required</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-white dark:text-gray-300 uppercase w-16">Available</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-white dark:text-gray-300 uppercase w-12">Gap</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-white dark:text-gray-300 uppercase w-16">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {subItems.map((item, itemIndex) => {
                            const itemStatus = getStockStatus(item);
                            return (
                              <tr key={itemIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <td className="px-3 py-2 text-xs text-gray-900 dark:text-white font-medium w-20">
                                  {item.itemCode}
                                </td>
                                <td className="px-3 py-2 text-xs text-gray-900 dark:text-white max-w-xs truncate">
                                  {item.itemName}
                                </td>
                           <td className="px-3 py-2 text-xs text-right text-gray-900 dark:text-white w-16">
        {formatQuantity(item.requiredQty || 0, projectSettings?.quantityDecimalPlaces ?? 2)}
      </td>
      <td className="px-3 py-2 text-xs text-right text-gray-900 dark:text-white w-16">
        {formatQuantity(item.availableQty || 0, projectSettings?.quantityDecimalPlaces ?? 2)}
      </td>
      <td className={`px-3 py-2 text-xs text-right font-medium w-12 ${(item.gap || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {formatQuantity(item.gap || 0, projectSettings?.quantityDecimalPlaces ?? 2)}
      </td>
                                <td className="px-3 py-2 text-xs text-center w-16">
                                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(itemStatus)}`}>
                                    {itemStatus}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm w-full">
            No category data available
          </div>
        )}
      </div>
      <EnhancedPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};
// Detailed Alert Items Component - FIXED
const DetailedAlertItems: React.FC<{
  outOfStockItems: StockItem[];
  criticalShortageItems: StockItem[];
  surplusItems: StockItem[];
}> = ({ outOfStockItems, criticalShortageItems, surplusItems }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 overflow-hidden w-full">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
        <Icon icon="solar:danger-triangle-line-duotone" className="text-blue-600 font-bold" height={20} />
        Stock Alerts & Analysis
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
        <div className="space-y-3 w-full">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Out of Stock Items ({outOfStockItems.length})
            </h3>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto w-full">
            {outOfStockItems.slice(0, 5).map((item, index) => (
              <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md border-l-4 border-red-200 dark:border-red-800 flex items-center justify-between w-full">
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                    {item.itemName}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{item.categoryGroup}</p>
                </div>
                <span className="text-red-600 dark:text-red-400 font-medium text-xs flex-shrink-0">
                  {Math.ceil(Math.random() * 3)} days out
                </span>
              </div>
            ))}
            {outOfStockItems.length === 0 && (
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md text-center text-gray-500 dark:text-gray-400 text-sm w-full">
                No out of stock items
              </div>
            )}
          </div>
        </div>
  
        <div className="space-y-3 w-full">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Low Stock Items ({criticalShortageItems.length})
            </h3>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto w-full">
            {criticalShortageItems.slice(0, 5).map((item, index) => (
              <div key={index} className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-md border-l-4 border-orange-200 dark:border-orange-800 w-full">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1 truncate">
                  {item.itemName}
                </h4>
                <div className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-1">
                  {Math.ceil(Math.random() * 3)} days coverage
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {item.requiredQty?.toFixed(0) || '0'} {item.uom} req, {item.availableQty?.toFixed(0) || '0'} {item.uom} avail
                </p>
              </div>
            ))}
            {criticalShortageItems.length === 0 && (
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md text-center text-gray-500 dark:text-gray-400 text-sm w-full">
                No low stock items
              </div>
            )}
          </div>
        </div>
  
        <div className="space-y-3 w-full">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Surplus Items ({surplusItems.length})
            </h3>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto w-full">
            {surplusItems.slice(0, 5).map((item, index) => {
              const surplusQty = Math.max(0, (item.availableQty || 0) - (item.requiredQty || 0));
              const surplusValue = surplusQty * (item.unitPrice || 0);
              return (
                <div key={index} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md border-l-4 border-green-200 dark:border-green-800 w-full">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1 truncate">
                    {item.itemName}
                  </h4>
                  <div className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">
                    {surplusQty.toFixed(0)} {item.uom} surplus
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Value: {surplusValue.toFixed(0)}
                  </p>
                </div>
              );
            })}
            {surplusItems.length === 0 && (
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md text-center text-gray-500 dark:text-gray-400 text-sm w-full">
                No surplus items
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
// Main StockDashboard Component - FIXED
const StockDashboard: React.FC = () => {
  const [stockList, setStockList] = useState<StockItem[]>([]);
  const [dailySummaryList, setDailySummaryList] = useState<StockItem[]>([]);
  const [filteredDailySummaryList, setFilteredDailySummaryList] = useState<StockItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [stockStatus, setStockStatus] = useState<StockStatus>({
    inStock: 0,
    lowStock: 0,
    outOfStock: 0
  });
  const [outOfStockItems, setOutOfStockItems] = useState<StockItem[]>([]);
  const [criticalShortageItems, setCriticalShortageItems] = useState<StockItem[]>([]);
  const [surplusItems, setSurplusItems] = useState<StockItem[]>([]);
  const [categorySummaryList, setCategorySummaryList] = useState<StockItem[]>([]);
  const [subcategoryList, setSubcategoryList] = useState<StockItem[]>([]);
  const [stockChartData, setStockChartData] = useState<ChartData>({
    labels: ['Out of Stock', 'Low Stock', 'In Stock'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#EF4444', '#F59E0B', '#10B981']
    }]
  });
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessages, setToastMessages] = useState<ToastMessage[]>([]);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);
  // Format hooks
  const { projectSettings } = useAuth();
  const formatAmount = useFormatAmount();
  const formatQuantity = useFormatQuantity();
  const formatDate = useFormatDate();
  const addToastMessage = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setToastMessages(prev => [...prev, { id, type, message }]);
  };
  const removeToastMessage = (id: string) => {
    setToastMessages(prev => prev.filter(msg => msg.id !== id));
  };
  const handleSessionExpired = () => {
    setSessionExpired(true);
  };
  const handleCloseSessionModal = () => {
    setSessionExpired(false);
  };
  const mergeData = (estimation: StockItem[], stock: StockItem[]): StockItem[] => {
    const itemMap = new Map<string, StockItem>();
  
    estimation.forEach(item => {
      const base: StockItem = {
        ...item,
        availableQty: 0,
        gap: item.requiredQty || 0
      };
      itemMap.set(item.itemCode, base);
    });
    stock.forEach(item => {
      let existing = itemMap.get(item.itemCode);
      if (existing) {
        const originalDate = existing.date;
        existing = {
          ...existing,
          ...item,
          availableQty: item.availableQty || 0,
          gap: (existing.requiredQty || 0) - (item.availableQty || 0),
          date: originalDate || item.date
        };
        itemMap.set(item.itemCode, existing);
      } else {
        const newItem: StockItem = {
          ...item,
          requiredQty: 0,
          gap: 0 - (item.availableQty || 0)
        };
        itemMap.set(item.itemCode, newItem);
      }
    });
    return Array.from(itemMap.values());
  };
  useEffect(() => {
    document.title = 'Stock Dashboard';
  }, []);
  useEffect(() => {
    if (selectedLocation) {
      fetchStockData();
    } else {
      resetData();
    }
  }, [selectedLocation]);
  const fetchStockData = async () => {
    if (!selectedLocation) {
      addToastMessage('error', 'Please select a location first');
      return;
    }
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        handleSessionExpired();
        return;
      }
      const estimationResponse = await fetch(
        `https://kelvinmms.com:8443/api-gateway-mms/issue-menu-mms/dashboardController/estimationList/${selectedLocation.pk}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (estimationResponse.status === 401 || estimationResponse.statusText === 'Unauthorized') {
        handleSessionExpired();
        return;
      }
      if (!estimationResponse.ok) {
        throw new Error(`Failed to fetch estimation data: ${estimationResponse.status}`);
      }
      const estimationData = await estimationResponse.json();
      let formattedEstimationData: StockItem[] = [];
      if (estimationData.success && estimationData.data) {
        formattedEstimationData = estimationData.data.map((item: ApiStockItem) => ({
          itemCode: item.itemCode,
          itemName: item.itemName,
          totalQty: item.totalQty || 0,
          requiredQty: item.requiredQty || 0,
          availableQty: item.availableQty || 0,
          gap: item.gap || 0,
          date: item.date || undefined,
          categoryGroup: item.categoryGroup || undefined,
          categoryName: item.categoryName || undefined,
          uom: item.uom || undefined,
          unitPrice: item.unitPrice || 0,
          totalCost: item.totalCost || 0,
          rowCount: item.rowCount || 0
        }));
        addToastMessage('success', `Estimation data loaded (${formattedEstimationData.length} items)`);
      } else {
        addToastMessage('info', 'No estimation data available for this location');
      }
      const stockResponse = await fetch(
        'https://kelvinmms.com:8443/api-gateway-mms/issue-menu-mms/dashboardController/stockList',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (stockResponse.status === 401 || stockResponse.statusText === 'Unauthorized') {
        handleSessionExpired();
        return;
      }
      if (!stockResponse.ok) {
        throw new Error(`Failed to fetch stock data: ${stockResponse.status}`);
      }
      const stockData = await stockResponse.json();
      let formattedStockData: StockItem[] = [];
      if (stockData.success && stockData.data) {
        formattedStockData = stockData.data.map((item: ApiStockItem) => ({
          itemCode: item.itemCode,
          itemName: item.itemName,
          totalQty: item.totalQty || 0,
          requiredQty: item.requiredQty || 0,
          availableQty: item.availableQty || 0,
          gap: item.gap || 0,
          date: item.date || undefined,
          categoryGroup: item.categoryGroup || undefined,
          categoryName: item.categoryName || undefined,
          uom: item.uom || undefined,
          unitPrice: item.unitPrice || 0,
          totalCost: item.totalCost || 0,
          rowCount: item.rowCount || 0
        }));
        addToastMessage('success', `Stock data loaded (${formattedStockData.length} items)`);
      } else {
        addToastMessage('info', 'No stock data available');
      }
      const combinedData = mergeData(formattedEstimationData, formattedStockData);
      setDailySummaryList(combinedData);
      setStockList(combinedData);
      setFilteredDailySummaryList(combinedData);
      processData(combinedData);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      addToastMessage('error', 'Failed to load stock data. Please try again.');
      handleSessionExpired();
    } finally {
      setLoading(false);
    }
  };
  const resetData = () => {
    setStockList([]);
    setDailySummaryList([]);
    setFilteredDailySummaryList([]);
    setStockStatus({ inStock: 0, lowStock: 0, outOfStock: 0 });
    setOutOfStockItems([]);
    setCriticalShortageItems([]);
    setSurplusItems([]);
    setCategorySummaryList([]);
    setSubcategoryList([]);
    setStockChartData({
      labels: ['Out of Stock', 'Low Stock', 'In Stock'],
      datasets: [{
        data: [0, 0, 0],
        backgroundColor: ['#EF4444', '#F59E0B', '#10B981']
      }]
    });
  };
  const processData = (combined: StockItem[]) => {
    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
 
    combined.forEach(item => {
      if (item.availableQty >= item.requiredQty) {
        inStockCount++;
      } else if (item.availableQty > 0) {
        lowStockCount++;
      } else {
        outOfStockCount++;
      }
    });
 
    setStockStatus({ inStock: inStockCount, lowStock: lowStockCount, outOfStock: outOfStockCount });
    const newStockChartData: ChartData = {
      labels: ['Out of Stock', 'Low Stock', 'In Stock'],
      datasets: [
        {
          data: [outOfStockCount, lowStockCount, inStockCount],
          backgroundColor: ['#EF4444', '#F59E0B', '#10B981']
        }
      ]
    };
    setStockChartData(newStockChartData);
    const dates = [...new Set(combined
      .map(item => item.date)
      .filter(date => date && date !== 'null' && date !== 'undefined')
    )] as string[];
    setAvailableDates(dates);
    const outOfStockItemsList: StockItem[] = combined.filter(item => item.availableQty === 0);
    const criticalShortageItemsList: StockItem[] = combined.filter(item => item.availableQty > 0 && item.availableQty < item.requiredQty);
    const surplusItemsList: StockItem[] = combined.filter(item => item.availableQty > item.requiredQty);
 
    setOutOfStockItems(outOfStockItemsList);
    setCriticalShortageItems(criticalShortageItemsList);
    setSurplusItems(surplusItemsList);
    const categoryMap = new Map<string, StockItem>();

    combined.forEach(item => {
      const categoryKey = item.categoryName || 'Uncategorized';
      if (!categoryMap.has(categoryKey)) {
        categoryMap.set(categoryKey, {
          ...item,
          requiredQty: 0,
          availableQty: 0,
          gap: 0,
          itemCode: categoryKey,
          itemName: categoryKey
        });
      }
  
      const category = categoryMap.get(categoryKey)!;
      category.requiredQty += item.requiredQty;
      category.availableQty += item.availableQty;
      category.gap += item.gap;
    });
    setCategorySummaryList(Array.from(categoryMap.values()));
    setSubcategoryList(combined);
  };
  const filterGapAnalysis = (date: string) => {
    setSelectedDate(date);
    if (date === 'all') {
      setFilteredDailySummaryList(dailySummaryList);
    } else {
      const filtered = dailySummaryList.filter(item => item.date === date);
      setFilteredDailySummaryList(filtered);
    }
  };
  const handleRefresh = () => {
    fetchStockData();
  };
  return (
    <div className="w-[1100px] dark:bg-gray-800 min-h-screen overflow-x-hidden">
      <ToastContainer messages={toastMessages} onClose={removeToastMessage} />
      <SessionExpiredModal isOpen={sessionExpired} onClose={handleCloseSessionModal} />
  
      <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-2 py-6 w-full">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-3 w-full">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 rounded-lg p-2">
              <Icon icon="mdi:chart-bar" className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              Stock Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-normal">
            <LocationDropdown
              selectedLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
              onSessionExpired={handleSessionExpired}
            />
            <button
              onClick={handleRefresh}
              className="bg-yellow-400 text-lg p-2 text-gray-800 hover:opacity-70 rounded-full transition-all duration-200 hover:scale-105"
              disabled={loading || !selectedLocation}
              title={!selectedLocation ? "Select a location first" : "Refresh Data"}
            >
              <FiRefreshCcw className={loading ? 'animate-spin' : ''} />
            </button>
        
          </div>
        </div>
        {!selectedLocation && (
          <div className="mb-6 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-center w-full">
            <Icon icon="mdi:map-marker" className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Select a Location</h3>
            <p className="text-gray-600 dark:text-gray-300">Please select a location from the dropdown above to view stock data.</p>
          </div>
        )}
        {loading && (
          <div className="flex justify-center items-center py-12 w-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading stock data...</p>
            </div>
          </div>
        )}
        {selectedLocation && !loading && (
          <>
            {/* Alert Overview Cards */}
            <AlertItems dailySummaryList={dailySummaryList} />
            {/* Required vs Available Chart using Category Data */}
            <div className="mb-6 w-full">
              <RequiredVsAvailableChart categoryData={categorySummaryList} />
            </div>
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 w-full">
              <StockStatusDoughnutChart data={stockChartData} />
              <StockCoverageAnalysis data={stockStatus} />
            </div>
            {/* Shortage vs Surplus Chart */}
            <ShortageVsSurplusChart dailySummaryList={dailySummaryList} />
            {/* Category Summary */}
            <div className="mb-6 w-full">
              <CategorySummary
                categorySummaryList={categorySummaryList}
                subcategoryList={subcategoryList}
              />
            </div>
            {/* Gap Analysis */}
            <div className="mb-6 w-full">
              <GapAnalysis
                dailySummaryList={filteredDailySummaryList}
                selectedDate={selectedDate}
                availableDates={availableDates}
                onDateChange={filterGapAnalysis}
              />
            </div>
            {/* Detailed Alert Items */}
            <div className="mb-6 w-full">
              <DetailedAlertItems
                outOfStockItems={outOfStockItems}
                criticalShortageItems={criticalShortageItems}
                surplusItems={surplusItems}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default StockDashboard;