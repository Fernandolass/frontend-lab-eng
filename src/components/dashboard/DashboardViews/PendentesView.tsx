import React, { useState, useEffect } from 'react';
import { ProjetoDetalhes } from '../../../data/mockData';
import { listarProjetos } from '../../../data/projects';

interface PendentesViewProps {
  onViewDetails: (projetoId: number) => void;
  onEditProject: (projetoId: number) => void;
}

const PendentesView: React.FC<PendentesViewProps> = ({ 
  onViewDetails, 
  onEditProject 
}) => {
  const [projects, setProjects] = useState<ProjetoDetalhes[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      let allResults: ProjetoDetalhes[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const data = await listarProjetos(page, "PENDENTE");
        allResults = [...allResults, ...data.results];
        hasMore = !!data.next;
        page++;
      }

      setProjects(allResults);
    };
    fetchData();
  }, []);

  const filteredProjects = projects.filter(project =>
    project.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.responsavel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <div className="content-header">
        <h1>Projetos Pendentes</h1>
      </div>

      {/* Barra de pesquisa */}
      <div className="search-bar mb-3 col-lg-6">
        <input
          type="text"
          placeholder="Buscar por nome ou responsável..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); 
          }}
          className="form-control"
        />
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
            {paginatedProjects.map(project => (
              <tr key={project.id}>
                <td>{project.id}</td>
                <td>{project.nome}</td>
                <td>{project.tipoProjeto}</td>
                <td>{project.dataCriacao}</td>
                <td>{project.responsavel}</td>
                <td>
                  <span className="status-badge pendente">Pendente</span>
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
                      className="btn btn-success"
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

        {filteredProjects.length === 0 && (
          <div className="no-projects-message">
            <p>Nenhum projeto pendente encontrado.</p>
          </div>
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <nav>
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => setCurrentPage(prev => prev - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </button>
            </li>
            <li className="page-item disabled">
              <span className="page-link">
                Página {currentPage} de {totalPages}
              </span>
            </li>
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage === totalPages}
              >
                Próxima
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default PendentesView;