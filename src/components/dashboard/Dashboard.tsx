// src/components/dashboard/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import InicioView from './DashboardViews/InicioView';
import CriarDocumentoView from './DashboardViews/CriarDocumentoView';
import CriarProjetoView from "./DashboardViews/CriarProjetoView";
import EspecificacaoView from "./DashboardViews/EspecificacaoView";
import AprovadosView from './DashboardViews/AprovadosView';
import ReprovadosView from './DashboardViews/ReprovadosView';
import PendentesView from './DashboardViews/PendentesView';
import ModelosView from './DashboardViews/ModelosView';
import LogsView from './DashboardViews/LogsView';
import DetalhesProjetoView from './DashboardViews/DetalhesProjetoView';
import AprovarProjetoView from './DashboardViews/AprovarProjetoView';
import { listarProjetos } from '../../data/projects';
import type { ProjetoDetalhes } from '../../data/mockData';

type DashboardView =
  | 'inicio'
  | 'criar-projeto'
  | 'especificacao'
  | 'criar-documento'
  | 'aprovados'
  | 'reprovados'
  | 'pendentes'
  | 'modelos'
  | 'logs'
  | 'detalhes-projeto'
  | 'aprovar-projeto';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [currentView, setCurrentView] = useState<DashboardView>('inicio');
  const [selectedProjetoId, setSelectedProjetoId] = useState<number>(1);
  const [viewHistory, setViewHistory] = useState<DashboardView[]>(['inicio']);
  const [projetosMenuOpen, setProjetosMenuOpen] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjetoDetalhes[]>([]);

  const userEmail = localStorage.getItem('userEmail') || 'Usuário';
  const userName = userEmail.split('@')[0];

  // 🔄 Busca todos os projetos do backend
  useEffect(() => {
    const carregarProjetos = async () => {
      setLoading(true);
      try {
        const data = await listarProjetos();
        setProjects(data);
        setErro(null);
      } catch (err) {
        console.error('Erro ao carregar projetos:', err);
        setErro('Não foi possível carregar os projetos.');
      } finally {
        setLoading(false);
      }
    };
    carregarProjetos();
  }, []);
  useEffect(() => {
    const savedView = localStorage.getItem("dashboardView");
    const savedProjectId = localStorage.getItem("selectedProjectId");

    if (savedView) {
      setCurrentView(savedView as DashboardView);
    }
    if (savedProjectId) {
      setSelectedProjetoId(Number(savedProjectId));
    }
  }, []);

  // Salva toda vez que o usuário muda de tela ou projeto
  useEffect(() => {
    localStorage.setItem("dashboardView", currentView);
    localStorage.setItem("selectedProjectId", String(selectedProjetoId || ""));
  }, [currentView, selectedProjetoId]);

  const handleNavigation = (view: DashboardView, projetoId?: number) => {
    if (projetoId) setSelectedProjetoId(projetoId);
    if (view !== 'aprovados' && view !== 'reprovados' && view !== 'pendentes')
      setProjetosMenuOpen(false);

    setViewHistory((prev) => [...prev, currentView]);
    setCurrentView(view);
  };

  const handleProjetosMenuClick = () => {
    setProjetosMenuOpen(!projetosMenuOpen);
    if (!projetosMenuOpen) setCurrentView('aprovados');
  };

  const handleSubMenuClick = (view: DashboardView) => handleNavigation(view);

  const handleBack = () => {
    if (viewHistory.length > 1) {
      const previousView = viewHistory[viewHistory.length - 1];
      setViewHistory((prev) => prev.slice(0, -1));
      setCurrentView(previousView);
    } else {
      setCurrentView('inicio');
    }
  };

  // 🔍 Filtros diretos do backend
  const approvedProjects = projects.filter((p) => p.status === 'aprovado');
  const rejectedProjects = projects.filter((p) => p.status === 'reprovado');
  const pendingProjects = projects.filter((p) => p.status === 'pendente');

  const isProjetosViewActive =
    currentView === 'aprovados' ||
    currentView === 'reprovados' ||
    currentView === 'pendentes';

  const renderContent = () => {
    if (loading) return <p className="loading-text">Carregando projetos...</p>;
    if (erro) return <p className="error-text">{erro}</p>;

    switch (currentView) {
      case 'inicio':
        return <InicioView onViewDetails={() => handleNavigation('aprovados')} />;
      case 'criar-documento':
        return <CriarDocumentoView onViewDetails={() => handleNavigation('pendentes')} />;
      case 'criar-projeto':
        return <CriarProjetoView onNext={(id) => handleNavigation('especificacao', id)} />;
      case 'especificacao':
        return <EspecificacaoView projetoId={selectedProjetoId} onBack={handleBack} />;
      case 'aprovados':
        return (
          <AprovadosView
            projects={approvedProjects}
            onViewDetails={(id) => handleNavigation('detalhes-projeto', id)}
          />
        );
      case 'reprovados':
        return (
          <ReprovadosView
            projects={rejectedProjects}
            onViewDetails={(id) => handleNavigation('detalhes-projeto', id)}
          />
        );
      case 'pendentes':
        return (
          <PendentesView
            projects={pendingProjects}
            onViewDetails={(id) => handleNavigation('detalhes-projeto', id)}
            onEditProject={(id) => handleNavigation('aprovar-projeto', id)}
          />
        );
      case 'modelos':
        return <ModelosView />;
      case 'logs':
        return <LogsView />;
      case 'detalhes-projeto':
        return (
          <DetalhesProjetoView onBack={handleBack} projetoId={selectedProjetoId} />
        );
      case 'aprovar-projeto':
        return (
          <AprovarProjetoView projetoId={selectedProjetoId} onBack={handleBack} />
        );
      default:
        return <InicioView onViewDetails={() => handleNavigation('aprovados')} />;
    }
  };

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
              { key: 'inicio', label: 'Inicio' },
              { key: 'criar-projeto', label: 'Criar Projeto' },
            ].map((item) => (
              <li
                key={item.key}
                className={`nav-item ${currentView === item.key ? 'active' : ''}`}
              >
                <span
                  className="nav-text"
                  onClick={() => handleNavigation(item.key as DashboardView)}
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
                  {['aprovados', 'reprovados', 'pendentes'].map((v) => (
                    <li
                      key={v}
                      className={`submenu-item ${currentView === v ? 'active' : ''}`}
                      onClick={() => handleSubMenuClick(v as DashboardView)}
                    >
                      <span className="submenu-text">
                        {v.charAt(0).toUpperCase() + v.slice(1)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            {[
              { key: 'modelos', label: 'Modelos' },
              { key: 'logs', label: 'Logs' },
            ].map((item) => (
              <li
                key={item.key}
                className={`nav-item ${currentView === item.key ? 'active' : ''}`}
              >
                <span
                  className="nav-text"
                  onClick={() => handleNavigation(item.key as DashboardView)}
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

      {/* Área de Conteúdo */}
      <div className="dashboard-content">{renderContent()}</div>
    </div>
  );
};

export default Dashboard;