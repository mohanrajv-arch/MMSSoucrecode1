import { useContext } from 'react';
import DarkLogo from '/src/assets/images/logos/lightModeLogo.png';
import LightLogo from '/src/assets/images/logos/spalogo.png';
import { Link } from 'react-router';
import { CustomizerContext } from 'src/context/CustomizerContext';
const MiniLogo = () => {
  const { activeMode } = useContext(CustomizerContext);
  return (
    <Link to={'/'}>
      {activeMode === 'light' ? (
        <img src={DarkLogo} alt="logo" className="block mx-auto ml-10 w-33" />
      ) : (
        <img src={LightLogo} alt="logo" className="block mx-auto ml-10 w-33" />
      )}
    </Link>
  );
};

export default MiniLogo;
