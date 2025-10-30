import React from 'react';

interface ModelosViewProps {
  modelos: any[];
  onViewDetails: (modeloId: number) => void;
  onCreateModel: () => void;
  onEditModel: (modeloId: number) => void;
  onDeleteModel: (modeloId: number) => void;
}

const ModelosView: React.FC<ModelosViewProps> = ({ 
  modelos, 
  onViewDetails, 
  onCreateModel,
  onEditModel,
  onDeleteModel 
}) => (
  <div>
    <div className="content-header">
      <h1>Modelos</h1>
      <div className="header-actions">
        <button className="btn btn-primary" onClick={onCreateModel}>
          Criar Modelo
        </button>
      </div>
    </div>

    <div className="projects-table-container">
      <table className="projects-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome do Modelo</th>
            <th>Tipo</th>
            <th>Data de Criação</th>
            <th>Responsável</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {modelos.map(modelo => (
            <tr key={modelo.id} className="project-row">
              <td>{modelo.id}</td>
              <td className="project-name">{modelo.nome}</td>
              <td>{modelo.tipoModelo}</td>
              <td>{modelo.dataCriacao}</td>
              <td>{modelo.responsavel}</td>
              <td>
                <div className="action-buttons">
                  <button 
                    className="btn btn-primary" 
                    onClick={() => onViewDetails(modelo.id)}
                  >
                    Ver Detalhes
                  </button>
                  <button
                    className="btn btn-secondary" 
                    onClick={() => onEditModel(modelo.id)}
                  >
                    Editar
                  </button>
                  <button 
                    className="btn btn-danger" 
                    onClick={() => onDeleteModel(modelo.id)}
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {modelos.length === 0 && (
        <div className="no-projects-message">
          <p>Nenhum modelo encontrado.</p>
        </div>
      )}
    </div>
  </div>
);

export default ModelosView;