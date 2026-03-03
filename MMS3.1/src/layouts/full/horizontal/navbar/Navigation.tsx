import { useState, useRef, useEffect } from 'react';
import { Navbar, NavbarCollapse } from 'flowbite-react';
import { IconChevronDown, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import ChildComponent from './ChildComponent';
import { Icon } from '@iconify/react';
import Menuitems from '../MenuData';
import { Link, useLocation } from 'react-router';

const Navigation = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [active, setActive] = useState(Menuitems[0].id);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const pathname = location.pathname;

  // Check scroll state
  const updateScrollButtons = () => {
    if (navRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener('resize', updateScrollButtons);
    return () => window.removeEventListener('resize', updateScrollButtons);
  }, []);

  const handleDropdownEnter = (itemId: any) => {
    setActiveDropdown(itemId);
    setActive(itemId);
  };

  const handleDropdownLeave = () => {
    setActiveDropdown(null);
  };

  const handleChildClick = (parentId: any) => {
    setActive(parentId);
  };

  const scrollNav = (direction: 'left' | 'right') => {
    if (navRef.current) {
      const scrollAmount = 200;
      navRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(updateScrollButtons, 300);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (navRef.current) {
      e.preventDefault();
      navRef.current.scrollLeft += e.deltaY;
      updateScrollButtons();
    }
  };

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="relative flex items-center w-full">
        {/* Left Scroll Button */}
        {canScrollLeft && (
          <button
            onClick={() => scrollNav('left')}
            className="absolute left-0 z-20 w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <IconChevronLeft size={16} />
          </button>
        )}

        {/* Navigation Container */}
        <div
          ref={navRef}
          className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2 px-10 w-full"
          onWheel={handleWheel}
          onScroll={updateScrollButtons}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {Menuitems.map((item) => {
            let isActive = false;

            // Check if item is active
            if (item.children && item.children.length > 0) {
              item.children.forEach((child: any) => {
                if (child?.children) {
                  child.children.forEach((nestedChild: any) => {
                    if (nestedChild.href === pathname) isActive = true;
                  });
                } else {
                  if (child.href === pathname) isActive = true;
                }
              });
            } else {
              isActive = item.href === pathname;
            }

            return (
              <div key={item.id} className="relative flex-shrink-0">
                {item.children && item.children.length > 0 ? (
                  <div
                    className="relative"
                    onMouseEnter={() => handleDropdownEnter(item.id)}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <div
                      className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${
                        isActive
                          ? 'text-primary bg-lightprimary dark:bg-lightprimary dark:text-primary'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-lightprimary hover:text-primary'
                      }`}
                    >
                      <Icon icon={item.icon} height={16} />
                      <span>{item.title}</span>
                      <IconChevronDown size={14} />
                    </div>

                    {activeDropdown === item.id && (
                      <div
                        className="absolute top-full left-0 mt-1 bg-white dark:bg-dark rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 min-w-[200px] max-h-80 overflow-y-auto"
                        onMouseEnter={() => handleDropdownEnter(item.id)}
                        onMouseLeave={handleDropdownLeave}
                      >
                        <div className="p-2">
                          {item.children.map((child) => (
                            <div key={child.id}>
                              <ChildComponent
                                item={child}
                                title={item.title}
                                isActive={activeDropdown === item.id}
                                handleMouseEnter={() => handleDropdownEnter(item.id)}
                                handleMouseLeave={handleDropdownLeave}
                                onClick={() => handleChildClick(item.id)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link to={item.href}>
                    <div
                      className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium whitespace-nowrap transition-colors ${
                        isActive
                          ? 'text-primary bg-lightprimary dark:bg-lightprimary dark:text-primary'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-lightprimary hover:text-primary'
                      }`}
                    >
                      <Icon icon={item.icon} height={16} />
                      <span>{item.title}</span>
                    </div>
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Scroll Button */}
        {canScrollRight && (
          <button
            onClick={() => scrollNav('right')}
            className="absolute right-0 z-20 w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <IconChevronRight size={16} />
          </button>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Navigation;