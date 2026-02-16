import { useState } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import AuthService from './services/AuthService';
import type { AuthResponse } from './types';
import './App.css';

function App() {
  // Lazy initialization - 초기 인증 상태를 한 번만 확인
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const user = AuthService.getCurrentUser();
    return !!(user && user.accessToken);
  });


  
const handleLoginSuccess = (userData: AuthResponse) => {
  console.log('User logged in:', userData.username);
  // 또는 상태 저장 등
  setIsAuthenticated(true);
};

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

 

  return (
    <div className="App">
      {isAuthenticated ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;
