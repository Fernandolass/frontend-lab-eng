// src/components/dashboard/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';
import { listarProjetos } from '../../data/projects';
import type { ProjetoDetalhes } from '../../data/mockData';
import { DashboardRoutes } from './DashboardRoutes';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [projetosMenuOpen, setProjetosMenuOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjetoDetalhes[]>([]);

  const userEmail = localStorage.getItem('userEmail') || 'Usuário';
  const userName = userEmail.split('@')[0];

  // Determina a view atual baseada na URL
  const getCurrentView = () => {
    const path = location.pathname;
    if (path.includes('criar-projeto')) return 'criar-projeto';
    if (path.includes('aprovados')) return 'aprovados';
    if (path.includes('reprovados')) return 'reprovados';
    if (path.includes('pendentes')) return 'pendentes';
    if (path.includes('modelos')) return 'modelos';
    if (path.includes('logs')) return 'logs';
    return 'inicio';
  };

  const currentView = getCurrentView();

  // 🔹 Busca projetos SOMENTE quando entra em uma view de projetos
  useEffect(() => {
    const carregarProjetos = async () => {
      if (!['aprovados', 'reprovados', 'pendentes'].includes(currentView)) {
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
        setErro(null);
      } catch (err) {
        console.error('Erro ao carregar projetos:', err);
        setErro('Não foi possível carregar os projetos.');
      } finally {
        setLoading(false);
      }
    };

    carregarProjetos();
  }, [currentView]);

  const handleNavigation = (path: string) => {
    navigate(path);
    if (!path.includes('aprovados') && !path.includes('reprovados') && !path.includes('pendentes')) {
      setProjetosMenuOpen(false);
    }
  };

  const handleProjetosMenuClick = () => {
    setProjetosMenuOpen(!projetosMenuOpen);
    if (!projetosMenuOpen) {
      navigate('/dashboard/aprovados');
    }
  };

  const isProjetosViewActive = 
    currentView === 'aprovados' ||
    currentView === 'reprovados' ||
    currentView === 'pendentes';

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-logo">
          <img
            src="/logo_jnunes_normal.png"
            alt="Logo Jotanunes"
            className="header-logo-image"
            onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
          />
        </div>

        <div className="header-user">
          <div className="header-user-info">
            <span className="header-user-name">{userName}</span>
            <span className="header-user-email">{userEmail}</span>
          </div>
          <div className="header-avatar">{userName.charAt(0).toUpperCase()}</div>
        </div>
      </header>

      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <nav className="sidebar-nav">
          <ul className="nav-menu">
            {[
              { key: 'inicio', path: '/dashboard/inicio', label: 'Inicio' },
              { key: 'criar-projeto', path: '/dashboard/criar-projeto', label: 'Criar Projeto' },
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
              { key: 'modelos', path: '/dashboard/modelos', label: 'Modelos' },
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
        />
      </div>
    </div>
  );
};

export default Dashboard;
