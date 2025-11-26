import React, { useState, useEffect } from "react";
import { 
  listarAmbientes, 
  criarAmbiente, 
  atualizarAmbiente,
  excluirAmbiente,
  getCategoriasAmbiente, 
  Ambiente 
} from "../../../data/api";

const CadastrarAmbienteView: React.FC = () => {
  const [formData, setFormData] = useState<{
    id: number;
    nome_do_ambiente: string;
    categoria: string;
  }>({
    id: 0,
    nome_do_ambiente: "",
    categoria: "",
  });

  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState(false);

  // Estado de pesquisa
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

  // Carregar ambientes da página atual
  useEffect(() => {
    async function carregarDados() {
      try {
        const [listaAmbientes, listaCategorias] = await Promise.all([
          listarAmbientes(),
          getCategoriasAmbiente()
        ]);
        
        setAmbientes(listaAmbientes);
        setCategorias(listaCategorias);

        // Calcular paginação
        const itemsPerPage = 10;
        setTotalPages(Math.ceil(listaAmbientes.length / itemsPerPage));
      } catch (err) {
        console.error("❌ Erro ao carregar dados:", err);
        mostrarMensagem("Erro ao carregar ambientes", "erro");
        setCategorias(["COMUM", "PRIVATIVA"]);
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
    setLoading(true);

    try {
      if (editando) {
        await atualizarAmbiente(formData.id, {
          nome_do_ambiente: formData.nome_do_ambiente,
          categoria: formData.categoria,
        });
        mostrarMensagem("Ambiente atualizado com sucesso!", "sucesso");
      } else {
        await criarAmbiente({
          nome_do_ambiente: formData.nome_do_ambiente,
          categoria: formData.categoria,
        });
        mostrarMensagem("Ambiente criado com sucesso!", "sucesso");
      }

      setFormData({ id: 0, nome_do_ambiente: "", categoria: "" });
      setEditando(false);

      // Recarregar lista
      const listaAmbientes = await listarAmbientes();
      setAmbientes(listaAmbientes);
    } catch (err: any) {
      console.error("Erro:", err);
      mostrarMensagem("Erro ao salvar ambiente.", "erro");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ambiente: Ambiente) => {
    setFormData({
      id: ambiente.id,
      nome_do_ambiente: ambiente.nome_do_ambiente,
      categoria: ambiente.categoria,
    });
    setEditando(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setFormData({ id: 0, nome_do_ambiente: "", categoria: "" });
    setEditando(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este ambiente?")) {
      try {
        await excluirAmbiente(id);
        setAmbientes((prev) => prev.filter((a) => a.id !== id));
        mostrarMensagem("Ambiente excluído com sucesso!", "sucesso");
      } catch (err) {
        console.error("❌ Erro ao excluir:", err);
        mostrarMensagem("Erro ao excluir ambiente.", "erro");
      }
    }
  };

  // Filtrar ambientes com base na pesquisa
  const ambientesFiltrados = ambientes.filter(ambiente => 
    ambiente.nome_do_ambiente.toLowerCase().includes(searchTable.toLowerCase()) ||
    ambiente.categoria.toLowerCase().includes(searchTable.toLowerCase())
  );

  // Lógica de paginação
  const itemsPerPage = 10;
  const totalPagesFiltered = Math.ceil(ambientesFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAmbientes = ambientesFiltrados.slice(startIndex, startIndex + itemsPerPage);

  // Resetar página quando pesquisa mudar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTable]);

  return (
    <div className="">
      <div className="content-header">
        <h1>{editando ? "Editar Ambiente" : "Cadastrar novo ambiente"}</h1>
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
            <label className="form-label">Nome do Ambiente</label>
            <input
              type="text"
              name="nome_do_ambiente"
              className="form-control"
              value={formData.nome_do_ambiente}
              onChange={handleInputChange}
              required
              placeholder="Digite o nome do ambiente"
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Categoria</label>
            <select
              name="categoria"
              className="form-control"
              value={formData.categoria}
              onChange={handleInputChange}
              required
            >
              <option value="">Selecione a categoria</option>
              {categorias.map((categoria, index) => (
                <option key={index} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
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
            disabled={loading}
          >
            {loading 
              ? (editando ? "Salvando..." : "Criando...") 
              : (editando ? "Editar Ambiente" : "Criar Ambiente")}
          </button>
        </div>
      </form>

      <h2 className="content-header bold">Lista de ambientes</h2>
      
      {/* Barra de pesquisa */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Pesquisar por nome ou categoria..."
              value={searchTable}
              onChange={(e) => setSearchTable(e.target.value)}
            />
            {searchTable && (
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => setSearchTable("")}
              >
                <i className="bi bi-x"></i>
              </button>
            )}
          </div>
        </div>
        <div className="col-md-6">
          {searchTable && (
            <div className="d-flex align-items-center h-100">
              <small className="text-muted">
                {ambientesFiltrados.length} de {ambientes.length} ambiente(s) encontrado(s)
              </small>
            </div>
          )}
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome do Ambiente</th>
            <th>Categoria</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {paginatedAmbientes.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center text-muted">
                {searchTable ? (
                  <>Nenhum ambiente encontrado para "<strong>{searchTable}</strong>"</>
                ) : (
                  "Nenhum ambiente cadastrado"
                )}
              </td>
            </tr>
          ) : (
            paginatedAmbientes.map((ambiente) => (
              <tr key={ambiente.id}>
                <td>{ambiente.id}</td>
                <td>{ambiente.nome_do_ambiente}</td>
                <td>
                  <span className={`badge ${
                    ambiente.categoria === "COMUM" 
                      ? "bg-dark" 
                      : "bg-secondary"
                  }`}>
                    {ambiente.categoria}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn btn-sm btn-primary me-2" 
                    onClick={() => handleEdit(ambiente)}
                  >
                    Editar
                  </button>
                  <button 
                    className="btn btn-sm btn-secondary" 
                    onClick={() => handleDelete(ambiente.id)}
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

export default CadastrarAmbienteView;