import React, { useEffect, useState, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate } from "react-router-dom";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Dropdown, DropdownItem } from "flowbite-react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Badge } from "flowbite-react";
import { Link } from "react-router-dom";
import Chart from 'react-apexcharts';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CardBox from "../../shared/CardBox";
import { useCredentials, useAuth, useFormatAmount, useFormatDate, useFormatQuantity } from "src/context/AuthContext";
import {
  X
} from "lucide-react";
import { FaSearch } from "react-icons/fa";
import SearchableSelect from 'src/components/Spa Components/DropdownSearch';
interface Location {
  pk: number;
  name: string;
}
const EnhancedDashboard: React.FC = () => {
  const navigate = useNavigate();
  const credentials = useCredentials();
  const { projectSettings } = useAuth();
  const formatDate = useFormatDate();
  const formatAmount = useFormatAmount();
  const formatQuantity = useFormatQuantity();
  const [selectedDateObj, setSelectedDateObj] = useState<Date>(new Date());
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  // Table state
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [filters, setFilters] = useState({
    date: '',
    category: '',
    code: '',
  });
  const [tableSearchQuery, setTableSearchQuery] = useState('');
  const itemsPerPage = 9;
  // Multi-level chart states for Group Category
  const [currentLevel, setCurrentLevel] = useState('main');
  const [selectedMain, setSelectedMain] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);
  const [viewMode, setViewMode] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [chartSortConfig, setChartSortConfig] = useState({ key: 'percentage', direction: 'desc' });
  const getSelectedDate = (monthCode: string, yearCode: string) => {
    if (!monthCode || !yearCode) return '';
    const yearNum = parseInt(yearCode);
    const monthNum = parseInt(monthCode) || new Date().getMonth() + 1;
    const date = new Date(yearNum, monthNum - 1, 5);
    return date.toISOString().split('T')[0];
  };
  const selectedMonth = selectedDateObj ? selectedDateObj.getMonth() + 1 : new Date().getMonth() + 1;
  const selectedYear = selectedDateObj ? selectedDateObj.getFullYear() : new Date().getFullYear();
  const selectedDate = useMemo(() => getSelectedDate(selectedMonth.toString(), selectedYear.toString()), [selectedMonth, selectedYear]);
  // Base data computations (always run)
  const data = apiData || {};
  const dailyList = data.dailyList || [];
  const mainCategoryList = data.mainCategoryList || [];
  const totalCost = data.totalCost || 0;
  const totalPob = data.totalPob || 0;
  const costPerPob = totalPob > 0 ? parseFloat((totalCost / totalPob).toFixed(2)) : 0;
  const avgDailyPob = dailyList.length > 0 ? parseFloat((totalPob / dailyList.length).toFixed(2)) : 0;
  // Compute daily cost analysis
  const dailyCosts = dailyList.map(item => ({ date: formatDate(new Date(item.date)), cost: item.totalCost || 0, pob: item.totalPob || 0, originalDate: item.date }));
  const maxCostDay = dailyCosts.length > 0 ? dailyCosts.reduce((max, curr) => curr.cost > max.cost ? curr : max, dailyCosts[0]) : { cost: 0, date: '', originalDate: '' };
  const minCostDay = dailyCosts.length > 0 ? dailyCosts.reduce((min, curr) => curr.cost < min.cost ? curr : min, dailyCosts[0]) : { cost: 0, date: '', originalDate: '' };
  const costVariance = minCostDay.cost > 0 ? Math.round(((maxCostDay.cost - minCostDay.cost) / minCostDay.cost) * 100) : 0;
  const avgDailyCost = dailyCosts.length > 0 ? parseFloat((dailyCosts.reduce((sum, d) => sum + d.cost, 0) / dailyCosts.length).toFixed(0)) : 0;
  // Trend chart data
  const trendChartData = dailyCosts;
  // Category colors
  const categoryColors = [
    '#6366f1', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6',
    '#ec4899', '#eab308', '#14b8a6', '#ef4444', '#06b6d4',
    '#f97316', '#db2777', '#2563eb', '#facc15', '#2dd4bf',
    '#a855f7', '#f97316', '#db2777', '#2563eb', '#facc15',
  ];
  // Current total for the level
  const currentTotal = useMemo(() => {
    if (currentLevel === 'main') return totalCost;
    if (currentLevel === 'sub' && selectedMain) {
      return mainCategoryList.filter(item => item.mainCategoryName === selectedMain).reduce((sum, item) => sum + (item.cost || 0), 0);
    }
    if (currentLevel === 'item' && selectedSub && selectedMain) {
      return mainCategoryList.filter(item => item.mainCategoryName === selectedMain && item.subCategoryName === selectedSub).reduce((sum, item) => sum + (item.cost || 0), 0);
    }
    return totalCost;
  }, [currentLevel, selectedMain, selectedSub, mainCategoryList, totalCost]);
  const rawList = mainCategoryList;
  // Pie data - full data without limits or filters
  const pieData = useMemo(() => {
    let grouped = [];
    if (currentLevel === 'main') {
      grouped = rawList.reduce((acc, item) => {
        const key = item.mainCategoryName || 'Unknown';
        if (!acc[key]) acc[key] = { name: key, amount: 0 };
        acc[key].amount += item.cost || 0;
        return acc;
      }, {});
      grouped = Object.values(grouped);
    } else if (currentLevel === 'sub' && selectedMain) {
      const filtered = rawList.filter(item => item.mainCategoryName === selectedMain);
      grouped = filtered.reduce((acc, item) => {
        const key = item.subCategoryName || 'Unknown';
        if (!acc[key]) acc[key] = { name: key, amount: 0 };
        acc[key].amount += item.cost || 0;
        return acc;
      }, {});
      grouped = Object.values(grouped);
    } else if (currentLevel === 'item' && selectedSub && selectedMain) {
      const filtered = rawList.filter(item => item.mainCategoryName === selectedMain && item.subCategoryName === selectedSub);
      grouped = filtered.map(item => ({
        name: item.itemName || 'Unknown',
        amount: item.cost || 0,
      }));
    }
    return grouped.map((item, index) => ({
      ...item,
      percentage: currentTotal > 0 ? (item.amount / currentTotal * 100) : 0,
      color: categoryColors[index % categoryColors.length],
    }));
  }, [currentLevel, selectedMain, selectedSub, rawList, currentTotal, categoryColors]);
  // List data - applies viewMode, search, sort
  const listData = useMemo(() => {
    let data = [...pieData];
    // Apply viewMode limit
    let sortedForLimit = [...data].sort((a, b) => b.percentage - a.percentage);
    if (viewMode.startsWith('least')) sortedForLimit = sortedForLimit.reverse();
    let limit = 0;
    if (viewMode === 'top5' || viewMode === 'least5') limit = 5;
    if (viewMode === 'top10' || viewMode === 'least10') limit = 10;
    data = limit > 0 ? sortedForLimit.slice(0, limit) : data;
    // Filter search
    data = data.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    // Sort for display
    data.sort((a, b) => {
      const valA = chartSortConfig.key === 'name' ? a.name.toLowerCase() : (a[chartSortConfig.key] || 0);
      const valB = chartSortConfig.key === 'name' ? b.name.toLowerCase() : (b[chartSortConfig.key] || 0);
      return chartSortConfig.direction === 'asc' ? (valA < valB ? -1 : 1) : (valA > valB ? -1 : 1);
    });
    return data;
  }, [pieData, viewMode, searchQuery, chartSortConfig]);
  // Optimized trend chart options
  const trendChartOptions = useMemo(() => ({
    chart: {
      type: 'column',
      backgroundColor: 'transparent',
      borderRadius: 10,
      style: {
        fontFamily: 'Inter, sans-serif',
      },
      height: 380,
    },
    title: {
      text: 'Daily POB vs Total Cost Trend',
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#1f2937',
      },
    },
    xAxis: {
      categories: trendChartData.map(d => d.date),
      labels: {
        rotation: -45,
        style: {
          fontSize: '10px',
          color: '#6b7280',
        },
      },
      gridLineWidth: 0,
    },
    yAxis: [
      {
        title: {
          text: 'POB',
          style: {
            color: '#2563eb',
            fontSize: '11px',
          },
        },
        labels: {
          style: {
            color: '#2563eb',
            fontSize: '10px',
          },
        },
        opposite: false,
      },
      {
        title: {
          text: 'Total Cost',
          style: {
            color: '#dc2626',
            fontSize: '11px',
          },
        },
        labels: {
          style: {
            color: '#dc2626',
            fontSize: '10px',
          },
        },
        opposite: true,
      },
    ],
    tooltip: {
      shared: true,
      borderWidth: 0,
      backgroundColor: 'rgba(255,255,255,0.95)',
      shadow: false,
      style: {
        fontSize: '12px',
      },
    },
    legend: {
      align: 'right',
      verticalAlign: 'top',
      itemStyle: {
        fontSize: '12px',
      },
    },
    plotOptions: {
      column: {
        borderRadius: 3,
        pointPadding: 0.08,
        groupPadding: 0.08,
        dataLabels: {
          enabled: true,
          format: '{y}',
          style: {
            fontSize: '9px',
            fontWeight: 'bold',
            color: '#1f2937',
          },
          y: -8,
        },
      },
      series: {
        marker: {
          enabled: false,
        },
        line: {
          dataLabels: {
            enabled: true,
            format: '{y}',
            style: {
              fontSize: '9px',
              fontWeight: 'bold',
              color: '#dc2626',
            },
          },
        },
      },
    },
    series: [
      {
        name: 'POB',
        type: 'column',
        yAxis: 0,
        data: trendChartData.map(d => d.pob),
        color: '#2563eb',
      },
      {
        name: 'Total Cost',
        type: 'line',
        yAxis: 1,
        data: trendChartData.map(d => d.cost),
        color: '#dc2626',
        marker: {
          symbol: 'circle',
          radius: 3,
        },
      },
    ],
    credits: {
      enabled: false,
    },
  }), [trendChartData]);
  // Optimized pie chart options - Increased size and improved data label handling for all levels
  const pieChartOptionsMain = useMemo(() => ({
    chart: {
      type: 'pie',
      backgroundColor: 'transparent',
      borderRadius: 10,
      height: 300, // Increased from 420 to 500 for larger size
      events: {
        load: function () {
          const chart = this;
          const center = chart.series[0].center;
          chart.renderer.text(
            `Total Cost<br>${formatAmount(currentTotal, projectSettings?.costDecimalPlaces || 2)}`,
            center[0],
            center[1],
            true
          )
          .attr({
            zIndex: 5,
            align: 'center',
            style: {
              fontSize: '16px', // Increased from 13px for better visibility
              fontWeight: 'bold',
              color: '#1f2937',
              textOutline: 'none'
            }
          })
          .add();
        }
      }
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
  distance: 35,
  softConnector: true,
  connectorPadding: 10,
  crop: false,
  overflow: 'allow',
  style: {
    fontSize: '12px',
    fontWeight: 'bold',
    textOutline: '1px contrast',
  },
  formatter: function () {
    const name = this.point.name || '';
    const maxLen = 10; // CHANGE THIS IF NEEDED
    const shortName = name.length > maxLen ? name.substring(0, maxLen) + '...' : name;
    return `${shortName}: ${this.percentage.toFixed(2)}%`;
  },
},
        showInLegend: false,
        point: {
          events: {
            click: function () {
              if (currentLevel === 'main') {
                setSelectedMain(this.name);
                setCurrentLevel('sub');
              } else if (currentLevel === 'sub') {
                setSelectedSub(this.name);
                setCurrentLevel('item');
              }
            }
          }
        }
      },
    },
    legend: {
      enabled: false,
    },
  tooltip: {
  enabled: true,
  pointFormatter: function () {
    return `<b>${this.name}</b>: ${this.amount.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })} (${this.percentage.toFixed(2)}%)`;
  }
},

    series: [{
      name: 'Categories',
      colorByPoint: true,
      data: pieData.map(d => ({ name: d.name, y: d.percentage, amount: d.amount, color: d.color })),
    }],
    credits: {
      enabled: false,
    },
  }), [pieData, currentLevel, selectedMain, selectedSub, currentTotal, formatAmount, projectSettings]);
  // Table data from mainCategoryList
  const tableData = useMemo(() => mainCategoryList.map(item => ({
    date: formatDate(new Date(item.date)),
    category: item.mainCategoryName || '',
    code: item.itemCode || '',
    itemName: item.itemName || '',
    pkgId: item.packageId || '',
    price: parseFloat((item.packagePrice || 0).toFixed(2)),
    bFactor: parseFloat((item.packageBaseFactor || 0).toFixed(2)),
    bUnit: item.packageBaseUnit || '',
    sFactor: parseFloat((item.packageSecondaryFactor || 0).toFixed(2)),
    sUnit: item.packageSecondaryUnit || '',
    sCost: parseFloat((item.packageSecondaryCost || 0).toFixed(2)),
    bQty: parseFloat((item.baseQuantity || 0).toFixed(2)),
    sQty: parseFloat((item.secondaryQuantity || 0).toFixed(2)),
    total: parseFloat((item.cost || 0).toFixed(2)),
  })), [mainCategoryList, formatDate]);
  // Filter and sort table data
  const filteredData = useMemo(() => tableData.filter(item => {
    const searchMatch = !tableSearchQuery ||
      item.category.toLowerCase().includes(tableSearchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(tableSearchQuery.toLowerCase()) ||
      item.pkgId.toLowerCase().includes(tableSearchQuery.toLowerCase());
    return (
      searchMatch &&
      (!filters.date || item.date.includes(filters.date)) &&
      (!filters.category || item.category.toLowerCase().includes(filters.category.toLowerCase())) &&
      (!filters.code || item.code.includes(filters.code))
    );
  }), [tableData, filters, tableSearchQuery]);
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    return [...filteredData].sort((a, b) => {
      let aVal = a[sortConfig.key as keyof typeof a];
      let bVal = b[sortConfig.key as keyof typeof b];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);
  const paginatedData = useMemo(() => sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [sortedData, currentPage]);
  const totalPages = useMemo(() => Math.ceil(sortedData.length / itemsPerPage), [sortedData.length]);
  const dateOptions = useMemo(() => [
    { code: '', name: 'All Dates' },
    ...dailyList.map(item => ({ code: formatDate(new Date(item.date)), name: formatDate(new Date(item.date)) })).slice(0, 3)
  ], [dailyList, formatDate]);
  // IconData with optimized sizes
  const IconData = useMemo(() => [
    {
      icon: 'mdi:account-multiple-outline',
      title: totalPob.toLocaleString(),
      subtitle: 'Total POB for Month',
      color: 'blue-600',
      borderColor: 'border-l-blue-500',
      statusText: '+5% from last month',
      statusColor: 'green-600',
    },
    {
      icon: 'mdi:money',
      title: formatAmount(totalCost, projectSettings?.costDecimalPlaces || 2),
      subtitle: 'Total Estimated Cost',
      color: 'green-600',
      borderColor: 'border-l-green-500',
      statusText: '+3% from last month',
      statusColor: 'green-600',
    },
    {
      icon: 'mdi:chart-line-variant',
      title: formatQuantity(avgDailyPob, projectSettings?.quantityDecimalPlaces || 2),
      subtitle: 'Average Daily POB',
      color: 'purple-600',
      borderColor: 'border-l-purple-500',
      statusText: 'Consistent trend',
      statusColor: 'purple-600',
    },
    {
      icon: 'mdi:calculator-variant',
      title: formatAmount(costPerPob, projectSettings?.costDecimalPlaces || 2),
      subtitle: 'Cost per POB',
      color: 'orange-600',
      borderColor: 'border-l-orange-500',
      statusText: 'Efficiency metric',
      statusColor: 'orange-600',
    },
  ], [totalPob, totalCost, avgDailyPob, costPerPob, formatAmount, formatQuantity, projectSettings]);
  // Cost per PO Efficiency
  const categoriesEfficiency = useMemo(() => dailyList.map(item => formatDate(new Date(item.date))), [dailyList, formatDate]);
  const efficiencyData = useMemo(() => dailyList.map(item => item.totalPob > 0 ? parseFloat((item.totalCost / item.totalPob).toFixed(2)) : 0), [dailyList]);
  // All useMemos for components
  const EarningReportsMemo = React.useMemo(() => (
    <EarningReports maxCostDay={maxCostDay} minCostDay={minCostDay} costVariance={costVariance} avgDailyCost={avgDailyCost} />
  ), [maxCostDay, minCostDay, costVariance, avgDailyCost]);
  const CostPerPOEfficiencyChartMemo = React.useMemo(() => (
    <CostPerPOEfficiencyChart categories={categoriesEfficiency} efficiencyData={efficiencyData} />
  ), [categoriesEfficiency, efficiencyData]);
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedLocation || !selectedDate) return;
      try {
        setLoading(true);
        const token = sessionStorage.getItem('token');
        if (!token) {
          setSessionExpired(true);
          return;
        }
        const response = await fetch('https://kelvinmms.com:8443/api-gateway-mms/issue-menu-mms/dashboardController/getEstimationSummary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            "locationFk": selectedLocation.pk,
            "date": selectedDate
          })
        });
        if (response.status === 401 || response.statusText === 'Unauthorized') {
          setSessionExpired(true);
          return;
        }
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseData = await response.json();
        if (responseData.success) {
          setApiData(responseData.data);
        } else {
          throw new Error(responseData.message || 'Failed to fetch data');
        }
      } catch (err) {
        console.error(err);
        setSessionExpired(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedLocation, selectedDate]);
  useEffect(() => {
    document.title = 'Estimated Dashboard';
  }, []);
  const handleChartBack = () => {
    if (currentLevel === 'item') {
      setCurrentLevel('sub');
      setSelectedSub(null);
    } else if (currentLevel === 'sub') {
      setCurrentLevel('main');
      setSelectedMain(null);
    }
    setSearchQuery('');
    setViewMode('all');
  };
  const handleChartSort = (key) => {
    setChartSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };
  const handleDateChange = (date: Date) => {
    setSelectedDateObj(date);
  };
  const clearDate = () => {
    setSelectedDateObj(null);
  };
  const handleTableRowClick = (categoryId) => {
    // Optional: handle row click if needed
  };
  // Session Expired Modal Component
  const SessionExpiredModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-sm w-full p-5 text-center">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Session Expired</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Your session has expired. Please login again to continue.
        </p>
        <button
          onClick={() => {
            sessionStorage.removeItem('token');
            localStorage.removeItem('token');
            navigate('/');
          }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
  // Enhanced LocationDropdown Component (with clear button)
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
    const locationDropdownRef = React.useRef<HTMLDivElement>(null);
    const locationInputRef = React.useRef<HTMLInputElement>(null);
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
              'Authorization': `Bearer ${token}`,
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
   
        const data = await response.json();
   
        if (data.success && data.data && Array.isArray(data.data)) {
          const validLocations = data.data
            .filter((item) => item && item.pk && item.name)
            .map((item) => ({
              pk: item.pk,
              name: `${item.code} - ${item.name}`,
            }));
     
          setLocations(validLocations);
          setFilteredLocations(validLocations);
     
          if (validLocations.length === 0) {
            setError('No locations available for this user');
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
    React.useEffect(() => {
      if (selectedLocation) {
        setLocationSearch(selectedLocation.name);
      }
    }, [selectedLocation]);
    const hasValue = !!locationSearch && locationSearch.trim() !== '';
    return (
      <div className="relative w-full sm:w-84" ref={locationDropdownRef}>
        <div className="relative">
          <input
            ref={locationInputRef}
            type="text"
            placeholder={loadingLocations ? "Loading..." : "Select location"}
            className="w-full h-9 px-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            value={locationSearch}
            onChange={handleLocationInputChange}
            onFocus={handleLocationInputFocus}
            onBlur={handleLocationInputBlur}
            disabled={loadingLocations}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            {hasValue && !loadingLocations && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearLocation();
                }}
                className="mr-1 flex items-center"
              >
                <X className="h-3 w-3 text-gray-400 hover:text-gray-600 transition-colors" />
              </button>
            )}
            {loadingLocations ? (
              <svg className="animate-spin h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg
                className="w-3.5 h-3.5 text-gray-400"
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
            <div className="absolute w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
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
  className="p-2 w-full max-w-full hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-left text-xs transition-colors text-gray-900 dark:text-white overflow-hidden"
  onClick={(e) => {
    e.preventDefault();
    handleLocationSelect(loc);
  }}
>
  <span className="truncate">{loc.name}</span>
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
  // EnhancedPagination Component
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 w-full">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Page {currentPage} of {totalPages}
        </div>
     
        <div className="flex items-center gap-1 flex-wrap justify-center">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Previous Page"
          >
            <Icon icon="mdi:chevron-left" className="w-4 h-4" />
          </button>
          {getVisiblePages().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...'}
              className={`min-w-[32px] px-2 py-1.5 text-sm rounded-md transition-colors ${
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
            className="p-1.5 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            className="w-14 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-2.5 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            Go
          </button>
        </form>
      </div>
    );
  };
  // Additional Statistical Summary Component
  const StatisticalSummary = () => {
    const numCategories = useMemo(() => new Set(mainCategoryList.map(item => item.mainCategoryName)).size, [mainCategoryList]);
    const avgCategoryCost = useMemo(() => numCategories > 0 ? parseFloat((totalCost / numCategories).toFixed(2)) : 0, [totalCost, numCategories]);
    const maxCategoryCost = useMemo(() => Math.max(...mainCategoryList.map(item => item.cost || 0)), [mainCategoryList]);
    const costEfficiencyTrend = useMemo(() => avgDailyCost > 0 ? Math.round((avgDailyPob * costPerPob / avgDailyCost) * 100) : 0, [avgDailyPob, costPerPob, avgDailyCost]);
    const statsData = [
      {
        icon: 'mdi:chart-pie',
        title: numCategories.toString(),
        subtitle: 'Total Categories',
        color: 'indigo-600',
        borderColor: 'border-l-indigo-500',
        statusText: 'Category Diversity',
        statusColor: 'indigo-600',
      },
{
  icon: 'mdi:money',
  title: formatAmount(avgCategoryCost, projectSettings?.costDecimalPlaces || 2),
  subtitle: 'Avg Category Cost',
  color: 'teal-600',
  borderColor: 'border-l-teal-500',
  statusText: 'Per Category Avg',
  statusColor: 'teal-600',
},
      {
        icon: 'mdi:trending-up',
        title: formatAmount(maxCategoryCost, projectSettings?.costDecimalPlaces || 2),
        subtitle: 'Max Category Cost',
        color: 'rose-600',
        borderColor: 'border-l-rose-500',
        statusText: 'Highest Spend',
        statusColor: 'rose-600',
      },
      {
        icon: 'mdi:speedometer',
        title: `${costEfficiencyTrend}%`,
        subtitle: 'Cost Efficiency',
        color: 'emerald-600',
        borderColor: 'border-l-emerald-500',
        statusText: 'Trend Index',
        statusColor: 'emerald-600',
      },
    ];
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {statsData.map((item, index) => (
          <div
            key={index}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow border-l-4 ${item.borderColor} p-3 h-[85px] hover:shadow-md transition-all duration-300 flex flex-col justify-between`}
          >
            <div className="flex items-center gap-2">
              <div
                className="p-1.5 rounded-lg shadow-sm flex-shrink-0"
                style={{
                  backgroundColor:
                    item.color === 'indigo-600' ? '#e0e7ff' : item.color === 'teal-600' ? '#ccfbf1' : item.color === 'rose-600' ? '#fecaca' : item.color === 'emerald-600' ? '#d1fae5' : '#e5e7eb',
                  color:
                    item.color === 'indigo-600' ? '#4f46e5' : item.color === 'teal-600' ? '#0d9488' : item.color === 'rose-600' ? '#e11d48' : item.color === 'emerald-600' ? '#059669' : '#374151',
                }}
              >
                <Icon icon={item.icon} width={18} height={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-1 truncate">{item.subtitle}</p>
                <h4 className="text-base font-bold text-gray-900 dark:text-white truncate">{item.title}</h4>
                {item.statusText && (
                  <p className={`text-xs font-medium mt-0.5 truncate ${
                    item.statusColor === 'indigo-600' ? 'text-indigo-600' : item.statusColor === 'teal-600' ? 'text-teal-600' : item.statusColor === 'rose-600' ? 'text-rose-600' : item.statusColor === 'emerald-600' ? 'text-emerald-600' : 'text-gray-500'
                  }`}>
                    {item.statusText}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
        <p className="text-sm text-gray-600 dark:text-gray-300">Loading dashboard data...</p>
      </div>
    </div>;
  }
  return (
    <>
      {sessionExpired && <SessionExpiredModal />}
      <div className="w-[1100px] dark:bg-gray-800 min-h-screen">
        <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-2 py-5">
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-5 gap-3">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 rounded-lg p-2 shadow">
                <Icon icon="mdi:chart-bar" className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                Estimated Dashboard
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <div className="relative w-full sm:w-60">
                <DatePicker
                  selected={selectedDateObj}
                  onChange={handleDateChange}
                  dateFormat="MMMM yyyy"
                  showMonthYearPicker
                  className="w-full h-9 px-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholderText="Select Month & Year"
                  popperClassName="z-50"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  {selectedDateObj && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        clearDate();
                      }}
                      className="mr-1 flex items-center"
                    >
                      <X className="h-3 w-3 text-gray-400 hover:text-gray-600 transition-colors" />
                    </button>
                  )}
                  <svg
                    className="w-3.5 h-3.5 text-gray-400"
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
                </div>
              </div>
              <LocationDropdown
                selectedLocation={selectedLocation}
                onLocationChange={setSelectedLocation}
                onSessionExpired={() => setSessionExpired(true)}
              />
            </div>
          </div>
          {(!selectedLocation || !selectedDateObj) && (
            <div className="mb-5 p-5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-center w-full">
              <Icon icon="mdi:map-marker" className="w-10 h-10 text-blue-500 mx-auto mb-2" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Select a Location and Month/Year</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Please select a location and month/year from the picker above to view dashboard data.</p>
            </div>
          )}
          {selectedLocation && selectedDateObj && (
            <>
              {/* Dashboard Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                {IconData.map((item, index) => (
                  <div
                      key={index}
                      className={`bg-white dark:bg-gray-800 rounded-lg shadow border-l-4 ${item.borderColor} p-3 h-[85px] hover:shadow-md transition-all duration-300 flex flex-col justify-between`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="p-1.5 rounded-lg shadow-sm flex-shrink-0"
                          style={{
                            backgroundColor:
                              item.color === 'blue-600' ? '#dbeafe' : item.color === 'green-600' ? '#dcfce7' : item.color === 'purple-600' ? '#e9d5ff' : item.color === 'orange-600' ? '#fed7aa' : '#e5e7eb',
                            color:
                              item.color === 'blue-600' ? '#2563eb' : item.color === 'green-600' ? '#16a34a' : item.color === 'purple-600' ? '#9333ea' : item.color === 'orange-600' ? '#ea580c' : '#374151',
                          }}
                        >
                          <Icon icon={item.icon} width={18} height={18} />
                        </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600 dark:text-gray-300 mb-1 truncate">{item.subtitle}</p>
                        <h4 className="text-base font-bold text-gray-900 dark:text-white truncate">{item.title}</h4>
                        {item.statusText && (
                          <p className={`text-xs font-medium mt-0.5 truncate ${
                            item.statusColor === 'green-600' ? 'text-green-600' : item.statusColor === 'purple-600' ? 'text-purple-600' : item.statusColor === 'orange-600' ? 'text-orange-600' : item.statusColor === 'red-600' ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {item.statusText}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Additional Statistical Summary */}
              <StatisticalSummary />
              {/* Trend Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-5 border border-gray-200 dark:border-gray-700 h-[400px]">
                <HighchartsReact highcharts={Highcharts} options={trendChartOptions} />
              </div>
              {/* Group Category Distribution - Multi-level */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-5 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-3">
                  <div className="flex items-center gap-3">
                    {currentLevel !== 'main' && (
                      <button
                        className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-700 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-all text-sm font-medium shadow-sm hover:shadow-md"
                        onClick={handleChartBack}
                      >
                        Back
                      </button>
                    )}
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {currentLevel === 'main' ? 'Group Category Distribution' : currentLevel === 'sub' ? `${selectedMain} Sub-Categories` : `${selectedSub} Items`}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={viewMode}
                      onChange={(e) => setViewMode(e.target.value)}
                      className="px-2.5 py-1.5 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 transition-colors"
                    >
                      <option value="all">View All</option>
                      <option value="top5">Top 5</option>
                      <option value="top10">Top 10</option>
                      <option value="least5">Least 5</option>
                      <option value="least10">Least 10</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-2.5 py-1.5 text-xs border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 w-28"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  <div className="lg:col-span-7 h-[500px]"> {/* Increased height to 500 for larger consistent size across levels */}
                    <div className="h-full flex items-center justify-center"> {/* Centered alignment */}
                      <HighchartsReact highcharts={Highcharts} options={pieChartOptionsMain} />
                    </div>
                  </div>
                  <div className="lg:col-span-5 h-[500px]"> {/* Matching height for alignment */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden h-full flex flex-col">
                      <div className="divide-y divide-gray-200 dark:divide-gray-700 flex-1 overflow-y-auto">
                        {listData.map((item, index) => (
                          <div
                            key={index}
                            className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                            style={{
                              borderLeft: `3px solid ${item.color}`,
                              backgroundColor: `${item.color}08`
                            }}
                            onClick={() => {
                              if (currentLevel === 'main') {
                                setSelectedMain(item.name);
                                setCurrentLevel('sub');
                              } else if (currentLevel === 'sub') {
                                setSelectedSub(item.name);
                                setCurrentLevel('item');
                              }
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div
                                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: item.color }}
                                />
                                <div className="flex-1 min-w-0">
                                  <h6 className="text-xs font-semibold text-gray-900 dark:text-white truncate">{item.name}</h6>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Category</p>
                                </div>
                              </div>
                              <div className="text-right ml-2 flex-shrink-0">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{formatAmount(item.amount, projectSettings?.costDecimalPlaces || 2)}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{item.percentage.toFixed(1)}%</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Daily Cost Analysis Cards */}
              {EarningReportsMemo}
              {/* Daily Item Requirements Table */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-5 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-3">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Daily Item Requirements</h2>
               
                  <div className="flex items-center gap-2 flex-wrap">
                    <SearchableSelect
                      options={dateOptions}
                      value={filters.date}
                      onChange={(val) => handleFilterChange('date', val)}
                      placeholder="All Dates"
                      displayKey="name"
                      valueKey="code"
                      className="text-sm max-w-[180px]"
                    />
   
            
                  </div>
                                <div className="relative">
                      <FaSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                      <input
                        type="text"
                        placeholder="Search Table..."
                        value={tableSearchQuery}
                        onChange={(e) => {
                          setTableSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 w-40"
                      />
                    </div>
                </div>
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 h-[450px]">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                    <thead className="bg-blue-600 sticky top-0">
                      <tr>
                        {[
                          { key: 'category', label: 'CATEGORY' },
                          { key: 'category', label: 'Item' },
                          { key: 'pkgId', label: 'PKG ID' },
                          { key: 'price', label: 'PRICE' },
                          { key: 'bFactor', label: 'B.FACTOR' },
                          { key: 'bUnit', label: 'B.UNIT' },
                          { key: 'sFactor', label: 'S.FACTOR' },
                          { key: 'sUnit', label: 'S.UNIT' },
                          { key: 'sCost', label: 'S.COST' },
                          { key: 'bQty', label: 'B.QTY' },
                          { key: 'sQty', label: 'S.QTY' },
                          { key: 'total', label: 'TOTAL' },
                        ].map((col) => (
                          <th
                            key={col.key}
                            className="px-2 py-2.5 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-blue-700 whitespace-nowrap"
                            onClick={() => handleSort(col.key)}
                          >
                            <div className="flex items-center">
                              {col.label}
                              {sortConfig?.key === col.key && (
                                <Icon
                                  icon={sortConfig.direction === 'asc' ? 'mdi:arrow-up' : 'mdi:arrow-down'}
                                  className="ml-1 w-3 h-3"
                                />
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700 overflow-y-auto">
                      {paginatedData.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors h-10" onClick={() => handleTableRowClick(row.category)}>
                          <td className="px-2 py-2 text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[120px]">{row.category}</td>
                           <td className="py-2 px-3 font-medium">
                                <div className="max-w-[120px]">
                               
                                  <div className="text-xs font-bold text-black dark:text-gray-400">{row.code}</div>
                                   <div className="text-xs font-semibold">{row.itemName}</div>
                             
                                </div>
                              </td>
                          <td className="px-2 py-2 whitespace-nowrap">
                            <span className="text-xs bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full dark:bg-blue-900 dark:text-blue-300">
                              {row.pkgId}
                            </span>
                          </td>
                          <td className="text-xs px-2 py-2 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">{formatAmount(row.price, projectSettings?.costDecimalPlaces || 2)}</td>
                          <td className="text-xs px-2 py-2 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">{formatQuantity(row.bFactor, projectSettings?.quantityDecimalPlaces || 2)}</td>
                          <td className="text-xs px-2 py-2 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">{row.bUnit}</td>
                          <td className="text-xs px-2 py-2 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">{formatQuantity(row.sFactor, projectSettings?.quantityDecimalPlaces || 2)}</td>
                          <td className="text-xs px-2 py-2 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">{row.sUnit}</td>
                          <td className="text-xs px-2 py-2 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">{formatAmount(row.sCost, projectSettings?.costDecimalPlaces || 2)}</td>
                          <td className="text-xs px-2 py-2 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">{formatQuantity(row.bQty, projectSettings?.quantityDecimalPlaces || 2)}</td>
                          <td className="text-xs px-2 py-2 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">{formatQuantity(row.sQty, projectSettings?.quantityDecimalPlaces || 2)}</td>
                          <td className="text-xs px-2 py-2 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">{formatAmount(row.total, projectSettings?.costDecimalPlaces || 2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Enhanced Pagination */}
                <EnhancedPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
              {/* Cost Per PO Efficiency */}
              <div className="grid grid-cols-1">
                {CostPerPOEfficiencyChartMemo}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};
// EarningReports Component - Dynamic
const EarningReports = ({ maxCostDay, minCostDay, costVariance, avgDailyCost }) => {
  const { projectSettings } = useAuth();
  const formatAmount = useFormatAmount();
  const formatDate = useFormatDate();
  const getBorderColor = (color) => {
    switch (color) {
      case 'green': return 'border-l-green-500';
      case 'blue': return 'border-l-blue-500';
      case 'purple': return 'border-l-purple-500';
      case 'orange': return 'border-l-orange-500';
      default: return 'border-l-gray-500';
    }
  };
  const getBgAndTextColor = (color) => {
    switch (color) {
      case 'green': return { bg: '#dcfce7', text: '#16a34a' };
      case 'blue': return { bg: '#dbeafe', text: '#2563eb' };
      case 'purple': return { bg: '#e9d5ff', text: '#9333ea' };
      case 'orange': return { bg: '#fed7aa', text: '#ea580c' };
      default: return { bg: '#e5e7eb', text: '#374151' };
    }
  };
  const dailyCostData = useMemo(() => [
    {
      icon: "solar:calendar-line-duotone",
      title: formatAmount(maxCostDay.cost, projectSettings?.costDecimalPlaces || 2),
      subtitle: `Highest Cost`,
      color: "green",
      borderColor: 'border-l-green-500',
      statusText: formatDate(new Date(maxCostDay.originalDate)),
      statusColor: "green-600",
    },
    {
      icon: "solar:calendar-line-duotone",
      title: formatAmount(minCostDay.cost, projectSettings?.costDecimalPlaces || 2),
      subtitle: `Lowest Cost`,
      color: "blue",
      borderColor: 'border-l-blue-500',
      statusText: formatDate(new Date(minCostDay.originalDate)),
      statusColor: "red-600",
    },
    {
      icon: "solar:chart-line-duotone",
      title: `+${costVariance}%`,
      subtitle: "Cost Variance",
      color: "purple",
      borderColor: 'border-l-purple-500',
      statusText: "Highest vs Lowest",
      statusColor: "",
    },
    {
      icon: "solar:chart-line-duotone",
      title: formatAmount(avgDailyCost, projectSettings?.costDecimalPlaces || 2),
      subtitle: "Average Daily Cost",
      color: "orange",
      borderColor: 'border-l-orange-500',
      statusText: "September 2025",
      statusColor: "green-600",
    },
  ], [maxCostDay, minCostDay, costVariance, avgDailyCost, formatAmount, formatDate, projectSettings]);
  return (
    <>
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Daily Cost Analysis</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {dailyCostData.map((item, index) => {
          const { bg, text } = getBgAndTextColor(item.color);
          return (
            <div
              key={index}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow ${getBorderColor(item.color)} p-3 h-[85px] hover:shadow-md transition-all duration-300 flex flex-col justify-between`}
            >
              <div className="flex items-center gap-2">
                <div
                  className="p-1.5 rounded-lg shadow-sm flex-shrink-0"
                  style={{
                    backgroundColor: bg,
                    color: text,
                  }}
                >
                  <Icon icon={item.icon} width={18} height={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-1 truncate">{item.subtitle}</p>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white truncate">{item.title}</h4>
                  {item.statusText && (
                    <p className={`text-xs font-medium mt-0.5 ${
                      item.statusColor === 'green-600' ? 'text-green-600' : item.statusColor === 'purple-600' ? 'text-purple-600' : item.statusColor === 'orange-600' ? 'text-orange-600' : item.statusColor === 'red-600' ? 'text-red-600' : 'text-gray-500'
                    } truncate`}>
                      {item.statusText}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
// CostPerPOEfficiencyChart - Dynamic
const CostPerPOEfficiencyChart = ({ categories, efficiencyData }) => {
  const { projectSettings } = useAuth();
  const formatAmount = useFormatAmount();
  const ChartData = useMemo(() => ({
    series: [
      {
        name: "Cost per POB Efficiency",
        data: efficiencyData,
      },
    ],
    chart: {
      height: 350,
      type: "line",
      foreColor: "#adb0bb",
      fontFamily: `inherit`,
      offsetX: -5,
      zoom: {
        type: "x",
        enabled: true,
      },
      toolbar: {
        show: false,
      },
      shadow: {
        enabled: true,
        color: "#000",
        top: 18,
        left: 7,
        blur: 10,
        opacity: 1,
      },
    },
    colors: ["#8b5cf6"],
    markers: {
      size: 0,
    },
    xaxis: {
      categories,
      title: {
        text: "Date",
      },
      axisBorder: {
        color: "rgba(173,181,189,0.3)",
      },
      labels: {
        rotate: -45,
        style: {
          fontSize: '10px',
        },
      },
    },
    yaxis: {
      title: {
        text: "Cost per PO",
      },
      min: efficiencyData.length > 0 ? (Math.min(...efficiencyData.map(Number)) - 0.5) || 0 : 0,
      max: efficiencyData.length > 0 ? (Math.max(...efficiencyData.map(Number)) + 0.5) || 15 : 15,
      labels: {
        formatter: (value: number) => formatAmount(value, projectSettings?.costDecimalPlaces || 2),
        style: {
          fontSize: '10px',
        },
      },
    },
    grid: {
      show: true,
      padding: {
        left: 15,
        bottom: 15,
      },
      borderColor: 'rgba(173,181,189,0.3)',
      strokeDashArray: 3,
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '9px',
        colors: ['#1f2937'],
      },
      offsetY: -8,
    },
    stroke: {
      curve: "smooth",
      width: "3",
    },
    legend: {
      show: false,
    },
    tooltip: {
      theme: "light",
      x: {
        format: "dd/MM/yy",
      },
      style: {
        fontSize: '11px',
      },
    },
  }), [categories, efficiencyData, formatAmount, projectSettings]);
  return (
    <CardBox>
      <div className="flex items-center justify-between mb-3">
        <h5 className="text-base font-semibold text-gray-800 dark:text-white">Cost per POB Efficiency Trend</h5>
      </div>
      <Chart
        options={ChartData}
        series={ChartData.series}
        type="line"
        height="350px"
        width="100%"
      />
    </CardBox>
  );
};
export default EnhancedDashboard;