import React, { useState, useEffect } from "react";
import { listarAmbientes, criarProjeto, criarAmbiente } from "../../../data/projects";
import { apiFetch } from "../../../data/api";

interface CriarProjetoViewProps {
  onNext: (projetoId: number) => void;
  modelos?: any[];
}

interface AmbienteInfo {
  id: number;
  nome: string;
  categoria?: string;
  tipo?: number | null;
}

const CriarProjetoView: React.FC<CriarProjetoViewProps> = ({ onNext, modelos = [] }) => {
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

  // Estados para criação de ambiente
  const [novoAmbiente, setNovoAmbiente] = useState({
    nome: "",
    tipo: "",
  });
  const [criandoAmbiente, setCriandoAmbiente] = useState(false);
  
  // Estados para funcionalidade de modelo
  const [usandoModelo, setUsandoModelo] = useState(false);
  const [modeloSelecionado, setModeloSelecionado] = useState<any>(null);
  const [carregandoModelo, setCarregandoModelo] = useState(false);

  // Paginação
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
      } catch (err) {
        console.error("Erro ao carregar ambientes:", err);
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
    
    // Validações da segunda tela
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

      mostrarMensagem("Projeto criado com sucesso! Status: Pendente de aprovação", "sucesso");

      setTimeout(() => {
        onNext(projeto.id);
      }, 1500);

    } catch (err: any) {
      console.error("Erro ao criar projeto:", err);

      let errorMessage = "Erro ao criar projeto";

      // Analisa erros de autorização (da segunda tela)
      if (err?.message?.includes("403") || err?.message?.includes("Forbidden")) {
        errorMessage = "Você não tem permissão para criar projetos.";
      } 
      else if (err?.message) {
        const shortMessage =
          err.message.length > 100 ? err.message.substring(0, 100) + "..." : err.message;
        errorMessage = `Erro: ${shortMessage}`;
      }

      mostrarMensagem(errorMessage, "erro");
    } finally {
      setLoading(false);
    }
  };

  const handleCriarAmbiente = async () => {
    if (!novoAmbiente.nome || !novoAmbiente.tipo) {
      mostrarMensagem("Informe o nome e o tipo do ambiente!", "erro");
      return;
    }

    try {
      const ambienteCriado = await criarAmbiente({
        projeto: 0,
        nome_do_ambiente: novoAmbiente.nome,
        tipo: Number(novoAmbiente.tipo),
      });

      const ambienteFormatado: AmbienteInfo = {
        id: ambienteCriado.id,
        nome: ambienteCriado.nome_do_ambiente || novoAmbiente.nome,
        tipo: ambienteCriado.tipo ?? Number(novoAmbiente.tipo),
      };

      setAmbientesLista((prev) => [...prev, ambienteFormatado]);
      mostrarMensagem("Ambiente criado com sucesso!", "sucesso");
      setNovoAmbiente({ nome: "", tipo: "" });
      setCriandoAmbiente(false);
    } catch (error) {
      console.error("Erro ao criar ambiente:", error);
      mostrarMensagem("Erro ao criar ambiente.", "erro");
    }
  };

  // Função para carregar detalhes do modelo (da primeira tela)
  const carregarDetalhesModelo = async (modeloId: number) => {
    setCarregandoModelo(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/modelos-documento/${modeloId}/`, {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
        },
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const modeloData = await response.json();
      console.log('🎯 Resposta COMPLETA da API:', modeloData);
      
      //  AGORA USE O CAMPO "projeto" DA RESPOSTA DIRETA
      if (modeloData.projeto) {
        console.log('🔍 Projeto ID encontrado:', modeloData.projeto);
        
        const projetoResponse = await fetch(`http://127.0.0.1:8000/api/projetos/${modeloData.projeto}/`, {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
          },
        });
        
        if (projetoResponse.ok) {
          const projetoOriginal = await projetoResponse.json();
          console.log(' Projeto original encontrado:', projetoOriginal);
          
          setModeloSelecionado(modeloData);
          setFormData(prev => ({
            ...prev,
            tipoProjeto: projetoOriginal.tipo_do_projeto || "",
            descricao: `Baseado no modelo: ${modeloData.nome}\n\n` + (projetoOriginal.descricao || "")
          }));
          
          if (projetoOriginal.ambientes && projetoOriginal.ambientes.length > 0) {
            const ambientesIds = projetoOriginal.ambientes.map((amb: any) => amb.id);
            console.log('IDs dos ambientes copiados:', ambientesIds);
            setAmbientesSelecionados(ambientesIds);
          } else {
            console.log('Nenhum ambiente encontrado no projeto original');
          }
          
          mostrarMensagem(`Modelo "${modeloData.nome}" carregado! Preencha o nome do novo projeto e clique em "Criar Projeto".`, "sucesso");
        } else {
          mostrarMensagem("Erro ao carregar dados do projeto original.", "erro");
        }
      } else {
        console.log('Campos disponíveis no modelo:', Object.keys(modeloData));
        mostrarMensagem("Modelo não possui projeto associado.", "erro");
      }
      
      setUsandoModelo(false);
    } catch (err) {
      console.error("Erro ao carregar modelo:", err);
      mostrarMensagem("Erro ao carregar os dados do modelo.", "erro");
    } finally {
      setCarregandoModelo(false);
    }
  };

  // Função para limpar seleção de modelo
  const limparModelo = () => {
    setModeloSelecionado(null);
    setFormData(prev => ({
      ...prev,
      tipoProjeto: "",
      descricao: prev.descricao.replace(/Baseado no modelo: .+\n\n/, "")
    }));
    setAmbientesSelecionados([]);
    mostrarMensagem("Modelo removido. Você pode criar um projeto do zero.", "sucesso");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  // Paginação (da segunda tela)
  const totalItems = ambientesLista.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAmbientes = ambientesLista.slice(startIndex, startIndex + itemsPerPage);

  // Corrigir página caso o total mude
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

      {/* Feedback (da segunda tela) */}
      {mensagem && (
        <div
          className={`alert ${
            mensagem.tipo === "sucesso" ? "alert-success" : "alert-danger"
          } alert-dismissible fade show mb-4`}
        >
          {mensagem.texto}
          <button type="button" className="btn-close" onClick={() => setMensagem(null)}></button>
        </div>
      )}

      {/* Botão para criar a partir de modelo (da primeira tela) */}
      {!modeloSelecionado ? (
        <div className="mb-4">

        </div>
      ) : (
        <div className="alert alert-info mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <span>
              <strong>Usando modelo:</strong> {modeloSelecionado.nome}
            </span>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={limparModelo}
            >
              Remover modelo
            </button>
          </div>
        </div>
      )}

      {/* Modal de seleção de modelos (da primeira tela) */}
      {usandoModelo && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Selecionar Modelo</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setUsandoModelo(false)}
                ></button>
              </div>
              <div className="modal-body">
                {carregandoModelo ? (
                  <p>Carregando modelos...</p>
                ) : (
                  <div className="list-group">
                    {modelos.length > 0 ? (
                      modelos.map((modelo: any) => (
                        <button
                          key={modelo.id}
                          type="button"
                          className="list-group-item list-group-item-action"
                          onClick={() => carregarDetalhesModelo(modelo.id)}
                        >
                          <div className="fw-bold">{modelo.nome}</div>
                          <small className="text-muted">Tipo: {modelo.tipoModelo}</small>
                        </button>
                      ))
                    ) : (
                      <p className="text-muted">Nenhum modelo disponível.</p>
                    )}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setUsandoModelo(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} onKeyDown={handleKeyPress}>
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
              disabled={!!modeloSelecionado}
            >
              <option value="">Selecione</option>
              <option value="RESIDENCIAL">Residencial</option>
              <option value="COMERCIAL">Comercial</option>
              <option value="INDUSTRIAL">Industrial</option>
            </select>
            {modeloSelecionado && (
              <small className="text-muted">Tipo definido pelo modelo selecionado</small>
            )}
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
                    : "Área Indefinida"}
                  )
                </span>
              </label>
            ))}
          </div>

          {/* Paginação (da segunda tela) */}
          {totalPages > 1 && (
            <nav>
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button
                    type="button"
                    className="page-link"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  >
                    Anterior
                  </button>
                </li>

                <li className="page-item disabled">
                  <span className="page-link">
                    Página {currentPage} de {totalPages}
                  </span>
                </li>

                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button
                    type="button"
                    className="page-link"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  >
                    Próxima
                  </button>
                </li>
              </ul>
            </nav>
          )}        
        </div>

        <div className="d-flex justify-content-end">
          <button className="btn btn-primary px-4" type="submit" disabled={loading}>
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