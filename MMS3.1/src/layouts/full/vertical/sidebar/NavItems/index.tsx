import React, { useContext } from "react";
import { ChildItem } from "../Sidebaritems";
import { Button, SidebarItem } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";
import { DashboardContext } from "src/context/DashboardContext/DashboardContext";

interface NavItemsProps {
  item: ChildItem;
  themeColor: string;
}

const NavItems: React.FC<NavItemsProps> = ({ item, themeColor }) => {
  const location = useLocation();
  const pathname = location.pathname;
  const isActive = item.url === pathname;
  const { t } = useTranslation();
  const { setIsMobileSidebarOpen } = useContext(DashboardContext);
  
  const handleMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  // Function to calculate a lighter version of the theme color
  const getLightColor = (color: string) => {
    // This is a simple approach - you might want to use a color library for more accuracy
    return color + "33"; // Add transparency (33 = 20% opacity in hex)
  };

  const lightThemeColor = getLightColor(themeColor);

  return (
    <>
      <Link to={item.url}>
        <SidebarItem
          as={Button}
          className={`${
            isActive
              ? `text-primary rounded-lg hover:text-primary`
              : "text-link group/link rounded-lg"
          }`}
          style={{
            backgroundColor: isActive ? lightThemeColor : 'transparent',
          }}
        >
          <span onClick={handleMobileSidebar} className="flex gap-[13px] align-center items-center truncate">
            {item.icon ? (
              <Icon 
                icon={item.icon} 
                className={item.color} 
                height={18} 
                style={{ color: isActive ? themeColor : 'inherit' }}
              />
            ) : (
              <span
                className={`${
                  isActive
                    ? "bg-primary rounded-full mx-1.5 group-hover/link:bg-primary h-[6px] w-[6px]"
                    : "h-[6px] w-[6px] bg-black/40 dark:bg-white rounded-full mx-1.5 group-hover/link:bg-primary"
                }`}
              ></span>
            )}
            <span 
              className="max-w-51 overflow-hidden hide-menu"
              style={{ color: isActive ? themeColor : 'inherit' }}
            >
              {t(`${item.name}`)}
            </span>
          </span>
        </SidebarItem>
      </Link>
    </>
  );
};

export default NavItems;