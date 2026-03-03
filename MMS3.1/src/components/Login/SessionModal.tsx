import React from 'react';
import { useAuth } from 'src/context/AuthContext'; // Adjust path as needed
import { useNavigate } from 'react-router-dom';

interface SessionModalProps {
  message: string;
}

const SessionModal: React.FC<SessionModalProps> = ({ message }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleOk = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Session Expired</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
        <button 
          onClick={handleOk} 
          className="w-full px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          Login Again
        </button>
      </div>
    </div>
  );
};

export default SessionModal;