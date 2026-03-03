// components/common/IconButton.jsx
import React from 'react';
import { Tooltip } from 'flowbite-react';

// Icon Library - All icons in one place
export const SaveIcon = ({ className = "h-5 w-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
    />
  </svg>
);

export const DeleteIcon = ({ className = "h-5 w-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

export const HistoryIcon = ({ className = "h-5 w-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export const AddIcon = ({ className = "h-5 w-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
    />
  </svg>
);

export const ViewIcon = ({ className = "h-5 w-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

export const EditIcon = ({ className = "h-5 w-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);

// Export all icons as a single object for easy access
export const Icons = {
  SaveIcon,
  DeleteIcon,
  HistoryIcon,
  AddIcon,
  ViewIcon,
  EditIcon
};

// Main IconButton component
const IconButton = ({
  icon,
  tooltip,
  onClick,
  color = "default",
  disabled = false,
  isLoading = false,
  loadingIcon = <div className="animate-spin">⏳</div>,
  className = "",
  size = "md",
  placement = "bottom",
  useFlowbiteButton = false,
  ...props
}) => {
  // Size variants
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10"
  };

  // Color variants
  const colorClasses = {
    default: "bg-gray-500 hover:bg-gray-600 text-white",
    success: "bg-green-500 hover:bg-green-600 text-white",
    warning: "bg-yellow-500 hover:bg-yellow-600 text-white",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    info: "bg-blue-500 hover:bg-blue-600 text-white",
    purple: "bg-purple-500 hover:bg-purple-600 text-white",
  };

  // Base classes for the button
  const baseClasses = `
    ${sizeClasses[size]} 
    ${colorClasses[color]}
    rounded-full 
    flex 
    items-center 
    justify-center 
    p-0 
    shadow-lg 
    hover:shadow-xl 
    transition-all 
    duration-200 
    hover:scale-105
    disabled:opacity-50
    disabled:cursor-not-allowed
    disabled:hover:scale-100
    ${className}
  `;

  // Render the appropriate button component
  let ButtonComponent;
  
  if (useFlowbiteButton) {
    // Import Button dynamically to avoid dependency if not used
    const { Button } = require('flowbite-react');
    ButtonComponent = (
      <Button
        color={color}
        className={baseClasses}
        onClick={onClick}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? loadingIcon : icon}
      </Button>
    );
  } else {
    ButtonComponent = (
      <button
        className={baseClasses}
        onClick={onClick}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? loadingIcon : icon}
      </button>
    );
  }

  // If tooltip is provided, wrap with Tooltip component
  if (tooltip) {
    return (
      <Tooltip content={tooltip} placement={placement}>
        {ButtonComponent}
      </Tooltip>
    );
  }

  return ButtonComponent;
};

// Convenience component creators for common actions
IconButton.Save = (props) => (
  <IconButton icon={<SaveIcon />} tooltip="Save" color="success" {...props} />
);

IconButton.Delete = (props) => (
  <IconButton icon={<DeleteIcon />} tooltip="Delete" color="danger" {...props} />
);

IconButton.History = (props) => (
  <IconButton icon={<HistoryIcon />} tooltip="History" color="info" {...props} />
);

IconButton.Add = (props) => (
  <IconButton icon={<AddIcon />} tooltip="Add" color="success" {...props} />
);

IconButton.View = (props) => (
  <IconButton icon={<ViewIcon />} tooltip="View" color="purple" {...props} />
);

IconButton.Edit = (props) => (
  <IconButton icon={<EditIcon />} tooltip="Edit" color="warning" {...props} />
);

export default IconButton;




// Usage Examples:


// // Basic usage with custom icon
// import IconButton, { Icons } from './components/common/IconButton';

// // Using predefined button types
// <IconButton.Save
//   onClick={handleSave}
//   disabled={isProcessing}
//   isLoading={isProcessing}
// />

// <IconButton.Delete
//   onClick={handleClearAll}
// />

// <IconButton.History
//   onClick={handleGoToHistory}
// />

// <IconButton.Add
//   onClick={() => navigate('/transactions/invoiceReg')}
// />

// // Using custom icon from the Icons object
// <IconButton
//   icon={<Icons.ViewIcon />}
//   tooltip="View Record"
//   color="purple"
//   onClick={() => handleViewRecord(record)}
// />

// <IconButton
//   icon={<Icons.EditIcon />}
//   tooltip="Modify Record"
//   color="success"
//   onClick={() => handleModifyRecord(record)}
// />

// // Using Flowbite Button component (if needed)
// <IconButton
//   icon={<Icons.SaveIcon />}
//   tooltip="Save with Flowbite"
//   color="success"
//   useFlowbiteButton={true}
//   onClick={handleSave}
// />