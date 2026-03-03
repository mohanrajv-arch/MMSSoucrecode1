import { Icon } from '@iconify/react';
import { useState } from 'react';
import Quicklinks from './Quicklinks';
import { IconHelp } from '@tabler/icons-react';
import { Button, Drawer } from 'flowbite-react';
// @ts-ignore
import SimpleBar from 'simplebar-react';
import { Link } from 'react-router';
import SidebarContent from '../sidebar/Sidebaritems';

const AppLinks = () => {
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      <div className="relative group z-[50]">
        {/* Desktop Icon */}
        <span className="h-10 w-10 hover:bg-lightprimary rounded-full justify-center items-center cursor-pointer group-hover:bg-lightprimary group-hover:text-primary xl:flex hidden">
          <Icon icon="solar:widget-3-line-duotone" height={20} />
        </span>

        {/* Mobile Icon */}
        <span
          className="xl:hidden h-10 w-10 hover:bg-lightprimary rounded-full flex justify-center items-center cursor-pointer group-hover:bg-lightprimary group-hover:text-primary"
          onClick={() => setIsOpen(true)}
        >
          <Icon icon="solar:widget-3-line-duotone" height={20} />
        </span>

        {/* Dropdown/Drawer Content */}
        <div className="sm:w-[900px] w-screen dropdown lg:invisible visible group-hover:visible absolute">
          <Drawer
            open={isOpen}
            onClose={handleClose}
            position="right"
            className="xl:relative xl:translate-none xl:h-auto xl:bg-transparent xl:z-[0] xl:w-[900px] w-64"
          >
            <SimpleBar className="md:h-auto h-[calc(100vh_-_50px)]">
              <div className="grid grid-cols-12 w-full">
                {/* Main Content Section */}
                <div className="xl:col-span-8 col-span-12 flex items-stretch xl:pr-0 xl:px-3 rtl:pr-3 px-5 py-5">
                  <div className="grid grid-cols-12 gap-3 w-full">
                    {SidebarContent.map((section, sectionIndex) => (
                      <div
                        className="col-span-12 xl:col-span-6 flex items-stretch"
                        key={sectionIndex}
                      >
                        <div className="w-full">
                          <h5 className="font-semibold text-sm text-ld mb-3 px-2">
                            {section.heading}
                          </h5>
                          <ul className="space-y-2">
                            {section.children?.map((item, itemIndex) => (
                              <li key={itemIndex}>
                                <Link
                                  to={item.url}
                                  className="flex gap-3 items-center hover:text-primary group relative p-2 rounded-lg hover:bg-lightprimary dark:hover:bg-darkprimary"
                                >
                                  <span className="bg-lighthover dark:bg-darkgray h-10 w-10 flex justify-center items-center rounded-full">
                                    <Icon icon={item.icon} width={20} height={20} />
                                  </span>
                                  <div>
                                    <h6 className="font-semibold text-sm text-ld hover:text-primary">
                                      {item.name}
                                    </h6>
                                  </div>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}

                    {/* Footer Section */}
                    <div className="col-span-12 md:col-span-12 border-t border-border dark:border-darkborder hidden xl:flex items-stretch pt-4 pr-4">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center text-dark dark:text-darklink">
                          <Link
                            to={'/theme-pages/faq'}
                            className="text-sm font-semibold hover:text-primary ml-2 flex gap-2 items-center"
                          >
                            <IconHelp width={20} />
                            Frequently Asked Questions
                          </Link>
                        </div>
                        <Button color={'primary'}>Check</Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quicklinks Section - Add this if you want to include it */}
                {/* <div className="xl:col-span-4 col-span-12 border-l border-border dark:border-darkborder">
                  <Quicklinks />
                </div> */}
              </div>
            </SimpleBar>
          </Drawer>
        </div>
      </div>
    </>
  );
};

export default AppLinks;
