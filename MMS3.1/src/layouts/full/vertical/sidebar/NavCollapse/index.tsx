import { useEffect, useState } from "react";
import { ChildItem } from "../Sidebaritems";
import NavItems from "../NavItems";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { CustomCollapse } from "../CustomCollapse";
import React from "react";

interface NavCollapseProps {
  item: ChildItem;
  themeColor: string;
  pathname: string;
}

const NavCollapse: React.FC<NavCollapseProps> = ({ item, themeColor, pathname }: any) => {
  const location = useLocation();
  const currentPathname = location.pathname;

  // Determine if any child matches the current path
  const hasActiveChild = item.children?.some((child: any) => {
    if (child.url === currentPathname) return true;
    if (child.children) {
      return child.children.some((nested: any) => nested.url === currentPathname);
    }
    return false;
  });

  const { t, i18n } = useTranslation();
  const [translatedLabel, setTranslatedLabel] = useState<string | null>(null);

  // Manage open/close state for the collapse
  const [isOpen, setIsOpen] = useState<boolean>(!!hasActiveChild);

  useEffect(() => {
    const loadTranslation = async () => {
      const label = t(`${item.name}`);
      setTranslatedLabel(label);
    };
    loadTranslation();
  }, [i18n.language, item.name, t]);

  // Auto-open if has active child
  useEffect(() => {
    if (hasActiveChild) {
      setIsOpen(true);
    }
  }, [hasActiveChild, currentPathname]);

  // Toggle the collapse
  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <CustomCollapse
      label={translatedLabel || `${item.name}`}
      open={isOpen}
      onClick={handleToggle}
      icon={item.icon}
      className={
        hasActiveChild
          ? "text-white bg-opacity-100 rounded-lg"
          : "rounded-lg dark:text-white/80 hover:text-white hover:bg-opacity-20"
      }
      style={{
        backgroundColor: hasActiveChild ? themeColor : 'transparent',
      }}
      iconColor={hasActiveChild ? '#fff' : themeColor}
    >
      {/* Render child items */}
      {item.children && (
        <div className="sidebar-dropdown pl-4">
          {item.children.map((child: any) => (
            <React.Fragment key={child.id}>
              {child.children ? (
                <NavCollapse 
                  item={child} 
                  themeColor={themeColor}
                  pathname={pathname}
                />
              ) : (
                <NavItems 
                  item={child} 
                  themeColor={themeColor}
                  pathname={pathname}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </CustomCollapse>
  );
};

export default NavCollapse;