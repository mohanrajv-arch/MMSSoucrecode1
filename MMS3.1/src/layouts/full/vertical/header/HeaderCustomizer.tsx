import React, { useContext, useState, useEffect } from "react";
import { Button, Drawer, RangeSlider, Tooltip } from "flowbite-react";
import { Icon } from "@iconify/react";
import { IconCheck } from "@tabler/icons-react";
// @ts-ignore
import SimpleBar from "simplebar-react";
import { CustomizerContext } from "src/context/CustomizerContext";

export const HeaderCustomizer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);
  
  const addAttributeToBody = (cvalue: any) => {
    document.body.setAttribute("data-color-theme", cvalue);
  };

  const {
    activeDir,
    setActiveDir,
    activeMode,
    setActiveMode,
    isCollapse,
    setIsCollapse,
    activeTheme,
    setActiveTheme,
    activeLayout,
    setActiveLayout,
    isLayout,
    isCardShadow,
    setIsCardShadow,
    setIsLayout,
    isBorderRadius,
    setIsBorderRadius,
  } = useContext(CustomizerContext);

  // Default theme configuration
  const defaultTheme = {
    id: 1,
    bgColor: "#3949AB",
    disp: "DARK_BLUE_THEME",
    name: "Navy Blue"
  };

  // Apply default theme on component mount
  useEffect(() => {
    // Check if no theme is currently set, then apply default
    if (!activeTheme || activeTheme === "") {
      setActiveTheme(defaultTheme.disp);
      addAttributeToBody(defaultTheme.disp);
    }
  }, [activeTheme, setActiveTheme]);

  const themeColors = [
    defaultTheme, // Default theme as first item
    {
      id: 2,
      bgColor: "#0074BA",
      disp: "AQUA_THEME",
      name: "Deep Aqua"
    },
    {
      id: 3,
      bgColor: "#763EBD",
      disp: "PURPLE_THEME",
      name: "Royal Purple"
    },
    {
      id: 4,
      bgColor: "#0A7EA4",
      disp: "GREEN_THEME",
      name: "Emerald Green"
    },
    {
      id: 5,
      bgColor: "#01C0C8",
      disp: "CYAN_THEME",
      name: "Vibrant Cyan"
    },
    {
      id: 6,
      bgColor: "#FA896B",
      disp: "ORANGE_THEME",
      name: "Coral Orange"
    },
    {
      id: 7,
      bgColor: "#FF4B4B",
      disp: "RED_THEME",
      name: "Crimson Red"
    },
    {
      id: 8,
      bgColor: "#FF9500",
      disp: "AMBER_THEME",
      name: "Sunset Amber"
    },
    {
      id: 9,
      bgColor: "#7857FF",
      disp: "INDIGO_THEME",
      name: "Electric Indigo"
    },
    {
      id: 10,
      bgColor: "#FF2E63",
      disp: "PINK_THEME",
      name: "Fuchsia Pink"
    },
    {
      id: 11,
      bgColor: "#43CC7A",
      disp: "MINT_THEME",
      name: "Fresh Mint"
    },
    {
      id: 12,
      bgColor: "#5E35B1",
      disp: "DEEP_PURPLE_THEME",
      name: "Deep Violet"
    },
    {
      id: 13,
      bgColor: "#E91E63",
      disp: "ROSE_THEME",
      name: "Blush Rose"
    },
    {
      id: 14,
      bgColor: "#00A1FF",
      disp: "BLUE_THEME",
      name: "Ocean Blue"
    },
    {
      id: 15,
      bgColor: "#D81B60",
      disp: "MAGENTA_THEME",
      name: "Vivid Magenta"
    },
    {
      id: 16,
      bgColor: "#009688",
      disp: "TEAL_THEME",
      name: "Jade Teal"
    },
    {
      id: 17,
      bgColor: "#FF6D00",
      disp: "DEEP_ORANGE_THEME",
      name: "Burnt Orange"
    },
    {
      id: 18,
      bgColor: "#7CB342",
      disp: "LIME_THEME",
      name: "Lime Green"
    },
    {
      id: 19,
      bgColor: "#8E24AA",
      disp: "VIOLET_THEME",
      name: "Rich Violet"
    },
    {
      id: 20,
      bgColor: "#009688",
      disp: "EMERALD_THEME",
      name: "Deep Emerald"
    },
    {
      id: 21,
      bgColor: "#FF7043",
      disp: "CORAL_THEME",
      name: "Vibrant Coral"
    },
    {
      id: 22,
      bgColor: "#FFB300",
      disp: "GOLD_THEME",
      name: "Shimmering Gold"
    },
    {
      id: 23,
      bgColor: "#2962FF",
      disp: "SAPPHIRE_THEME",
      name: "Bright Sapphire"
    },
    {
      id: 24,
      bgColor: "#E53935",
      disp: "RUBY_THEME",
      name: "Ruby Red"
    },
    {
      id: 25,
      bgColor: "#43A047",
      disp: "FOREST_THEME",
      name: "Forest Green"
    },
    {
      id: 26,
      bgColor: "#9C27B0",
      disp: "LAVENDER_THEME",
      name: "Lavender Purple"
    },
    {
      id: 27,
      bgColor: "#03A9F4",
      disp: "SKY_THEME",
      name: "Sky Blue"
    },
    {
      id: 28,
      bgColor: "#00BCD4",
      disp: "MARINE_THEME",
      name: "Marine Teal"
    },
    {
      id: 29,
      bgColor: "#FF9800",
      disp: "SUNSET_THEME",
      name: "Sunset Orange"
    }
  ];

  return (
    <>
      {/* Header Settings Button */}
      <div
        className="h-8 w-8 hover:bg-white/20 rounded-md flex justify-center items-center cursor-pointer text-white hover:text-white transition-all duration-200"
        onClick={() => setIsOpen(true)}
        title="Theme Settings"
      >
       <Icon
  icon="solar:settings-bold"  // or "solar:settings-fill"
  width="20"
  className="font-bold"
/>
      </div>

      {/* Settings Drawer */}
      <Drawer
        open={isOpen}
        onClose={handleClose}
        position={`${activeDir === "rtl" ? "left" : "right"}`}
        className="dark:bg-darkgray max-w-[350px] w-full"
        style={{ zIndex: 9999 }}
      >
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center p-4">
            <h5 className="text-xl font-semibold text-gray-900 dark:text-white">Theme Settings</h5>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Icon icon="solar:close-square-line-duotone" width="20" />
            </button>
          </div>
        </div>
        
        <SimpleBar className="max-h-[calc(100vh-80px)]">
          <div className="p-4 space-y-6">
            {/* Theme Mode */}
            <div>
              <h4 className="text-base font-medium mb-3 text-gray-900 dark:text-white">Theme Mode</h4>
              <div className="flex gap-3">
                <Button
                  color={"light"}
                  size="sm"
                  className={`flex-1 text-sm border transition-all duration-200 ${
                    activeMode === "light"
                      ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-50"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveMode("light")}
                >
                  <Icon icon="solar:sun-bold-duotone" width="18" className="me-2" />
                  Light
                </Button>

                <Button
                  color={"light"}
                  size="sm"
                  className={`flex-1 text-sm border transition-all duration-200 ${
                    activeMode === "dark"
                      ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-50"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveMode("dark")}
                >
                  <Icon icon="solar:moon-bold-duotone" width="18" className="me-2" />
                  Dark
                </Button>
              </div>
            </div>

            {/* Direction */}
            <div>
              <h4 className="text-base font-medium mb-3 text-gray-900 dark:text-white">Direction</h4>
              <div className="flex gap-3">
                <Button
                  color={"light"}
                  size="sm"
                  className={`flex-1 text-sm border transition-all duration-200 ${
                    activeDir === "ltr"
                      ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-50"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveDir("ltr")}
                >
                  <Icon icon="solar:align-left-line-duotone" width="18" className="me-2" />
                  LTR
                </Button>
                <Button
                  color={"light"}
                  size="sm"
                  className={`flex-1 text-sm border transition-all duration-200 ${
                    activeDir === "rtl"
                      ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-50"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveDir("rtl")}
                >
                  <Icon icon="solar:align-right-line-duotone" width="18" className="me-2" />
                  RTL
                </Button>
              </div>
            </div>

            {/* Theme Colors */}
            <div>
              <h4 className="text-base font-medium mb-3 text-gray-900 dark:text-white">Theme Colors</h4>
              <div className="grid grid-cols-5 gap-2">
                {themeColors.map((theme, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      addAttributeToBody(theme.disp);
                      setActiveTheme(theme.disp);
                    }}
                    className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-1 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Tooltip content={theme.name}>
                      <div className="flex items-center justify-center">
                        <div
                          className="h-6 w-6 rounded-full cursor-pointer flex items-center justify-center shadow-sm border-2 border-white"
                          style={{ backgroundColor: theme.bgColor }}
                        >
                          {activeTheme === theme.disp && (
                            <IconCheck className="text-white" size={12} />
                          )}
                        </div>
                      </div>
                    </Tooltip>
                  </div>
                ))}
              </div>
            </div>

            {/* Layout Type */}
            <div>
              <h4 className="text-base font-medium mb-3 text-gray-900 dark:text-white">Layout Type</h4>
              <div className="flex gap-3">
                <Button
                  color={"light"}
                  size="sm"
                  className={`flex-1 text-sm border transition-all duration-200 ${
                    activeLayout === "vertical"
                      ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-50"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveLayout("vertical")}
                >
                  <Icon icon="solar:slider-vertical-line-duotone" width="18" className="me-2" />
                  Vertical
                </Button>
                <Button
                  color={"light"}
                  size="sm"
                  className={`flex-1 text-sm border transition-all duration-200 ${
                    activeLayout === "horizontal"
                      ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-50"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveLayout("horizontal")}
                >
                  <Icon icon="solar:slider-horizontal-line-duotone" width="18" className="me-2" />
                  Horizontal
                </Button>
              </div>
            </div>

            {/* Container */}
            <div>
              <h4 className="text-base font-medium mb-3 text-gray-900 dark:text-white">Container</h4>
              <div className="flex gap-3">
                <Button
                  color={"light"}
                  size="sm"
                  className={`flex-1 text-sm border transition-all duration-200 ${
                    isLayout === "boxed"
                      ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-50"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsLayout("boxed")}
                >
                  <Icon icon="solar:quit-full-screen-square-line-duotone" width="18" className="me-2" />
                  Boxed
                </Button>
                <Button
                  color={"light"}
                  size="sm"
                  className={`flex-1 text-sm border transition-all duration-200 ${
                    isLayout === "full"
                      ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-50"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsLayout("full")}
                >
                  <Icon icon="solar:full-screen-square-line-duotone" width="18" className="me-2" />
                  Full
                </Button>
              </div>
            </div>

            {/* Sidebar Type */}
            <div>
              <h4 className="text-base font-medium mb-3 text-gray-900 dark:text-white">Sidebar Type</h4>
              <div className="flex gap-3">
                <Button
                  color={"light"}
                  size="sm"
                  className={`flex-1 text-sm border transition-all duration-200 ${
                    isCollapse === "full-sidebar"
                      ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-50"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsCollapse("full-sidebar")}
                >
                  <Icon icon="solar:mirror-left-line-duotone" width="18" className="me-2" />
                  Full
                </Button>
                <Button
                  color={"light"}
                  size="sm"
                  className={`flex-1 text-sm border transition-all duration-200 ${
                    isCollapse === "mini-sidebar"
                      ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-50"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsCollapse("mini-sidebar")}
                >
                  <Icon icon="solar:mirror-right-line-duotone" width="18" className="me-2" />
                  Collapse
                </Button>
              </div>
            </div>

            {/* Card Style */}
            <div>
              <h4 className="text-base font-medium mb-3 text-gray-900 dark:text-white">Card Style</h4>
              <div className="flex gap-3">
                <Button
                  color={"light"}
                  size="sm"
                  className={`flex-1 text-sm border transition-all duration-200 ${
                    !isCardShadow
                      ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-50"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsCardShadow(false)}
                >
                  <Icon icon="solar:three-squares-line-duotone" width="18" className="me-2" />
                  Border
                </Button>
                <Button
                  color={"light"}
                  size="sm"
                  className={`flex-1 text-sm border transition-all duration-200 ${
                    isCardShadow
                      ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-50"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsCardShadow(true)}
                >
                  <Icon icon="solar:three-squares-bold-duotone" width="18" className="me-2" />
                  Shadow
                </Button>
              </div>
            </div>

            {/* Border Radius */}
            <div>
              <h4 className="text-base font-medium mb-3 text-gray-900 dark:text-white">Border Radius</h4>
              <div className="space-y-3">
                <RangeSlider
                  id="border-radius-range"
                  value={isBorderRadius}
                  min={4}
                  max={24}
                  onChange={(event: any) => setIsBorderRadius(event.target.value)}
                  className="w-full"
                />
                <div className="text-sm text-gray-600 dark:text-gray-400 text-center bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-md">
                  Current Value: <span className="font-semibold">{isBorderRadius}px</span>
                </div>
              </div>
            </div>
          </div>
        </SimpleBar>
      </Drawer>
    </>
  );
};