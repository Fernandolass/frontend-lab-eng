import React, { useState, useEffect } from "react";
import { listarAmbientes, criarMaterial, listarMateriais, atualizarMaterialCRUD, deletarMaterial } from "../../../data/projects";
import { apiFetch } from "../../../data/api";

// Interfaces
interface NovoItem {
  id?: number;
  nome: string;
  ambientesSelecionados: number[];
}

interface Material {
  id: number;
  item: string;
  descricao: string;
  ambiente: number;
  ambiente_nome?: string;
  ambiente_tipo?: number;
}

interface MaterialAPIResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Material[];
}

const CadastrarItemView: React.FC = () => {
  const [ambientes, setAmbientes] = useState<any[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [materiaisFiltrados, setMateriaisFiltrados] = useState<Material[]>([]);
  const [novoItem, setNovoItem] = useState<NovoItem>({ 
    nome: "", 
    ambientesSelecionados: [] 
  });
  const [loading, setLoading] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [carregandoAmbientes, setCarregandoAmbientes] = useState(true);
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: 'sucesso' | 'erro' } | null>(null);
  const [editando, setEditando] = useState(false);
  const [pesquisaMaterial, setPesquisaMaterial] = useState("");

  // Estados para edição
  const [materialEditando, setMaterialEditando] = useState<Material | null>(null);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState<number | null>(null);
  const [carregandoAcao, setCarregandoAcao] = useState<number | null>(null);

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estados de paginação para ambientes
  const [currentPageAmbientes, setCurrentPageAmbientes] = useState(1);
  const itemsPerPageAmbientes = 10;

  const mostrarMensagem = (texto: string, tipo: 'sucesso' | 'erro') => {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem(null), 5000);
  };

  // 🔄 LÓGICA DE CARREGAMENTO
  const carregarTodosMateriais = async (): Promise<Material[]> => {
    try {
      let todosMateriais: Material[] = [];
      let nextUrl: string | null = "/api/materiais/";

      while (nextUrl) {
        const response: MaterialAPIResponse = await apiFetch(nextUrl);
        
        let materiaisDaPagina: Material[] = [];
        let nextPageUrl: string | null = null;
        
        if (Array.isArray(response)) {
          materiaisDaPagina = response;
          nextPageUrl = null;
        } else if (response && typeof response === 'object' && Array.isArray(response.results)) {
          materiaisDaPagina = response.results;
          nextPageUrl = response.next ? response.next.replace(/^.*\/\/[^/]+/, '') : null;
        } else {
          console.warn("⚠️ Formato de resposta inesperado:", response);
          break;
        }
        
        todosMateriais = [...todosMateriais, ...materiaisDaPagina];
        nextUrl = nextPageUrl;
        
        if (todosMateriais.length >= 1000) {
          console.warn("⚠️ Limite de 1000 materiais atingido");
          break;
        }
      }

      return todosMateriais;
    } catch (error) {
      console.error("❌ Erro ao carregar materiais:", error);
      throw error;
    }
  };

  // 🔄 FILTRO/PESQUISA - Apenas por item
  useEffect(() => {
    if (pesquisaMaterial.trim() === "") {
      setMateriaisFiltrados(materiais);
      setCurrentPage(1);
    } else {
      const termoPesquisa = pesquisaMaterial.toLowerCase().trim();
      const filtrados = materiais.filter(material => {
        const nomeItem = material.item.toLowerCase();
        return nomeItem.includes(termoPesquisa);
      });
      setMateriaisFiltrados(filtrados);
      setCurrentPage(1);
    }
  }, [pesquisaMaterial, materiais]);

  // CARREGA AMBIENTES
  useEffect(() => {
    const carregarAmbientes = async () => {
      try {
        setCarregandoAmbientes(true);
        const lista = await listarAmbientes();
        
        const ambientesComTipo = lista.map(ambiente => ({
          ...ambiente,
          tipo: ambiente.categoria === "PRIVATIVA" ? 1 : 
                ambiente.categoria === "COMUM" ? 2 : 0
        }));
        
        setAmbientes(ambientesComTipo);
      } catch (err) {
        console.error("Erro ao carregar ambientes:", err);
        mostrarMensagem("Erro ao carregar ambientes.", "erro");
      } finally {
        setCarregandoAmbientes(false);
      }
    };
    carregarAmbientes();
  }, []);

  // 🔄 CARREGAMENTO DE MATERIAIS
  useEffect(() => {
    const carregarMateriais = async () => {
      try {
        setCarregando(true);
        const todosMateriais = await carregarTodosMateriais();
        setMateriais(todosMateriais);
        setMateriaisFiltrados(todosMateriais);
        console.log(`✅ Carregados ${todosMateriais.length} materiais`);
      } catch (error) {
        console.error("Erro ao carregar materiais:", error);
        mostrarMensagem("Erro ao carregar materiais.", "erro");
      } finally {
        setCarregando(false);
      }
    };
    carregarMateriais();
  }, []);

  // Resetar página de ambientes quando a lista mudar
  useEffect(() => {
    setCurrentPageAmbientes(1);
  }, [ambientes]);

  // Lógica de paginação para ambientes
  const totalAmbientes = ambientes.length;
  const totalPagesAmbientes = Math.max(1, Math.ceil(totalAmbientes / itemsPerPageAmbientes));
  const startIndexAmbientes = (currentPageAmbientes - 1) * itemsPerPageAmbientes;
  const ambientesPaginados = ambientes.slice(startIndexAmbientes, startIndexAmbientes + itemsPerPageAmbientes);

  // Lógica de paginação para materiais filtrados
  const totalItems = materiaisFiltrados.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMateriais = materiaisFiltrados.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const toggleAmbiente = (ambienteId: number) => {
    setNovoItem(prev => ({
      ...prev,
      ambientesSelecionados: prev.ambientesSelecionados.includes(ambienteId)
        ? prev.ambientesSelecionados.filter(id => id !== ambienteId)
        : [...prev.ambientesSelecionados, ambienteId]
    }));
  };

  const toggleTodosAmbientes = () => {
    if (novoItem.ambientesSelecionados.length === ambientes.length) {
      setNovoItem(prev => ({
        ...prev,
        ambientesSelecionados: []
      }));
    } else {
      setNovoItem(prev => ({
        ...prev,
        ambientesSelecionados: ambientes.map(amb => amb.id)
      }));
    }
  };

  const handleCriarItem = async () => {
    if (!novoItem.nome.trim()) {
      mostrarMensagem("Digite o nome do item!", "erro");
      return;
    }

    if (novoItem.ambientesSelecionados.length === 0) {
      mostrarMensagem("Selecione pelo menos um ambiente!", "erro");
      return;
    }

    setLoading(true);
    try {
      if (editando && novoItem.id) {
        // 🔧 CORREÇÃO: Para edição, apenas atualiza o item existente
        await atualizarMaterialCRUD(novoItem.id, {
          ambiente: novoItem.ambientesSelecionados[0],
          item: novoItem.nome.trim(),
          descricao: "", // Descrição vazia pois não é mais usada
        });
        mostrarMensagem("Item atualizado com sucesso!", "sucesso");
      } else {
        // Criação normal - criar em múltiplos ambientes
        const promises = novoItem.ambientesSelecionados.map(ambienteId =>
          criarMaterial({
            ambiente: ambienteId,
            item: novoItem.nome.trim(),
            descricao: "", // Descrição vazia pois não é mais usada
          })
        );

        await Promise.all(promises);
        mostrarMensagem("Item criado com sucesso para os ambientes selecionados! 🎉", "sucesso");
      }

      // Limpar formulário
      setNovoItem({ 
        nome: "", 
        ambientesSelecionados: [] 
      });
      setEditando(false);

      // Recarregar lista
      const todosMateriais = await carregarTodosMateriais();
      setMateriais(todosMateriais);
      setMateriaisFiltrados(todosMateriais);

    } catch (err: any) {
      console.error("Erro ao criar/editar item:", err);
      
      let errorMessage = editando ? "Erro ao atualizar item" : "Erro ao criar item";
      
      if (err?.message?.includes("403") || err?.message?.includes("Forbidden")) {
        errorMessage = "Você não tem permissão para criar/editar itens. Entre em contato com o administrador.";
      } else if (err?.message) {
        const shortMessage = err.message.length > 100 
          ? err.message.substring(0, 100) + "..." 
          : err.message;
        errorMessage = `Erro: ${shortMessage}`;
      }
      
      mostrarMensagem(errorMessage, "erro");
    } finally {
      setLoading(false);
    }
  };

  // 🔧 CORREÇÃO: Função de edição apenas do nome do item
  const handleEditarMaterial = async () => {
    if (!materialEditando) return;
    
    if (!materialEditando.item.trim()) {
      mostrarMensagem("Digite o nome do item!", "erro");
      return;
    }

    setCarregandoAcao(materialEditando.id);
    try {
      const materialAtualizado = await atualizarMaterialCRUD(materialEditando.id, {
        ambiente: materialEditando.ambiente,
        item: materialEditando.item,
        descricao: "", // Descrição vazia
      });

      // Atualiza a lista local
      setMateriais(prev => prev.map(m => 
        m.id === materialEditando.id ? materialAtualizado : m
      ));
      setMateriaisFiltrados(prev => prev.map(m => 
        m.id === materialEditando.id ? materialAtualizado : m
      ));

      setMaterialEditando(null);
      mostrarMensagem("✅ Item atualizado com sucesso!", "sucesso");
    } catch (error: any) {
      console.error("Erro ao editar item:", error);
      mostrarMensagem("Erro ao editar item.", "erro");
    } finally {
      setCarregandoAcao(null);
    }
  };

  const handleExcluirMaterial = async (materialId: number) => {
    setCarregandoAcao(materialId);
    setConfirmandoExclusao(null);
    
    try {
      await deletarMaterial(materialId);
      
      // Remove da lista local
      setMateriais(prev => prev.filter(m => m.id !== materialId));
      setMateriaisFiltrados(prev => prev.filter(m => m.id !== materialId));
      
      mostrarMensagem("✅ Item excluído com sucesso!", "sucesso");
    } catch (error: any) {
      console.error("Erro ao excluir item:", error);
      mostrarMensagem("Erro ao excluir item.", "erro");
    } finally {
      setCarregandoAcao(null);
    }
  };

  const iniciarEdicao = (material: Material) => {
    setMaterialEditando({...material});
  };

  const cancelarEdicao = () => {
    setMaterialEditando(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCriarItem();
    }
  };

  if (carregandoAmbientes) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
        <p className="mt-2 text-muted">Carregando ambientes...</p>
      </div>
    );
  }

  return (
    <div className="">
      <div className="content-header">
        <h1>{editando ? "Editar Item" : "Cadastrar Item"}</h1>
      </div>

      {/* Mensagens de feedback */}
      {mensagem && (
        <div className={`alert ${mensagem.tipo === 'sucesso' ? 'alert-success' : 'alert-danger'} alert-dismissible fade show mb-4`}>
          {mensagem.texto}
          <button type="button" className="btn-close" onClick={() => setMensagem(null)}></button>
        </div>
      )}

      <form onKeyPress={handleKeyPress}>
        <div className="row mb-3">
          <div className="col-md-12">
            <label className="form-label">Nome do Item</label>
            <input
              type="text"
              placeholder="Ex: Piso, Parede, Teto, Porta"
              className="form-control"
              value={novoItem.nome}
              onChange={(e) => setNovoItem({ ...novoItem, nome: e.target.value })}
            />
          </div>
        </div>

        {/* Seleção de ambientes */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <label className="form-label h5 mb-0">Selecione os Ambientes</label>
            <div className="d-flex align-items-center gap-2">
              {totalPagesAmbientes > 1 && (
                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${currentPageAmbientes === 1 ? 'disabled' : ''}`}>
                    </li>
                  </ul>
                </nav>
              )}
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={toggleTodosAmbientes}
              >
                {novoItem.ambientesSelecionados.length === ambientes.length 
                  ? "Desmarcar Todos" 
                  : "Selecionar Todos"}
              </button>
            </div>
          </div>

          <div className="list-group mb-3">
            {ambientesPaginados.map((ambiente) => (
              <label key={ambiente.id} className="list-group-item">
                <input
                  type="checkbox"
                  checked={novoItem.ambientesSelecionados.includes(ambiente.id)}
                  onChange={() => toggleAmbiente(ambiente.id)}
                  className="form-check-input me-2"
                />
                {ambiente.nome}{" "}
                <span className="text-muted">
                  (
                  {ambiente.categoria === "PRIVATIVA"
                    ? "Área Privativa"
                    : ambiente.categoria === "COMUM"
                    ? "Área Comum"
                    : "Área Indefinida"}
                  )
                </span>
              </label>  
            ))}
          </div>

          {/* Paginação inferior para ambientes */}
          {totalPagesAmbientes > 1 && (
            <div className="d-flex justify-content-center mt-2">
              <nav>
                <ul className="pagination pagination-sm">
                  <li className={`page-item ${currentPageAmbientes === 1 ? 'disabled' : ''}`}>
                    <button 
                      type="button"
                      className="page-link" 
                      onClick={() => setCurrentPageAmbientes(prev => prev - 1)}
                      disabled={currentPageAmbientes === 1}
                    >
                      Anterior
                    </button>
                  </li>
                  <li className="page-item disabled">
                    <span className="page-link">
                      Página {currentPageAmbientes} de {totalPagesAmbientes}
                    </span>
                  </li>
                  <li className={`page-item ${currentPageAmbientes === totalPagesAmbientes ? 'disabled' : ''}`}>
                    <button 
                      type="button"
                      className="page-link" 
                      onClick={() => setCurrentPageAmbientes(prev => prev + 1)}
                      disabled={currentPageAmbientes === totalPagesAmbientes}
                    >
                      Próxima
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
          
          {ambientes.length === 0 && (
            <div className="text-center text-muted py-3">
              Nenhum ambiente cadastrado. Cadastre ambientes primeiro.
            </div>
          )}

          <div className="text-muted small mt-2">
            {novoItem.ambientesSelecionados.length} ambiente(s) selecionado(s) de {ambientes.length} total
          </div>
        </div>

        <div className="d-flex justify-content-end mb-4">
          {editando && (
            <button
              type="button"
              className="btn btn-secondary me-2 px-4"
              onClick={() => {
                setNovoItem({ nome: "", ambientesSelecionados: [] });
                setEditando(false);
              }}
              disabled={loading}
            >
              Cancelar Edição
            </button>
          )}
          <button
            className="btn btn-primary px-4"
            onClick={handleCriarItem}
            disabled={loading || !novoItem.nome.trim() || novoItem.ambientesSelecionados.length === 0}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                {editando ? "Salvando..." : "Criando..."}
              </>
            ) : (
              editando ? "Atualizar Item" : "Criar Item"
            )}
          </button>
        </div>
      </form>

      <h2 className="content-header bold">Lista de itens</h2>
      
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Pesquisar itens por nome..."
              value={pesquisaMaterial}
              onChange={(e) => setPesquisaMaterial(e.target.value)}
            />
            {pesquisaMaterial && (
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => setPesquisaMaterial("")}
              >
                <i className="bi bi-x"></i>
              </button>
            )}
          </div>
        </div>
        <div className="col-md-6">
          {pesquisaMaterial && (
            <div className="d-flex align-items-center h-100">
              <small className="text-muted">
                {materiaisFiltrados.length} de {materiais.length} item(s) encontrado(s)
              </small>
            </div>
          )}
        </div>
      </div>

      {carregando ? (
        <div className="text-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2 text-muted">Carregando itens...</p>
        </div>
      ) : materiaisFiltrados.length === 0 ? (
        <div className="alert alert-info mb-0">
          <i className="bi bi-info-circle me-2"></i>
          {pesquisaMaterial ? (
            <>Nenhum item encontrado para "<strong>{pesquisaMaterial}</strong>"</>
          ) : (
            "Nenhum item cadastrado ainda. Comece criando o primeiro item usando o formulário acima."
          )}
        </div>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Material</th>
                <th>Ambiente</th>
                <th></th>
                <th style={{ width: '150px' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMateriais.map((material) => (
                <tr key={material.id}>
                  {materialEditando?.id === material.id ? (
                    // MODO EDIÇÃO
                    <>
                      <td>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={materialEditando.item}
                          onChange={(e) => setMaterialEditando({
                            ...materialEditando,
                            item: e.target.value
                          })}
                        />
                      </td>
                      <td>
                        <span className="text-muted small">
                          {material.descricao || "Sem descrição"}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-secondary">
                          {material.ambiente_nome || `Ambiente ${material.ambiente}`}
                        </span>
                      </td>
                      <td>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={handleEditarMaterial}
                            disabled={carregandoAcao === material.id}
                          >
                            {carregandoAcao === material.id ? (
                              <span className="spinner-border spinner-border-sm" />
                            ) : (
                              'Salvar'
                            )}
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={cancelarEdicao}
                            disabled={carregandoAcao === material.id}
                          >
                            Cancelar
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    // MODO VISUALIZAÇÃO
                    <>
                      <td>
                        <span className="fw-semibold">
                          {material.item}
                        </span>
                      </td>
                      <td>
                        <span className="">
                          {material.descricao || "Sem descrição"}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-secondary">
                          {material.ambiente_nome || `Ambiente ${material.ambiente}`}
                        </span>
                      </td>
                      <td>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-primary btn-sm me-2"
                            onClick={() => iniciarEdicao(material)}
                            disabled={carregandoAcao === material.id}
                          >
                            Editar
                          </button>
                          {confirmandoExclusao === material.id ? (
                            <div className="d-flex align-items-center gap-1">
                              <span className="text-muted small">Confirmar?</span>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleExcluirMaterial(material.id)}
                                disabled={carregandoAcao === material.id}
                              >
                                {carregandoAcao === material.id ? (
                                  <span className="spinner-border spinner-border-sm" />
                                ) : (
                                  '✓'
                                )}
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => setConfirmandoExclusao(null)}
                              >
                                ✗
                              </button>
                            </div>
                          ) : (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setConfirmandoExclusao(material.id)}
                              disabled={carregandoAcao === material.id}
                            >
                              Excluir
                            </button>
                          )}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginação */}
          {totalPages > 1 && (
            <nav>
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    type="button"
                    className="page-link"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
                    type="button"
                    className="page-link"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Próxima
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default CadastrarItemView;