import React, { useState, useEffect } from "react";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineExclamationCircle,
} from 'react-icons/hi';
import { useNavigate, useLocation } from 'react-router-dom';

import kelvinLogo from "../../assets/images/logos/EsfitaLogo.png";
import firstSlideImg from "../../assets/images/loginbg/firstSlideImg.png";
import { useAuth } from "src/context/AuthContext";

const AuthLogin: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<string>('');
  const [formData, setFormData] = useState<{
    emailId: string;
    password: string;
    remember: boolean;
  }>({
    emailId: '',
    password: '',
    remember: false,
  });
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || "/screen/screen";

  interface Slide {
    id: number;
    title?: string;
    content?: string;
    bgImage?: string;
    decorativeElements: {
      type: string;
      size: string;
      position: string;
      opacity: string;
      rotation?: string;
    }[];
  }

  const slides: Slide[] = [
    {
      id: 1,
      bgImage: firstSlideImg,
      decorativeElements: [
        { type: "circle", size: "w-16 h-16", position: "top-10 left-10", opacity: "bg-white/10" },
        { type: "square", size: "w-10 h-10", position: "bottom-20 right-16", opacity: "bg-white/15", rotation: "rotate-45" }
      ]
    },
  ];

  useEffect(() => {
    document.title = 'MMS';
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 25000);

    return () => clearInterval(interval);
  }, []);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (message) {
      setMessage('');
      setMessageType('');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
      await login(formData.emailId, formData.password);

      const userDetails = {
        userName: formData.emailId.split('@')[0] || 'User',
        mailId: formData.emailId,
      };

      navigate(from, {
        replace: true,
        state: {
          fromLogin: true,
          userName: userDetails.userName,
        },
      });
    } catch (error: any) {
      setMessage(error.message || 'An error occurred');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* Left Section - Slider */}
      <div className="w-1/2 relative overflow-hidden bg-white shadow-2xl">
        {/* Slider Container */}
        <div 
          className="h-full flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="min-w-full h-full flex flex-col items-center justify-center p-12 text-center relative overflow-hidden"
              style={slide.bgImage ? 
                { 
                  backgroundImage: `url(${slide.bgImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                } : undefined
              }
            >
              {/* Background overlay for image slides (except first slide) */}
              {slide.bgImage && slide.id !== 1 && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
              )}

              {/* Decorative Elements */}
              {slide.decorativeElements.map((element) => (
                <div
                  key={`${slide.id}-${element.type}-${element.position}-${element.size}`}
                  className={`absolute ${element.size} ${element.opacity} ${element.position} ${element.rotation || ''} rounded-${element.type === 'circle' ? 'full' : 'lg'}`}
                ></div>
              ))}

              {/* Content - Only show for slides with title and content */}
              {slide.title && slide.content && (
                <div className="relative z-10 max-w-2xl text-white">
                  <h2 className="text-3xl font-bold mb-6 drop-shadow-lg">
                    {slide.title}
                  </h2>
                  <p className="text-white/95 text-base leading-relaxed drop-shadow-md">
                    {slide.content}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
      
      </div>

      {/* Right Section - Login Form */}
      <div className="w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <img src={kelvinLogo} alt="Kelvin Logo" className="h-14 w-auto object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          </div>

          {message && messageType === 'error' && (
            <div
              className={`mb-6 p-3 rounded-lg flex items-start bg-red-50/80 border border-red-200 text-red-800`}
            >
              <HiOutlineExclamationCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="emailId"
                className="block text-sm font-bold text-gray-700 mb-1.5"
              >
                Login Id
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiOutlineMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="emailId"
                  name="emailId"
                  type="email"
                  placeholder="Enter Your Email Id"
                  value={formData.emailId}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-gray-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiOutlineLockClosed className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <HiOutlineEyeOff className="h-5 w-5" />
                  ) : (
                    <HiOutlineEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-xs text-gray-600">
            <p>© {new Date().getFullYear()} Esfita InfoTech. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLogin;