// Sidebaritems.tsx
import { uniqueId } from 'lodash';
import { useAuth } from 'src/context/AuthContext';

export interface ChildItem {
  id?: number | string;
  name?: string;
  icon?: any;
  children?: ChildItem[];
  item?: any;
  url?: any;
  color?: string;
}

export interface MenuItem {
  heading?: string;
  name?: string;
  icon?: any;
  id?: number;
  to?: string;
  items?: MenuItem[];
  children?: ChildItem[];
  url?: any;
}

const baseSidebarContent: MenuItem[] = [
  {
    heading: 'Menu Structuring',
    children: [
      {
        name: 'Meal Set Template',
        icon: 'solar:document-text-outline', // Suitable for templates/documents
        id: uniqueId(),
        url: '/Transaction/MealSetTemplate',
      },
      {
        name: 'Meal Set Menu',
        icon: 'solar:list-outline', // For lists/menus
        id: uniqueId(),
        url: '/Transaction/MealSetMenu',
      },
      {
        name: 'Final Menu Set',
        icon: 'solar:checklist-outline', // For final checklists
        id: uniqueId(),
        url: '/Transaction/FinalMealSet',
      },
      {
        name: 'Menu Simulation',
        icon: 'solar:chart-2-outline', // For simulations/charts
        id: uniqueId(),
        url: '/Transaction/MenuSimulation',
      },
    ],
  },
  {
    heading: 'Business Operations',
    children: [
      {
        name: 'Issue Menu-Location',
        icon: 'solar:map-point-add-outline', // For locations and issuing
        id: uniqueId(),
        url: 'business/issueMenuToLocation',
      },
    ],
  },
  {
    heading: 'Master Setup',
    children: [
      {
        name: 'Recipe Master',
        icon: 'solar:book-2-outline', // For recipes/books
        id: uniqueId(),
        url: '/Master/RecipeMaster',
      },
      {
        name: 'Category Recipe',
        icon: 'solar:widget-add-outline', // For mapping/widgets
        id: uniqueId(),
        url: '/Master/CategoryRecipe',
      },
      {
        name: 'Meal Type Recipe',
        icon: 'solar:widget-5-outline', // For mapping/widgets
        id: uniqueId(),
        url: '/Master/MealTypeMapping',
      },
      {
        name: 'Country Origin',
        icon: 'solar:flag-outline', // For countries/flags
        id: uniqueId(),
        url: 'Master/CountryOrigin',
      },
      {
        name: 'Meal Type',
        icon: 'solar:clock-circle-outline', // For types/time-related
        id: uniqueId(),
        url: 'Master/mealType',
      },
      {
        name: 'Recipe Category',
        icon: 'solar:tag-horizontal-outline', // For categories/tags
        id: uniqueId(),
        url: '/Master/RecipeCategory',
      },
      {
        name: 'Base Portion Quantity',
        icon: 'solar:tag-outline', // For categories/tags
        id: uniqueId(),
        url: '/Master/BasePortion',
      },
      {
        name: 'Item Category',
        icon: 'solar:tag-outline', // For categories/tags
        id: uniqueId(),
        url: '/Master/ItemCategory',
      },
    ],
  },
  {
    heading: 'Locations',
    children: [
      {
        name: 'Recipe Listing',
        icon: 'solar:book-2-outline', // For recipes/books
        id: uniqueId(),
        url: '/Master/RecipeListing',
      },
      {
        name: 'Recipe Enquiry',
        icon: 'solar:book-2-outline', // For recipes/books
        id: uniqueId(),
        url: '/Location/RecipeEnquiry',
      },
      {
        name: 'Item Requisition',
        icon: 'solar:book-2-outline', // For recipes/books
        id: uniqueId(),
        url: '/Master/ItemRequisition',
      },
      {
        name: 'Menu Screen',
        icon: 'solar:book-2-outline', // For recipes/books
        id: uniqueId(),
        url: '/Location/MenuScreen',
      },
      {
        name: 'Estimated Dashboard',
        icon: 'solar:book-2-outline', // For recipes/books
        id: uniqueId(),
        url: '/Dashboard/EstimatedDashboard',
      },
      {
        name: 'Stock Dashboard',
        icon: 'solar:book-2-outline', // For recipes/books
        id: uniqueId(),
        url: '/Dashboard/StockDashboard',
      },
      {
        name: 'User Creations',
        icon: 'solar:book-2-outline', // For recipes/books
        id: uniqueId(),
        url: '/userMaster/userCreations',
      },
      {
        name: 'User Log',
        icon: 'solar:book-2-outline', // For recipes/books
        id: uniqueId(),
        url: '/userMaster/userLog',
      },
      {
        name: 'User Rights',
        icon: 'solar:book-2-outline', // For recipes/books
        id: uniqueId(),
        url: '/userMaster/userRights',
      },
      {
        name: 'Common Master',
        icon: 'solar:book-2-outline', // For recipes/books
        id: uniqueId(),
        url: '/CommonMaster/CommonMaster',
      }
    ],
  },
];

export const useSidebarItems = (): MenuItem[] => {
  const { credentials } = useAuth();
  const userType = credentials?.userType ?? 0; // Default to 0 if not authenticated

  if (userType === 0) {
    return baseSidebarContent;
  }

  let filteredContent: MenuItem[] = [...baseSidebarContent];

  if (userType === 1) {
    // Show all except the six restricted items in Locations
    filteredContent = filteredContent.map((section) => {
      if (section.heading === 'Locations') {
        const restrictedUrls = [
          '/Master/RecipeListing',
          '/Location/RecipeEnquiry',
          '/Master/ItemRequisition',
          '/Location/MenuScreen',
          '/Dashboard/EstimatedDashboard',
          '/Dashboard/StockDashboard',
        ];
        return {
          ...section,
          children: section.children?.filter((child) => !restrictedUrls.includes(child.url)) || [],
        };
      }
      return section;
    });
  } else if (userType === 2) {
    // Show only the six restricted items under Locations
    const locationsSection = baseSidebarContent.find((s) => s.heading === 'Locations');
    if (locationsSection) {
      const allowedUrls = [
        '/Master/RecipeListing',
        '/Location/RecipeEnquiry',
        '/Master/ItemRequisition',
        '/Location/MenuScreen',
        '/Dashboard/EstimatedDashboard',
        '/Dashboard/StockDashboard',
      ];
      const filteredChildren = locationsSection.children?.filter((child) => allowedUrls.includes(child.url)) || [];
      filteredContent = [{
        ...locationsSection,
        children: filteredChildren,
      }];
    } else {
      filteredContent = [];
    }
  }

  // Filter out empty sections (optional, but keeps UI clean)
  return filteredContent.filter((section) => 
    section.children?.length > 0 || section.items?.length > 0
  );
};

export default baseSidebarContent; // Export the base for any static uses, but recommend using the hook