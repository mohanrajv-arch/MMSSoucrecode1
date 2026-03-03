import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCredentials } from 'src/context/AuthContext';
import { ChevronDown, Download, Plus } from 'lucide-react';

type Location = {
  pk: number;
  name: string;
  code?: string;
};

type ApiResponse = {
  success: boolean;
  message: string | null;
  data: Location[];
};

type RequisitionApiResponse = {
  success: boolean;
  message: string;
  data: {
    itemList: Requisition[];
  };
};

interface Requisition {
  id: number;
  reqNo: string;
  dates: string;
  period: string;
  itemCount: number;
  createdDate: string; // Add this line
}

const RequisitionHistory: React.FC = () => {
  const { userId } = useCredentials();
  const [location, setLocation] = useState<string>("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [locationSearch, setLocationSearch] = useState('');
  const [locationError, setLocationError] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [loadingRequisitions, setLoadingRequisitions] = useState(false);
  const [allRequisitions, setAllRequisitions] = useState<Requisition[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error'; show: boolean }>({
    message: '',
    type: 'error',
    show: false,
  });
  const [sessionExpired, setSessionExpired] = useState(false);

  const formatDate = (dateStr: string): string => {
  try {
    // Handle potential null/undefined
    if (!dateStr) return 'N/A';
    
    // Check if it's already a valid date string
    const date = new Date(dateStr);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      // Try parsing as timestamp if it's a number string
      const timestamp = parseInt(dateStr);
      if (!isNaN(timestamp)) {
        const dateFromTimestamp = new Date(timestamp);
        if (!isNaN(dateFromTimestamp.getTime())) {
          return dateFromTimestamp.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });
        }
      }
      return dateStr; // Return original if can't parse
    }
    
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr; // Fallback if parsing fails
  }
};

  const filteredLocations = useMemo(() => {
    if (!locationSearch) return locations;
    const lower = locationSearch.toLowerCase();
    return locations.filter(loc =>
      (loc.code?.toLowerCase().includes(lower) || '') ||
      loc.name.toLowerCase().includes(lower)
    );
  }, [locations, locationSearch]);

  const filteredRequisitions = useMemo(() => {
    return allRequisitions.filter(requisition =>
      requisition.reqNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatDate(requisition.dates).toLowerCase().includes(searchQuery.toLowerCase()) ||
      requisition.period.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allRequisitions, searchQuery]);

  const totalPages = Math.ceil(filteredRequisitions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRequisitions = filteredRequisitions.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const navigate = useNavigate();

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type, show: true });
    setTimeout(() => {
      setNotification({ message: '', type, show: false });
    }, 4000);
  };

  const toggleDropdown = (dropdown: string | null) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  // Updated fetchLocations function
  const fetchLocations = async () => {
    setLoadingLocations(true);
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setSessionExpired(true);
        setLoadingLocations(false);
        return;
      }
      
      console.log('Fetching locations with token:', token.substring(0, 20) + '...');
      
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
      
      console.log('API Response status:', response.status);
      
      if (response.status === 401 || response.status === 403) {
        setSessionExpired(true);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error('Invalid JSON response from server');
      }
      
      if (data.success === false && data.message === "Session expired or invalid. Please login again.") {
        setSessionExpired(true);
        return;
      }
      
      console.log('API Response data:', data);
      
      if (data.success && data.data && Array.isArray(data.data)) {
        console.log('Raw locations data:', data.data);
        
        const validLocations = data.data
          .filter((item) => item && item.pk && item.name)
          .map((item) => ({
            pk: item.pk,
            name: item.name,
            code: item.code || '', // Add code if available in response
          }));
        
        console.log('Valid locations:', validLocations);
        setLocations(validLocations);
        
        if (validLocations.length === 0) {
          console.warn('No valid locations found after filtering');
          showNotification('No valid locations found in the response', 'error');
        } else if (validLocations.length > 0 && selectedLocation === null) {
          // Set first location as default
          const firstLoc = validLocations[0];
          setSelectedLocation(firstLoc.pk);
        }
      } else {
        console.error('API returned unsuccessful response:', data);
        throw new Error(data.message || 'Failed to fetch locations');
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMsg.includes('Session expired') || 
          errorMsg.includes('authentication') || 
          errorMsg.includes('Failed to fetch')) {
        setSessionExpired(true);
      } else if (errorMsg.includes('Record Not Found')) {
        showNotification('No records found for the selected filters', 'error');
      }
    } finally {
      setLoadingLocations(false);
    }
  };

  // Fetch requisitions from API
  const fetchRequisitions = async () => {
    setLoadingRequisitions(true);
    try {
      const token = sessionStorage.getItem('token');
      
      if (!token) {
        setSessionExpired(true);
        setAllRequisitions([]);
        setLoadingRequisitions(false);
        return;
      }

      console.log('Fetching requisitions with token:', token.substring(0, 20) + '...');

      const body = location ? { locationFk: parseInt(location) } : {};
      
      const response = await fetch(
        'https://kelvinmms.com:8443/api-gateway-mms/issue-menu-mms/itemRequisitionController/ItemReqsList',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        },
      );

      console.log('API Response status:', response.status);

      if (response.status === 401 || response.status === 403) {
        setSessionExpired(true);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: RequisitionApiResponse = await response.json();
      
      console.log('API Response data:', data);

      if (data.success && data.data && Array.isArray(data.data.itemList)) {
        setAllRequisitions(data.data.itemList);
      } else {
        console.error('API returned unsuccessful response:', data);
        setAllRequisitions([]);
        throw new Error(data.message || 'Failed to fetch requisitions');
      }
    } catch (error) {
      console.error('Error fetching requisitions:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setAllRequisitions([]);
    } finally {
      setLoadingRequisitions(false);
    }
  };

  // Sync location with selectedLocation
  useEffect(() => {
    setLocation(selectedLocation ? selectedLocation.toString() : '');
  }, [selectedLocation]);

  // Load locations on component mount
  useEffect(() => {
    fetchLocations();
  }, []);

  // Load requisitions when location changes
  useEffect(() => {
    fetchRequisitions();
  }, [location]);

  const handleDownload = async (id: number) => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        console.error('Authorization token not found in session storage');
        return;
      }

      const response = await fetch(
        `https://kelvinmms.com:8443/api-gateway-mms/issue-menu-mms/itemRequisitionController/printexcelreportForMaterial/${id}/${userId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `requisition_${id}.xlsx`; // Adjust filename as needed
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      // Handle error, e.g., show toast notification
    }
  };

  const handleCSV = async (id: number) => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        console.error('Authorization token not found in session storage');
        return;
      }

      const response = await fetch(
        `https://kelvinmms.com:8443/api-gateway-mms/issue-menu-mms/itemRequisitionController/printCSVReportForMaterial/${id}/${userId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `requisition_${id}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading CSV file:', error);
      // Handle error, e.g., show toast notification
    }
  };

  const handleDownloadAll = async () => {
    if (selectedLocation === null) {
      showNotification('Please select a location', 'error');
      return;
    }
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        showNotification('Authorization token not found', 'error');
        return;
      }

      const response = await fetch(
        `https://kelvinmms.com:8443/api-gateway-mms/issue-menu-mms/itemRequisitionController/downloadItemReqExcel`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            locationFk: selectedLocation,
            createdBy: userId,
          }),
          
        }
      );  

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `requisition_history_${selectedLocation}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showNotification('Download started successfully', 'success');
    } catch (error) {
      console.error('Error downloading file:', error);
      showNotification('Failed to download report', 'error');
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300 p-4">
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Requisition History</h1>
        <div className="flex items-center gap-3">
          <button 
            className="px-2.5 py-2.5 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
            onClick={handleDownloadAll}
            title="Download"
          >
         <Download size={16} />
          </button>
          <button 
            className="px-2.5 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            onClick={() => navigate('/Master/ItemRequisition')}
          >
                 <Plus size={16} />

          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
          {/* Location with SearchableSelect */}
          <div className="relative flex-1 md:flex-none md:w-64">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Location</label>
            <div className="relative flex-1 max-w-xs">
              <button
                onClick={() => toggleDropdown('location')}
                disabled={loadingLocations}
                className="w-full px-4 h-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-left flex items-center justify-between hover:border-gray-400 transition-colors text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60"
              >
                <span className="truncate">
                  {loadingLocations
                    ? 'Loading locations...'
                    : locationError
                      ? 'Failed to load'
                      : selectedLocation === null
                        ? 'All Locations'
                        : `${locations.find(l => l.pk === selectedLocation)?.code} - ${locations.find(l => l.pk === selectedLocation)?.name}`}
                </span>
                <ChevronDown size={20} className="text-gray-500 flex-shrink-0" />
              </button>
              {openDropdown === 'location' && !loadingLocations && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 p-3">
                    <input
                      type="text"
                      placeholder="Search location..."
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setSelectedLocation(null);
                      setOpenDropdown(null);
                      setLocationSearch('');
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm border-b border-gray-200 dark:border-gray-700"
                  >
                    All Locations
                  </button>
                  {filteredLocations.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">No locations found</div>
                  ) : (
                    filteredLocations.map(loc => (
                      <button
                        key={loc.pk}
                        onClick={() => {
                          setSelectedLocation(loc.pk);
                          setOpenDropdown(null);
                          setLocationSearch('');
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                      >
                        {loc.code} - {loc.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {loadingLocations && (
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading locations...
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 sr-only">Search requisitions</label>
            <input
              type="text"
              placeholder="Search requisitions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-4 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
        {loadingRequisitions ? (
          <div className="py-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-400 flex items-center justify-center mb-4">
              <svg className="animate-spin w-8 h-8" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Loading Requisitions</h3>
            <p className="text-gray-500 dark:text-gray-400">Fetching your requisition history...</p>
          </div>
        ) : filteredRequisitions.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-400 flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Requisitions Found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-12">S.No</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-32">Req No</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-32">Created Date</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-48">Period</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-20">Items</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-16">View</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-16">Download</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-16">CSV</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentRequisitions.map((req, index) => (
                    <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 w-12">
                        {startIndex + index + 1}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 w-32">{req.reqNo}</td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 w-32" title={req.createdDate}>
  {formatDate(req.createdDate)}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate w-48" title={req.period}>
                        {req.period}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 w-20">{req.itemCount} items</td>
                      <td className="py-4 w-16 text-center">
                        <button className="text-blue-600 hover:text-blue-900
                         dark:text-blue-400 dark:hover:text-blue-300 mx-auto block"
                         onClick={() =>
                          navigate('/Master/ViewItemRequisition', { state: { ViewId: req.id } })
                        }>
                          <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </td>
                      <td className="py-4 w-16 text-center">
                        <button 
                          onClick={() => handleDownload(req.id)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mx-auto block"
                        >
                          <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </td>
                      <td className="py-4 w-16 text-center">
                        <button 
                          onClick={() => handleCSV(req.id)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mx-auto block"
                        >
                          <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredRequisitions.length)} of {filteredRequisitions.length} records
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <div className="flex space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900 dark:border-blue-400 dark:text-blue-300'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RequisitionHistory;