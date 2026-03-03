// FinalMenuViewChart.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Clock, CheckCircle, DollarSign, Menu, Award, Eye, Hash, Tag, BookOpen, Search } from 'lucide-react';
import { BiMoney } from "react-icons/bi";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useAuth, useCredentials, useFormatAmount, useFormatDate } from "src/context/AuthContext";
import headerCardImg from 'D:/Esfita/Projects/MMS/src/assets/images/FoodImage/headerPngImg.png';

const ViewFinalMenu = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = location.state || {};
  const credentials = useCredentials();
  const userId = credentials?.userId || 0;
  const { projectSettings } = useAuth();
  const formatDate = useFormatDate();
  const formatAmount = useFormatAmount();
  
  // State
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSessionExpiryModal, setShowSessionExpiryModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "cost", direction: "desc" });
  
  // Navigation state
  const [currentView, setCurrentView] = useState('menu'); // 'menu', 'category', 'recipe'
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  
  // Colors
  const menuColors = ['#6366f1', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6'];
  const categoryColors = ['#8b5cf6', '#ec4899', '#eab308', '#14b8a6', '#ef4444'];
  const recipeColors = ['#06b6d4', '#84cc16', '#f97316', '#8b5cf6', '#ec4899'];

  // Format date
  const formattedDate = useMemo(() => {
    if (!data?.createdDate) return '';
    return formatDate(data.createdDate);
  }, [data, formatDate]);

  // Enhanced main menu data
  const enhancedData = useMemo(() => {
    if (!data) return null;
    
    const totalCost = data.detailList?.reduce((sum, item) => sum + (item.recipeCost || 0), 0) || data.totalCost || 0;
    const totalRecipes = data.detailList?.reduce((sum, item) => sum + (item.recipeCount || 0), 0) || data.recipeCount || 0;
    const mealTypes = data.mealTypeCount || data.detailList?.length || 0;
    
    return {
      ...data,
      totalCost,
      totalRecipes,
      mealTypes,
      approver: data.approver || data.approverBy || 'N/A',
      userName: data.userName || data.createdBy || (data.approver || data.approverBy) || 'N/A'
    };
  }, [data]);

  // Menu chart data
  const menuChartData = useMemo(() => {
    if (!enhancedData?.detailList) return [];
    
    return enhancedData.detailList.map((item, index) => ({
      name: item.menuName || `Menu ${index + 1}`,
      y: item.recipeCost || 0,
      color: menuColors[index % menuColors.length],
      menuId: item.menuFk,
      menuInfo: item,
      recipeCount: item.recipeCount || 0,
      mealTypeName: item.mealTypeName || 'N/A'
    }));
  }, [enhancedData, menuColors]);

  // Category chart data (when menu is selected)
  const categoryChartData = useMemo(() => {
    if (!categoryData?.categoryList) return [];
    
    return categoryData.categoryList.map((cat, index) => ({
      name: cat.categoriesName || 'Unknown',
      y: cat.totalCost || 0,
      color: categoryColors[index % categoryColors.length],
      categoryId: cat.categoriesName || 'Unknown',
      totalCost: cat.totalCost || 0,
      totalPortion: cat.totalPortion || 0,
    }));
  }, [categoryData, categoryColors]);

  // Recipe chart data (when category is selected)
  const recipeChartData = useMemo(() => {
    if (!selectedCategory || !categoryData?.categoryList) return [];
    
    const category = categoryData.categoryList.find(cat =>
      cat.categoriesName === selectedCategory
    );
    
    if (!category?.recipes || category.recipes.length === 0) {
      return [];
    }
    
    return category.recipes.map((recipe, index) => ({
      name: recipe.recipeName || `Recipe ${index + 1}`,
      y: recipe.recipeCost || 0,
      color: recipeColors[index % recipeColors.length],
      costPerPortion: recipe.recipeCost || 0,
      recipeId: recipe.recipeFk || index,
      portionSize: recipe.perPortionSize || 0,
      uom: recipe.uom || 'unit'
    }));
  }, [selectedCategory, categoryData, recipeColors]);

  // Current data for table based on view level
  const currentTableData = useMemo(() => {
    let items = [];
    let totalForPercentage = 0;
    let colors = menuColors;
    
    switch (currentView) {
      case 'menu':
        items = menuChartData.map(item => ({
          ...item,
          name: item.name,
          cost: item.y,
          portion: item.recipeCount || 0,
        }));
        totalForPercentage = enhancedData?.totalCost || 0;
        colors = menuColors;
        break;
        
      case 'category':
        items = categoryChartData.map(item => ({
          ...item,
          name: item.name,
          cost: item.y,
          portion: item.totalPortion || 0,
        }));
        totalForPercentage = categoryData?.totalCost || 0;
        colors = categoryColors;
        break;
        
      case 'recipe':
        items = recipeChartData.map(item => ({
          ...item,
          name: item.name,
          cost: item.y,
          portion: item.portionSize || 0,
        }));
        totalForPercentage = categoryData?.categoryList?.find(cat => 
          cat.categoriesName === selectedCategory
        )?.totalCost || 0;
        colors = recipeColors;
        break;
    }
    
    // Filter
    const filtered = items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Sort
    filtered.sort((a, b) => {
      let valueA, valueB;
      if (sortConfig.key === "name") {
        valueA = a.name || "";
        valueB = b.name || "";
        return sortConfig.direction === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      } else {
        valueA = Number(a[sortConfig.key]) || 0;
        valueB = Number(b[sortConfig.key]) || 0;
        return sortConfig.direction === "asc"
          ? valueA - valueB
          : valueB - valueA;
      }
    });
    
    // Add percentage
    return filtered.map((item, index) => ({
      ...item,
      percentage: totalForPercentage > 0 ? ((item.cost / totalForPercentage) * 100).toFixed(0) : 0,
      color: colors[index % colors.length]
    }));
  }, [currentView, menuChartData, categoryChartData, recipeChartData, searchQuery, sortConfig, enhancedData, categoryData, selectedCategory]);

  // Table totals
  const tableTotalCost = useMemo(() => {
    switch (currentView) {
      case 'menu': return enhancedData?.totalCost || 0;
      case 'category': return categoryData?.totalCost || 0;
      case 'recipe': 
        return categoryData?.categoryList?.find(cat => 
          cat.categoriesName === selectedCategory
        )?.totalCost || 0;
      default: return 0;
    }
  }, [currentView, enhancedData, categoryData, selectedCategory]);

  const tableTotalPortion = useMemo(() => {
    switch (currentView) {
      case 'menu': return enhancedData?.totalRecipes || 0;
      case 'category': return categoryData?.totalPortion || 0;
      case 'recipe': 
        return categoryData?.categoryList?.find(cat => 
          cat.categoriesName === selectedCategory
        )?.totalPortion || 0;
      default: return 0;
    }
  }, [currentView, enhancedData, categoryData, selectedCategory]);

  // Current chart options
  const chartOptions = useMemo(() => {
    let currentData = [];
    let totalCostValue = 0;
    let chartTitle = '';
    let subtitle = '';
    
    switch (currentView) {
      case 'menu':
        currentData = menuChartData;
        totalCostValue = enhancedData?.totalCost || 0;
        chartTitle = 'Menu Distribution';
        subtitle = 'Click slices to view categories';
        break;
      case 'category':
        currentData = categoryChartData;
        totalCostValue = categoryData?.totalCost || 0;
        chartTitle = `Categories in ${selectedMenu?.menuName || 'Menu'}`;
        subtitle = 'Click slices to view recipes';
        break;
      case 'recipe':
        currentData = recipeChartData;
        totalCostValue = categoryData?.categoryList?.find(cat => 
          cat.categoriesName === selectedCategory
        )?.totalCost || 0;
        chartTitle = `Recipes in ${selectedCategory}`;
        subtitle = `Category: ${selectedCategory}`;
        break;
    }
    
    if (currentData.length === 0) {
      return {
        chart: { type: 'pie', height: 300, backgroundColor: 'transparent' },
        title: { text: 'No Data Available', style: { color: '#6b7280', fontSize: '16px' } },
        series: [{ type: 'pie', data: [] }]
      };
    }
    
    return {
      chart: {
        type: 'pie',
        height: 300,
        backgroundColor: 'transparent',
        animation: { duration: 800, easing: 'easeOutBounce' },
        events: {
          render: function () {
            const centerX = this.plotWidth / 2 + this.plotLeft;
            const centerY = this.plotHeight / 2 + this.plotTop;
            
            if (this.customLabel) {
              this.customLabel.destroy();
            }
            
            if (currentData.length > 0) {
              const labelText = `Total Cost<br><span style="font-size: 18px; font-weight: bold; color: #1f2937;">${formatAmount(totalCostValue || 0, projectSettings?.costDecimalPlaces || 2)}</span>`;
              this.customLabel = this.renderer.text(labelText, centerX, centerY, true)
                .attr({
                  align: "center",
                  zIndex: 10,
                  class: 'chart-center-label'
                })
                .css({
                  fontSize: "14px",
                  color: "#1f2937",
                  textAlign: "center",
                  fontWeight: 600,
                  lineHeight: 1.2
                })
                .add();
              
              const bbox = this.customLabel.getBBox();
              this.customLabel.attr({
                x: centerX - (bbox.width / 16),
                y: centerY - (bbox.height / 5)
              });
            }
          }
        }
      },
      title: { text: null },
      subtitle: {
        text: subtitle,
        align: 'center',
        style: { fontSize: '12px', color: '#6b7280' }
      },
      tooltip: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        shadow: true,
        padding: 12,
        style: { fontSize: '12px' },
        formatter: function() {
          switch (currentView) {
            case 'menu':
              return `<span style="color:${this.point.color}; font-weight: bold;">${this.point.name}</span><br/>
                      <span style="color: #374151;">Cost: ${formatAmount(this.point.y, projectSettings?.costDecimalPlaces || 2)}</span><br/>
                      <span style="color: #374151;">Recipes: ${this.point.recipeCount}</span><br/>
                      <span style="color: #374151;">Meal Type: ${this.point.mealTypeName}</span>`;
            case 'category':
              return `<span style="color:${this.point.color}; font-weight: bold;">${this.point.name}</span><br/>
                      <span style="color: #374151;">Cost: ${formatAmount(this.point.y, projectSettings?.costDecimalPlaces || 2)}</span><br/>
                      <span style="color: #374151;">Portion: ${this.point.totalPortion.toFixed(2)}</span>`;
            case 'recipe':
              return `<span style="color:${this.point.color}; font-weight: bold;">${this.point.name}</span><br/>
                      <span style="color: #374151;">Cost: ${formatAmount(this.point.y, projectSettings?.costDecimalPlaces || 2)}</span><br/>
                      <span style="color: #374151;">Portion: ${this.point.portionSize} ${this.point.uom}</span>`;
          }
        }
      },
      credits: { enabled: false },
      plotOptions: {
        pie: {
          innerSize: "70%",
          allowPointSelect: true,
          cursor: "pointer",
          borderWidth: 2,
          borderColor: "#ffffff",
          center: ["50%", "50%"],
          dataLabels: {
            enabled: currentData.length > 0,
            format: currentView === 'recipe' ? "{point.name}" : "{point.name}: {point.y.toFixed(2)}",
            distance: 30,
            style: {
              fontSize: '11px',
              fontWeight: 'bold',
              textOverflow: 'ellipsis',
              color: '#374151'
            },
          },
          showInLegend: false,
          size: '85%',
          point: {
            events: {
              click: function () {
                switch (currentView) {
                  case 'menu':
                    handleMenuClick(this);
                    break;
                  case 'category':
                    handleCategoryClick(this);
                    break;
                }
              }
            }
          }
        }
      },
      series: [{
        name: currentView === 'menu' ? "Menus" : currentView === 'category' ? "Categories" : "Recipes",
        data: currentData.map(item => ({
          ...item,
          name: item.name,
          y: item.y,
          color: item.color
        })),
        type: 'pie'
      }],
      responsive: {
        rules: [{
          condition: { maxWidth: 500 },
          chartOptions: {
            plotOptions: {
              pie: {
                center: ["50%", "50%"],
                dataLabels: { enabled: false }
              },
            },
          },
        }],
      },
    };
  }, [currentView, menuChartData, categoryChartData, recipeChartData, enhancedData, categoryData, selectedMenu, selectedCategory, formatAmount, projectSettings]);

  // Handlers
  const handleMenuClick = (menuPoint) => {
    setSelectedMenu(menuPoint.menuInfo);
    fetchCategoryData(menuPoint.menuInfo.menuFk);
    setCurrentView('category');
    setSearchQuery("");
  };

  const handleCategoryClick = (categoryPoint) => {
    setSelectedCategory(categoryPoint.name);
    setCurrentView('recipe');
    setSearchQuery("");
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setCurrentView('category');
    setSearchQuery("");
  };

  const handleBackToMenu = () => {
    setSelectedMenu(null);
    setSelectedCategory(null);
    setCategoryData(null);
    setCurrentView('menu');
    setSearchQuery("");
  };

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
    }));
  };

  const fetchCategoryData = async (menuId) => {
    try {
      const token = sessionStorage.getItem('token');
      const apiUrl = `https://kelvinmms.com:8443/api-gateway-mms/menu-creation-service/finalMenuSetController/finalMenuSetViewByMenu/${id}/${menuId}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to fetch category data');
      const result = await response.json();
      
      if (result.success) {
        const catData = result.data;
        // Calculate totals
        const totalCost = catData.categoryList?.reduce((sum, cat) => {
          const categoryCost = cat.recipes?.reduce((catSum, recipe) => catSum + (recipe.recipeCost || 0), 0) || 0;
          return sum + categoryCost;
        }, 0) || catData.totalCost || 0;
        
        const totalPortion = catData.categoryList?.reduce((sum, cat) => {
          const categoryPortion = cat.recipes?.reduce((catSum, recipe) => catSum + (recipe.perPortionSize || 0), 0) || 0;
          return sum + categoryPortion;
        }, 0) || 0;
        
        const enhancedCategoryData = {
          ...catData,
          categoryList: catData.categoryList?.map(cat => {
            const categoryCost = cat.recipes?.reduce((sum, recipe) => sum + (recipe.recipeCost || 0), 0) || 0;
            const categoryPortion = cat.recipes?.reduce((sum, recipe) => sum + (recipe.perPortionSize || 0), 0) || 0;
            
            return {
              ...cat,
              totalCost: categoryCost,
              totalPortion: categoryPortion,
              recipes: cat.recipes || []
            };
          }) || [],
          totalCost,
          totalPortion,
          totalCategories: catData.totalCategories || catData.categoryList?.length || 0,
          totalRecipes: catData.totalRecipes || 0,
          approver: catData.approverBy || 'N/A',
          userName: catData.createdBy || catData.userName || 'N/A'
        };
        
        setCategoryData(enhancedCategoryData);
      } else {
        throw new Error(result.message || 'Failed to fetch category data');
      }
    } catch (err) {
      console.error('Error fetching category data:', err);
    }
  };

  // Fetch initial data
  useEffect(() => {
    if (!id) {
      setError('No ID provided');
      setLoading(false);
      return;
    }
    
    const apiUrl = `https://kelvinmms.com:8443/api-gateway-mms/menu-creation-service/finalMenuSetController/finalMenuView/${id}`;
    
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        
        if (response.status === 401) {
          setShowSessionExpiryModal(true);
          setLoading(false);
          return;
        }
        
        if (!response.ok) throw new Error('Failed to fetch data');
        const result = await response.json();
        
        if (result.success) {
          setData(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch data');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handleLoginAgain = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  if (error || !data) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Error: {error || 'No data'}</div>;
  }

  const { finalMenuName, approvalStatusStr } = enhancedData || data;

  // Components
  const Welcome = () => {
    return (
      <div className="bg-blue-600 relative rounded-lg overflow-hidden p-4 shadow-lg">
        <div className="md:w-3/5 relative z-10">
          <h4 className="text-white text-xl">{finalMenuName}</h4>
          <p className="text-sm text-white font-medium mt-1">{enhancedData?.mealTypes ? `${enhancedData.mealTypes} Meal Types` : 'Final Menu Set'}</p>
          <div className="flex rounded-full justify-between bg-gray-800/10 w-fit mt-4">
            <div className="py-3 px-6 text-center">
              <h5 className="text-white text-lg leading-normal">{approvalStatusStr}</h5>
              <small className="text-white text-xs font-medium block">Status</small>
            </div>
            <div className="py-3 px-6 text-center border-s border-white/20">
              <h5 className="text-white text-lg leading-normal">{enhancedData?.approver || 'N/A'}</h5>
              <small className="text-white text-xs font-medium block">Approver</small>
            </div>
            <div className="py-3 px-6 text-center border-s border-white/20">
              <h5 className="text-white text-lg leading-normal">{enhancedData?.userName || 'N/A'}</h5>
              <small className="text-white text-xs font-medium block">Creator</small>
            </div>
            
            <div className="py-3 px-6 text-center border-s border-white/20">
              <h5 className="text-white text-lg leading-normal">{formattedDate || 'N/A'}</h5>
              <small className="text-white text-xs font-medium block">Created Date</small>
            </div>
          </div>
          
        </div>
        
        {/* Image positioned absolutely on the right side with reduced size */}
        <img
          src={headerCardImg}
          alt="header"
          className="absolute right-0 top-1/2 transform -translate-y-1/2 w-36 h-36 object-contain md:w-48 md:h-48"
        />
      </div>
    );
  };

  const SmallCards = () => {
    const smallCardData = [
      {
        icon: Hash,
        num: id.toString(),
        title: "Final Menu ID",
        bgcolor: "yellow",
      },
      {
        icon: Tag,
        num: enhancedData?.mealTypes?.toString() || '0',
        title: "Meal Types",
        bgcolor: "purple",
      },
      {
        icon: BookOpen,
        num: enhancedData?.totalRecipes?.toString() || '0',
        title: "Total Recipes",
        bgcolor: "blue",
      },
      {
        icon: BiMoney,
        num: formatAmount(enhancedData?.totalCost || 0, projectSettings?.costDecimalPlaces || 2),
        title: "Total Cost",
        bgcolor: "green",
      }
    ];

    return (
      <>
        <div className="grid grid-cols-12 gap-y-4 gap-x-0 lg:gap-y-4 lg:gap-x-4 h-full">
          {smallCardData.map((theme, index) => (
            <div className="md:col-span-3 col-span-12" key={index}>
              <div className={`relative shadow-none rounded-lg overflow-hidden bg-${theme.bgcolor}-200 dark:bg-${theme.bgcolor}-900 p-4 h-full flex flex-col`}>
                <span className={`w-14 h-10 rounded-full flex items-center justify-center text-white mb-4 bg-${theme.bgcolor}-500 flex-shrink-0`}>
                  <theme.icon size={24} />
                </span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <h5 className="text-lg text-gray-900 dark:text-white">{theme.num}</h5>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm mt-2 font-medium flex-grow-0 mt-auto">
                  {theme.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };


  const TableSkeleton = () => (
    <div className="w-full">
      <div className="table-container rounded-lg border border-gray-200">
        <div className="table-wrapper h-[300px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
              <tr>
                <th className="p-1 text-left">
                  {currentView === 'menu' ? 'Menu' : currentView === 'category' ? 'Category' : 'Recipe'}
                </th>
                <th className="p-1 text-center">Cost</th>
                <th className="p-1 text-center">
                  {currentView === 'menu' ? 'Recipes' : 'Portion'}
                </th>
                <th className="p-1 text-right">%</th>
              </tr>
            </thead>
            <tbody>
              {[...new Array(8)].map((_, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="p-1"><div className="h-2 bg-gray-200 rounded animate-pulse"></div></td>
                  <td className="p-1"><div className="h-2 bg-gray-200 rounded animate-pulse mx-auto w-4"></div></td>
                  <td className="p-1"><div className="h-2 bg-gray-200 rounded animate-pulse mx-auto w-4"></div></td>
                  <td className="p-1"><div className="h-2 bg-gray-200 rounded animate-pulse ml-auto w-4"></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const NoDataMessage = () => (
    <div className="flex flex-col items-center justify-center h-[300px] text-gray-500 text-xs">
      <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p className="font-medium">No data available</p>
    </div>
  );

  const DonutChartSkeleton = () => (
    <div className="h-[300px] w-full flex items-center justify-center">
      <div className="relative w-64 h-64">
        <div className="absolute inset-0 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="absolute inset-10 rounded-full bg-white"></div>
      </div>
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-2 py-2.5 flex items-center justify-between">
          <h1 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Menu size={20} className="text-indigo-600" />
            View Final Menu Set
            {currentView === 'category' && ' > Categories'}
            {currentView === 'recipe' && ' > Recipes'}
          </h1>
        <button
              onClick={() => navigate('/Transaction/FinalMealSet')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-xs transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
        </div>

        {/* Main Content */}
        <div className="py-3 space-y-2.5">
          {/* Header Grid */}
          <div className="grid grid-cols-12 gap-y-4 gap-x-0 lg:gap-y-4 lg:gap-x-4">
            <div className="lg:col-span-7 col-span-12">
              <Welcome />
            </div>
            <div className="lg:col-span-5 col-span-12 h-full">
              <SmallCards />
            </div>
          </div>

          {/* Chart and Table Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">
            {/* Donut Chart */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-lg p-2.5 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {currentView === 'menu' && 'Menu Distribution'}
                    {currentView === 'category' && `Categories in ${selectedMenu?.menuName || 'Menu'}`}
                    {currentView === 'recipe' && `Recipes in ${selectedCategory}`}
                  </h3>
                     <div className="flex items-center gap-2">
            {currentView !== 'menu' && (
              <button
                onClick={handleBackToMenu}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-xs transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Back to Menu</span>
              </button>
            )}
            {currentView === 'recipe' && (
              <button
                onClick={handleBackToCategories}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-xs transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Back to Categories</span>
              </button>
            )}
           
          </div>
                </div>
                <div className="flex justify-center items-center min-h-[300px] bg-gray-50 rounded">
                  {loading ? (
                    <DonutChartSkeleton />
                  ) : chartOptions ? (
                    <div className="w-full">
                      <HighchartsReact highcharts={Highcharts} options={chartOptions} />
                    </div>
                  ) : (
                    <div className="text-gray-500 text-xs">No data for chart</div>
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col shadow-sm">
                <div className="p-2 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <div className="relative w-full max-w-[200px]">
                      <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder={`Search ${currentView === 'menu' ? 'menus' : currentView === 'category' ? 'categories' : 'recipes'}`}
                        className="w-full border border-gray-300 py-1.5 pl-7 pr-2 text-xs rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-gray-50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 min-h-[300px]">
                  {loading ? (
                    <TableSkeleton />
                  ) : currentTableData.length > 0 ? (
                    <div className="table-container overflow-hidden">
                      <div className="table-wrapper h-[300px] overflow-y-auto">
                        <table className="w-full text-xs">
                          <thead className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white shadow-sm">
                            <tr>
                              <th className="p-1 text-left">
                                <button className="flex items-center gap-0.5 w-full text-left" onClick={() => handleSort("name")}>
                                  {currentView === 'menu' ? 'Menu' : currentView === 'category' ? 'Category' : 'Recipe'}
                                  <svg className={`h-2.5 w-2.5 transition-transform ${sortConfig.key === "name" && sortConfig.direction === "asc" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                  </svg>
                                </button>
                              </th>
                              <th className="p-1 text-center">
                                <button className="flex items-center justify-center gap-0.5 w-full" onClick={() => handleSort("cost")}>
                                  Cost
                                  <svg className={`h-2.5 w-2.5 transition-transform ${sortConfig.key === "cost" && sortConfig.direction === "asc" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                  </svg>
                                </button>
                              </th>
                              <th className="p-1 text-center">
                                <button className="flex items-center justify-center gap-0.5 w-full" onClick={() => handleSort("portion")}>
                                  {currentView === 'menu' ? 'Recipes' : 'Portion'}
                                  <svg className={`h-2.5 w-2.5 transition-transform ${sortConfig.key === "portion" && sortConfig.direction === "asc" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                  </svg>
                                </button>
                              </th>
                              <th className="p-1 text-right">
                                <button className="flex items-center justify-end gap-0.5 w-full" onClick={() => handleSort("percentage")}>
                                  %
                                  <svg className={`h-2.5 w-2.5 transition-transform ${sortConfig.key === "percentage" && sortConfig.direction === "asc" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                  </svg>
                                </button>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentTableData.map((item, index) => (
                              <tr
                                key={index}
                                className={`border-b border-gray-100/50 hover:bg-gray-50/50 transition-all duration-200 cursor-pointer ${index % 2 === 0 ? 'bg-white/70' : 'bg-gray-50/70'} ${
                                  currentView === 'category' && selectedCategory === item.name ? 'bg-indigo-50/70 border-indigo-200/50' : ''
                                }`}
                                onClick={() => {
                                  if (currentView === 'menu') {
                                    handleMenuClick(item);
                                  } else if (currentView === 'category') {
                                    setSelectedCategory(item.name);
                                    setCurrentView('recipe');
                                    setSearchQuery("");
                                  }
                                }}
                              >
                                <td className="p-1">
                                  <div className="flex items-center gap-1.5">
                                    <div className="h-2 w-2 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                                    <span className="truncate text-xs font-medium text-gray-900">{item.name}</span>
                                  </div>
                                </td>
                                <td className="p-1 text-center text-xs font-medium text-gray-900">
                                  {formatAmount(item.cost || 0, projectSettings?.costDecimalPlaces || 2)}
                                </td>
                                <td className="p-1 text-center text-xs font-medium text-gray-900">
                                  {formatAmount(item.portion || 0, projectSettings?.costDecimalPlaces || 2)}
                                </td>
                                <td className="p-1 text-right text-xs font-medium text-gray-900">{item.percentage}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <NoDataMessage />
                  )}
                </div>

                <div className="p-2 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-blue-50/50">
                  <div className="flex justify-between text-xs font-semibold text-gray-900">
                    <span>Total {currentView === 'menu' ? 'Cost / Recipes' : 'Cost / Portion'}</span>
                    <span>
                      {formatAmount(tableTotalCost || 0, projectSettings?.costDecimalPlaces || 2)} / 
                      {formatAmount(tableTotalPortion || 0, projectSettings?.costDecimalPlaces || 2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Session Expiry Modal */}
      {showSessionExpiryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Session Expired</h3>
              <p className="text-sm text-gray-500 mb-6">
                Your session has expired. Please log in again to continue.
              </p>
              <div className="space-y-2">
                <button
                  onClick={handleLoginAgain}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Log In Again
                </button>
                <button
                  onClick={() => setShowSessionExpiryModal(false)}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewFinalMenu;