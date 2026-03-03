import React, { useState, useEffect, ChangeEvent, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "src/components/shadcn-ui/Default-Ui/card";
import { CustomizerContext } from "src/context/CustomizerContext";
import { AlertCircle, CheckCircle, RefreshCw, Search, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { FaRegFileExcel } from "react-icons/fa6";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Button } from "flowbite-react";
import { Label,Select } from 'flowbite-react';
import Toastify, { showToast } from 'src/components/Spa Components/Toastify';

interface UserLogItem {
  userEmailId: string;
  userName: string;
  userTypeWord: string;
  check: boolean;
  loginStr: string;
  logoutStr: string;
}

const UserLog: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useContext(CustomizerContext);
  
  const [activeOption, setActiveOption] = useState<"Current Day" | "Week" | "Month" | "Year">("Current Day");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [locationData, setLocationData] = useState<UserLogItem[]>([]);
  const [filteredData, setFilteredData] = useState<UserLogItem[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedUserType, setSelectedUserType] = useState<number | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortColumn, setSortColumn] = useState<keyof UserLogItem>('userEmailId');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Generic API fetch helper with proper token handling
  const apiFetch = async (url: string, options: RequestInit = {}): Promise<any> => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      setSessionExpired(true);
      throw new Error('No authentication token found. Please log in again.');
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
        throw new Error('Session expired. Please log in again.');
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
      throw new Error(`Server error occurred. Please try again. (Status: ${response.status})`);
    }

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error('Invalid response from server. Please try again.');
    }

    // Check for session expired in response
    if (data.success === false && data.message === "Session expired or invalid. Please login again.") {
      setSessionExpired(true);
      throw new Error(data.message);
    }

    return data;
  };

  // Session Expired Modal Component
  const SessionExpiredModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`rounded-2xl shadow-xl max-w-sm w-full p-6 text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Session Expired</h2>
        <p className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Your session has expired. Please log in again to continue.
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

  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getYearOptions = (): number[] => {
    const currentYear = new Date().getFullYear();
    return [
      currentYear,
      currentYear - 1,
      currentYear - 2,
      currentYear - 3,
      currentYear - 4,
    ];
  };

  const formatDate = (date: Date): string => {
    if (!date) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    switch (activeOption) {
      case "Current Day":
        return `${day}/${month}/${year}`;
      case "Week": {
        const firstDay = new Date(date);
        const dayOfWeek = date.getDay() || 7;
        firstDay.setDate(date.getDate() - dayOfWeek + 1);
        const lastDay = new Date(firstDay);
        lastDay.setDate(firstDay.getDate() + 6);
        const firstDayFormatted = `${firstDay.getDate().toString().padStart(2, "0")}/${(firstDay.getMonth() + 1).toString().padStart(2, "0")}`;
        const lastDayFormatted = `${lastDay.getDate().toString().padStart(2, "0")}/${(lastDay.getMonth() + 1).toString().padStart(2, "0")}/${lastDay.getFullYear()}`;
        return `${firstDayFormatted} - ${lastDayFormatted}`;
      }
      case "Month": {
        const monthNames = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December",
        ];
        return `${monthNames[date.getMonth()]} ${year}`;
      }
      case "Year":
        return selectedYear.toString();
      default:
        return `${day}/${month}/${year}`;
    }
  };

  const getPayload = (): Record<string, any> => {
    let retrieveType: number;
    switch (activeOption) {
      case "Current Day": retrieveType = 1; break;
      case "Week": retrieveType = 2; break;
      case "Month": retrieveType = 3; break;
      case "Year": retrieveType = 4; break;
      default: retrieveType = 4;
    }

    const payload: Record<string, any> = { retrieveType };
    payload.userType = selectedUserType;
    
    if (retrieveType === 1 || retrieveType === 2 || retrieveType === 3) {
      payload.day = formatDateForAPI(selectedDate);
      payload.yearInt = selectedDate.getFullYear();
    } else if (retrieveType === 4) {
      payload.yearInt = selectedYear;
    }
    
    return payload;
  };

  const fetchUserLogData = async (): Promise<void> => {
    setLoading(true);
    try {
      const payload = getPayload();
      const apiUrl = "https://kelvinmms.com:8443/api-gateway-mms/master-service/userController/retreiveUserLog";
      const response = await apiFetch(apiUrl, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      
      // Handle the case where success is false but data exists
      if (response.data && Array.isArray(response.data)) {
        const data: UserLogItem[] = response.data.map((item: any) => ({
          userEmailId: item.userEmailId || "N/A",
          userName: item.userName || "N/A",
          userTypeWord: item.userTypeWord || "N/A",
          check: false,
          loginStr: item.loginStr || "N/A",
          logoutStr: item.logoutStr || "N/A",
        }));
        
        setLocationData(data);
        setSelectedRows([]);
        
        if (data.length === 0) {
          showToast('No user log data found for the selected period.', 'error');
        }
      } else {
        setLocationData([]);
        setFilteredData([]);
        showToast(response.message || 'No data available for the selected period.', 'error');
      }
    } catch (error: any) {
      console.error("Error fetching user log data:", error);
      setLocationData([]);
      setFilteredData([]);
      showToast(error.message || 'Failed to load user logs. Please check your connection and try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Update filtered data whenever locationData or searchQuery changes
  useEffect(() => {
    if (locationData.length > 0) {
      const filtered = locationData.filter(
        (item) =>
          item.userEmailId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.userTypeWord?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData([]);
    }
    setCurrentPage(1);
  }, [locationData, searchQuery]);

  useEffect(() => {
    fetchUserLogData();
  }, [activeOption, selectedDate, selectedYear, selectedUserType]);

  const handleToggle = (option: "Current Day" | "Week" | "Month" | "Year"): void => {
    setActiveOption(option);
    if (option === "Current Day" || option === "Week" || option === "Month") {
      setSelectedDate(new Date());
    } else if (option === "Year") {
      setSelectedYear(new Date().getFullYear());
    }
  };

  const handleCheckboxChange = (index: number): void => {
    const newSelectedRows = [...selectedRows];
    const indexPosition = newSelectedRows.indexOf(index);
    if (indexPosition !== -1) {
      newSelectedRows.splice(indexPosition, 1);
    } else {
      newSelectedRows.push(index);
    }
    setSelectedRows(newSelectedRows);
    
    const updatedLocationData = locationData.map((item, i) => 
      i === index ? { ...item, check: !item.check } : item
    );
    setLocationData(updatedLocationData);
  };

  const handleRefreshIconClick = (): void => {
    setActiveOption("Year");
    setSelectedRows([]);
    setLocationData([]);
    setFilteredData([]);
    setSearchQuery("");
    setSelectedDate(new Date());
    setSelectedYear(new Date().getFullYear());
    setSelectedUserType(null);
    setCurrentPage(1);
    setSortColumn('userEmailId');
    setSortDirection('asc');
    fetchUserLogData();
  };

  const handleDownloadClick = async (): Promise<void> => {
    setIsProcessing(true);
    try {
      const payload = getPayload();
      const apiUrl = "https://kelvinmms.com:8443/api-gateway-mms/master-service/userController/retreiveUserLogByExcel";
      
      const token = sessionStorage.getItem('token');
      if (!token) {
        setSessionExpired(true);
        throw new Error('No authentication token found. Please log in again.');
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setSessionExpired(true);
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error(`Download failed with status: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error("Downloaded file is empty");
      }
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `user_log_${activeOption.toLowerCase()}_${formatDate(selectedDate)
        .replace(/[^a-zA-Z0-9]/g, "_")
        .toLowerCase()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showToast('User log Excel file downloaded successfully!', 'success');
    } catch (error: any) {
      console.error("Error downloading Excel file:", error);
      showToast(error.message || 'Failed to download Excel file. Please try again.', 'error');
       setSessionExpired(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
  };

  const handleYearChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    setSelectedYear(parseInt(e.target.value));
  };

  const handleUserTypeChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    setSelectedUserType(e.target.value ? parseInt(e.target.value) : null);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };

  const handleSort = (column: keyof UserLogItem) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const formatDateForInput = (): string => {
    if (!selectedDate) return "";
    const year = selectedDate.getFullYear();
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
    const day = selectedDate.getDate().toString().padStart(2, "0");
    switch (activeOption) {
      case "Current Day":
      case "Week":
        return `${year}-${month}-${day}`;
      case "Month":
        return `${year}-${month}`;
      default:
        return `${year}-${month}-${day}`;
    }
  };

  const getTodayFormatted = (): string => {
    const today = new Date();
    return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;
  };

  const getCurrentMonthFormatted = (): string => {
    const today = new Date();
    return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}`;
  };

  const renderDateInput = (): React.ReactNode => {
    switch (activeOption) {
      case "Current Day":
      case "Week":
        return (
          <input
            type="date"
            value={formatDateForInput()}
            onChange={handleDateChange}
            max={getTodayFormatted()}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-navy-700 dark:text-white dark:border-navy-600 cursor-pointer"
          />
        );
      case "Month":
        return (
          <input
            type="month"
            value={formatDateForInput()}
            onChange={handleDateChange}
            max={getCurrentMonthFormatted()}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-navy-700 dark:text-white dark:border-navy-600 cursor-pointer"
          />
        );
      case "Year":
        return (
          <select
            value={selectedYear}
            onChange={handleYearChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-navy-700 dark:text-white dark:border-navy-600"
          >
            {getYearOptions().map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        );
      default:
        return null;
    }
  };

  const sortedFilteredData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let aValue: string = '';
      let bValue: string = '';

      switch (sortColumn) {
        case 'userEmailId':
          aValue = a.userEmailId || '';
          bValue = b.userEmailId || '';
          break;
        case 'loginStr':
          aValue = a.loginStr || '';
          bValue = b.loginStr || '';
          break;
        case 'logoutStr':
          aValue = a.logoutStr || '';
          bValue = b.logoutStr || '';
          break;
        default:
          break;
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedFilteredData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(sortedFilteredData.length / rowsPerPage);

  const getSortIcon = (column: keyof UserLogItem) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  return (
    <>
      {sessionExpired && <SessionExpiredModal />}
      
      <div className="min-h-screen w-full bg-gray-50 dark:bg-navy-900">
        <div className="container mx-auto px-2 py-2 max-w-7xl">
          {/* Header Section */}
        
          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-center mb-6">
              <div className="bg-blue-100 text-blue-800 px-6 py-3 rounded-lg flex items-center shadow-sm">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-800" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading user logs...
              </div>
            </div>
          )}

          {/* Controls Section */}
          <div className="bg-white dark:bg-navy-800 rounded-xl shadow-lg p-6 mb-6">
            {/* Time Period Selector */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time Period
                </label>
                <div className="flex flex-wrap gap-2">
                  {(["Current Day", "Week", "Month", "Year"] as const).map((option) => (
                    <button
                      key={option}
                      className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                        activeOption === option
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-navy-700 dark:text-gray-300 dark:hover:bg-navy-600"
                      }`}
                      onClick={() => handleToggle(option)}
                      disabled={loading}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex lg:gap-4 items-end">
                <div className="max-w-sm">
                  <Label
                    htmlFor="userType"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block"
                  >
                    User Type
                  </Label>
                  <Select
                    id="userType"
                    name="userType"
                    value={selectedUserType ? selectedUserType.toString() : ""}
                    onChange={handleUserTypeChange}
                    className="w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  >
                    <option value="">Select User Type</option>
                    <option value={1}>Admin</option>
                    <option value={2}>Location's User</option>
                    <option value={3}>Super User</option>
                  </Select>
                </div> 
                <div className="flex items-center gap-4">
                  <div className="max-w-xs">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {activeOption === "Year" ? "Select Year" : "Select Date"}
                  </label>
                  {renderDateInput()}
                </div>
                 <div className="flex items-center gap-3 flex-shrink-0 mt-6">
                <button
                  onClick={handleRefreshIconClick}
                  className="flex items-center gap-2 px-3 py-2.5 text-white bg-yellow-300 rounded-lg hover:bg-yellow-700 transition-colors"
                  title="Refresh"
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  onClick={handleDownloadClick}
                  className="flex items-center gap-2 px-3 py-2.5 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                  title="Download Excel"
                  disabled={loading || isProcessing}
                >
                  {isProcessing ? (
                    <div className="animate-spin rounded-lg h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <FaRegFileExcel className="h-4 w-4" />
                  )}
                </button>
              </div>
                </div>
                
              </div>
             
            </div>

            {/* Search and Actions Row */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end justify-between pt-4 border-t border-gray-200 dark:border-navy-700">
         

        
            </div>
          </div>

          {/* Data Table Section */}
          <div className="bg-white dark:bg-navy-800 rounded-xl shadow-lg overflow-hidden">
            {/* Table Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-navy-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  User Log Records
                </h3>
                  <div className="flex-1 w-full sm:max-w-md">
               
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by email, name, or user type..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-navy-700 dark:text-white dark:border-navy-600"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    disabled={loading}
                  />
                </div>
              </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-blue-700"
                    >
                      User Details
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    >
                      Login Time
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-blue-700"
                    >
                      Logout Time 
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-navy-700">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center">
                        <div className="flex justify-center items-center">
                          <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      </td>
                    </tr>
                  ) : currentRows.length > 0 ? (
                    currentRows.map((item, index) => (
                      <tr 
                        key={index}
                        className="hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors"
                      >
                       
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {item.userEmailId}
                          </div>
                          <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                            {item.userName} | {item.userTypeWord}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 font-mono">
                          {item.loginStr}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 font-mono">
                          {item.logoutStr}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center">
                        <div className="text-gray-500 dark:text-gray-400">
                          {locationData.length === 0 
                            ? "No user log data available for the selected period." 
                            : "No results found matching your search criteria."}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {sortedFilteredData.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-navy-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <Label className="text-sm">Show</Label>
                  <Select
                    value={rowsPerPage.toString()}
                    onChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="w-20"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </Select>
                  <Label className="text-sm">entries</Label>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, sortedFilteredData.length)} of {sortedFilteredData.length} entries
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Toastify/>
    </>
  );
};

export default UserLog;