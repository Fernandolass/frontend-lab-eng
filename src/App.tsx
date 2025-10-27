// src/App.tsx
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/styles/custom.css';
import { jwtDecode } from "jwt-decode";
import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './components/login/Login';
import Dashboard from './components/dashboard/Dashboard';

import { login as apiLogin, getAccessToken, clearTokens } from "./data/api";

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();

    if (token) {
      try {
        const decoded: { exp: number } = jwtDecode(token);
        const now = Date.now() / 1000;

        if (decoded.exp < now) {
          clearTokens();
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      } catch {
        clearTokens();
        setIsAuthenticated(false);
      }
    } else {
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
    <Routes>
      {/* Rota login */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
        }
      />

      {/* Rota dashboard */}
      <Route
        path="/dashboard/*"
        element={
          isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" />
        }
      />

      {/* Rota raiz redireciona */}
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
        }
      />

      {/* 404 simples */}
      <Route path="*" element={<p>Página não encontrada</p>} />
    </Routes>
  );
};

export default App;