// InnerSidebar.jsx
import React, { useContext, useEffect, useState } from 'react';
import { SidebarItemGroup, SidebarItems } from 'flowbite-react';
import { useSidebarItems } from './Sidebaritems';
import NavItems from './NavItems';
import NavCollapse from './NavCollapse';
import SimpleBar from 'simplebar-react';
import { CustomizerContext } from 'src/context/CustomizerContext';
import { useLocation } from 'react-router';
import { Icon } from '@iconify/react/dist/iconify.js';
import { logScreenCapture } from 'src/utils/screenCapture';

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

const InnerSidebar = () => {
  const { setSelectedIconId, activeTheme } = useContext(CustomizerContext) || {};
  const location = useLocation();
  const pathname = location.pathname;
  const [lastScreenUrl, setLastScreenUrl] = useState('');
  const [screenStartTime, setScreenStartTime] = useState(new Date());
  const [activeItemId, setActiveItemId] = useState(null);

  const SidebarContent = useSidebarItems();

  // Function to get theme color based on active theme
  const getThemeColor = () => {
    const colors = {
      BLUE_THEME: '#00A1FF',
      AQUA_THEME: '#0074BA',
      PURPLE_THEME: '#763EBD',
      GREEN_THEME: '#0A7EA4',
      CYAN_THEME: '#01C0C8',
      ORANGE_THEME: '#FA896B',
      RED_THEME: '#FF4B4B',
      AMBER_THEME: '#FF9500',
      INDIGO_THEME: '#7857FF',
      PINK_THEME: '#FF2E63',
      MINT_THEME: '#43CC7A',
      DEEP_PURPLE_THEME: '#5E35B1',
      ROSE_THEME: '#E91E63',
      DARK_BLUE_THEME: '#3949AB',
      MAGENTA_THEME: '#D81B60',
      TEAL_THEME: '#009688',
      DEEP_ORANGE_THEME: '#FF6D00',
      LIME_THEME: '#7CB342',
      VIOLET_THEME: '#8E24AA',
      EMERALD_THEME: '#009688',
      CORAL_THEME: '#FF7043',
      GOLD_THEME: '#FFB300',
      SAPPHIRE_THEME: '#2962FF',
      RUBY_THEME: '#E53935',
      FOREST_THEME: '#43A047',
      LAVENDER_THEME: '#9C27B0',
      SKY_THEME: '#03A9F4',
      MARINE_THEME: '#00BCD4',
      SUNSET_THEME: '#FF9800',
    };
    return colors[activeTheme] || colors.BLUE_THEME;
  };

  // Track screen time when component mounts or path changes
  useEffect(() => {
    const now = new Date();
    const timeSpent = Math.floor((now.getTime() - screenStartTime.getTime()) / 1000);

    // Only log if we've spent more than 5 seconds on the previous screen
    if (lastScreenUrl && timeSpent > 5) {
      logScreenCapture(lastScreenUrl, timeSpent);
    }

    // Update for the new screen
    setLastScreenUrl(pathname);
    setScreenStartTime(now);

    // Cleanup function to log when component unmounts
    return () => {
      const finalTime = Math.floor((new Date().getTime() - now.getTime()) / 1000);
      if (pathname && finalTime > 5) {
        logScreenCapture(pathname, finalTime);
      }
    };
  }, [pathname]);

  // Find active URL and set active item
  useEffect(() => {
    const findActiveItem = (items: MenuItem[], targetUrl: string): string | number | null => {
      for (const item of items) {
        if (item.children) {
          for (const child of item.children) {
            if (child.url === targetUrl) {
              return child.id;
            }
            if (child.children) {
              const nestedActive = findActiveItem(child.children as MenuItem[], targetUrl);
              if (nestedActive) return nestedActive;
            }
          }
        }
      }
      return null;
    };

    const findParentGroupId = (items: MenuItem[], targetUrl: string): string | number | null => {
      for (const item of items) {
        if (item.children) {
          for (const child of item.children) {
            if (child.url === targetUrl) {
              return item.id;
            }
            if (child.children) {
              const nestedParent = findParentGroupId(child.children as MenuItem[], targetUrl);
              if (nestedParent) return nestedParent;
            }
          }
        }
      }
      return null;
    };

    if (SidebarContent.length > 0) {
      const activeId = findActiveItem(SidebarContent, pathname);
      setActiveItemId(activeId);
      
      const groupId = findParentGroupId(SidebarContent, pathname);
      if (groupId && setSelectedIconId) {
        setSelectedIconId(groupId);
      }
    }
  }, [pathname, setSelectedIconId, SidebarContent]);

  // Get the current theme color
  const themeColor = getThemeColor();

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <SimpleBar
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{
          height: 'calc(100vh - 120px)',
          paddingBottom: '20px',
        }}
        autoHide={false}
      >
        <SidebarItems className="rtl:pe-0 rtl:ps-3 px-4 mt-2 pb-8">
          <SidebarItemGroup className="sidebar-nav space-y-1">
            {SidebarContent.map((item, index) => (
              <React.Fragment key={item.id || index}>
                <h5 
                  className="text-link dark:text-white/70 caption font-semibold leading-6 tracking-widest text-xs pb-2 pt-4 uppercase border-t border-border dark:!border-darkborder whitespace-normal break-words first:border-t-0 first:pt-0 text-left"
                  style={{ color: themeColor }}
                >
                  <span className="hide-menu">{item.heading}</span>
                </h5>
                <div className="space-y-1">
                  {item.children?.map((child, index) => (
                    <React.Fragment key={child.id || index}>
                      {child.children ? (
                        <div className="collapse-items">
                          <NavCollapse 
                            item={child} 
                            themeColor={themeColor}
                            activeItemId={activeItemId}
                            pathname={pathname}
                          />
                        </div>
                      ) : (
                        <NavItems 
                          item={child} 
                          themeColor={themeColor}
                          isActive={activeItemId === child.id}
                          pathname={pathname}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </React.Fragment>
            ))}
          </SidebarItemGroup>
        </SidebarItems>
      </SimpleBar>
    </div>
  );
};

export default InnerSidebar;