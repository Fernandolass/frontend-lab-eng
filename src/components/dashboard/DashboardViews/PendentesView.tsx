import React from 'react';
import { ProjetoDetalhes } from '../../../data/mockData';

interface PendentesViewProps {
  projects: ProjetoDetalhes[];
  onViewDetails: (projetoId: number) => void;
  onEditProject: (projetoId: number) => void;
}

const PendentesView: React.FC<PendentesViewProps> = ({ 
  projects, 
  onViewDetails, 
  onEditProject 
}) => {
  // Função para contar materiais pendentes em um projeto
  const contarMateriaisPendentes = (project: ProjetoDetalhes): number => {
    return project.ambientes.reduce((total, ambiente) => {
      return total + ambiente.materiais.filter(material => material.status === 'pendente').length;
    }, 0);
  };

  return (
    <div>
      <div className="content-header">
        <h1>Projetos Pendentes</h1>
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
              <th>Itens Pendentes</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(project => (
              <tr key={project.id} className="project-row">
                <td>{project.id}</td>
                <td className="project-name">{project.nome}</td>
                <td>{project.tipoProjeto}</td>
                <td>{project.dataCriacao}</td>
                <td>{project.responsavel}</td>
                <td>
                  <span className="badge bg-secondary">
                    {contarMateriaisPendentes(project)} itens
                  </span>
                </td>
                <td>
                  <span className="status-badge pendente">
                    Pendente
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
                    <button 
                      className="btn btn-primary"
                      onClick={() => onEditProject(project.id)} 
                    >
                      Validar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {projects.length === 0 && (
          <div className="no-projects-message">
            <p>Nenhum projeto pendente encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendentesView;