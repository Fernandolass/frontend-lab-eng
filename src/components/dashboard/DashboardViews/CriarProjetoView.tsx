import React, { useState, useEffect } from "react";
import { listarAmbientes, criarProjeto } from "../../../data/projects";
import { apiFetch } from "../../../data/api";

interface CriarProjetoViewProps {
  onNext: (projetoId: number) => void;
}

interface AmbienteInfo {
  id: number;
  nome: string;
  categoria?: string;
  tipo?: number | null;
}

const CriarProjetoView: React.FC<CriarProjetoViewProps> = ({ onNext }) => {
  const [formData, setFormData] = useState({
    nomeProjeto: "",
    tipoProjeto: "",
    descricao: "",
    dataEntrega: "",
  });
  const [ambientesLista, setAmbientesLista] = useState<AmbienteInfo[]>([]);
  const [ambientesSelecionados, setAmbientesSelecionados] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: 'sucesso' | 'erro' } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const carregarAmbientes = async () => {
      try {
        const ambientes = await listarAmbientes();
        const ambientesComTipo = ambientes.map((a: any) => ({
          id: a.id,
          nome: a.nome,
          categoria: a.categoria,
          tipo: a.tipo ?? 1,
        }));
        setAmbientesLista(ambientesComTipo);
      } catch {
        mostrarMensagem("Erro ao carregar ambientes", "erro");
      }
    };
    carregarAmbientes();
  }, []);

  const mostrarMensagem = (texto: string, tipo: 'sucesso' | 'erro') => {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem(null), 5000);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleAmbiente = (id: number) => {
    setAmbientesSelecionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!formData.nomeProjeto.trim()) {
      mostrarMensagem("Preencha o nome do projeto!", "erro");
      return;
    }

    if (!formData.tipoProjeto) {
      mostrarMensagem("Selecione o tipo do projeto!", "erro");
      return;
    }

    if (!formData.dataEntrega) {
      mostrarMensagem("Selecione a data de entrega!", "erro");
      return;
    }

    setLoading(true);
    try {
      const existentes = await apiFetch(`/api/projetos/?search=${formData.nomeProjeto}`);

      if (
        existentes.results &&
        existentes.results.some((p: any) => p.nome_do_projeto === formData.nomeProjeto)
      ) {
        mostrarMensagem("Já existe um projeto com esse nome!", "erro");
        setLoading(false);
        return;
      }

      const projeto = await criarProjeto({
        nome_do_projeto: formData.nomeProjeto,
        tipo_do_projeto: formData.tipoProjeto,
        data_entrega: formData.dataEntrega,
        descricao: formData.descricao,
        ambientes_ids: ambientesSelecionados,
      });

      mostrarMensagem("Projeto criado com sucesso!", "sucesso");
      setTimeout(() => {
        onNext(projeto.id);
      }, 1500);

    } catch (err: any) {
      console.error("Erro ao criar projeto:", err);
      
      let errorMessage = "Erro ao criar projeto";
      
      if (err?.message?.includes("403") || err?.message?.includes("Forbidden")) {
        errorMessage = "Você não tem permissão para criar projetos. Entre em contato com o administrador.";
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

  // Lógica de paginação
  const totalItems = ambientesLista.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAmbientes = ambientesLista.slice(startIndex, startIndex + itemsPerPage);

  // Garantir página válida caso a lista mude
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  return (
    <div className="">
      <div className="content-header">
        <h1>Criar novo projeto</h1>
      </div>

       {/* Mensagens de feedback */}
      {mensagem && (
        <div className={`alert ${mensagem.tipo === 'sucesso' ? 'alert-success' : 'alert-danger'} alert-dismissible fade show mb-4`}>
          {mensagem.texto}
          <button type="button" className="btn-close" onClick={() => setMensagem(null)}></button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Nome do Projeto</label>
            <input
              type="text"
              name="nomeProjeto"
              className="form-control"
              value={formData.nomeProjeto}
              placeholder="Digite o nome do seu projeto"
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Tipo do Projeto</label>
            <select
              name="tipoProjeto"
              className="form-control dropdown-toggle"
              value={formData.tipoProjeto}
              onChange={handleInputChange}
              required
            >
              <option className="dropdown-item" value="">Selecione</option>
              <option className="dropdown-item" value="RESIDENCIAL">Residencial</option>
              <option className="dropdown-item" value="COMERCIAL">Comercial</option>
              <option className="dropdown-item" value="INDUSTRIAL">Industrial</option>
            </select>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Data de Entrega</label>
            <input
              type="date"
              name="dataEntrega"
              className="form-control"
              value={formData.dataEntrega}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Descrição</label>
          <textarea
            name="descricao"
            placeholder="Digite informações adicionais sobre o projeto"
            className="form-control"
            rows={3}
            value={formData.descricao}
            onChange={handleInputChange}
          />
        </div>

        <div className="mb-3">
          <h5>Selecione os Ambientes para este Projeto:</h5>

          <div className="list-group mb-3">
            {paginatedAmbientes.map((a) => (
              <label key={a.id} className="list-group-item">
                <input
                  type="checkbox"
                  checked={ambientesSelecionados.includes(a.id)}
                  onChange={() => toggleAmbiente(a.id)}
                  className="form-check-input me-2"
                />
                {a.nome}{" "}
                <span className="text-muted">
                  (
                  {a.tipo === 1
                    ? "Área Privativa"
                    : a.tipo === 2
                    ? "Área Comum"
                    : "Área Privativa"}
                  )
                </span>
              </label>
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <nav>
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    type="button"   // 👈 evita submit
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
        </div>

        <div className="d-flex justify-content-end">
              <button 
                className="btn btn-primary px-4" 
                type="submit" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Criando...
                  </>
                ) : (
                  "Criar Projeto"
                )}
              </button>
            </div>
      </form>
    </div>
  );
};

export default CriarProjetoView;