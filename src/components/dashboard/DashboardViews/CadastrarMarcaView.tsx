import React, { useState, useEffect } from "react";
import { getMarcasDescricao, salvarMarcaDescricao, MaterialMarca, apiFetch } from "../../../data/api";

const CadastrarMarcaView: React.FC = () => {
  const [formData, setFormData] = useState<{
    id: number;
    material: string;
    marcas: string;
  }>({
    id: 0,
    material: "",
    marcas: "",
  });

  const [marcasCadastradas, setMarcasCadastradas] = useState<MaterialMarca[]>([]);
  const [todosMateriais, setTodosMateriais] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState(false);
  const [carregandoMateriais, setCarregandoMateriais] = useState(true);

  // Estados de pesquisa
  const [searchDropdown, setSearchDropdown] = useState("");
  const [searchTable, setSearchTable] = useState("");

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Mensagem de feedback
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: "sucesso" | "erro" } | null>(null);

  const mostrarMensagem = (texto: string, tipo: "sucesso" | "erro") => {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem(null), 5000);
  };

  // 🔹 Função para carregar TODOS os materiais do endpoint /api/materiais/
  const carregarTodosMateriais = async () => {
    try {
      let todosMateriais: any[] = [];
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
        } else if (response && typeof response === 'object' && response.data) {
          materiaisDaPagina = response.data;
          nextPageUrl = response.next ? response.next.replace(/^.*\/\/[^/]+/, '') : null;
        } else {
          console.warn("⚠️ Formato de resposta inesperado:", response);
          break;
        }
        
        todosMateriais = [...todosMateriais, ...materiaisDaPagina];
        nextUrl = nextPageUrl;
        
        if (todosMateriais.length >= 2000) {
          console.warn("⚠️ Limite de 2000 materiais atingido");
          break;
        }
      }

      // Extrair lista única de descrições de materiais (campo 'descricao')
      const materiaisSet = new Set(
        todosMateriais
          .map(m => m.descricao)
          .filter(Boolean) // Remove valores vazios/null
          .map(desc => desc.trim()) // Remove espaços extras
      );
      
      console.log("✅ Total de materiais únicos carregados:", materiaisSet.size);
      return Array.from(materiaisSet).sort();
    } catch (error) {
      console.error("❌ Erro ao listar materiais:", error);
      return [];
    }
  };

  // 🔹 Função para carregar TODAS as marcas já cadastradas
  const carregarTodasMarcas = async () => {
    try {
      let todasMarcas: MaterialMarca[] = [];
      let nextUrl: string | null = "/api/marcas-descricao/";

      while (nextUrl) {
        const response: any = await apiFetch(nextUrl);
        
        let marcasDaPagina: MaterialMarca[] = [];
        let nextPageUrl: string | null = null;
        
        if (Array.isArray(response)) {
          marcasDaPagina = response;
          nextPageUrl = null;
        } else if (response && typeof response === 'object' && Array.isArray(response.results)) {
          marcasDaPagina = response.results;
          nextPageUrl = response.next ? response.next.replace(/^.*\/\/[^/]+/, '') : null;
        } else if (response && typeof response === 'object' && response.data) {
          marcasDaPagina = response.data;
          nextPageUrl = response.next ? response.next.replace(/^.*\/\/[^/]+/, '') : null;
        } else {
          console.warn("⚠️ Formato de resposta inesperado:", response);
          break;
        }
        
        todasMarcas = [...todasMarcas, ...marcasDaPagina];
        nextUrl = nextPageUrl;
        
        if (todasMarcas.length >= 1000) {
          console.warn("⚠️ Limite de 1000 marcas atingido");
          break;
        }
      }

      console.log("✅ Total de marcas cadastradas:", todasMarcas.length);
      return todasMarcas;
    } catch (error) {
      console.error("❌ Erro ao listar marcas:", error);
      return [];
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregandoMateriais(true);
        
        // Carregar em paralelo: todos os materiais E marcas cadastradas
        const [materiais, marcas] = await Promise.all([
          carregarTodosMateriais(),
          carregarTodasMarcas()
        ]);
        
        setTodosMateriais(materiais);
        setMarcasCadastradas(marcas);

        // Calcular paginação para a tabela de marcas cadastradas
        const itemsPerPage = 10;
        setTotalPages(Math.ceil(marcas.length / itemsPerPage));
      } catch (error) {
        console.error("❌ Erro ao carregar dados:", error);
        mostrarMensagem("Erro ao carregar dados", "erro");
      } finally {
        setCarregandoMateriais(false);
      }
    }
    carregarDados();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.material) {
      mostrarMensagem("Selecione um material!", "erro");
      return;
    }

    if (!formData.marcas.trim()) {
      mostrarMensagem("Digite o nome da marca!", "erro");
      return;
    }

    setLoading(true);

    try {
      await salvarMarcaDescricao({
        material: formData.material,
        marcas: formData.marcas,
      });
      
      mostrarMensagem(
        editando ? "Marca atualizada com sucesso!" : "Marca criada com sucesso!", 
        "sucesso"
      );

      setFormData({ id: 0, material: "", marcas: "" });
      setEditando(false);

      // Recarregar lista de marcas cadastradas
      const marcas = await carregarTodasMarcas();
      setMarcasCadastradas(marcas);
      
      // Recalcular paginação
      const itemsPerPage = 10;
      setTotalPages(Math.ceil(marcas.length / itemsPerPage));
    } catch (error: any) {
      console.error("Erro:", error);
      if (error.message.includes('400')) {
        mostrarMensagem("Erro: Formato de dados inválido.", "erro");
      } else {
        mostrarMensagem("Erro ao salvar marca.", "erro");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (marca: MaterialMarca) => {
    setFormData({
      id: marca.id,
      material: marca.material,
      marcas: marca.marcas,
    });
    setEditando(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setFormData({ id: 0, material: "", marcas: "" });
    setEditando(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta marca?")) {
      try {
        await apiFetch(`/api/marcas-descricao/${id}/`, {
          method: "DELETE",
        });
        
        setMarcasCadastradas((prev) => prev.filter((m) => m.id !== id));
        mostrarMensagem("Marca excluída com sucesso!", "sucesso");
        
        // Recalcular paginação após exclusão
        const itemsPerPage = 10;
        const novoTotal = marcasCadastradas.length - 1;
        setTotalPages(Math.ceil(novoTotal / itemsPerPage));
        
        // Ajustar página atual se necessário
        if (currentPage > Math.ceil(novoTotal / itemsPerPage)) {
          setCurrentPage(Math.max(1, Math.ceil(novoTotal / itemsPerPage)));
        }
      } catch (err) {
        console.error("❌ Erro ao excluir:", err);
        mostrarMensagem("Erro ao excluir marca.", "erro");
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  // Lógica de paginação para a tabela de marcas cadastradas
  const itemsPerPage = 10;
  
  // Filtrar marcas com base na pesquisa
  const marcasFiltradas = marcasCadastradas.filter(marca => 
    marca.material.toLowerCase().includes(searchTable.toLowerCase()) ||
    marca.marcas.toLowerCase().includes(searchTable.toLowerCase())
  );
  
  // Recalcular paginação após filtro
  const totalPagesFiltered = Math.ceil(marcasFiltradas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMarcas = marcasFiltradas.slice(startIndex, startIndex + itemsPerPage);

  // Filtrar materiais do dropdown com base na pesquisa
  const materiaisFiltrados = todosMateriais.filter(material =>
    material.toLowerCase().includes(searchDropdown.toLowerCase())
  );

  // Resetar página quando pesquisa mudar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTable]);

  return (
    <div className="">
      <div className="content-header">
        <h1>{editando ? "Editar Marca" : "Cadastrar nova marca"}</h1>
      </div>

      {/* Mensagens de feedback */}
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

      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Material</label>
            {editando ? (
              <>
                <input
                  type="text"
                  name="material"
                  className="form-control"
                  value={formData.material}
                  disabled
                />
                <div className="form-text">
                  <small>O material não pode ser alterado durante a edição</small>
                </div>
              </>
            ) : (
              <>
                {carregandoMateriais ? (
                  <div className="text-muted small">Carregando materiais...</div>
                ) : (
                  <div>
                    <div className="input-group mb-2">
                      <span className="input-group-text">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Pesquisar material..."
                        value={searchDropdown}
                        onChange={(e) => setSearchDropdown(e.target.value)}
                      />
                      {searchDropdown && (
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => setSearchDropdown("")}
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      )}
                    </div>
                    
                    <select
                      name="material"
                      className="form-select"
                      value={formData.material}
                      onChange={handleInputChange}
                      disabled={materiaisFiltrados.length === 0}
                      required
                    >
                      <option value="">Selecione um material</option>
                      {materiaisFiltrados.length === 0 && searchDropdown ? (
                        <option value="" disabled>
                          Nenhum material encontrado para "{searchDropdown}"
                        </option>
                      ) : (
                        materiaisFiltrados.map((material, index) => (
                          <option key={index} value={material}>
                            {material}
                          </option>
                        ))
                      )}
                    </select>
                    
                    {searchDropdown && (
                      <div className="mt-1">
                        <small className="text-muted">
                          {materiaisFiltrados.length} material(is) encontrado(s)
                        </small>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="col-md-6">
            <label className="form-label">Marcas</label>
            <input
              type="text"
              name="marcas"
              className="form-control"
              value={formData.marcas}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              required
              placeholder="Digite as marcas (separadas por vírgula)"
              disabled={loading}
            />
            <div className="form-text">
              <small>
                <strong>Exemplo:</strong> Portobello, Eliane, Ceusa
              </small>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end">
          {editando && (
            <button
              type="button"
              className="btn btn-secondary me-2 px-4"
              onClick={handleCancelEdit}
              disabled={loading}
            >
              Cancelar Edição
            </button>
          )}
          <button 
            className="btn btn-primary px-4" 
            type="submit" 
            disabled={loading || carregandoMateriais}
          >
            {loading 
              ? (editando ? "Salvando..." : "Criando...") 
              : (editando ? "Editar Marca" : "Criar Marca")}
          </button>
        </div>
      </form>

      <h2 className="content-header bold">Lista de marcas</h2>
      
      {/* Barra de pesquisa da tabela */}
      <div className="mb-3">
        <div className="input-group">
        <span className="input-group-text">
          <i className="bi bi-search"></i>
        </span>
        <input
          type="text"
          className="form-control"
          placeholder="Pesquisar marca..."
          value={searchTable}
          onChange={(e) => setSearchTable(e.target.value)}
        />
        {searchTable && (
          <small className="text-muted">
            Mostrando {marcasFiltradas.length} de {marcasCadastradas.length} marcas
          </small>
        )}
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Material</th>
            <th>Marcas</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {carregandoMateriais ? (
            <tr>
              <td colSpan={4} className="text-center">
                <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                Carregando dados...
              </td>
            </tr>
          ) : paginatedMarcas.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center text-muted">
                {searchTable ? "Nenhuma marca encontrada" : "Nenhuma marca cadastrada"}
              </td>
            </tr>
          ) : (
            paginatedMarcas.map((marca) => (
              <tr key={marca.marcas}>
                <td className="fw-semibold">
                  {marca.material}
                </td>
                <td>{marca.marcas}</td>
                <td>
                  <button 
                    className="btn btn-sm btn-primary me-2" 
                    onClick={() => handleEdit(marca)}
                  >
                    Editar
                  </button>
                  <button 
                    className="btn btn-sm btn-secondary" 
                    onClick={() => handleDelete(marca.id)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Paginação */}
      {totalPagesFiltered > 1 && (
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
                Página {currentPage} de {totalPagesFiltered}
              </span>
            </li>
            <li className={`page-item ${currentPage === totalPagesFiltered ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => {
                  if (currentPage < totalPagesFiltered) {
                    setCurrentPage(prev => prev + 1);
                  }
                }}
                disabled={currentPage === totalPagesFiltered}
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

export default CadastrarMarcaView;