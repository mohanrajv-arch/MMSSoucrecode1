import React, { useState, useMemo, useRef, useEffect, useCallback, ChangeEvent, MouseEvent } from 'react';
import { useCredentials } from 'src/context/AuthContext';
import { useNavigate } from 'react-router';
import { useAuth, useFormatAmount, useFormatDate, useFormatQuantity } from "src/context/AuthContext";
import { ChevronDown, Search, X, Calendar, Plus, Trash2, RefreshCw, Archive, MenuIcon } from 'lucide-react';
import { createPortal } from 'react-dom';
import SearchableSelect from 'src/components/Spa Components/DropdownSearch';

type RequisitionType = 'single' | 'period';

type MenuRow = {
  date: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | string;
  menu: string;
  itemsCount: number;
  pob: number;
  menuFk: number;
  finalMenuName?: string;
};

type ConsolidatedItem = {
  category: string;
  itemCode: string;
  packageId: string;
  packagePrice: number;
  baseFactor: number;
  baseUnit: string;
  secondaryFactor: number;
  secondaryUnit: string;
  secondaryCost: number;
  baseQuantity: number;
  secondaryQuantity: number;
  totalCost: number;
  adjustedQuantity: number;
  adjustedTotal: number;
  selected?: boolean;
  isAdditional?: boolean;
  itemCategoryFk?: number;
  itemName: string;
  chefUnit: string;
  costPrice: number;
  date?: string;
  itemFk?: number;
};

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

type ItemDropdownItem = {
  pk: number;
  itemCategoryFk: number;
  category: string;
  code: string;
  name: string;
  packageId: string;
  packagePrice: number;
  packageBaseFactor: number;
  packageSecondaryFactor: number;
  packageBaseUnit: string;
  packageSecondaryUnit: string;
  packageSecondaryCost: number;
  chefUnit: string;
  chefCost: number;
};

type ItemDropdownResponse = {
  success: boolean;
  message: string;
  data: ItemDropdownItem[];
};

type RealApiData = {
  menuList: Array<{
    id: number;
    mealTypeFk: number;
    mealType: string;
    menuFk: number;
    menuName: string;
    date: string;
    pob: number;
    itemCount: number;
    finalMenuName: string;
  }>;
  itemList: Array<{
    itemCategoryFk: number;
    itemCategoryName: string;
    itemFk: number;
    itemName: string;
    itemCode: string;
    packageId: string;
    packagePrice: number;
    packageBaseFactor: number;
    packageSecondaryFactor: number;
    packageBaseUnit: string;
    packageSecondaryUnit: string;
    packageSecondaryCost: number;
    chefUnit: string;
    costPrice: number;
    baseQuantity: number;
    secondaryQuantity: number;
    baseTotal: number;
    date: string;
  }>;
  dateWiseItemList: Record<string, Array<any>>;
  totalDays: number;
  totalItems: number;
  totalMeals: number;
  menuItemCost: number;
  menuFkStr: string;
  totalPob: number;
};

type FinalizedMenuResponse = {
  success: boolean;
  message: string;
  data: RealApiData;
};

type SaveResponse = {
  success: boolean;
  message: string;
};

type FetchFinalizedMenusRequest = {
  locationFk: number;
  singleDates?: string;
  fromDates?: string;
  toDates?: string;
};

interface Option {
  label: string;
  value: string;
  [k: string]: any
}

