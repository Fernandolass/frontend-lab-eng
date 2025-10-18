// src/App.tsx
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/styles/custom.css';
import { jwtDecode } from "jwt-decode";
import Login from './components/login/Login';
import Dashboard from './components/dashboard/Dashboard';

import { login as apiLogin, getAccessToken, clearTokens } from "./data/api";

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar se já está logado ao carregar a aplicação
  useEffect(() => {
  const token = getAccessToken();

  if (token) {
    try {
      const decoded: { exp: number } = jwtDecode(token);
      const now = Date.now() / 1000;

      if (decoded.exp < now) {
        // Token expirou
        clearTokens();
        setIsAuthenticated(false);
      } else {
        // Token ainda válido
        setIsAuthenticated(true);
      }
    } catch (err) {
      // Token inválido ou erro ao decodificar
      clearTokens();
      setIsAuthenticated(false);
    }
  } else {
    // Nenhum token salvo
    setIsAuthenticated(false);
  }

  setIsLoading(false);
}, []);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await apiLogin(email, password);
      setIsAuthenticated(true);
      localStorage.setItem("userEmail", email);
    } catch (e: any) {
      alert(e.message || "Erro ao autenticar");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearTokens();
    setIsAuthenticated(false);
    localStorage.removeItem("userEmail");
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {isAuthenticated ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;