import { RouterProvider } from 'react-router-dom';
import { ThemeModeScript, ThemeProvider } from 'flowbite-react';
import customTheme from './utils/theme/custom-theme';
import router from './routes/Router';
import { Toaster } from './components/shadcn-ui/Default-Ui/toaster';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <>
      <ThemeModeScript />
      <ThemeProvider theme={customTheme}>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
