// src/components/dashboard/DashboardRoutes.tsx
import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import InicioView from './DashboardViews/InicioView';
import CriarDocumentoView from './DashboardViews/CriarDocumentoView';
import CriarProjetoView from './DashboardViews/CriarProjetoView';
import EspecificacaoView from './DashboardViews/EspecificacaoView';
import AprovadosView from './DashboardViews/AprovadosView';
import ReprovadosView from './DashboardViews/ReprovadosView';
import PendentesView from './DashboardViews/PendentesView';
import LogsView from './DashboardViews/LogsView';
import DetalhesProjetoView from './DashboardViews/DetalhesProjetoView';
import DetalhesModeloView from './DashboardViews/DetalhesModeloView';
import AprovarProjetoView from './DashboardViews/AprovarProjetoView';
import CriarModeloView from './DashboardViews/CriarModeloView';
import Loading from '../Loading';

interface DashboardRoutesProps {
  onNavigate: (path: string) => void;
  projects: any[];
  loading: boolean;
  erro: string | null;
}

export function DashboardRoutes({ onNavigate, projects, loading, erro }: DashboardRoutesProps) {

  const [modelos, setModelos] = useState<any[]>([]);

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
      <Route 
        path="detalhes-modelo/:modeloId" 
        element={<DetalhesModeloView onBack={() => window.history.back()} />} 
      />
      <Route 
        path="criar-modelo" 
        element={
          <CriarModeloView 
            projects={projects.filter((p: any) => p.status === 'aprovado')}
            onBack={() => onNavigate('/dashboard/modelos')}
            onModeloCriado={(projeto: any) => {
              const novoModelo = {
                id: modelos.length + 1,
                nome: projeto.nome,
                tipoModelo: projeto.tipoProjeto,
                dataCriacao: new Date().toLocaleDateString('pt-BR'),
                responsavel: projeto.responsavel,
                projetoOrigem: projeto
              };
              setModelos([...modelos, novoModelo]);
              onNavigate('/dashboard/modelos');
            }}
            onViewDetails={(id: number) => onNavigate(`/dashboard/detalhes-projeto/${id}`)}
          />
        } 
      />
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