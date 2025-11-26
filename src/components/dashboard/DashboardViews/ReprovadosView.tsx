import React, { useState, useEffect } from 'react';
import { ProjetoDetalhes } from '../../../data/mockData';
import { listarProjetos, obterProjeto } from '../../../data/projects';

interface ReprovadosViewProps {
  projects: any[];
  onViewDetails: (projetoId: number) => void;
  onProjetoReenviado: (projetoId: number) => void;
}

const ReprovadosView: React.FC<ReprovadosViewProps> = ({ onViewDetails, onProjetoReenviado }) => {
  const [projects, setProjects] = useState<ProjetoDetalhes[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [projetoEditando, setProjetoEditando] = useState<number | null>(null);
  const [projetoDetalhado, setProjetoDetalhado] = useState<any>(null);
  const [materialEditando, setMaterialEditando] = useState<{ambienteId: number, materialId: number} | null>(null);
  const [loading, setLoading] = useState<number | null>(null);
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: 'sucesso' | 'erro' } | null>(null);
  const itemsPerPage = 5;

  // Sistema de mensagens
  const mostrarMensagem = (texto: string, tipo: 'sucesso' | 'erro') => {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem(null), 5000);
  };

  // Lista FIXA de itens disponíveis para teste
  const itensDisponiveis = [
    { id: 1, nome: 'Tijolo Baiano' },
    { id: 2, nome: 'Cimento CP II' },
    { id: 3, nome: 'Tinta Acrílica' },
    { id: 4, nome: 'Argamassa' },
    { id: 5, nome: 'Piso Cerâmico' },
    { id: 6, nome: 'Tubo PVC' },
    { id: 7, nome: 'Fio Elétrico' },
    { id: 8, nome: 'Lâmpada LED' },
    { id: 9, nome: 'Porta de Madeira' },
    { id: 10, nome: 'Janela de Alumínio' },
  ];

  // Buscar projetos reprovados
  useEffect(() => {
    const fetchData = async () => {
      let allResults: ProjetoDetalhes[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const data = await listarProjetos(page, "REPROVADO");
        allResults = [...allResults, ...data.results];
        hasMore = !!data.next;
        page++;
      }

      setProjects(allResults);
    };
    fetchData();
  }, []);

  // Carregar detalhes do projeto
  const carregarDetalhesProjeto = async (projetoId: number) => {
    try {
      const projeto = await obterProjeto(projetoId);
      console.log(' Projeto carregado:', projeto);
      setProjetoDetalhado(projeto);
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
      mostrarMensagem('Erro ao carregar detalhes do projeto', 'erro');
    }
  };

  // Funções de edição
  const iniciarEdicao = async (projeto: ProjetoDetalhes) => {
    setProjetoEditando(projeto.id);
    await carregarDetalhesProjeto(projeto.id);
  };

  const cancelarEdicao = () => {
    setProjetoEditando(null);
    setProjetoDetalhado(null);
    setMaterialEditando(null);
  };

  // Verificar se um material foi reprovado
  const materialFoiReprovado = (material: any) => {
    const reprovado = material.status === 'reprovado' || 
           material.status?.toLowerCase().includes('reprovado') ||
           material.motivo_reprovacao;
    console.log(` Material ${material.item}: status=${material.status}, reprovado=${reprovado}`);
    return reprovado;
  };

  // Iniciar edição de um material específico
  const iniciarEdicaoMaterial = (ambienteId: number, materialId: number) => {
    console.log(`✏️ Editando material: ambiente=${ambienteId}, material=${materialId}`);
    setMaterialEditando({ ambienteId, materialId });
  };

  // Cancelar edição de um material
  const cancelarEdicaoMaterial = () => {
    setMaterialEditando(null);
  };

  // Atualizar campo de um material
  const handleMaterialChange = (ambienteId: number, materialId: number, campo: string, valor: string) => {
    console.log(`Alterando ${campo} para:`, valor);
    setProjetoDetalhado((prev: any) => ({
      ...prev,
      ambientes: prev.ambientes.map((amb: any) => 
        amb.id === ambienteId 
          ? {
              ...amb,
              materials: amb.materials.map((mat: any) =>
                mat.id === materialId ? { ...mat, [campo]: valor } : mat
              )
            }
          : amb
      )
    }));
  };

  // Selecionar novo item
  const selecionarNovoItem = (ambienteId: number, materialId: number, novoItem: string) => {
    console.log(` Selecionando novo item: ${novoItem}`);
    if (novoItem) {
      handleMaterialChange(ambienteId, materialId, 'item', novoItem);
    }
    setMaterialEditando(null);
  };

  // Salvar e reenviar
  const salvarEEnviar = async (projetoId: number) => {
    setLoading(projetoId);
    
    try {
      console.log(' Salvando alterações...', projetoDetalhado);

      // Primeiro, atualizar os materiais que foram editados
      if (projetoDetalhado?.ambientes) {
        for (const ambiente of projetoDetalhado.ambientes) {
          for (const material of ambiente.materials) {
            if (materialFoiReprovado(material)) {
              try {
                console.log(` Atualizando material ${material.id}:`, {
                  item: material.item,
                  descricao: material.descricao
                });

                const response = await fetch(`http://127.0.0.1:8000/api/materiais/${material.id}/`, {
                  method: "PATCH",
                  headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    item: material.item,
                    descricao: material.descricao,
                    status: 'PENDENTE',
                    motivo_reprovacao: ''
                  })
                });

                if (!response.ok) {
                  const errorData = await response.json();
                  console.error(` Erro ao atualizar material ${material.id}:`, errorData);
                  throw new Error(`Erro ao atualizar material: ${JSON.stringify(errorData)}`);
                }

                console.log(` Material ${material.id} atualizado com sucesso`);

              } catch (error) {
                console.error(` Erro ao atualizar material ${material.id}:`, error);
                throw error;
              }
            }
          }
        }
      }

      // Depois, atualizar o status do projeto
      console.log(' Atualizando status do projeto para PENDENTE...');
      const response = await fetch(`http://127.0.0.1:8000/api/projetos/${projetoId}/`, {
        method: "PATCH",
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'PENDENTE'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(' Erro ao atualizar projeto:', errorData);
        throw new Error(`Erro ao atualizar projeto: ${JSON.stringify(errorData)}`);
      }

      console.log(' Projeto atualizado com sucesso');

      //  MENSAGEM DE SUCESSO
      mostrarMensagem(' Projeto editado e reenviado para aprovação!', 'sucesso');
      
      // Atualizar estado local
      setProjetoEditando(null);
      setProjetoDetalhado(null);
      setMaterialEditando(null);
      
      // Atualizar a lista local - remove da lista de reprovados
      setProjects(projects.filter(p => p.id !== projetoId));
      onProjetoReenviado(projetoId);
      
    } catch (error) {
      console.error(' Erro ao salvar projeto:', error);
      //  MENSAGEM DE ERRO
      mostrarMensagem(' Erro ao salvar projeto. Verifique o console para mais detalhes.', 'erro');
    } finally {
      setLoading(null);
    }
  };

  // Filtragem e paginação
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
        <h1>Projetos Reprovados</h1>
      </div>

      {/* Sistema de Mensagens */}
      {mensagem && (
        <div
          className={`alert ${
            mensagem.tipo === "sucesso" ? "alert-success" : "alert-danger"
          } alert-dismissible fade show mb-4`}
        >
          {mensagem.texto}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setMensagem(null)}
          ></button>
        </div>
      )}

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
              <React.Fragment key={project.id}>
                {/* Linha principal */}
                <tr className="project-row">
                  <td>{project.id}</td>
                  <td className="project-name">{project.nome}</td>
                  <td>{project.tipoProjeto}</td>
                  <td>{project.dataCriacao}</td>
                  <td>{project.responsavel}</td>
                  <td>
                    <span className="status-badge reprovado">Reprovado</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-primary " 
                        onClick={() => onViewDetails(project.id)}
                      >
                        Ver Detalhes
                      </button>
                      {projetoEditando !== project.id ? (
                        <button 
                          className="btn btn-secondary"
                          onClick={() => iniciarEdicao(project)}
                        >
                          Editar
                        </button>
                      ) : (
                        <button 
                          className="btn btn-secondary"
                          onClick={cancelarEdicao}
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>

                {/* Linha de edição */}
                {projetoEditando === project.id && projetoDetalhado && (
                  <tr>
                    <td colSpan={7} className="p-0">
                      <div className="p-3 bg-light border-top">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h5 className="mb-0">
                            Editando Projeto: {projetoDetalhado.nome || projetoDetalhado.nome_do_projeto}
                          </h5>
                          <small className="text-muted">
                          Clique nos itens reprovados para editá-los
                          </small>
                        </div>

                        {/* Ambientes e Materiais */}
                        <div className="card mb-3">
                          <div className="card-header">
                            <h6 className="mb-0">Ambientes</h6>
                          </div>
                          <div className="card-body">
                            {projetoDetalhado.ambientes && projetoDetalhado.ambientes.length > 0 ? (
                              projetoDetalhado.ambientes.map((amb: any) => (
                                <div key={amb.id} className="projects-table-container mb-3">
                                  <div className="mb-3 fw-bold">
                                    {amb.nome_do_ambiente || amb.nome}
                                  </div>
                                  <div className="card-body">
                                    {amb.materials && amb.materials.length > 0 ? (
                                      <table className="projects-table table table-sm">
                                        <thead>
                                          <tr>
                                            <th>Item</th>
                                            <th>Descrição</th>
                                            <th>Status</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {amb.materials.map((mat: any) => {
                                            const podeEditar = materialFoiReprovado(mat);
                                            const estaEditando = materialEditando?.ambienteId === amb.id && materialEditando?.materialId === mat.id;
                                            
                                            return (
                                              <tr key={mat.id} className={podeEditar ? 'table-danger' : 'table-success'}>
                                                <td style={{ minWidth: '250px' }}>
                                                  {podeEditar && estaEditando ? (
                                                    <div>
                                                      <select
                                                        className="form-control form-control-sm"
                                                        value={mat.item}
                                                        onChange={(e) => selecionarNovoItem(amb.id, mat.id, e.target.value)}
                                                        autoFocus
                                                      >
                                                        <option value={mat.item}>
                                                          {mat.item_label || mat.item} (Atual)
                                                        </option>
                                                        <option value="" disabled>-- Selecione um novo item --</option>
                                                        {itensDisponiveis
                                                          .filter(item => item.nome !== mat.item)
                                                          .map(item => (
                                                            <option key={item.id} value={item.nome}>
                                                              {item.nome}
                                                            </option>
                                                          ))
                                                        }
                                                      </select>
                                                      <div className="mt-1">
                                                        <small className="text-muted">
                                                          {itensDisponiveis.filter(item => item.nome !== mat.item).length} itens disponíveis
                                                        </small>
                                                        <button
                                                          type="button"
                                                          className="btn btn-outline-secondary ms-2"
                                                          onClick={cancelarEdicaoMaterial}
                                                        >
                                                          Fechar
                                                        </button>
                                                      </div>
                                                    </div>
                                                  ) : (
                                                    <div 
                                                      className={`p-2 ${podeEditar ? 'cursor-pointer' : ''}`}
                                                      onClick={() => podeEditar && iniciarEdicaoMaterial(amb.id, mat.id)}
                                                      style={{ 
                                                        cursor: podeEditar ? 'pointer' : 'default',
                                                        borderRadius: '4px',
                                                        minHeight: '40px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        border: podeEditar ? '1px dashed #dc3545' : 'none',
                                                        backgroundColor: podeEditar && estaEditando ? '#f8d7da' : 'transparent'
                                                      }}
                                                    >
                                                      <div>
                                                        <strong>{mat.item_label || mat.item}</strong>
                                                        {podeEditar && (
                                                          <small className="text-muted d-block">
                                                            🔧 Clique para selecionar outro item
                                                          </small>
                                                        )}
                                                      </div>
                                                    </div>
                                                  )}
                                                </td>
                                                <td>
                                                  <textarea
                                                    className={`form-control form-control-sm ${!podeEditar ? 'bg-light' : ''}`}
                                                    rows={2}
                                                    value={mat.descricao || "—"}
                                                    onChange={(e) => handleMaterialChange(amb.id, mat.id, 'descricao', e.target.value)}
                                                    disabled={!podeEditar}
                                                    placeholder={podeEditar ? "Digite a descrição..." : ""}
                                                  />
                                                </td>
                                                <td>
                                                  {podeEditar ? (
                                                    <div>
                                                      <span className="badge bg-danger">Reprovado</span>
                                                      {mat.motivo_reprovacao && (
                                                        <small className="d-block text-muted mt-1">
                                                          {mat.motivo_reprovacao}
                                                        </small>
                                                      )}
                                                    </div>
                                                  ) : (
                                                    <span className="badge bg-success">Aprovado</span>
                                                  )}
                                                </td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    ) : (
                                      <p className="text-muted">Nenhum material cadastrado.</p>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-muted">Nenhum ambiente cadastrado.</p>
                            )}
                          </div>
                        </div>

                        {/* Botões de ação */}
                        <div className="d-flex gap-2 justify-content-end">
                          <button
                            type="button"
                            className="btn btn-success"
                            onClick={() => salvarEEnviar(project.id)}
                            disabled={loading === project.id}
                          >
                            {loading === project.id ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Enviando...
                              </>
                            ) : (
                              'Confirmar Edição e Reenviar'
                            )}
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={cancelarEdicao}
                            disabled={loading === project.id}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {filteredProjects.length === 0 && (
          <div className="no-projects-message">
            <p>Nenhum projeto reprovado encontrado.</p>
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

export default ReprovadosView;