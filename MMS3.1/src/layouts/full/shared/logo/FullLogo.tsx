// src/components/FullLogo.tsx (or wherever it is)
import { useContext } from "react";
import { Link } from "react-router-dom";
import { CustomizerContext } from "src/context/CustomizerContext";
import { useAuth } from "src/context/AuthContext"; // This holds your project settings

// Fallback logo in case no logo is uploaded yet
import defaultLogo from "D:/Esfita/Projects/MMS/src/assets/images/logos/EsfitaLogo.png"; // Keep as fallback

const FullLogo = () => {
  const { activeMode } = useContext(CustomizerContext);
  const { projectSettings } = useAuth(); // This comes from your AuthContext

  // Priority: uploaded screenLogo > default logo
  const logoSrc = projectSettings?.screenLogo || defaultLogo;

  return (
    <Link to="/" className="flex items-start justify-start">
      <img
        src={logoSrc}
        alt="Company Logo"
        className={`block ${activeMode === "light" ? "mr-34" : ""} w-25`}
        onError={(e) => {
          // If uploaded logo fails to load (e.g. broken URL), fallback to default
          e.currentTarget.src = defaultLogo;
        }}
      />
    </Link>
  );
};

export default FullLogo;