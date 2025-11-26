import React, { useState, useEffect } from "react";
import { criarMaterial, listarAmbientes, atualizarMaterial, deletarMaterial } from "../../../data/projects";
import { Ambiente, apiFetch } from "../../../data/api";

interface Material {
  id: number;
  ambiente: number;
  item: string;
  descricao: string;
  marca: number | null;
  ambiente_nome: string;
  ambiente_categoria: string;
  status: string;
  motivo: string | null;
  aprovador: number | null;
  data_aprovacao: string | null;
  updated_at: string;
}

interface AmbienteAPI {
  id: number;
  nome: string;
  categoria: string;
  tipo?: number;
}

interface MaterialAPIResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Material[];
}

const CadastrarMaterialView: React.FC = () => {
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [materiaisFiltrados, setMateriaisFiltrados] = useState<Material[]>([]);
  const [itensDisponiveis, setItensDisponiveis] = useState<any[]>([]);
  const [itensFiltrados, setItensFiltrados] = useState<any[]>([]);
  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [nomeMaterial, setNomeMaterial] = useState<string>("");
  const [itemSelecionado, setItemSelecionado] = useState<string>("");
  const [ambienteSelecionado, setAmbienteSelecionado] = useState<string>("");
  const [pesquisaItem, setPesquisaItem] = useState<string>("");
  const [pesquisaMaterial, setPesquisaMaterial] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [carregandoItens, setCarregandoItens] = useState(true);
  const [carregandoAmbientes, setCarregandoAmbientes] = useState(true);
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: 'sucesso' | 'erro' } | null>(null);
  const [erroItens, setErroItens] = useState<string | null>(null);
  
  // Estados para edição
  const [materialEditando, setMaterialEditando] = useState<Material | null>(null);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState<number | null>(null);
  const [carregandoAcao, setCarregandoAcao] = useState<number | null>(null);

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const mostrarMensagem = (texto: string, tipo: 'sucesso' | 'erro') => {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem(null), 5000);
  };

  // Função para mapear dados da API para a interface Ambiente
  const mapearAmbienteAPI = (ambientesAPI: AmbienteAPI[]): Ambiente[] => {
    return ambientesAPI.map(amb => ({
      id: amb.id,
      nome_do_ambiente: amb.nome,
      categoria: amb.categoria,
      tipo: amb.tipo,
    }));
  };

  // Função para filtrar itens baseado na pesquisa
  useEffect(() => {
    if (pesquisaItem.trim() === "") {
      setItensFiltrados(itensDisponiveis);
    } else {
      const termoPesquisa = pesquisaItem.toLowerCase().trim();
      const filtrados = itensDisponiveis.filter(item => {
        const nomeItem = (item.item_label || item.nome || "").toLowerCase();
        return nomeItem.includes(termoPesquisa);
      });
      setItensFiltrados(filtrados);
    }
  }, [pesquisaItem, itensDisponiveis]);

  // Função para filtrar materiais baseado na pesquisa
  useEffect(() => {
    if (pesquisaMaterial.trim() === "") {
      setMateriaisFiltrados(materiais);
      setCurrentPage(1);
    } else {
      const termoPesquisa = pesquisaMaterial.toLowerCase().trim();
      const filtrados = materiais.filter(material => {
        const nomeMaterial = material.descricao.toLowerCase();
        const nomeItem = material.item.toLowerCase();
        const nomeAmbiente = material.ambiente_nome.toLowerCase();
        
        return nomeMaterial.includes(termoPesquisa) ||
               nomeItem.includes(termoPesquisa) ||
               nomeAmbiente.includes(termoPesquisa);
      });
      setMateriaisFiltrados(filtrados);
      setCurrentPage(1);
    }
  }, [pesquisaMaterial, materiais]);

  // Função para carregar TODOS os materiais (com paginação)
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

  // CARREGA AMBIENTES EXISTENTES
  useEffect(() => {
    const carregarAmbientes = async () => {
      try {
        setCarregandoAmbientes(true);
        const ambientesData = await listarAmbientes();
        
        const ambientesMapeados = mapearAmbienteAPI(ambientesData);
        setAmbientes(ambientesMapeados);
        
        if (ambientesMapeados.length > 0) {
          setAmbienteSelecionado(ambientesMapeados[0].id.toString());
        }
      } catch (error) {
        console.error("Erro ao carregar ambientes:", error);
        mostrarMensagem("Erro ao carregar ambientes.", "erro");
      } finally {
        setCarregandoAmbientes(false);
      }
    };
    carregarAmbientes();
  }, []);

  // CARREGA TODOS OS MATERIAIS EXISTENTES
  useEffect(() => {
    const carregarMateriais = async () => {
      try {
        setCarregando(true);
        const todosMateriais = await carregarTodosMateriais();
        setMateriais(todosMateriais);
        setMateriaisFiltrados(todosMateriais);
      } catch (error) {
        console.error("Erro ao carregar materiais:", error);
        mostrarMensagem("Erro ao carregar materiais.", "erro");
      } finally {
        setCarregando(false);
      }
    };
    carregarMateriais();
  }, []);

  // CARREGA ITENS DISPONÍVEIS
  useEffect(() => {
    const carregarItens = async () => {
      try {
        setCarregandoItens(true);
        setErroItens(null);
        
        let todosMateriaisAPI: any[] = [];
        let nextUrl: string | null = "/api/materiais/";
        
        while (nextUrl) {
          const response: any = await apiFetch(nextUrl);
          
          let materiaisDaPagina: any[] = [];
          let nextPageUrl: string | null = null;
          
          if (Array.isArray(response)) {
            materiaisDaPagina = response;
            nextPageUrl = null;
          } else if (response && typeof response === 'object' && Array.isArray(response.results)) {
            materiaisDaPagina = response.results;
            nextPageUrl = response.next ? response.next.replace(/^.*\/\/[^/]+/, '') : null;
          } else {
            throw new Error("Formato de resposta inválido da API");
          }
          
          todosMateriaisAPI = [...todosMateriaisAPI, ...materiaisDaPagina];
          nextUrl = nextPageUrl;
        }

        if (todosMateriaisAPI.length > 0) {
          const todosItens = todosMateriaisAPI
            .map(material => material.item)
            .filter(item => item && item.trim() !== '');
          
          const itensUnicos = todosItens.filter((item, index) => 
            todosItens.indexOf(item) === index
          ).map((item, index) => ({ 
            id: index + 1, 
            nome: item, 
            item_label: item 
          }));
          
          setItensDisponiveis(itensUnicos);
          setItensFiltrados(itensUnicos);
        } else {
          setItensDisponiveis([]);
          setItensFiltrados([]);
          setErroItens("Nenhum material cadastrado no sistema. Crie o primeiro material para gerar a lista de itens.");
        }
      } catch (error) {
        console.error("❌ Erro ao carregar itens dos materiais:", error);
        const errorMessage = error instanceof Error 
          ? `Erro ao carregar itens: ${error.message}`
          : "Erro ao carregar lista de itens. Tente recarregar a página.";
        
        setErroItens(errorMessage);
        setItensDisponiveis([]);
        setItensFiltrados([]);
      } finally {
        setCarregandoItens(false);
      }
    };
    
    carregarItens();
  }, []);

  // CRIA NOVO MATERIAL
  const handleCriarMaterial = async () => {
    if (!nomeMaterial.trim()) {
      mostrarMensagem("Digite o nome do material!", "erro");
      return;
    }
    if (!itemSelecionado) {
      mostrarMensagem("Selecione um item!", "erro");
      return;
    }
    if (!ambienteSelecionado) {
      mostrarMensagem("Selecione um ambiente!", "erro");
      return;
    }

    setLoading(true);
    try {
      const materialData: any = {
        ambiente: parseInt(ambienteSelecionado),
        item: itemSelecionado,
        descricao: nomeMaterial,
        marca: null
      };

      const materialNovo = await criarMaterial(materialData);
      
      // ATUALIZA A LISTA COM O NOVO MATERIAL
      setMateriais(prev => [materialNovo, ...prev]);
      setMateriaisFiltrados(prev => [materialNovo, ...prev]);
      
      // ATUALIZA LISTA DE ITENS SE FOR UM NOVO ITEM
      if (!itensDisponiveis.some(item => item.nome === itemSelecionado || item.item_label === itemSelecionado)) {
        const novoItem = {
          id: itensDisponiveis.length + 1,
          nome: itemSelecionado,
          item_label: itemSelecionado
        };
        setItensDisponiveis(prev => [...prev, novoItem]);
        setItensFiltrados(prev => [...prev, novoItem]);
        
        if (erroItens) {
          setErroItens(null);
        }
      }
      
      // Limpa o formulário
      setNomeMaterial("");
      setItemSelecionado("");
      setPesquisaItem("");
      
      mostrarMensagem("✅ Material criado com sucesso! Já está disponível para uso em todos os projetos.", "sucesso");
    } catch (error: any) {
      console.error("Erro ao criar material:", error);
      
      let errorMessage = "Erro ao criar material";
      if (error?.message?.includes("403") || error?.message?.includes("Forbidden")) {
        errorMessage = "Você não tem permissão para criar materiais. Entre em contato com o administrador.";
      } else if (error?.message) {
        errorMessage = `Erro: ${error.message}`;
      }
      
      mostrarMensagem(errorMessage, "erro");
    } finally {
      setLoading(false);
    }
  };

  // EDITAR MATERIAL
  const handleEditarMaterial = async () => {
    if (!materialEditando) return;
    
    if (!materialEditando.descricao.trim()) {
      mostrarMensagem("Digite o nome do material!", "erro");
      return;
    }
    if (!materialEditando.item) {
      mostrarMensagem("Selecione um item!", "erro");
      return;
    }

    setCarregandoAcao(materialEditando.id);
    try {
      const materialAtualizado = await atualizarMaterial(materialEditando.id, {
        item: materialEditando.item,
        descricao: materialEditando.descricao,
      });

      // Atualiza a lista local mantendo os dados do backend
      setMateriais(prev => prev.map(m => 
        m.id === materialEditando.id ? materialAtualizado : m
      ));
      setMateriaisFiltrados(prev => prev.map(m => 
        m.id === materialEditando.id ? materialAtualizado : m
      ));

      setMaterialEditando(null);
      mostrarMensagem("✅ Material atualizado com sucesso!", "sucesso");
    } catch (error: any) {
      console.error("Erro ao editar material:", error);
      mostrarMensagem("Erro ao editar material.", "erro");
    } finally {
      setCarregandoAcao(null);
    }
  };

  // EXCLUIR MATERIAL
  const handleExcluirMaterial = async (materialId: number) => {
    setCarregandoAcao(materialId);
    setConfirmandoExclusao(null);
    
    try {
      await deletarMaterial(materialId);
      
      // Remove da lista local
      setMateriais(prev => prev.filter(m => m.id !== materialId));
      setMateriaisFiltrados(prev => prev.filter(m => m.id !== materialId));
      
      mostrarMensagem("✅ Material excluído com sucesso!", "sucesso");
    } catch (error: any) {
      console.error("Erro ao excluir material:", error);
      mostrarMensagem("Erro ao excluir material.", "erro");
    } finally {
      setCarregandoAcao(null);
    }
  };

  // INICIAR EDIÇÃO
  const iniciarEdicao = (material: Material) => {
    setMaterialEditando({...material});
  };

  // CANCELAR EDIÇÃO
  const cancelarEdicao = () => {
    setMaterialEditando(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCriarMaterial();
    }
  };

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

  return (
    <div>
      <div className="content-header mb-4">
        <h1 className="h4 fw-bold">Cadastrar Material</h1>
        <p className="text-muted mb-0">
          Materiais cadastrados aqui ficam disponíveis para uso em todos os projetos
        </p>
      </div>

      {/* Mensagens de feedback */}
      {mensagem && (
        <div className={`alert ${mensagem.tipo === 'sucesso' ? 'alert-success' : 'alert-danger'} alert-dismissible fade show mb-4`}>
          {mensagem.texto}
          <button type="button" className="btn-close" onClick={() => setMensagem(null)}></button>
        </div>
      )}

      {/* FORMULÁRIO DE CRIAÇÃO */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header">
          <h5 className="card-title mb-0">Novo Material</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <label className="form-label">Item</label>
              {carregandoItens ? (
                <div className="text-muted small">Carregando itens...</div>
              ) : erroItens ? (
                <div className="alert alert-danger py-2">
                  <small>
                    <i className="bi bi-exclamation-triangle me-1"></i>
                    {erroItens}
                  </small>
                </div>
              ) : (
                <div>
                  <div className="input-group mb-2">
                    <span className="input-group-text">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Pesquisar item..."
                      value={pesquisaItem}
                      onChange={(e) => setPesquisaItem(e.target.value)}
                    />
                    {pesquisaItem && (
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setPesquisaItem("")}
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    )}
                  </div>
                  
                  <select
                    className="form-select"
                    value={itemSelecionado}
                    onChange={(e) => setItemSelecionado(e.target.value)}
                    disabled={itensFiltrados.length === 0}
                  >
                    <option value="">Selecione um item</option>
                    {itensFiltrados.length === 0 && pesquisaItem ? (
                      <option value="" disabled>
                        Nenhum item encontrado para "{pesquisaItem}"
                      </option>
                    ) : (
                      itensFiltrados.map((item) => (
                        <option key={item.id || item.nome} value={item.item_label || item.nome}>
                          {item.item_label || item.nome}
                        </option>
                      ))
                    )}
                  </select>
                  
                  {pesquisaItem && (
                    <div className="mt-1">
                      <small className="text-muted">
                        {itensFiltrados.length} item(s) encontrado(s)
                      </small>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="col-md-4">
              <label className="form-label">Nome do Material</label>
              <input
                type="text"
                placeholder="Ex: Porcelanato esmaltado 60x60cm"
                className="form-control"
                value={nomeMaterial}
                onChange={(e) => setNomeMaterial(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Ambiente</label>
              {carregandoAmbientes ? (
                <div className="text-muted small">Carregando ambientes...</div>
              ) : (
                <select
                  className="form-select"
                  value={ambienteSelecionado}
                  onChange={(e) => setAmbienteSelecionado(e.target.value)}
                >
                  <option value="">Selecione um ambiente</option>
                  {ambientes.map((ambiente) => (
                    <option key={ambiente.id} value={ambiente.id}>
                      {ambiente.nome_do_ambiente}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="d-flex justify-content-end mt-3">
            <button
              className="btn btn-primary px-4"
              onClick={handleCriarMaterial}
              disabled={loading || !nomeMaterial.trim() || !itemSelecionado || !ambienteSelecionado || !!erroItens}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Salvando...
                </>
              ) : (
                "Criar Material"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* LISTA DE TODOS OS MATERIAIS */}
      <div className="card border-0 shadow-sm">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">
              Materiais Cadastrados
            </h5>
            <span className="badge bg-secondary">{materiaisFiltrados.length} material(s)</span>
          </div>
        </div>
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Pesquisar materiais por nome, item ou ambiente..."
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
                    {materiaisFiltrados.length} de {materiais.length} material(s) encontrado(s)
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
              <p className="mt-2 text-muted">Carregando materiais...</p>
            </div>
          ) : materiaisFiltrados.length === 0 ? (
            <div className="alert alert-info mb-0">
              <i className="bi bi-info-circle me-2"></i>
              {pesquisaMaterial ? (
                <>Nenhum material encontrado para "<strong>{pesquisaMaterial}</strong>"</>
              ) : (
                "Nenhum material cadastrado ainda. Comece criando o primeiro material usando o formulário acima."
              )}
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Item</th>
                      <th>Nome do Material</th>
                      <th>Ambiente</th>
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
                              <select
                                className="form-select form-select-sm"
                                value={materialEditando.item}
                                onChange={(e) => setMaterialEditando({
                                  ...materialEditando,
                                  item: e.target.value
                                })}
                              >
                                <option value="">Selecione um item</option>
                                {itensDisponiveis.map((item) => (
                                  <option key={item.id} value={item.item_label || item.nome}>
                                    {item.item_label || item.nome}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={materialEditando.descricao}
                                onChange={(e) => setMaterialEditando({
                                  ...materialEditando,
                                  descricao: e.target.value
                                })}
                              />
                            </td>
                            <td>
                              <span className="badge bg-secondary">
                                {material.ambiente_nome}
                              </span>
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
                              <span className=" fw-normal">
                                {material.item}
                              </span>
                            </td>
                            <td className="fw-semibold">{material.descricao}</td>
                            <td>
                              <span className="badge bg-secondary">
                                {material.ambiente_nome}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex gap-1">
                                <button
                                  className="btn btn-primary btn-sm"
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
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <nav className="mt-3">
                  <ul className="pagination justify-content-center mb-0">
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
      </div>
    </div>
  );
};

export default CadastrarMaterialView;