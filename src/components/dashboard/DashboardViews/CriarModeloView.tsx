import React, { useState } from 'react';

interface CriarModeloViewProps {
  projects: any[]; // Lista de projetos aprovados
  onBack: () => void;
  onModeloCriado: (projeto: any) => void; // Passa o projeto completo para criar modelo
  onViewDetails: (projetoId: number) => void; // Para ver detalhes do projeto
}

const CriarModeloView: React.FC<CriarModeloViewProps> = ({ 
  projects, 
  onBack, 
  onModeloCriado,
  onViewDetails 
}) => {
  const [projetoSelecionado, setProjetoSelecionado] = useState<number | null>(null);

  const handleCriarModelo = () => {
    if (!projetoSelecionado) return;
    
    const projeto = projects.find(p => p.id === projetoSelecionado);
    if (projeto) {
      onModeloCriado(projeto);
    }
  };

  return (
    <div>
      <div className="content-header">
        <h1>Criar Modelo a partir de Projeto Aprovado</h1>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={onBack}>
            Cancelar
          </button>
        </div>
      </div>

      <div className="projects-table-container">
        <table className="projects-table">
          <thead>
            <tr>
              <th>Selecionar</th>
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
                <td>
                  <input
                    type="radio"
                    name="projetoSelecionado"
                    checked={projetoSelecionado === project.id}
                    onChange={() => setProjetoSelecionado(project.id)}
                  />
                </td>
                <td>{project.id}</td>
                <td className="project-name">{project.nome}</td>
                <td>{project.tipoProjeto}</td>
                <td>{project.dataCriacao}</td>
                <td>{project.responsavel}</td>
                <td>
                  <span className="status-badge aprovado">
                    Aprovado
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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {projects.length === 0 && (
          <div className="no-projects-message">
            <p>Nenhum projeto aprovado encontrado.</p>
          </div>
        )}

        {projects.length > 0 && (
          <div className="mt-4 text-center">
            <button 
              className="btn btn-primary btn-lg"
              onClick={handleCriarModelo}
              disabled={!projetoSelecionado}
            >
              Criar Modelo a partir do Projeto Selecionado
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CriarModeloView;