import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Users, CheckCircle, ForkKnife, Hash, Tag, BookOpen, Calendar } from 'lucide-react';
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useAuth, useCredentials, useFormatAmount, useFormatDate } from "src/context/AuthContext";
import headerCardImg from 'D:/Esfita/Projects/MMS/src/assets/images/FoodImage/headerPngImg.png';

const ViewMealSetTemplate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = location.state || {};
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "totalRecipes",
    direction: "desc",
  });
  const [sessionExpired, setSessionExpired] = useState(false);
  const { projectSettings } = useAuth();
  const formatDate = useFormatDate();
  const formatAmount = useFormatAmount();
  const credentials = useCredentials();
  const userId = credentials?.userId || 0;
  const baseUrl = 'https://kelvinmms.com:8443/api-gateway-mms/meal-set-template-services/mealSetTemplateController';
  const categoryColors = [
    '#6366f1', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6',
    '#ec4899', '#eab308', '#14b8a6', '#ef4444', '#06b6d4',
  ];

  // Generic fetch helper
  const apiFetch = async (url: string, options: RequestInit = {}) => {
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
        ...options.headers,
      },
    });
    if (!response.ok) {
      if (response.status === 401) {
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
        // Ignore JSON parse error for non-JSON responses
      }
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e: any) {
      console.error('Failed to parse JSON response:', e);
      throw new Error(`Invalid JSON response from server: ${e?.message ?? String(e)}`);
    }
    // Check for session expired
    if (data.success === false && data.message === "Session expired or invalid. Please login again.") {
      setSessionExpired(true);
      throw new Error(data.message);
    }
    return data;
  };

  // Session Expired Modal Component (exactly like MealSetMenu)
  const SessionExpiredModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
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
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Go to Login
        </button>
      </div>
    </div>
  );

  const formattedDate = useMemo(() => {
    if (!data?.createdDate) return '';
    return formatDate(data.createdDate);
  }, [data, formatDate]);

  const chartData = useMemo(() => {
    if (!data?.categoryList) return [];
    const total = data.categoryList.reduce((sum, cat) => sum + (cat.totalRecipes || 0), 0);
    return data.categoryList.map((cat, index) => ({
      name: cat.categoriesName || 'Unknown',
      y: cat.totalRecipes || 0,
      percentage: total > 0 ? ((cat.totalRecipes || 0) / total * 100) : 0,
      color: categoryColors[index % categoryColors.length],
      categoryId: cat.categoriesName || 'Unknown',
      totalRecipes: cat.totalRecipes || 0,
    }));
  }, [data, categoryColors]);

  const chartOptions = useMemo(() => {
    if (!data || chartData.length === 0) return null;
    const { totalRecipes } = data;
    return {
      chart: {
        type: 'pie',
        height: 300,
        backgroundColor: 'transparent',
        animation: {
          duration: 800,
          easing: 'easeOutBounce'
        },
        events: {
          load: function () {
            const centerText = this.renderer.text(
              'Total Recipes<br><span style="font-size: 24px; font-weight: bold; line-height: 1.2;">' +
              totalRecipes +
              "</span>",
              this.plotWidth / 2,
              this.plotHeight / 2,
              true
            ).attr({
              align: "center",
              zIndex: 3, // Reduced z-index to be below tooltip
              width: this.plotWidth
            })
              .css({
                fontSize: "16px",
                color: "#1f2937",
                textAlign: "center",
                fontWeight: 600,
                lineHeight: 1.4,
                pointerEvents: 'none' // Prevent text from blocking mouse events
              })
              .add();
          },
        },
      },
      title: {
        text: null
      },
      tooltip: {
        backgroundColor: '#ffffff',
        borderRadius: 6,
        shadow: true,
        padding: 8,
        pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}</b><br>Percentage: <b>{point.percentage:.1f}%</b>',
        zIndex: 10, // Higher z-index than center text
        useHTML: true, // Use HTML for better rendering control
        style: {
          pointerEvents: 'auto', // Ensure tooltip can receive mouse events
        }
      },
      credits: {
        enabled: false
      },
      plotOptions: {
        pie: {
          innerSize: "65%",
          allowPointSelect: true,
          cursor: "pointer",
          borderWidth: 2,
          borderColor: "#ffffff",
          center: ["50%", "50%"],
          dataLabels: {
            enabled: true,
            format: "{point.name}: {point.y}<br>({point.percentage:.0f}%)",
            distance: 20,
            style: {
              fontSize: '10px',
              fontWeight: '600'
            },
          },
          showInLegend: false,
          size: '90%',
          point: {
            events: {
              // Optional: Add mouseover/mouseout events to ensure tooltip visibility
              mouseOver: function() {
                // Force tooltip to be on top
                if (this.series.chart.tooltip) {
                  this.series.chart.tooltip.label.attr({ zIndex: 10 });
                }
              }
            }
          }
        },
      },
      series: [{
        name: "Categories",
        data: chartData
      }],
      responsive: {
        rules: [{
          condition: {
            maxWidth: 500
          },
          chartOptions: {
            plotOptions: {
              pie: {
                center: ["50%", "50%"],
                dataLabels: {
                  enabled: false
                }
              },
            },
          },
        }],
      },
    };
  }, [data, chartData]);

  const filteredData = useMemo(() => {
    if (!data?.categoryList) return [];
    let filtered = data.categoryList.filter(cat =>
      cat.categoriesName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    filtered.sort((a, b) => {
      if (sortConfig.key === "categoriesName") {
        const valueA = a[sortConfig.key] || "";
        const valueB = b[sortConfig.key] || "";
        return sortConfig.direction === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      } else {
        const valueA = Number(a[sortConfig.key]) || 0;
        const valueB = Number(b[sortConfig.key]) || 0;
        return sortConfig.direction === "asc" ? valueA - valueB : valueB - valueA;
      }
    });
    return filtered.map((cat, index) => ({
      ...cat,
      percentage: data.totalRecipes > 0 ? (cat.totalRecipes / data.totalRecipes) * 100 : 0,
      color: categoryColors[index % categoryColors.length]
    }));
  }, [data, searchQuery, sortConfig, categoryColors]);

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
    }));
  };

  useEffect(() => {
    if (!id) {
      setError('No ID provided');
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch(`${baseUrl}/mealSetViewById?id=${id}`, {
          method: 'GET'
        });
        if (data.success) {
          setData(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch data');
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message);
        if (err.message.includes('Session expired') || err.message.includes('401')) {
          setSessionExpired(true);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }
  if (error || !data) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Error: {error || 'No data'}</div>;
  }

  const { templateName, mealType, approvalStatusStr, userName, approver, totalCategories, totalRecipes, createdDate } = data;

  const Welcome = () => {
    return (
   <div className="bg-blue-600 relative rounded-lg overflow-hidden p-4 shadow-lg">
  <div className="md:w-3/5 relative z-10">
    <h4 className="text-white text-xl">{templateName}</h4>
    <p className="text-sm text-white font-medium mt-1">{mealType}</p>
    <div className="flex rounded-full justify-between bg-gray-800/10 w-fit mt-4">
      <div className="py-3 px-6 text-center">
        <h5 className="text-white text-lg leading-normal">{approvalStatusStr}</h5>
        <small className="text-white text-xs font-medium block">Status</small>
      </div>
      <div className="py-3 px-6 text-center border-s border-white/20">
        <h5 className="text-white text-lg leading-normal">{approver || 'N/A'}</h5>
        <small className="text-white text-xs font-medium block">Approver</small>
      </div>
      <div className="py-3 px-6 text-center border-s border-white/20">
        <h5 className="text-white text-lg leading-normal">{userName || 'N/A'}</h5>
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
    className="absolute left-110 top-1/2 transform -translate-y-1/2 w-36 h-36 object-contain md:w-50 md:h-50"
  />
</div>

    );
  };

  const SmallCards = () => {
    const smallCardData = [
      {
        icon: Hash,
        num: id.toString(),
        percent: "+0%",
        title: "Template ID",
        bgcolor: "yellow",
      },
      {
        icon: Tag,
        num: totalCategories.toString(),
        percent: "+0%",
        title: "Categories",
        bgcolor: "purple",
      },
      {
        icon: BookOpen,
        num: totalRecipes.toString(),
        percent: "+0%",
        title: "Recipes",
        bgcolor: "green",
      },
     
    ];

    return (
      <>
        <div className="grid grid-cols-12 gap-y-4 gap-x-0 lg:gap-y-4 lg:gap-x-4">
          {smallCardData.map((theme, index) => (
            <div className="md:col-span-4 col-span-12" key={index}>
              <div className={`relative shadow-none rounded-lg overflow-hidden bg-${theme.bgcolor}-200 dark:bg-${theme.bgcolor}-900 p-4`}>
                <span className={`w-14 h-10 rounded-full flex items-center justify-center text-white mb-8 bg-${theme.bgcolor}-500`}>
                  <theme.icon size={24} />
                </span>
                <div className="flex items-center gap-1">
                  <h5 className="text-lg text-gray-900 dark:text-white">{theme.num}</h5>
                 
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm mt-2 font-medium">
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
                <th className="p-1 text-left">Category</th>
                <th className="p-1 text-center">Recipes</th>
                <th className="p-1 text-right">%</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(8)].map((_, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="p-1"><div className="h-2 bg-gray-200 rounded animate-pulse"></div></td>
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
      <p className="font-medium">No category data</p>
    </div>
  );

  const DonutChartSkeleton = () => (
    <div className="h-[300px] w-full flex items-center justify-center">
      <div className="relative w-64 h-64">
        <div className="absolute inset-0 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="absolute inset-10 rounded-full bg-white"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="w-16 h-2 bg-gray-200 rounded animate-pulse mb-1"></div>
          <div className="w-20 h-3 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {sessionExpired && <SessionExpiredModal />}
      {/* Header - Compact */}
      <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
        <h1 className="text-sm font-semibold text-gray-900">View Meal Set Template</h1>
        <button
          onClick={() => navigate('/Transaction/MealSetTemplate')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-xs transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>
      </div>
      {/* Main Content - Ultra Compact */}
      <div className="px-3 py-3 space-y-2.5">
        {/* New Header Grid */}
        <div className="grid grid-cols-12 gap-y-4 gap-x-0 lg:gap-y-4 lg:gap-x-4">
          <div className="lg:col-span-7 col-span-12">
            <Welcome />
          </div>
          <div className="lg:col-span-5 col-span-12">
            <SmallCards />
          </div>
        </div>
        {/* Chart and Table Section - Compact */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">
          {/* Donut Chart - 8 columns, SAME HEIGHT */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg p-2.5 border border-gray-200 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-1.5">Category Distribution</h3>
              <div className="flex justify-center items-center min-h-[300px]">
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
          {/* Ultra Compact Table - 4 columns */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col shadow-sm">
              <div className="p-2 border-b border-gray-200">
                <div className="flex items-center justify-between mb-1">
                  <div className="relative w-full max-w-[200px]">
                    <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search"
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
                ) : filteredData.length > 0 ? (
                  <div className="table-container overflow-hidden">
                    <div className="table-wrapper h-[300px] overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
                          <tr>
                            <th className="p-1 text-left">
                              <button
                                className="flex items-center gap-0.5 w-full text-left"
                                onClick={() => handleSort("categoriesName")}
                              >
                                Category
                                <svg
                                  className={`h-2.5 w-2.5 transition-transform ${
                                    sortConfig.key === "categoriesName" && sortConfig.direction === "asc"
                                      ? "rotate-180"
                                      : ""
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                              </button>
                            </th>
                            <th className="p-1 text-center">
                              <button
                                className="flex items-center justify-center gap-0.5 w-full"
                                onClick={() => handleSort("totalRecipes")}
                              >
                                Recipes
                                <svg
                                  className={`h-2.5 w-2.5 transition-transform ${
                                    sortConfig.key === "totalRecipes" && sortConfig.direction === "asc"
                                      ? "rotate-180"
                                      : ""
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                              </button>
                            </th>
                            <th className="p-1 text-right">
                              <button
                                className="flex items-center justify-end gap-0.5 w-full"
                                onClick={() => handleSort("percentage")}
                              >
                                %
                                <svg
                                  className={`h-2.5 w-2.5 transition-transform ${
                                    sortConfig.key === "percentage" && sortConfig.direction === "asc"
                                      ? "rotate-180"
                                      : ""
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                              </button>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData.map((cat, index) => (
                            <tr
                              key={index}
                              className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                              }`}
                            >
                              <td className="p-1">
                                <div className="flex items-center gap-1">
                                  <div
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: cat.color }}
                                  />
                                  <span className="truncate text-xs font-medium text-gray-900">
                                    {cat.categoriesName}
                                  </span>
                                </div>
                              </td>
                              <td className="p-1 text-center text-xs font-medium text-gray-900">
                                {cat.totalRecipes}
                              </td>
                              <td className="p-1 text-right text-xs font-medium text-gray-900">
                                {formatAmount(cat.percentage, projectSettings?.costDecimalPlaces || 1)}%
                              </td>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewMealSetTemplate;