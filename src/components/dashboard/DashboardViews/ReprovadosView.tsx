// src/components/dashboard/DashboardViews/ReprovadosView.tsx
import React from 'react';

interface ReprovadosViewProps {
  projects: any[];
  onViewDetails: (projetoId: number) => void;
}

const ReprovadosView: React.FC<ReprovadosViewProps> = ({ projects, onViewDetails }) => (
  <div>
    <div className="content-header">
      <h1>Projetos Reprovados</h1>
      <div className="header-actions">
        <button className="btn btn-primary">
          Exportar Dados
        </button>
      </div>
    </div>

    <div className="projects-table-container">
      <table className="projects-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome do Projeto</th>
            <th>Tipo</th>
            <th>Data</th>
            <th>Responsável</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
           {projects.map(project => (
            <tr key={project.id} className="project-row">
              <td>{project.id}</td>
              <td className="project-name">{project.nome_do_projeto}</td>
              <td>{project.tipo_do_projeto}</td>
              <td>{project.data_criacao?.split('T')[0]}</td>
              <td>{project.responsavel_nome || '—'}</td>
              <td>
                <span className="status-badge reprovado">
                  Reprovado
                </span>
              </td>
              <td>
                <div className="action-buttons">
                  <button 
                    className="btn btn-primary" 
                    onClick={() => onViewDetails(project.id)}
                  >
                    Ver Detalhes
                  </button>
                  <button className="btn btn-secondary">
                    Download
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {projects.length === 0 && (
        <div className="no-projects-message">
          <p>Nenhum projeto reprovado encontrado.</p>
        </div>
      )}
    </div>
  </div>
);

export default ReprovadosView;