interface SearchableSelectProps {
  options: Option[];
  value: string | null;
  onChange: (val: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: boolean;
  helperText?: string;
  loading?: boolean;
  displayKey?: string;
  valueKey?: string;
}

const ItemRequisition: React.FC = () => {
  const { projectSettings } = useAuth();
  const formatDate = useFormatDate();
  const formatAmount = useFormatAmount();
  const formatQuantity = useFormatQuantity();
  const [location, setLocation] = useState<string>('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [requisitionType, setRequisitionType] = useState<RequisitionType>('single');
  const [singleDate, setSingleDate] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<MenuRow[] | null>(null);
  const [consolidatedItems, setConsolidatedItems] = useState<ConsolidatedItem[]>([]);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [availableItems, setAvailableItems] = useState<ConsolidatedItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [consolidatedSearchQuery, setConsolidatedSearchQuery] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error'; show: boolean }>({
    message: '',
    type: 'error',
    show: false,
  });
  const [remarks, setRemarks] = useState('');
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingAvailableItems, setLoadingAvailableItems] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const singleDateRef = useRef<HTMLInputElement>(null);
  const fromDateRef = useRef<HTMLInputElement>(null);
  const toDateRef = useRef<HTMLInputElement>(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [locationSearch, setLocationSearch] = useState('');
  const [locationError, setLocationError] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [totalPob, setTotalPob] = useState<number>(0);
  const [menuFkStr, setMenuFkStr] = useState<string>('');
  const [dateWiseItemList, setDateWiseItemList] = useState<Record<string, any[]>>({});

  const filteredLocations = useMemo(() => {
    if (!locationSearch) return locations;
    const lower = locationSearch.toLowerCase();
    return locations.filter(loc =>
      loc.code?.toLowerCase().includes(lower) ||
      loc.name.toLowerCase().includes(lower)
    );
  }, [locations, locationSearch]);

  const filteredAvailableItems = useMemo(() => {
    return availableItems.filter(
      (item) =>
        (item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.itemCode.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [availableItems, searchQuery]);

  const filteredMenuItems = useMemo(() => {
    return consolidatedItems.filter(
      (item) =>
        !item.isAdditional &&
        (item.itemName.toLowerCase().includes(consolidatedSearchQuery.toLowerCase()) ||
          item.itemCode.toLowerCase().includes(consolidatedSearchQuery.toLowerCase())),
    );
  }, [consolidatedItems, consolidatedSearchQuery]);

  const addedAdditionalItems = useMemo(
    () => consolidatedItems.filter((item) => item.isAdditional),
    [consolidatedItems],
  );

  const userId = useCredentials().userId;
  const navigate = useNavigate();

  // Check if we have results to display
  const hasResults = useMemo(() => {
    return rows && rows.length > 0;
  }, [rows]);

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
            code: item.code || `LOC${item.pk}`,
          }));
        
        console.log('Valid locations with PKs:', validLocations.map(l => ({ pk: l.pk, name: l.name, code: l.code })));
        
        setLocations(validLocations);
        
        if (validLocations.length === 0) {
          console.warn('No valid locations found after filtering');
          showNotification('No valid locations found in the response', 'error');
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
      } else {
        showNotification(`Failed to load locations: ${errorMsg}`, 'error');
      }
    } finally {
      setLoadingLocations(false);
    }
  };

  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  const fetchAvailableItems = async () => {
    setLoadingAvailableItems(true);
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setSessionExpired(true);
        setLoadingAvailableItems(false);
        return;
      }
      console.log('Fetching available items with token:', token.substring(0, 20) + '...');
      const response = await fetch(
        'https://kelvinmms.com:8443/api-gateway-mms/issue-menu-mms/itemRequisitionController/loadItemDropdown',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('Available items API Response status:', response.status);
      if (response.status === 401 || response.status === 404) {
        setSessionExpired(true);
        return;
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ItemDropdownResponse = await response.json();
      console.log('Available items API Response data:', data);
      if (data.success && data.data && Array.isArray(data.data)) {
        console.log('Available items received:', data.data);
        const mappedAvailable: ConsolidatedItem[] = data.data.map((item) => ({
          category: item.category || '',
          itemCode: item.code || '',
          packageId: item.packageId || '',
          packagePrice: item.packagePrice || 0,
          baseFactor: item.packageBaseFactor || 0,
          baseUnit: item.packageBaseUnit || '',
          secondaryFactor: item.packageSecondaryFactor || 0,
          secondaryUnit: item.packageSecondaryUnit || '',
          secondaryCost: item.packageSecondaryCost || 0,
          baseQuantity: 0,
          secondaryQuantity: 0,
          totalCost: 0,
          adjustedQuantity: 0,
          adjustedTotal: 0,
          selected: false,
          itemCategoryFk: item.itemCategoryFk,
          itemName: item.name || '',
          chefUnit: item.chefUnit || '',
          costPrice: item.chefCost || 0,
        }));
        setAvailableItems(mappedAvailable);
      } else {
        console.error('API returned unsuccessful response:', data);
        throw new Error(data.message || 'Failed to fetch available items');
      }
    } catch (error) {
      console.error('Error fetching available items:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      if (errorMsg.includes('Record Not Found')) {
        showNotification('No records found for the selected filters', 'error');
      } else {
        setSessionExpired(true);
        showNotification(
          `Failed to load available items: ${errorMsg}`,
          'error',
        );
      }
      setAvailableItems([]);
    } finally {
      setLoadingAvailableItems(false);
    }
  };

  const fetchFinalizedMenus = async () => {
    if (!location || location === '') {
      showNotification('Please select a location', 'error');
      setLoading(false);
      return;
    }
    
    const locationId = parseInt(location);
    if (isNaN(locationId)) {
      showNotification('Invalid location selected', 'error');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setSessionExpired(true);
        setLoading(false);
        return;
      }
      
      console.log('Selected location ID:', locationId);
      console.log('Selected location string:', location);
      
      const requestBody: FetchFinalizedMenusRequest = {
        locationFk: locationId,
      };
      
      if (requisitionType === 'single') {
        requestBody.singleDates = singleDate;
        delete requestBody.fromDates;
        delete requestBody.toDates;
      } else if (requisitionType === 'period') {
        requestBody.fromDates = fromDate;
        requestBody.toDates = toDate;
        delete requestBody.singleDates;
      }
      
      console.log('Fetching finalized menus with request:', requestBody);
      
      const response = await fetch(
        'https://kelvinmms.com:8443/api-gateway-mms/issue-menu-mms/itemRequisitionController/itemReqList',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        },
      );
      console.log('Finalized menus API Response status:', response.status);
      if (response.status === 401 || response.status === 404) {
        setSessionExpired(true);
        return;
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const responseData: FinalizedMenuResponse = await response.json();
      console.log('Finalized menus API Response data:', responseData);
      console.log('Response datawiselist : ', responseData.data.dateWiseItemList);
      if (responseData.success && responseData.data.menuList && Array.isArray(responseData.data.menuList)) {
        console.log('Finalized menus received:', responseData.data.menuList);
        
        // Clear existing data if response is empty
        if (responseData.data.menuList.length === 0) {
          setRows([]);
          setConsolidatedItems([]);
          setTotalPob(0);
          setMenuFkStr('');
          showNotification('No finalized menus found for the selected criteria', 'error');
          setLoading(false);
          return;
        }
        
        // If we have data, process it
        const mappedRows: MenuRow[] = responseData.data.menuList.map((menu) => ({
          date: menu.date,
          mealType: menu.mealType as 'BREAKFAST' | 'LUNCH' | 'DINNER' | string,
          menu: menu.menuName,
          itemsCount: menu.itemCount,
          pob: menu.pob,
          menuFk: menu.menuFk,
          finalMenuName: menu.finalMenuName,
        }));
        setRows(mappedRows);
        
        if (responseData.data.itemList && Array.isArray(responseData.data.itemList)) {
          console.log('Item list received:', responseData.data.itemList);
          const mappedConsolidated: ConsolidatedItem[] = responseData.data.itemList.map((item) => ({
            category: item.itemCategoryName || '',
            itemCode: item.itemCode || '',
            packageId: item.packageId || '',
            packagePrice: item.packagePrice || 0,
            baseFactor: item.packageBaseFactor || 0,
            baseUnit: item.packageBaseUnit || '',
            secondaryFactor: item.packageSecondaryFactor || 0,
            secondaryUnit: item.packageSecondaryUnit || '',
            secondaryCost: item.packageSecondaryCost || 0,
            baseQuantity: item.baseQuantity || 0,
            secondaryQuantity: item.secondaryQuantity || 0,
            totalCost: item.baseTotal || 0,
            adjustedQuantity: 0,
            adjustedTotal: 0,
            isAdditional: false,
            itemCategoryFk: item.itemCategoryFk,
            itemName: item.itemName || '',
            chefUnit: item.chefUnit || '',
            costPrice: item.costPrice || 0,
            date: item.date,
            itemFk: item.itemFk,
          }));
          setConsolidatedItems(mappedConsolidated);
        }

        if (responseData.data.dateWiseItemList) {console.log('Date-wise item list from API:', responseData.data.dateWiseItemList);setDateWiseItemList(responseData.data.dateWiseItemList);}
 
        
        if (responseData.data.totalPob !== undefined) {
          console.log('Total POB from API:', responseData.data.totalPob);
          setTotalPob(responseData.data.totalPob);
        }
        
        if (responseData.data.menuFkStr !== undefined) {
          console.log('menuFkStr from API:', responseData.data.menuFkStr);
          setMenuFkStr(responseData.data.menuFkStr);
        }
      } else {
        // Clear data on unsuccessful response
        setRows([]);
        setConsolidatedItems([]);
        setTotalPob(0);
        setMenuFkStr('');
        
        const errorMsg = responseData.message || 'Failed to fetch finalized menus';
        if (errorMsg.includes('Record Not Found')) {
          showNotification('No records found for the selected filters', 'error');
        } else {
          throw new Error(errorMsg);
        }
      }
    } catch (error) {
      // Clear data on error
      setRows([]);
      setConsolidatedItems([]);
      setTotalPob(0);
      setMenuFkStr('');
      
      console.error('Error fetching finalized menus:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      if (errorMsg.includes('Record Not Found')) {
        showNotification('No records found for the selected filters', 'error');
      } else {
        setSessionExpired(true);
        showNotification(
          `Failed to load finalized menus: ${errorMsg}`,
          'error',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
    fetchAvailableItems();
  }, []);

  const summary = useMemo(() => {
    if (!rows || rows.length === 0) return null;
    const uniqueDates = new Set(rows.map((r) => r.date));
    const meals = rows.length;
    const uniqueItems = rows.reduce((acc, r) => acc + r.itemsCount, 0);
    const totalPob = rows.reduce((s, r) => s + r.pob, 0);
    return {
      totalDays: uniqueDates.size,
      meals,
      uniqueItems,
      totalPob,
    };
  }, [rows]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type, show: true });
    setTimeout(() => {
      setNotification({ message: '', type, show: false });
    }, 4000);
  };

  const handleFetch = () => {
    if (!location) {
      showNotification('Please select a location', 'error');
      return;
    }
    if (requisitionType === 'single' && !singleDate) {
      showNotification('Select a date', 'error');
      return;
    }
    if (requisitionType === 'period') {
      if (!fromDate) {
        showNotification('Select From date', 'error');
        return;
      }
      if (!toDate) {
        showNotification('Select To date', 'error');
        return;
      }
      if (toDate < fromDate) {
        showNotification('To date must be after From date', 'error');
        return;
      }
    }
    fetchFinalizedMenus();
  };

  const reset = () => {
    setRows(null);
    setSingleDate('');
    setFromDate('');
    setToDate('');
    setConsolidatedItems([]);
    setRemarks('');
    setConsolidatedSearchQuery('');
    setLocation('');
    setSelectedLocation(null);
    setTotalPob(0);
    setMenuFkStr('');
    setLocationSearch('');
    setDateWiseItemList({});
  };

  const handleSingleDateBoxClick = () => {
    if (singleDateRef.current) {
      singleDateRef.current.showPicker
        ? singleDateRef.current.showPicker()
        : singleDateRef.current.click();
    }
  };

  const handleFromDateBoxClick = () => {
    if (fromDateRef.current) {
      fromDateRef.current.showPicker
        ? fromDateRef.current.showPicker()
        : fromDateRef.current.click();
    }
  };

  const handleToDateBoxClick = () => {
    if (fromDate && toDateRef.current) {
      toDateRef.current.showPicker ? toDateRef.current.showPicker() : toDateRef.current.click();
    }
  };

  const handleOpenAddItemModal = () => {
    if (!hasResults) {
      showNotification('Please fetch finalized menus first', 'error');
      return;
    }
    if (availableItems.length === 0 && !loadingAvailableItems) {
      fetchAvailableItems();
    }
    setShowAddItemModal(true);
  };

  const handleCloseAddItemModal = () => {
    setShowAddItemModal(false);
    setSearchQuery('');
    setAvailableItems((prev) => prev.map((item) => ({ ...item, selected: false })));
  };

  const handleToggleItem = (itemCode: string) => {
    setAvailableItems((prev) =>
      prev.map((item) =>
        item.itemCode === itemCode
          ? { ...item, selected: !(item.selected ?? false) }
          : item
      )
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setAvailableItems((prev) =>
      prev.map((item) => ({ ...item, selected: checked }))
    );
  };

  const handleAddSelectedItems = () => {
    const selectedItems = availableItems.filter((item) => item.selected ?? false);
    if (selectedItems.length === 0) {
      showNotification('Please select at least one item', 'error');
      return;
    }

    // Check for duplicate items in consolidated items
    const duplicateItems = selectedItems.filter((selectedItem) => {
      return consolidatedItems.some(
        (existingItem) => existingItem.itemCode === selectedItem.itemCode
      );
    });

    if (duplicateItems.length > 0) {
      const duplicateNames = duplicateItems.map((item) => `${item.itemCode} - ${item.itemName}`).join(', ');
      showNotification(
        `Cannot add duplicate items: ${duplicateNames} already exist in the list`,
        'error'
      );
      return;
    }

    const itemsWithQuantities = selectedItems.map((item) => ({
      ...item,
      baseQuantity: 1.0,
      secondaryQuantity: 1.0,
      totalCost: item.secondaryCost,
      adjustedQuantity: 1.0,
      adjustedTotal: item.secondaryCost,
      isAdditional: true,
    }));
    
    setConsolidatedItems((prev) => [...prev, ...itemsWithQuantities]);
    // Keep items in availableItems but mark them as already added
    setAvailableItems((prev) => prev.map((item) => ({ ...item, selected: false })));
    setSearchQuery('');
    showNotification(`${selectedItems.length} items added successfully!`, 'success');
    handleCloseAddItemModal();
  };

const handleConsolidatedQuantityChange = (index: number, value: number) => {
  setConsolidatedItems((prev) => {
    const newItems = [...prev];
    const item = newItems[index];
    
    // The minimum allowed value is -item.secondaryQuantity
    // This ensures adjusted quantity cannot be more negative than the original secondary quantity
    const minAllowed = -item.secondaryQuantity;
    const finalValue = Math.max(minAllowed, value);
    
    newItems[index].adjustedQuantity = finalValue;
    newItems[index].adjustedTotal = finalValue * item.secondaryCost;
    return newItems;
  });
};

const handleAdditionalQuantityChange = (index: number, value: number) => {
  setConsolidatedItems((prev) => {
    const newItems = [...prev];
    const item = newItems[index];
    
    const finalValue = Math.max(0, value);
    
    newItems[index].adjustedQuantity = finalValue;
    newItems[index].adjustedTotal = finalValue * item.secondaryCost;
    return newItems;
  });
};

  const handleRemoveConsolidatedItem = (index: number) => {
    const itemToRemove = consolidatedItems[index];
    setConsolidatedItems((prev) => prev.filter((_, i) => i !== index));
    // Item remains in availableItems, but will be filtered out in the modal
  };

const menuItemsCost = useMemo(
  () => {
    const cost = consolidatedItems
      .filter((item) => !item.isAdditional)
      .reduce(
        (sum, item) => {
          // Calculate final cost: original totalCost + adjustedTotal
          // adjustedTotal can be positive or negative
          const finalCost = item.totalCost + (item.adjustedTotal || 0);
          
          console.log('Item cost calculation:', {
            itemName: item.itemName,
            totalCost: item.totalCost,
            adjustedTotal: item.adjustedTotal,
            finalCost: finalCost
          });
          
          return sum + finalCost;
        },
        0,
      );
    
    console.log('Total menu items cost:', cost);
    return cost;
  },
  [consolidatedItems],
);

  const additionalCost = useMemo(
    () =>
      consolidatedItems
        .filter((item) => item.isAdditional)
        .reduce(
          (sum, item) => sum + (item.adjustedQuantity > 0 ? item.adjustedTotal : item.totalCost),
          0,
        ),
    [consolidatedItems],
  );

  const totalCost = menuItemsCost + additionalCost;

  const handleSaveDraft = async () => {
    if (!hasResults) {
      showNotification('No data to save. Please fetch finalized menus first.', 'error');
      return;
    }
    
    if (!location || location === '') {
      showNotification('Please select a location', 'error');
      return;
    }
    
    const locationId = parseInt(location);
    if (isNaN(locationId)) {
      showNotification('Invalid location selected', 'error');
      return;
    }
    
    setSaving(true);
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setSessionExpired(true);
        return;
      }
      
      console.log('Saving draft for location ID:', locationId);
      const createdBy = userId;
    
      const additionalItemsFromAdded = addedAdditionalItems.map((item) => ({
        itemCategoryFk: item.itemCategoryFk,
        itemCategoryName: item.category,
        itemCode: item.itemCode,
        itemName: item.itemName,
        packageId: item.packageId,
        packagePrice: item.packagePrice,
        packageBaseUnit: item.baseUnit,
        packageSecondaryUnit: item.secondaryUnit,
        packageBaseFactor: item.baseFactor,
        packageSecondaryFactor: item.secondaryFactor,
        packageSecondaryCost: item.secondaryCost,
        chefUnit: item.chefUnit,
        costPrice: item.costPrice,
        quantity: item.adjustedQuantity > 0 ? item.adjustedQuantity : item.secondaryQuantity,
        insertionType: 1,
      }));
      
      const adjustedMenuItems = consolidatedItems
        .filter(
          (item) =>
            !item.isAdditional &&
            item.adjustedQuantity !== 0,
        )
        .map((item) => ({
          itemCategoryFk: item.itemCategoryFk,
          itemCategoryName: item.category,
          itemCode: item.itemCode,
          itemName: item.itemName,
          packageId: item.packageId,
          packagePrice: item.packagePrice,
          packageBaseUnit: item.baseUnit,
          packageSecondaryUnit: item.secondaryUnit,
          packageBaseFactor: item.baseFactor,
          packageSecondaryFactor: item.secondaryFactor,
          packageSecondaryCost: item.secondaryCost,
          chefUnit: item.chefUnit,
          costPrice: item.costPrice,
          quantity: item.adjustedQuantity,
          insertionType: 1,
          itemFk: item.itemFk,
        }));
      
      const additionalItems = [...additionalItemsFromAdded, ...adjustedMenuItems];
      const requestBody = {
        menuFkStr,
        locationFk: locationId,
        ...(requisitionType === 'single' ? { singleDates: singleDate } : { fromDates: fromDate, toDates: toDate }),
        remarks,
        createdBy,
        totalPob,
        dateWiseItemList,
        additionalItems,
      };
      console.log('Saving draft with request:', requestBody);
      console.log('Total POB being sent:', totalPob);
      console.log('menuFkStr being sent:', menuFkStr);
      const response = await fetch(
        'https://kelvinmms.com:8443/api-gateway-mms/issue-menu-mms/itemRequisitionController/saveItemReq',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        },
      );
      console.log('Save draft API Response status:', response.status);
      if (response.status === 401 || response.status === 404) {
        setSessionExpired(true);
        return;
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: SaveResponse = await response.json();
      console.log('Save draft API Response data:', data);
      if (data.success) {
        showNotification(data.message || 'Item requisition saved successfully!', 'success');
        reset()
      } else {
        throw new Error(data.message || 'Failed to save draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      if (errorMsg.includes('Record Not Found')) {
        showNotification('No records found for the selected filters', 'error');
      } else {
        setSessionExpired(true);
        showNotification(
          `Failed to save draft: ${errorMsg}`,
          'error',
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const locationOptions = locations.map((loc) => ({
    label: loc.name,
    value: loc.pk.toString(),
    pk: loc.pk,
    name: loc.name,
  }));

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen p-3 max-w-full overflow-x-hidden">
      {/* Notification Toast */}
      <div
        className={`fixed top-16 right-3 z-50 transition-all duration-300 transform ${
          notification.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
      >
        <div className={`text-white px-4 py-2 rounded-md shadow-lg max-w-xs ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
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
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">
          Create New Requisition
        </h1>

        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            title="Reload"
              className="flex items-center gap-1 bg-yellow-300 dark:bg-yellow-500 hover:bg-yellow-400 px-3 py-2 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200"
          >
          <RefreshCw size={15} />

          </button>
          <button className="flex items-center gap-1 bg-blue-600 dark:bg-blue-700 hover:bg-blue-300 px-3 py-2 dark:hover:bg-gray-600 text-white dark:text-gray-300 rounded-lg transition-all duration-200"
            onClick={() => navigate('/Master/RequisitionHistory')}>
            <MenuIcon size={15} />
          </button>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 mb-4 w-full">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
          </svg>
          Filters
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Location */}
          <div>
            <label className="block text-xs font-medium mb-1.5 text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Location
            </label>
            <div className="relative flex-1 max-w-xs">
              <button
                onClick={() => toggleDropdown('location')}
                disabled={loadingLocations}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-gray-400 transition-colors text-gray-700 text-sm disabled:opacity-60"
              >
                <span className="truncate">
                  {loadingLocations
                    ? 'Loading locations...'
                    : locationError
                    ? 'Failed to load'
                    : !location || location === ''
                    ? 'Select a location'
                    : `${locations.find(l => l.pk.toString() === location)?.code || ''} - ${locations.find(l => l.pk.toString() === location)?.name || 'Unknown'}`
                  }
                </span>
                <ChevronDown size={16} className="text-gray-500 flex-shrink-0" />
              </button>
              {openDropdown === 'location' && !loadingLocations && (
                <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b border-gray-200 p-2">
                    <input
                      type="text"
                      placeholder="Search location..."
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setSelectedLocation(null);
                      setOpenDropdown(null);
                      setLocationSearch('');
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 text-gray-700 transition-colors text-sm font-medium"
                  >
                    All Locations
                  </button>
                  {filteredLocations.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500">No locations found</div>
                  ) : (filteredLocations.map(loc => (
                    <button
                      key={loc.pk}
                      onClick={() => {
                        setLocation(loc.pk.toString());
                        setSelectedLocation(loc.pk);
                        setOpenDropdown(null);
                        setLocationSearch('');
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 text-gray-700 transition-colors text-sm"
                    >
                      {loc.code || 'N/A'} - {loc.name}
                    </button>
                  )))}
                </div>
              )}
            </div>
          </div>
          {/* Type */}
          <div>
            <label className="block text-xs font-medium mb-1.5 text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Requisition Type
            </label>
            <select
              className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 
                rounded-md bg-white dark:bg-gray-900 focus:ring-1 focus:ring-blue-500 
                focus:border-blue-500 transition-colors shadow-sm text-xs"
              value={requisitionType}
              onChange={(e) => setRequisitionType(e.target.value as RequisitionType)}
            >
              <option value="">Select Date</option>
              <option value="single">Single Date</option>
              <option value="period">Date Period</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5 text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {requisitionType === 'single' ? 'Select Date' : 'Select Date Range'}
            </label>
            {requisitionType === 'single' ? (
              <div className="relative">
                <input
                  ref={singleDateRef}
                  type="date"
                  className="absolute inset-0 w-full h-10 opacity-0 pointer-events-none z-10"
                  value={singleDate}
                  onChange={(e) => setSingleDate(e.target.value)}
                />
                <div
                  onClick={handleSingleDateBoxClick}
                  className={`h-10 w-full px-3 border-2 rounded-md bg-white dark:bg-gray-900 flex items-center justify-between cursor-pointer transition-all hover:border-blue-500 hover:shadow-sm shadow-sm ${
                    singleDate
                      ? 'text-gray-900 dark:text-white border-blue-500'
                      : 'text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    {singleDate ? formatDate(new Date(singleDate)) : 'Select date'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>
            ) : (
              <div className="flex gap-2.5">
                <div className="relative flex-1">
                  <input
                    ref={fromDateRef}
                    type="date"
                    className="absolute inset-0 w-full h-10 opacity-0 pointer-events-none z-10"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      if (toDate && e.target.value && toDate < e.target.value) setToDate('');
                    }}
                  />
                  <div
                    onClick={handleFromDateBoxClick}
                    className={`h-10 w-full px-3 border-2 rounded-md bg-white dark:bg-gray-900 flex items-center justify-between cursor-pointer transition-all hover:border-blue-500 hover:shadow-sm shadow-sm ${
                      fromDate
                        ? 'text-gray-900 dark:text-white border-blue-500'
                        : 'text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      {fromDate ? formatDate(new Date(fromDate)) : 'From date'}
                    </span>
                  </div>
                </div>
                <div className="relative flex-1">
                  <input
                    ref={toDateRef}
                    type="date"
                    className="absolute inset-0 w-full h-10 opacity-0 pointer-events-none z-10"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    disabled={!fromDate}
                    min={fromDate || undefined}
                  />
                  <div
                    onClick={handleToDateBoxClick}
                    className={`h-10 w-full px-3 border-2 rounded-md flex items-center justify-between transition-all shadow-sm ${
                      !fromDate
                        ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : `cursor-pointer hover:border-blue-500 hover:shadow-sm ${
                            toDate
                              ? 'text-gray-900 dark:text-white border-blue-500 bg-white dark:bg-gray-900'
                              : 'text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900'
                          }`
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      {toDate ? formatDate(new Date(toDate)) : 'To date'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleFetch}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm text-xs"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Fetching...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Fetch Finalized Menus
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Card - Finalized Menus Summary */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 mb-4 w-full">
        {!rows ? (
          <div className="py-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1m4 0h-4"
                />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1.5">
              No Finalized Menus Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs">
              Use the filters above to fetch finalized menus
            </p>
          </div>
        ) : rows.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-md bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-3">
              <svg
                className="w-6 h-6 text-yellow-500"
                fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1m4 0h-4"
                />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1.5">
              No Finalized Menus Available
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs">
              No menus are available for the selected criteria
            </p>
            <button
              onClick={reset}
              className="mt-3 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Different Filters
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-0">
                  Finalized Menus Summary
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800">
                  Finalized Only
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">Total POB</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{totalPob}</p>
              </div>
            </div>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
              <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 shadow-sm">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Total Days
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {summary?.totalDays}
                </div>
              </div>
              <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 shadow-sm">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.56 1.44a1.5 1.5 0 00-2.12 0L4.62 11.31a1.5 1.5 0 00-.05 2.12l9.45 9.45a1.5 1.5 0 002.12.05L19.56 13.5a1.5 1.5 0 000-2.12l-9.45-9.45a1.5 1.5 0 00-2.12-.05L19.56 1.44z" />
                  </svg>
                  Meals
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {summary?.meals}
                </div>
              </div>
              <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 shadow-sm">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Menu Items
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {summary?.uniqueItems}
                </div>
              </div>
              <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 shadow-sm">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Unique Items
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {consolidatedItems.filter((item) => !item.isAdditional).length}
                </div>
              </div>
            </div>
            {/* Finalized Menus Table */}
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-md w-full shadow-sm">
              <table className="min-w-full text-xs w-full">
                <thead className="bg-blue-800 dark:bg-blue-900 text-white">
                  <tr>
                    <th className="py-2 px-3 text-left font-medium">
                      Date
                    </th>
                    <th className="py-2 px-3 text-left font-medium">
                      Meal Type
                    </th>
                    <th className="py-2 px-3 text-left font-medium">
                      Final Menu Name
                    </th>
                    <th className="py-2 px-3 text-left font-medium">
                      Menu
                    </th>
                    <th className="py-2 px-3 text-left font-medium">
                      Items
                    </th>
                    <th className="py-2 px-3 text-left font-medium">
                      POB
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {rows.map((r, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="py-2 px-3">{formatDate(new Date(r.date))}</td>
                      <td className="py-2 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          {r.mealType}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-medium truncate max-w-[150px]">{r.finalMenuName}</td>
                      <td className="py-2 px-3 font-medium truncate max-w-[150px]">{r.menu}</td>
                      <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                        {r.itemsCount} items
                      </td>
                      <td className="py-2 px-3 font-medium text-right">{formatQuantity(r.pob, projectSettings?.quantityDecimalPlaces || 2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Consolidated Item List (Menu Items Only) */}
      {hasResults && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 mb-4 max-w-[1200px]">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Consolidated Item List
            </h2>
            {/* Add Additional Item Button - Always visible */}
            <button
              onClick={handleOpenAddItemModal}
              disabled={loadingAvailableItems}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Additional Item
              {loadingAvailableItems && (
                <svg className="animate-spin h-3.5 w-3.5 ml-1.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
            </button>
          </div>
          <div className="mb-4 flex justify-end">
            <div className="relative w-80">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name or code..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm text-xs"
                value={consolidatedSearchQuery}
                onChange={(e) => setConsolidatedSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto max-h-80 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md w-full shadow-sm">
            <table className="w-full table-auto text-[10px]">
              <thead className="bg-blue-800 dark:bg-blue-900 text-white sticky top-0">
                <tr>
                  <th className="py-1.5 px-1.5 text-left font-medium w-12">Category</th>
                  <th className="py-1.5 px-1.5 text-left font-medium w-16">Item Name</th>
                  <th className="py-1.5 px-1.5 text-left font-medium w-12">Pkg ID</th>
                  <th className="py-1.5 px-1.5 text-left font-medium w-8 text-right">Pkg cost</th>
                  <th className="py-1.5 px-1.5 text-left font-medium w-6 text-right">B.Fec</th>
                  <th className="py-1.5 px-1.5 text-left font-medium w-6">B.Unit</th>
                  <th className="py-1.5 px-1.5 text-left font-medium w-6 text-right">S.Fec</th>
                  <th className="py-1.5 px-1.5 text-left font-medium w-6">S.Unit</th>
                  <th className="py-1.5 px-1.5 text-left font-medium w-8 text-right">S.Cost</th>
                  <th className="py-1.5 px-1.5 text-left font-medium w-8 text-right">B.Qty</th>
                  <th className="py-1.5 px-1.5 text-left font-medium w-8 text-right">S.Qty</th>
                  <th className="py-1.5 px-1.5 text-left font-medium w-8 text-right">Total cost</th>
                  <th className="py-1.5 px-1.5 text-left font-medium w-8 text-right">Adj.Qty</th>
                  <th className="py-1.5 px-1.5 text-left font-medium w-8 text-right">Adj.cost</th>
               <th className="py-1.5 px-1.5 text-left font-medium w-8 text-right">Final.cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {filteredMenuItems.length > 0 ? (
                  filteredMenuItems.map((item, index) => {
                    const globalIndex = consolidatedItems.findIndex(
                      (ci) => ci.itemCode === item.itemCode && !ci.isAdditional,
                    );
                    return (
                      <tr
                        key={globalIndex}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="py-1.5 px-1.5 font-medium">
                          {item.category}
                        </td>
                           <td className="py-2 px-3 font-medium">
                                <div className="max-w-[120px]">
                                 
                                  <div className="text-xs text-gray-500 dark:text-gray-400">{item.itemCode}</div>
                                   <div className="font-semibold">{item.itemName}</div>
                               
                                </div>
                              </td>
                        <td className="py-1.5 px-1.5 max-w-[60px]">{item.packageId}</td>
                        <td className="py-1.5 px-1.5 text-right">{formatAmount(item.packagePrice, projectSettings?.costDecimalPlaces || 2)}</td>
                        <td className="py-1.5 px-1.5 text-right">{formatQuantity(item.baseFactor, projectSettings?.quantityDecimalPlaces || 1)}</td>
                        <td className="py-1.5 px-1.5">{item.baseUnit}</td>
                        <td className="py-1.5 px-1.5 text-right">{formatQuantity(item.secondaryFactor, projectSettings?.quantityDecimalPlaces || 1)}</td>
                        <td className="py-1.5 px-1.5">{item.secondaryUnit}</td>
                        <td className="py-1.5 px-1.5 text-right">{formatAmount(item.secondaryCost, projectSettings?.costDecimalPlaces || 2)}</td>
                        <td className="py-1.5 px-1.5 text-right">{formatQuantity(item.baseQuantity, projectSettings?.quantityDecimalPlaces || 4)}</td>
                        <td className="py-1.5 px-1.5 text-right">{formatQuantity(item.secondaryQuantity, projectSettings?.quantityDecimalPlaces || 4)}</td>
                        <td className="py-1.5 px-1.5 font-medium text-right">{formatAmount(item.totalCost, projectSettings?.costDecimalPlaces || 2)}</td>
                        <td className="py-1.5 px-1.5 text-right">
 <input
  type="number"
  value={item.adjustedQuantity !== 0 ? item.adjustedQuantity : ''}
  step={0.01}
  onChange={(e) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      const lowerLimit = -item.secondaryQuantity;
      if (newValue < lowerLimit) {
        e.target.value = lowerLimit.toString();
        return;
      }
      handleConsolidatedQuantityChange(globalIndex, newValue);
    } else if (e.target.value === '') {
      // Handle empty input - set to 0
      handleConsolidatedQuantityChange(globalIndex, 0);
    }
  }}
  onBlur={(e) => {
    if (e.target.value === '') {
      // Keep it empty if user leaves it blank
      return;
    }
    const newValue = parseFloat(e.target.value);
    if (isNaN(newValue)) {
      e.target.value = '';
      handleConsolidatedQuantityChange(globalIndex, 0);
      return;
    }
    
    const lowerLimit = -item.secondaryQuantity;
    const finalValue = Math.max(lowerLimit, newValue);
    
    if (finalValue !== item.adjustedQuantity) {
      handleConsolidatedQuantityChange(globalIndex, finalValue);
    }
  }}
  className="w-full text-right px-0.5 py-0.5 border border-gray-300 dark:border-gray-600 rounded text-[10px] bg-white dark:bg-gray-900 focus:ring-1 focus:ring-blue-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
  min={-item.secondaryQuantity}
  onClick={(e) => e.stopPropagation()}
  placeholder="0"
/>
                        </td>
                        <td className="py-1.5 px-1.5 text-right">{formatAmount(item.adjustedTotal, projectSettings?.costDecimalPlaces || 2)}</td>
                        <td className="py-1.5 px-1.5 text-right"> {formatAmount(item.totalCost + item.adjustedTotal, projectSettings?.costDecimalPlaces || 2)}</td>
                     
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={15}
                      className="py-3 px-3 text-center text-gray-500 dark:text-gray-400"
                    >
                      No consolidated items available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manage Additional Items with Table */}
      {hasResults && addedAdditionalItems.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 mb-4 w-full">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              Manage Additional Items
            </h2>
            {/* Add Additional Item Button - Also available in this section */}
            <button
              onClick={handleOpenAddItemModal}
              disabled={loadingAvailableItems}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add More Items
            </button>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Added Additional Items ({addedAdditionalItems.length})
            </h3>
            <div className="overflow-x-auto max-h-80 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md w-full shadow-sm">
              <table className="w-full table-auto text-[10px]">
                <thead className="bg-emerald-800 dark:bg-emerald-900 text-white sticky top-0">
                  <tr>
                    <th className="py-1.5 px-1.5 text-left font-medium w-20">Category</th>
                    <th className="py-1.5 px-1.5 text-left font-medium w-10">Item</th>
                    <th className="py-1.5 px-1.5 text-left font-medium w-12">Pkg ID</th>
                    <th className="py-1.5 px-1.5 text-left font-medium w-8 text-right">Pkg cost</th>
                    <th className="py-1.5 px-1.5 text-left font-medium w-6 text-right">B.Fec</th>
                    <th className="py-1.5 px-1.5 text-left font-medium w-6">B.Unit</th>
                    <th className="py-1.5 px-1.5 text-left font-medium w-6 text-right">S.Fec</th>
                    <th className="py-1.5 px-1.5 text-left font-medium w-6">S.Unit</th>
                    <th className="py-1.5 px-1.5 text-left font-medium w-8 text-right">S.Cost</th>
                    <th className="py-1.5 px-1.5 text-left font-medium w-8 text-right">B.Qty</th>
                    <th className="py-1.5 px-1.5 text-left font-medium w-8 text-right">S.Qty</th>
                    <th className="py-1.5 px-1.5 text-left font-medium w-8 text-right">Qty</th>
                    <th className="py-1.5 px-1.5 text-left font-medium w-8 text-right">Total Price</th>
                    <th className="py-1.5 px-1.5 text-left font-medium w-10 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {addedAdditionalItems.map((item, index) => {
                    const globalIndex = consolidatedItems.findIndex(
                      (ci) => ci.itemCode === item.itemCode && ci.isAdditional,
                    );
                    return (
                      <tr
                        key={globalIndex}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="py-1.5 px-1.5 font-medium max-w-[60px]">
                          {item.category}
                        </td>
                         <td className="py-2 px-3 font-medium">
                                <div className="max-w-[120px]">
                                 
                                  <div className="text-xs text-gray-500 dark:text-gray-400">{item.itemCode}</div>
                                   <div className="font-semibold">{item.itemName}</div>
                               
                                </div>
                              </td>
                        <td className="py-1.5 px-1.5 max-w-[60px]">{item.packageId}</td>
                        <td className="py-1.5 px-1.5 text-right">{formatAmount(item.packagePrice, projectSettings?.costDecimalPlaces || 2)}</td>
                        <td className="py-1.5 px-1.5 text-right">{formatQuantity(item.baseFactor, projectSettings?.quantityDecimalPlaces || 1)}</td>
                        <td className="py-1.5 px-1.5">{item.baseUnit}</td>
                        <td className="py-1.5 px-1.5 text-right">{formatQuantity(item.secondaryFactor, projectSettings?.quantityDecimalPlaces || 1)}</td>
                        <td className="py-1.5 px-1.5">{item.secondaryUnit}</td>
                        <td className="py-1.5 px-1.5 text-right">{formatAmount(item.secondaryCost, projectSettings?.costDecimalPlaces || 2)}</td>
                        <td className="py-1.5 px-1.5 text-right">{formatQuantity(item.baseQuantity, projectSettings?.quantityDecimalPlaces || 4)}</td>
                        <td className="py-1.5 px-1.5 text-right">{formatQuantity(item.secondaryQuantity, projectSettings?.quantityDecimalPlaces || 4)}</td>
                        <td className="py-1.5 text-right">
 <input
  type="number"
  value={item.adjustedQuantity !== 0 ? item.adjustedQuantity : ''}
  onBlur={(e) => {
    if (e.target.value === '') {
      // Keep it empty if user leaves it blank
      return;
    }
    const newValue = parseFloat(e.target.value);
    if (isNaN(newValue)) {
      e.target.value = '';
      handleAdditionalQuantityChange(globalIndex, 0);
      return;
    }
    
    const finalValue = Math.max(0, newValue);
    
    if (finalValue !== item.adjustedQuantity) {
      handleAdditionalQuantityChange(globalIndex, finalValue);
    }
  }}
  onChange={(e) => {
    // Prevent minus symbol from being entered
    if (e.target.value.includes('-')) {
      e.target.value = e.target.value.replace('-', '');
      return;
    }
    
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      handleAdditionalQuantityChange(globalIndex, newValue);
    } else if (e.target.value === '') {
      handleAdditionalQuantityChange(globalIndex, 0);
    }
  }}
  onKeyDown={(e) => {
    // Prevent minus key from being pressed
    if (e.key === '-' || e.key === 'Subtract') {
      e.preventDefault();
    }
  }}
  className="w-full text-right px-0.5 py-0.5 border border-gray-300 dark:border-gray-600 rounded text-[10px] bg-white dark:bg-gray-900 focus:ring-1 focus:ring-blue-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none "
  min="0"
  max="999999"
  onClick={(e) => e.stopPropagation()}
/>
                        </td>
                        <td className="py-1.5 px-1.5 font-medium text-right">{formatAmount(item.adjustedTotal, projectSettings?.costDecimalPlaces || 2)}</td>
                        <td className="py-1.5 px-1.5 text-center">
                          <button
                            onClick={() => handleRemoveConsolidatedItem(globalIndex)}
                            className="text-red-500 hover:text-red-700 transition-colors p-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Cost Summary */}
      {hasResults && (
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
</svg>

            Cost Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 shadow-sm">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Menu Items Cost
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {formatAmount(menuItemsCost, projectSettings?.costDecimalPlaces || 2)}
              </div>
            </div>
            <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 shadow-sm">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" />
                Additional Items
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {formatAmount(additionalCost, projectSettings?.costDecimalPlaces || 2)}
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
            </div>
          </div>
        </div>
      )}

      {/* Remarks & Submission Section */}
      {hasResults && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 w-full">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Remarks & Submission
          </h2>
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5 text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Remarks
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any special instructions or notes..."
              className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none shadow-sm text-xs"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2.5">
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="px-4 py-2 border border-green-600 rounded-md text-xs font-medium 
                bg-green-600 text-white transition-all duration-200 ease-in-out 
                hover:bg-white hover:text-green-600 hover:border-green-600 
                disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-1.5"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V9" />
                  </svg>
                  Save Draft
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Add Item Modal - For Consolidated Items */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                Add Items to Consolidated List
              </h3>
              <button
                onClick={handleCloseAddItemModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-0.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(85vh-10rem)]">
              {/* Search Bar */}
              <div className="mb-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="select-all-checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      disabled={loadingAvailableItems}
                    />
                    <label htmlFor="select-all-checkbox" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Select All
                    </label>
                  </div>
                  <span className="text-xs text-gray-500">
                    {availableItems.filter(item => item.selected).length} of {filteredAvailableItems.length} selected
                  </span>
                </div>
                <div className="relative w-80">
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by name or code..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm text-xs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              {/* Available Items Table */}
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  </svg>
                  Available Items ({filteredAvailableItems.length})
                </h4>
                {loadingAvailableItems ? (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1.5 text-xs">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading available items...
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-64 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm">
                    <table className="min-w-full text-xs w-full">
                      <thead className="bg-blue-800 dark:bg-blue-900 text-white sticky top-0">
                        <tr>
                          <th className="py-2 px-3 text-left font-medium w-10">
                            <input
                              type="checkbox"
                              className="rounded border-white text-white focus:ring-white"
                              disabled={loadingAvailableItems}
                              onChange={(e) => handleSelectAll(e.target.checked)}
                              checked={filteredAvailableItems.length > 0 && filteredAvailableItems.every(item => item.selected)}
                            />
                          </th>
                          <th className="py-2 px-3 text-left font-medium w-24">Item Name & Code</th>
                          <th className="py-2 px-3 text-left font-medium w-12">Category</th>
                          <th className="py-2 px-3 text-left font-medium w-12">Pkg ID</th>
                          <th className="py-2 px-3 text-left font-medium w-12 text-right">Pkg cost</th>
                          <th className="py-2 px-3 text-left font-medium w-6 text-right">B.Fec</th>
                          <th className="py-2 px-3 text-left font-medium w-6">B.Unit</th>
                          <th className="py-2 px-3 text-left font-medium w-6 text-right">S.Fec</th>
                          <th className="py-2 px-3 text-left font-medium w-6">S.Unit</th>
                          <th className="py-2 px-3 text-left font-medium w-8 text-right">S.Cost</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                        {filteredAvailableItems.map((item) => {
                          // Check if item is already in consolidated items
                          const isAlreadyAdded = consolidatedItems.some(
                            existingItem => existingItem.itemCode === item.itemCode
                          );
                          
                          return (
                            <tr
                              key={item.itemCode}
                              className={`transition-colors ${isAlreadyAdded ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                              onClick={() => !isAlreadyAdded && handleToggleItem(item.itemCode)}
                            >
                              <td className="py-2 px-3" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={item.selected ?? false}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    if (!isAlreadyAdded) {
                                      handleToggleItem(item.itemCode);
                                    }
                                  }}
                                  disabled={loadingAvailableItems || isAlreadyAdded}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                              </td>
                              <td className="py-2 px-3 font-medium">
                                <div className="max-w-[120px]">
                                  <div className="font-semibold">{item.itemName}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">Code: {item.itemCode}</div>
                                  {isAlreadyAdded && (
                                    <div className="text-xs text-red-500 dark:text-red-400 mt-1">
                                      ✓ Already added
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="py-2 px-1.5 font-medium max-w-[80px]">{item.category}</td>
                              <td className="py-2 px-3 max-w-[80px]">{item.packageId}</td>
                              <td className="py-2 px-3 text-right">{formatAmount(item.packagePrice, projectSettings?.costDecimalPlaces || 2)}</td>
                              <td className="py-2 px-3 text-right">{formatQuantity(item.baseFactor, projectSettings?.quantityDecimalPlaces || 1)}</td>
                              <td className="py-2 px-3">{item.baseUnit}</td>
                              <td className="py-2 px-3 text-right">{formatQuantity(item.secondaryFactor, projectSettings?.quantityDecimalPlaces || 1)}</td>
                              <td className="py-2 px-3">{item.secondaryUnit}</td>
                              <td className="py-2 px-3 text-right">{formatAmount(item.secondaryCost, projectSettings?.costDecimalPlaces || 2)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                {!loadingAvailableItems && filteredAvailableItems.length === 0 && (
                  <div className="text-center py-3 text-gray-500 dark:text-gray-400 text-xs">
                    No items found matching your search
                  </div>
                )}
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-4 mb-2.5 pt-4 border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">
                  {availableItems.filter(item => item.selected).length} items selected
                </span>
              </div>
              <div className="flex justify-end gap-2.5">
                <button
                  onClick={handleCloseAddItemModal}
                  className="px-4 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                >
                  Close
                </button>
                <button
                  onClick={handleAddSelectedItems}
                  disabled={
                    loadingAvailableItems ||
                    availableItems.filter((item) => item.selected ?? false).length === 0
                  }
                  className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Selected ({availableItems.filter(item => item.selected).length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemRequisition;