// src/components/dashboard/DashboardRoutes.tsx
import { Routes, Route } from 'react-router-dom';
import InicioView from './DashboardViews/InicioView';
import CriarDocumentoView from './DashboardViews/CriarDocumentoView';
import CriarProjetoView from './DashboardViews/CriarProjetoView';
import EspecificacaoView from './DashboardViews/EspecificacaoView';
import AprovadosView from './DashboardViews/AprovadosView';
import ReprovadosView from './DashboardViews/ReprovadosView';
import PendentesView from './DashboardViews/PendentesView';
import ModelosView from './DashboardViews/ModelosView';
import LogsView from './DashboardViews/LogsView';
import DetalhesProjetoView from './DashboardViews/DetalhesProjetoView';
import AprovarProjetoView from './DashboardViews/AprovarProjetoView';
import Loading from '../Loading';

interface DashboardRoutesProps {
  onNavigate: (path: string) => void;
  projects: any[];
  loading: boolean;
  erro: string | null;
}

export function DashboardRoutes({ onNavigate, projects, loading, erro }: DashboardRoutesProps) {
  if (loading) return <Loading />;
  if (erro) return <p className="error-text">{erro}</p>;

  return (
    <Routes>
      <Route 
        path="inicio" 
        element={<InicioView onViewDetails={() => onNavigate('/dashboard/aprovados')} />} 
      />
      <Route 
        path="criar-documento" 
        element={<CriarDocumentoView onViewDetails={() => onNavigate('/dashboard/pendentes')} />} 
      />
      <Route 
        path="criar-projeto" 
        element={<CriarProjetoView onNext={(id) => onNavigate(`/dashboard/especificacao/${id}`)} />} 
      />
      <Route 
        path="especificacao/:projetoId" 
        element={<EspecificacaoView onBack={() => onNavigate('/dashboard/inicio')} />} 
      />
      <Route 
        path="aprovados" 
        element={
          <AprovadosView
            projects={projects.filter((p) => p.status === 'aprovado')}
            onViewDetails={(id) => onNavigate(`/dashboard/detalhes-projeto/${id}`)}
          />
        } 
      />
      <Route 
        path="reprovados" 
        element={
          <ReprovadosView
            projects={projects.filter((p) => p.status === 'reprovado')}
            onViewDetails={(id) => onNavigate(`/dashboard/detalhes-projeto/${id}`)}
          />
        } 
      />
      <Route 
        path="pendentes" 
        element={
          <PendentesView
            projects={projects.filter((p) => p.status === 'pendente')}
            onViewDetails={(id) => onNavigate(`/dashboard/detalhes-projeto/${id}`)}
            onEditProject={(id) => onNavigate(`/dashboard/aprovar-projeto/${id}`)}
          />
        } 
      />
      <Route path="modelos" element={<ModelosView />} />
      <Route path="logs" element={<LogsView />} />
      <Route 
        path="detalhes-projeto/:projetoId" 
        element={<DetalhesProjetoView onBack={() => window.history.back()} />} 
      />
      <Route 
        path="aprovar-projeto/:projetoId" 
        element={<AprovarProjetoView onBack={() => window.history.back()} />} 
      />
      
      {/* Rota padrão redireciona para início */}
      <Route path="/" element={<InicioView onViewDetails={() => onNavigate('/dashboard/aprovados')} />} />
    </Routes>
  );
}