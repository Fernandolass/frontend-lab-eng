// src/components/dashboard/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';
import { listarProjetos } from '../../data/projects';
import type { ProjetoDetalhes } from '../../data/mockData';
import { DashboardRoutes } from './DashboardRoutes';

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [projetosMenuOpen, setProjetosMenuOpen] = useState<boolean>(false);
  const [cadastroMenuOpen, setCadastroMenuOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjetoDetalhes[]>([]);
  const [cacheProjetos, setCacheProjetos] = useState<Record<string, ProjetoDetalhes[]>>({});
  const [logs, setLogs] = useState<any[]>([]);
  const [logsCarregados, setLogsCarregados] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const userEmail = localStorage.getItem('userEmail') || 'Usuário';
  const userName = userEmail.split('@')[0];

  // Determina a view atual baseada na URL
  const getCurrentView = () => {
    const path = location.pathname;
    if (path.includes('criar-projeto')) return 'criar-projeto';
    if (path.includes('criar-usuario')) return 'criar-usuario';
    if (path.includes('aprovados')) return 'aprovados';
    if (path.includes('reprovados')) return 'reprovados';
    if (path.includes('pendentes')) return 'pendentes';
    if (path.includes('logs')) return 'logs';
    if (path.includes('ambiente')) return 'ambiente';
    if (path.includes('item')) return 'item';
    if (path.includes('marca')) return 'marca';
    if (path.includes('material')) return 'material';
    return 'inicio';
  };

  const isSuperAdmin = () => {
    const userRole = localStorage.getItem('userRole');
    return userRole === 'superadmin';
  };

  const currentView = getCurrentView();

  // Busca projetos SOMENTE quando entra em uma view de projetos
  useEffect(() => {
    const carregarDados = async () => {
      // ==============================
      // PROJETOS
      // ==============================
      if (['aprovados', 'reprovados', 'pendentes'].includes(currentView)) {
        if (cacheProjetos[currentView]) {
          setProjects(cacheProjetos[currentView]);
          return;
        }

        setLoading(true);
        try {
          let status: "APROVADO" | "REPROVADO" | "PENDENTE" | undefined;
          if (currentView === 'aprovados') status = "APROVADO";
          if (currentView === 'reprovados') status = "REPROVADO";
          if (currentView === 'pendentes') status = "PENDENTE";

          const data = await listarProjetos(1, status);
          setProjects(data.results);
          setCacheProjetos((prev) => ({ ...prev, [currentView]: data.results }));
          setErro(null);
        } catch (err) {
          console.error('Erro ao carregar projetos:', err);
          setErro('Não foi possível carregar os projetos.');
        } finally {
          setLoading(false);
        }
      }

      // ==============================
      // LOGS
      // ==============================
      else if (currentView === 'logs' && !logsCarregados) {
        setLoading(true);
        try {
          const response = await fetch(`${API_BASE_URL}/api/logs/`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          });
          if (!response.ok) throw new Error("Erro ao carregar logs");

          const data = await response.json();
          setLogs(data.results || data);
          setLogsCarregados(true);
          setErro(null);
        } catch (err) {
          console.error('Erro ao carregar logs:', err);
          setErro('Não foi possível carregar os logs.');
        } finally {
          setLoading(false);
        }
      }
    };

    carregarDados();
  }, [currentView]);

  const handleNavigation = (path: string) => {
    navigate(path);
    if (!path.includes('aprovados') && !path.includes('reprovados') && !path.includes('pendentes')) {
      setProjetosMenuOpen(false);
    }
    // Fecha sidebar no mobile após navegação
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleProjetosMenuClick = () => {
    setProjetosMenuOpen(!projetosMenuOpen);
    if (!projetosMenuOpen) {
      navigate('/dashboard/aprovados');
    }
  };

  const isCadastroViewActive =
    currentView === 'ambiente' ||
    currentView === 'item' ||
    currentView === 'marca' ||
    currentView === 'material';

  useEffect(() => {
    // Sincroniza o estado do menu com a rota atual
    setCadastroMenuOpen(isCadastroViewActive);
  }, [isCadastroViewActive]);

  const handleCadastroMenuClick = () => {
    const newState = !cadastroMenuOpen;
    setCadastroMenuOpen(newState);
    if (newState) {
      navigate('/dashboard/ambiente');
    }
  };

  const isProjetosViewActive = 
    currentView === 'aprovados' ||
    currentView === 'reprovados' ||
    currentView === 'pendentes';

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Fecha sidebar quando redimensionar para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <button 
            className="mobile-menu-btn"
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            <span className="menu-bar"></span>
            <span className="menu-bar"></span>
            <span className="menu-bar"></span>
          </button>
          <div className="header-logo">
            <img
              src="/logo_techflowheader.png"
              alt="Logo Jotanunes"
              className="header-logo-image"
              onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
            />
          </div>
        </div>

        <div className="header-user">
          <div className="header-user-info">
            <span className="header-user-name">{userName}</span>
            <span className="header-user-email">{userEmail}</span>
          </div>
          <div className="header-avatar">{userName.charAt(0).toUpperCase()}</div>
        </div>
      </header>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`dashboard-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
        <nav className="sidebar-nav">
          <ul className="nav-menu">
            {[
              { key: 'inicio', path: '/dashboard/inicio', label: 'Inicio' },
              { key: 'criar-projeto', path: '/dashboard/criar-projeto', label: 'Criar Projeto' },
              { key: 'criar-usuario', path: '/dashboard/criar-usuario', label: 'Criar Novo Usuário' },
            ].map((item) => (
              <li
                key={item.key}
                className={`nav-item ${currentView === item.key ? 'active' : ''}`}
              >
                <span
                  className="nav-text"
                  onClick={() => handleNavigation(item.path)}
                >
                  {item.label}
                </span>
              </li>
            ))}

            <li className={`nav-item ${isProjetosViewActive ? 'active' : ''}`}>
              <div className="nav-text nav-with-submenu" onClick={handleProjetosMenuClick}>
                <span>Projetos</span>
                <span className={`submenu-arrow ${projetosMenuOpen ? 'open' : ''}`}>▼</span>
              </div>

              {projetosMenuOpen && (
                <ul className="submenu">
                  {[
                    { key: 'aprovados', path: '/dashboard/aprovados', label: 'Aprovados' },
                    { key: 'reprovados', path: '/dashboard/reprovados', label: 'Reprovados' },
                    { key: 'pendentes', path: '/dashboard/pendentes', label: 'Pendentes' },
                  ].map((item) => (
                    <li
                      key={item.key}
                      className={`submenu-item ${currentView === item.key ? 'active' : ''}`}
                      onClick={() => handleNavigation(item.path)}
                    >
                      <span className="submenu-text">{item.label}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
              
            {[
              { key: 'logs', path: '/dashboard/logs', label: 'Logs' },
            ].map((item) => (
              <li
                key={item.key}
                className={`nav-item ${currentView === item.key ? 'active' : ''}`}
              >
                <span
                  className="nav-text"
                  onClick={() => handleNavigation(item.path)}
                >
                  {item.label}
                </span>
              </li>
            ))}

            <li
              className={`nav-item ${
                ['ambiente', 'item', 'marca', 'material'].includes(currentView) ? 'active' : ''
              }`}
            >
              <div
                className="nav-text nav-with-submenu"
                onClick={handleCadastroMenuClick}
              >
                <span>Cadastros</span>
                <span className={`submenu-arrow ${cadastroMenuOpen ? 'open' : ''}`}>▼</span>
              </div>

              {cadastroMenuOpen && (
                <ul className="submenu">
                  {[
                    { key: 'ambiente', path: '/dashboard/ambiente', label: 'Ambiente' },
                    { key: 'item', path: '/dashboard/item', label: 'Item' },
                    { key: 'marca', path: '/dashboard/marca', label: 'Marca' },
                    { key: 'material', path: '/dashboard/material', label: 'Material' },
                  ].map((item) => (
                    <li
                      key={item.key}
                      className={`submenu-item ${currentView === item.key ? 'active' : ''}`}
                      onClick={() => handleNavigation(item.path)}
                    >
                      <span className="submenu-text">{item.label}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <nav className="sidebar-nav">
            <ul className="nav-menu nav-item">
              <div className="nav-text nav-with-submenu" onClick={onLogout}>
                <span>Sair</span>
              </div>
            </ul>
          </nav>
        </div>
      </div>

      {/* Área de Conteúdo com React Router */}
      <div className="dashboard-content">
        <DashboardRoutes 
          onNavigate={handleNavigation}
          projects={projects}
          loading={loading}
          erro={erro}
          logs={logs}
        />
      </div>
    </div>
  );
};

export default Dashboard;