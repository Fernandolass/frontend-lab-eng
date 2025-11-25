import React, { useState, useEffect } from "react";
import { listarAmbientes, criarMaterial, listarMateriais, atualizarMaterialCRUD, deletarMaterial } from "../../../data/projects";

// Interfaces
interface NovoItem {
  id?: number;
  nome: string;
  descricao: string;
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

const CadastrarItemView: React.FC = () => {
  const [ambientes, setAmbientes] = useState<any[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [todosMateriais, setTodosMateriais] = useState<Material[]>([]);
  const [materiaisFiltrados, setMateriaisFiltrados] = useState<Material[]>([]);
  const [novoItem, setNovoItem] = useState<NovoItem>({ 
    nome: "", 
    descricao: "", 
    ambientesSelecionados: [] 
  });
  const [loading, setLoading] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: 'sucesso' | 'erro' } | null>(null);
  const [editando, setEditando] = useState(false);
  const [termoBusca, setTermoBusca] = useState("");

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Nova paginação para resultados filtrados
  const [currentPageFiltrados, setCurrentPageFiltrados] = useState(1);
  const itemsPerPage = 10;

  // Paginação para ambientes
  const [currentPageAmbientes, setCurrentPageAmbientes] = useState(1);
  const itemsPerPageAmbientes = 10;

  // Carregar ambientes apenas uma vez
  useEffect(() => {
    carregarAmbientes();
  }, []);

  // Carregar materiais quando a página mudar
  useEffect(() => {
    carregarMateriais();
  }, [currentPage]);

  // Resetar página de filtrados quando termo de busca mudar
  useEffect(() => {
    setCurrentPageFiltrados(1);
  }, [termoBusca]);

  // Calcular materiais paginados para exibição
  const materiaisParaExibir = termoBusca ? materiaisFiltrados : materiais;
  
  // Paginação manual para resultados filtrados
  const startIndex = (currentPageFiltrados - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const materiaisPaginados = materiaisParaExibir.slice(startIndex, endIndex);
  const totalPagesFiltrados = Math.ceil(materiaisParaExibir.length / itemsPerPage);

  // Paginação para ambientes
  const totalPagesAmbientes = Math.ceil(ambientes.length / itemsPerPageAmbientes);
  const startIndexAmbientes = (currentPageAmbientes - 1) * itemsPerPageAmbientes;
  const ambientesPaginados = ambientes.slice(startIndexAmbientes, startIndexAmbientes + itemsPerPageAmbientes);

  useEffect(() => {
    // Filtrar materiais quando o termo de busca mudar
    if (termoBusca.trim() === "") {
      setMateriaisFiltrados(materiais);
    } else {
      const filtrados = todosMateriais.filter(material =>
        material.item.toLowerCase().includes(termoBusca.toLowerCase()) ||
        material.descricao.toLowerCase().includes(termoBusca.toLowerCase()) ||
        (material.ambiente_nome && material.ambiente_nome.toLowerCase().includes(termoBusca.toLowerCase()))
      );
      setMateriaisFiltrados(filtrados);
    }
  }, [termoBusca, materiais, todosMateriais]);

  const carregarAmbientes = async () => {
    try {
      const lista = await listarAmbientes();
      setAmbientes(lista);
    } catch (err) {
      console.error("Erro ao carregar ambientes:", err);
      mostrarMensagem("Erro ao carregar ambientes.", "erro");
    } finally {
      setCarregando(false);
    }
  };

  // 🔧 CORREÇÃO: Função carregarMateriais única e corrigida
  const carregarMateriais = async () => {
    try {
      const data = await listarMateriais(currentPage);
      
      // 🔧 CORREÇÃO: Atualizar estados de forma segura
      const novosMateriais = data.results || [];
      setMateriais(novosMateriais);
      setMateriaisFiltrados(novosMateriais);

      // Carregar TODOS os materiais para busca (apenas na primeira página)
      if (currentPage === 1) {
        try {
          let todos: Material[] = [];
          let page = 1;
          let hasMore = true;

          // Carrega TODAS as páginas
          while (hasMore) {
            const pageData = await listarMateriais(page);
            const resultadosPagina = pageData.results || [];
            todos = [...todos, ...resultadosPagina];
            
            // Verifica se tem mais páginas
            hasMore = pageData.next !== null;
            page++;
            
            // Safety limit
            if (page > 50) break;
          }
          
          setTodosMateriais(todos);
        } catch (err) {
          console.error("Erro ao carregar todos materiais:", err);
        }
      }

      if (data.count && data.results) {
        const pageSize = data.results.length;
        setTotalPages(Math.ceil(data.count / pageSize));
      }
    } catch (err) {
      console.error("Erro ao carregar materiais:", err);
      mostrarMensagem("Erro ao carregar materiais.", "erro");
    }
  };

  const mostrarMensagem = (texto: string, tipo: 'sucesso' | 'erro') => {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem(null), 5000);
  };

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
    if (!novoItem.nome.trim() || !novoItem.descricao.trim()) {
      mostrarMensagem("Preencha o nome e a descrição do item!", "erro");
      return;
    }

    if (novoItem.ambientesSelecionados.length === 0) {
      mostrarMensagem("Selecione pelo menos um ambiente!", "erro");
      return;
    }

    setLoading(true);
    try {
      if (editando && novoItem.id) {
        // Atualizar material existente
        await atualizarMaterialCRUD(novoItem.id, {
          ambiente: novoItem.ambientesSelecionados[0],
          item: novoItem.nome.trim(),
          descricao: novoItem.descricao.trim(),
        });
        mostrarMensagem("Item atualizado com sucesso!", "sucesso");
      } else {
        // Criação normal - criar em múltiplos ambientes
        const promises = novoItem.ambientesSelecionados.map(ambienteId =>
          criarMaterial({
            ambiente: ambienteId,
            item: novoItem.nome.trim(),
            descricao: novoItem.descricao.trim(),
          })
        );

        await Promise.all(promises);
        mostrarMensagem("Item criado com sucesso para os ambientes selecionados! 🎉", "sucesso");
      }

      // Limpar formulário
      setNovoItem({ 
        nome: "", 
        descricao: "", 
        ambientesSelecionados: [] 
      });
      setEditando(false);

      // 🔧 CORREÇÃO: Recarregar lista e resetar paginação
      setCurrentPage(1);
      setCurrentPageFiltrados(1);
      await carregarMateriais();

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

  const handleEditarItem = (material: Material) => {
    setNovoItem({
      id: material.id,
      nome: material.item,
      descricao: material.descricao,
      ambientesSelecionados: [material.ambiente]
    });
    setEditando(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelarEdicao = () => {
    setNovoItem({ 
      nome: "", 
      descricao: "", 
      ambientesSelecionados: [] 
    });
    setEditando(false);
  };

  const handleExcluirItem = async (id: number) => {
  if (window.confirm("Tem certeza que deseja excluir este item?")) {
    try {
      await deletarMaterial(id);
      mostrarMensagem("Item excluído com sucesso!", "sucesso");
    } catch (err: any) {
      console.error("Erro ao excluir item:", err);
      
      // Se for 404, o item já não existe no servidor - consideramos sucesso
      if (err?.message?.includes("404") || err?.message?.includes("Not Found")) {
        mostrarMensagem("Item removido com sucesso!", "sucesso");
      } else {
        mostrarMensagem("Erro ao excluir item. Tente novamente.", "erro");
        return; // Não remove da lista se for outro erro
      }
    }
    
    // Remove o item de todas as listas locais
    setMateriais(prev => prev.filter(material => material.id !== id));
    setMateriaisFiltrados(prev => prev.filter(material => material.id !== id));
    setTodosMateriais(prev => prev.filter(material => material.id !== id));
  }
};

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCriarItem();
    }
  };

  if (carregando) {
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
          <div className="col-md-6">
            <label className="form-label">Nome do Item</label>
            <input
              type="text"
              placeholder="Ex: Piso, Parede, Teto, Porta..."
              className="form-control"
              value={novoItem.nome}
              onChange={(e) => setNovoItem({ ...novoItem, nome: e.target.value })}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Descrição</label>
            <input
              type="text"
              placeholder="Descreva as especificações do item..."
              className="form-control"
              value={novoItem.descricao}
              onChange={(e) => setNovoItem({ ...novoItem, descricao: e.target.value })}
            />
          </div>
        </div>

        {/* Seleção de ambientes */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <label className="form-label h5 mb-0">Selecione os Ambientes</label>
            <div className="d-flex align-items-center gap-2">
              {/* Paginação para ambientes */}
              {totalPagesAmbientes > 1 && (
                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${currentPageAmbientes === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => setCurrentPageAmbientes(prev => prev - 1)}
                        disabled={currentPageAmbientes === 1}
                      >
                        &laquo;
                      </button>
                    </li>
                    <li className="page-item disabled">
                      <span className="page-link">
                        {currentPageAmbientes}/{totalPagesAmbientes}
                      </span>
                    </li>
                    <li className={`page-item ${currentPageAmbientes === totalPagesAmbientes ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => {
                          if (currentPageAmbientes < totalPagesAmbientes) {
                            setCurrentPageAmbientes(prev => prev + 1);
                          }
                        }}
                        disabled={currentPageAmbientes === totalPagesAmbientes}
                      >
                        &raquo;
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
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
                  {ambiente.tipo === 1
                    ? "Área Privativa"
                    : ambiente.tipo === 2
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
                      className="page-link" 
                      onClick={() => {
                        if (currentPageAmbientes < totalPagesAmbientes) {
                          setCurrentPageAmbientes(prev => prev + 1);
                        }
                      }}
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
              onClick={handleCancelarEdicao}
              disabled={loading}
            >
              Cancelar Edição
            </button>
          )}
          <button
            className="btn btn-primary px-4 "
            onClick={handleCriarItem}
            disabled={loading || !novoItem.nome.trim() || !novoItem.descricao.trim() || novoItem.ambientesSelecionados.length === 0}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                {editando ? "Salvando..." : "Criando..."}
              </>
            ) : (
              editando ? "Editar Item" : "Criar Item"
            )}
          </button>
        </div>
      </form>

      {/* Lista de Itens - CRUD */}
      <h2 className="content-header bold">Lista de Itens</h2>
      
      {/* Barra de pesquisa */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="input-group" style={{ width: "500px" }}>
          <span className="input-group-text">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nome, descrição ou ambiente..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
          />
        </div>
      </div>

      {materiaisParaExibir.length === 0 ? (
        <div className="text-center text-muted py-4">
          {termoBusca ? "Nenhum item encontrado para sua pesquisa." : "Nenhum item cadastrado ainda."}
        </div>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome do Item</th>
                <th>Descrição</th>
                <th>Ambiente</th>
                <th>Tipo Ambiente</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {materiaisPaginados.map((material) => (
                <tr key={material.id}>
                  <td>{material.id}</td>
                  <td>{material.item}</td>
                  <td>{material.descricao}</td>
                  <td>{material.ambiente_nome || `Ambiente ${material.ambiente}`}</td>
                  <td>
                    <span className={`badge ${material.ambiente_tipo === 1 ? 'bg-primary' : 'bg-success'}`}>
                      {material.ambiente_tipo === 1 ? "Área Privativa" : "Área Comum"}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-sm btn-primary me-2" 
                      onClick={() => handleEditarItem(material)}
                    >
                      Editar
                    </button>
                    <button 
                      className="btn btn-sm btn-secondary" 
                      onClick={() => handleExcluirItem(material.id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginação - Adaptada para pesquisa */}
          {(totalPages > 1 && !termoBusca) || (totalPagesFiltrados > 1 && termoBusca) ? (
            <nav>
              <ul className="pagination justify-content-center">
                <li className={`page-item ${(termoBusca ? currentPageFiltrados : currentPage) === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => {
                      if (termoBusca) {
                        setCurrentPageFiltrados(prev => prev - 1);
                      } else {
                        setCurrentPage(prev => prev - 1);
                      }
                    }}
                    disabled={(termoBusca ? currentPageFiltrados : currentPage) === 1}
                  >
                    Anterior
                  </button>
                </li>
                <li className="page-item disabled">
                  <span className="page-link">
                    Página {termoBusca ? currentPageFiltrados : currentPage} de {termoBusca ? totalPagesFiltrados : totalPages}
                  </span>
                </li>
                <li className={`page-item ${(termoBusca ? currentPageFiltrados : currentPage) === (termoBusca ? totalPagesFiltrados : totalPages) ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => {
                      if (termoBusca) {
                        if (currentPageFiltrados < totalPagesFiltrados) {
                          setCurrentPageFiltrados(prev => prev + 1);
                        }
                      } else {
                        if (currentPage < totalPages) {
                          setCurrentPage(prev => prev + 1);
                        }
                      }
                    }}
                    disabled={(termoBusca ? currentPageFiltrados : currentPage) === (termoBusca ? totalPagesFiltrados : totalPages)}
                  >
                    Próxima
                  </button>
                </li>
              </ul>
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
};

export default CadastrarItemView;