import { useState } from 'react';
import { IconChevronDown } from '@tabler/icons-react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';

const ChildComponent = ({
  item,
  isActive,
  handleMouseEnter,
  handleMouseLeave,
  onClick,
  title,
}: any) => {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;
  const { t } = useTranslation();

  const handleSubMenuEnter = () => {
    setIsSubMenuOpen(true);
  };

  const handleSubMenuLeave = () => {
    setIsSubMenuOpen(false);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleSubMenuEnter}
      onMouseLeave={handleSubMenuLeave}
      onClick={onClick}
    >
      <Link to={item.href}>
        <div
          className={`w-full p-2 rounded-lg flex items-center gap-2 text-sm transition-colors ${
            item.href === pathname
              ? 'text-primary bg-lightprimary dark:bg-lightprimary dark:text-primary'
              : 'text-gray-700 dark:text-gray-300 hover:bg-lightprimary hover:text-primary'
          }`}
        >
          <Icon icon={item.icon} height={16} />
          <span className="flex-1">{t(item.title)}</span>
          {item.children && <IconChevronDown size={14} />}
        </div>
      </Link>

      {isSubMenuOpen && item.children && (
        <div className="absolute left-full top-0 ml-1 bg-white dark:bg-dark rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 min-w-[180px] max-h-80 overflow-y-auto">
          <div className="p-2">
            {item.children.map((child: any) => (
              <div key={child.id} className="mb-1">
                {child.children ? (
                  <ChildComponent
                    item={child}
                    isActive={isActive}
                    handleMouseEnter={handleMouseEnter}
                    handleMouseLeave={handleMouseLeave}
                    title={title}
                  />
                ) : (
                  <Link to={child.href}>
                    <div
                      className={`p-2 rounded-lg flex items-center gap-2 text-sm transition-colors ${
                        child.href === pathname
                          ? 'text-primary bg-lightprimary dark:bg-lightprimary dark:text-primary'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-lightprimary hover:text-primary'
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          child.href === pathname ? 'bg-primary' : 'bg-gray-400 dark:bg-gray-500'
                        }`}
                      />
                      <span>{t(child.title)}</span>
                    </div>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChildComponent;
