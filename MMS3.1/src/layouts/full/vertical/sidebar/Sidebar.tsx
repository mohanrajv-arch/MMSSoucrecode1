// SidebarLayout.jsx
import { Sidebar } from 'flowbite-react';
import FullLogo from '../../shared/logo/FullLogo';
import InnerSidebar from './InnerSidebar';

const SidebarLayout = () => {
  return (
    <div className="xl:block hidden">
      <Sidebar
        className="fixed left-0 top-0 menu-sidebar bg-white dark:bg-darkgray rtl:pe-4 h-screen w-64"
        aria-label="Sidebar with multi-level dropdown example"
      >
        <div className="py-3 flex items-center justify-center brand-logo flex-shrink-0">
          <FullLogo />
        </div>
        <InnerSidebar />
      </Sidebar>
    </div>
  );
};

export default SidebarLayout;