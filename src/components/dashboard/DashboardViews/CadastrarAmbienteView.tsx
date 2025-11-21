import React, { useState, useEffect } from "react";
import { 
  listarAmbientes, 
  criarAmbiente, 
  getCategoriasAmbiente, 
  Ambiente 
} from "../../../data/api";

const CadastrarAmbienteView: React.FC = () => {
  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [novoAmbiente, setNovoAmbiente] = useState({ 
    nome_do_ambiente: "", 
    categoria: "" 
  });
  const [loading, setLoading] = useState(false);
  const [carregandoAmbientes, setCarregandoAmbientes] = useState(true);
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: 'sucesso' | 'erro' } | null>(null);

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    carregarAmbientes();
  }, []);

  const carregarAmbientes = async () => {
    try {
      setCarregandoAmbientes(true);
      const [listaAmbientes, listaCategorias] = await Promise.all([
        listarAmbientes(),
        getCategoriasAmbiente()
      ]);
      setAmbientes(listaAmbientes);
      setCategorias(listaCategorias);
    } catch (err) {
      console.error("❌ Erro ao carregar dados:", err);
      setCategorias(["PRIVADA", "COMUM", "PRIVATIVA"]);
      setAmbientes([]);
    } finally {
      setCarregandoAmbientes(false);
    }
  };

  const mostrarMensagem = (texto: string, tipo: 'sucesso' | 'erro') => {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem(null), 5000);
  };

  const handleCriarAmbiente = async () => {
    if (!novoAmbiente.nome_do_ambiente || !novoAmbiente.categoria) {
      mostrarMensagem("Preencha o nome e a categoria do ambiente!", "erro");
      return;
    }

    setLoading(true);
    try {
      await criarAmbiente({
        nome_do_ambiente: novoAmbiente.nome_do_ambiente,
        categoria: novoAmbiente.categoria
      });
      await carregarAmbientes();
      setNovoAmbiente({ nome_do_ambiente: "", categoria: "" });
      mostrarMensagem("Ambiente criado com sucesso!", "sucesso");
    } catch (error) {
      console.error("❌ Erro ao criar ambiente:", error);
      mostrarMensagem("Erro ao criar ambiente.", "erro");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setNovoAmbiente(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Lógica de paginação
  const totalItems = ambientes.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAmbientes = ambientes.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCriarAmbiente();
    }
  };

  return (
    <div>
      <div className="content-header mb-4">
        <h1 className="h4 fw-bold">Cadastrar Ambiente</h1>
      </div>

      {/* Mensagens de feedback */}
      {mensagem && (
        <div className={`alert ${mensagem.tipo === 'sucesso' ? 'alert-success' : 'alert-danger'} alert-dismissible fade show mb-4`}>
          {mensagem.texto}
          <button type="button" className="btn-close" onClick={() => setMensagem(null)}></button>
        </div>
      )}

      {/* Formulário */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header">
          <h5 className="card-title mb-0">Novo Ambiente</h5>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Nome do Ambiente</label>
              <input
                type="text"
                placeholder="Digite o nome do ambiente"
                className="form-control"
                value={novoAmbiente.nome_do_ambiente}
                onChange={(e) => handleInputChange("nome_do_ambiente", e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Categoria</label>
              <select
                className="form-select"
                value={novoAmbiente.categoria}
                onChange={(e) => handleInputChange("categoria", e.target.value)}
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
            <button
              className="btn btn-primary px-4"
              onClick={handleCriarAmbiente}
              disabled={loading || !novoAmbiente.nome_do_ambiente || !novoAmbiente.categoria}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Salvando...
                </>
              ) : (
                "Criar Ambiente"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Lista de ambientes existentes */}
      <div className="card border-0 shadow-sm">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">Ambientes Cadastrados</h5>
            <span className="badge bg-secondary">{ambientes.length} ambiente(s)</span>
          </div>
        </div>
        <div className="card-body">
          {carregandoAmbientes ? (
            <div className="text-center p-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
              <p className="mt-2 text-muted">Carregando ambientes...</p>
            </div>
          ) : ambientes.length === 0 ? (
            <div className="alert alert-info mb-0">
              <i className="bi bi-info-circle me-2"></i>
              Nenhum ambiente cadastrado ainda.
            </div>
          ) : (
            <>
              <div className="list-group">
                {paginatedAmbientes.map((ambiente) => (
                  <div key={ambiente.id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{ambiente.nome_do_ambiente}</strong>
                        <span className="text-muted ms-2">({ambiente.categoria})</span>
                      </div>
                      <div>
                        <small className="text-muted me-3">ID: {ambiente.id}</small>
                        <span className="badge bg-success">Ativo</span>
                      </div>
                    </div>
                  </div>
                ))}
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

export default CadastrarAmbienteView;