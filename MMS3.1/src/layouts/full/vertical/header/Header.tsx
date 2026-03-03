import 'flowbite';
import { useState, useEffect, useContext } from 'react';
import { DrawerItems, Navbar, NavbarCollapse } from 'flowbite-react';
import { Icon } from '@iconify/react';
import AppLinks from './AppLinks';
import Profile from './Profile';
import FullLogo from '../../shared/logo/FullLogo';
import MobileHeaderItems from './MobileHeaderItems';
import { Drawer } from 'flowbite-react';
import MobileSidebar from '../sidebar/MobileSidebar';
import HorizontalMenu from '../../horizontal/header/HorizontalMenu';
import { CustomizerContext } from 'src/context/CustomizerContext';
import { DashboardContext } from 'src/context/DashboardContext/DashboardContext';
import { HeaderCustomizer } from './HeaderCustomizer';

interface HeaderPropsType {
  layoutType: string;
}

const Header = ({ layoutType }: HeaderPropsType) => {
  const [isSticky, setIsSticky] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const userData =
      window.userData ||
      (localStorage.getItem('userSession')
        ? JSON.parse(localStorage.getItem('userSession') || '{}')
        : null);

    if (userData) {
      setUserName(
        userData.userDetails?.userName || userData.userName || userData.firstName || 'User',
      );
    }
  }, []);

  const { setIsCollapse, isCollapse, isLayout, setActiveMode, activeMode, activeTheme } =
    useContext(CustomizerContext);
  const { isMobileSidebarOpen, setIsMobileSidebarOpen } = useContext(DashboardContext);
  const [mobileMenu, setMobileMenu] = useState('');

  const getThemeColor = () => {
    const colors = {
      BLUE_THEME: 'from-blue-500 to-blue-600',
      AQUA_THEME: 'from-[#0074BA] to-[#005A92]',
      PURPLE_THEME: 'from-[#763EBD] to-[#5D2F9E]',
      GREEN_THEME: 'from-[#0A7EA4] to-[#086485]',
      CYAN_THEME: 'from-[#01C0C8] to-[#019AA1]',
      ORANGE_THEME: 'from-[#FA896B] to-[#F86A46]',
      RED_THEME: 'from-[#FF4B4B] to-[#FF2A2A]',
      AMBER_THEME: 'from-[#FF9500] to-[#E67E00]',
      INDIGO_THEME: 'from-[#7857FF] to-[#5E3CFF]',
      PINK_THEME: 'from-[#FF2E63] to-[#E61A4F]',
      MINT_THEME: 'from-[#43CC7A] to-[#33B367]',
      DEEP_PURPLE_THEME: 'from-[#5E35B1] to-[#4C2A8F]',
      ROSE_THEME: 'from-[#E91E63] to-[#D81B60]',
      DARK_BLUE_THEME: 'from-[#3949AB] to-[#2F3D8F]',
      MAGENTA_THEME: 'from-[#D81B60] to-[#B7154F]',
      TEAL_THEME: 'from-[#009688] to-[#007D70]',
      DEEP_ORANGE_THEME: 'from-[#FF6D00] to-[#E65C00]',
      LIME_THEME: 'from-[#7CB342] to-[#689F38]',
      VIOLET_THEME: 'from-[#8E24AA] to-[#7B1FA2]',
      EMERALD_THEME: 'from-[#009688] to-[#00897B]',
      CORAL_THEME: 'from-[#FF7043] to-[#F4511E]',
      GOLD_THEME: 'from-[#FFB300] to-[#FFA000]',
      SAPPHIRE_THEME: 'from-[#2962FF] to-[#1A53FF]',
      RUBY_THEME: 'from-[#E53935] to-[#D32F2F]',
      FOREST_THEME: 'from-[#43A047] to-[#388E3C]',
      LAVENDER_THEME: 'from-[#9C27B0] to-[#8E24AA]',
      SKY_THEME: 'from-[#03A9F4] to-[#039BE5]',
      MARINE_THEME: 'from-[#00BCD4] to-[#00ACC1]',
      SUNSET_THEME: 'from-[#FF9800] to-[#F57C00]',
    };
    return colors[activeTheme] || colors.DARK_BLUE_THEME;
  };

  const toggleMode = () => setActiveMode(activeMode === 'light' ? 'dark' : 'light');
  const handleClose = () => setIsMobileSidebarOpen(false);

  const formatDateTime = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds} IST`;
  };

  const formattedDateTime = formatDateTime(currentDateTime);

  return (
    <>
      <header className={`sticky top-0 z-[5] ${isSticky ? 'shadow-md' : ''}`}>
        <div className={`bg-gradient-to-r ${getThemeColor()} text-white shadow-sm`}>
          <div
            className={`${
              layoutType === 'horizontal' ? 'container mx-auto px-4' : 'px-4 sm:px-6'
            } ${isLayout === 'full' ? '!max-w-full' : ''} py-3`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="h-8 w-8 flex xl:hidden text-white hover:text-white hover:bg-white/20 rounded-md justify-center items-center cursor-pointer transition-all duration-200 font-bold"
                >
                  <Icon
                    icon="solar:hamburger-menu-bold"
                    height={20}
                    className="font-bold"
                  />
                </span>

                {layoutType === 'horizontal' ? (
                  <div className="text-white scale-90">
                    <FullLogo />
                  </div>
                ) : (
                  <span
                    onClick={() =>
                      setIsCollapse(isCollapse === 'full-sidebar' ? 'mini-sidebar' : 'full-sidebar')
                    }
                    className="h-8 w-8 xl:flex hidden text-white hover:text-white hover:bg-white/20 rounded-md justify-center items-center cursor-pointer transition-all duration-200 font-bold"
                  >
                    <Icon
                      icon="solar:hamburger-menu-bold"
                      height={20}
                      className="font-bold"
                    />
                  </span>
                )}
              </div>

              <div className="flex-1 flex justify-center px-4">
                <h1 className="text-lg sm:text-xl font-bold text-white whitespace-nowrap">
                  Menu Management System
                </h1>
              </div>

              <div className="flex items-center gap-3">
          

                <div className="hidden xl:flex items-center gap-1">
                  {/* Theme Toggle */}
                  <div
                    className="h-8 w-8 hover:bg-white/20 rounded-md flex justify-center items-center cursor-pointer text-white hover:text-white transition-all duration-200"
                    onClick={toggleMode}
                    title={`Switch to ${activeMode === 'light' ? 'dark' : 'light'} mode`}
                  >
                    <Icon
                      icon={
                        activeMode === 'light'
                          ? 'solar:moon-bold'
                          : 'solar:sun-bold'
                      }
                      width="20"
                      className="font-bold"
                    />
                  </div>

                  {/* Customizer Settings */}
                  <div className="h-8 w-8 hover:bg-white/20 rounded-md flex justify-center items-center cursor-pointer text-white hover:text-white transition-all duration-200">
                   <HeaderCustomizer />
                  </div>

                  <div className="scale-90">
                    <Profile />
                  </div>
                </div>

                <span
                  className="h-8 w-8 flex xl:hidden text-white hover:text-white hover:bg-white/20 rounded-md justify-center items-center cursor-pointer transition-all duration-200 font-bold"
                  onClick={() => setMobileMenu(mobileMenu === 'active' ? '' : 'active')}
                >
                  <Icon
                    icon="tabler:dots-vertical"
                    height={20}
                    className="font-bold"
                  />
                </span>
              </div>
            </div>

            <div className="md:hidden mt-2 pt-2 border-t border-white/20">
              <div className="flex justify-between items-center font-bold text-white text-xs">
                <span className="font-bold">{userName}</span>
                <span className="font-bold">{formattedDateTime}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={`w-full xl:hidden block mobile-header-menu ${mobileMenu}`}>
          <MobileHeaderItems />
        </div>

        {layoutType === 'horizontal' && (
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className={`${isLayout === 'full' ? 'w-full px-6' : 'container px-5'}`}>
              <HorizontalMenu />
            </div>
          </div>
        )}
      </header>

      <Drawer open={isMobileSidebarOpen} onClose={handleClose} className="w-[130px]">
        <DrawerItems>
          <MobileSidebar />
        </DrawerItems>
      </Drawer>
    </>
  );
};

export default Header;