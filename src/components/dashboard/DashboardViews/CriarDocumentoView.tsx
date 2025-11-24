import React, { useState, useEffect } from 'react';
import { listarTiposAmbiente, listarAmbientes, criarAmbiente, criarTipoAmbiente, criarProjeto, criarMaterial } from '../../../data/projects';
import { apiFetch } from "../../../data/api";


interface CriarDocumentoViewProps {
  onViewDetails: () => void;
}
interface AmbienteInfo {
  id: number;
  nome: string;
  nome_do_ambiente?: string;
  categoria?: string;
  tipo?: number | null;
}
const CriarDocumentoView: React.FC<CriarDocumentoViewProps> = ({ onViewDetails }) => {
  const [formData, setFormData] = useState({
    nomeProjeto: '',
    tipoProjeto: '',
    descricao: '',
    dataEntrega: ''
  });
  const [sugestoesMateriais, setSugestoesMateriais] = useState<Record<string, string[]>>({});
  const [materiaisAmbiente, setMateriaisAmbiente] = useState<any[]>([]);
  const [materiaisPorAmbiente, setMateriaisPorAmbiente] = useState<Record<string, any[]>>({});
  const [ambienteFiltro, setAmbienteFiltro] = useState<string>('');
  const [showTipoModal, setShowTipoModal] = useState(false);
  const [tiposAmbiente, setTiposAmbiente] = useState<Array<{ id: number; nome: string }>>([]);
  const [ambientesLista, setAmbientesLista] = useState<AmbienteInfo[]>([]);
  const [novoTipo, setNovoTipo] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [novoAmbiente, setNovoAmbiente] = useState({
    nome_do_ambiente: '',
    tipo: '',
  });

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const [ambs, tipos] = await Promise.all([listarAmbientes(), listarTiposAmbiente()]);
        setAmbientesLista(ambs);
        if (ambs.length > 0) setAmbienteFiltro(ambs[0].id.toString());
        await carregarSugestoes();
      } catch (err) {
        console.warn("Erro ao carregar dados iniciais:", err);
      }
    };
    carregarDados();
  }, []);

  useEffect(() => {
    const salvo = localStorage.getItem("materiaisPorAmbiente");
    if (salvo) {
      try {
        setMateriaisPorAmbiente(JSON.parse(salvo));
      } catch {
        console.warn("Erro ao carregar materiais salvos localmente");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("materiaisPorAmbiente", JSON.stringify(materiaisPorAmbiente));
  }, [materiaisPorAmbiente]);
  const carregarSugestoes = async () => {
    try {
      const data = await apiFetch("/api/materiais/");

      const agrupado: Record<string, Set<string>> = {};

      data.forEach((m: any) => {
        if (m.item && m.descricao) {
          const tipo = m.item.toUpperCase().trim();
          if (!agrupado[tipo]) agrupado[tipo] = new Set();
          agrupado[tipo].add(m.descricao.trim());
        }
      });

      const limpo: Record<string, string[]> = {};
      Object.keys(agrupado).forEach((key) => {
        limpo[key] = Array.from(agrupado[key]);
      });

      setSugestoesMateriais(limpo);
    } catch (err) {
      console.error("Erro ao carregar sugestões de materiais:", err);
    }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


const handleAmbienteFilterChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
  const novoAmbienteId = e.target.value;

  if (!novoAmbienteId || novoAmbienteId === "undefined" || novoAmbienteId === "null") {
    setAmbienteFiltro("");
    setMateriaisAmbiente([]);
    return;
  }

  if (ambienteFiltro && materiaisAmbiente.length > 0) {
    setMateriaisPorAmbiente((prev) => ({
      ...prev,
      [ambienteFiltro]: materiaisAmbiente,
    }));
  }

  setAmbienteFiltro(novoAmbienteId);

  if (materiaisPorAmbiente[novoAmbienteId]) {
    setMateriaisAmbiente(materiaisPorAmbiente[novoAmbienteId]);
    return;
  }

  try {
    if (!isNaN(Number(novoAmbienteId))) {
      const data = await apiFetch(`/api/materiais/?ambiente=${novoAmbienteId}`);
      setMateriaisPorAmbiente((prev) => ({ ...prev, [novoAmbienteId]: data }));
      setMateriaisAmbiente(data);
    }
  } catch (error) {
    console.error("Erro ao carregar materiais:", error);
    setMateriaisAmbiente([]);
  }
};


const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Cria o projeto principal
      const projeto = await criarProjeto({
        nome_do_projeto: formData.nomeProjeto,
        tipo_do_projeto: formData.tipoProjeto,
        data_entrega: formData.dataEntrega,
        descricao: formData.descricao,
      });

      // Pega todos os ambientes que o usuário interagiu/alterou
      const ambientesSelecionados = Object.keys(materiaisPorAmbiente);

      for (const ambienteId of ambientesSelecionados) {
        const ambienteOriginal = ambientesLista.find(a => a.id.toString() === ambienteId);
        if (!ambienteOriginal) continue;

        // Cria um novo ambiente vinculado ao projeto criado
        const novoAmbiente = await criarAmbiente({
          nome_do_ambiente: ambienteOriginal.nome_do_ambiente ?? ambienteOriginal.nome ?? "",
          categoria: ambienteOriginal.categoria ?? "PRIVATIVA",
        });

        // Cria materiais personalizados para esse ambiente
        const materiaisEditados = materiaisPorAmbiente[ambienteId];
        for (const m of materiaisEditados) {
          await criarMaterial({
            ambiente: novoAmbiente.id,
            item: m.item,
            descricao: m.descricao || "",
            marca: m.marca || null,
          });
        }
      }

      alert("Projeto criado com sucesso!");
      onViewDetails();
    } catch (err: any) {
      console.error("Erro ao enviar projeto:", err);
      alert(`Erro ao criar projeto: ${err.message}`);
    }
  };

  // === Criar novo ambiente ===
  const handleCriarAmbiente = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await criarAmbiente({
        nome_do_ambiente: novoAmbiente.nome_do_ambiente,
      });
      alert('Ambiente criado com sucesso!');
      setShowModal(false);
      setNovoAmbiente({ nome_do_ambiente: '', tipo: '' });
      const novos = await listarAmbientes();
      setAmbientesLista(novos);
    } catch (error) {
      alert('Erro ao criar ambiente.');
    }
  };

  return (
    <div>
      <div className="content-header">
        <h1>Criar Novo Documento</h1>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          {/* Informações Básicas do Projeto */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="nomeProjeto">Nome do Projeto</label>
                <input
                  type="text"
                  id="nomeProjeto"
                  name="nomeProjeto"
                  value={formData.nomeProjeto}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="tipoProjeto">Tipo de Projeto</label>
                <select
                  id="tipoProjeto"
                  name="tipoProjeto"
                  value={formData.tipoProjeto}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                >
                  <option value="">Selecione o tipo</option>
                  <option value="RESIDENCIAL">Residencial</option>
                  <option value="COMERCIAL">Comercial</option>
                  <option value="INDUSTRIAL">Industrial</option>
                </select>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="dataEntrega">Data de Entrega</label>
                <input
                  type="date"
                  id="dataEntrega"
                  name="dataEntrega"
                  value={formData.dataEntrega}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group mb-4">
            <label htmlFor="descricao">Descrição do Projeto</label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleInputChange}
              className="form-control"
              rows={3}
              placeholder="Descreva o objetivo e características do projeto..."
              required
            />
          </div>

          {/* Especificação de Materiais */}
          <div className="materiais-section">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3>Especificação de Materiais</h3>
              <button
                type="button"
                className="btn btn-success"
                onClick={() => setShowModal(true)}
              >
                + Novo Ambiente
              </button>
            </div>

            {/* Modal Novo Ambiente */}
            {showModal && (
              <div
                className="modal fade show"
                style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
              >
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Criar Novo Ambiente</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowModal(false)}
                      ></button>
                    </div>

                    <form onSubmit={handleCriarAmbiente}>
                      <div className="modal-body">
                        <div className="mb-3">
                          <label className="form-label">Nome do Ambiente</label>
                          <input
                            type="text"
                            className="form-control"
                            value={novoAmbiente.nome_do_ambiente}
                            onChange={(e) =>
                              setNovoAmbiente((prev) => ({
                                ...prev,
                                nome_do_ambiente: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>

                        {/* Campo Tipo + botão Criar Tipo */}
                        <div className="mb-3">
                          <label className="form-label d-flex justify-content-between align-items-center">
                            <span>Tipo do Ambiente</span>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => setShowTipoModal(true)}
                            >
                              + Criar Tipo
                            </button>
                          </label>
                          <select
                            className="form-control"
                            value={novoAmbiente.tipo}
                            onChange={(e) =>
                              setNovoAmbiente((prev) => ({
                                ...prev,
                                tipo: e.target.value,
                              }))
                            }
                          >
                            <option value="">Selecione um tipo...</option>
                            {tiposAmbiente.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.nome}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setShowModal(false)}
                        >
                          Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                          Criar
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Criar Tipo de Ambiente */}
            {showTipoModal && (
              <div
                className="modal fade show"
                style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
              >
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Criar Tipo de Ambiente</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowTipoModal(false)}
                      ></button>
                    </div>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                          await criarTipoAmbiente(novoTipo);
                          alert("Tipo criado com sucesso!");
                          setNovoTipo("");
                          setShowTipoModal(false);
                          const atualizados = await listarTiposAmbiente();
                          setTiposAmbiente(atualizados);
                        } catch {
                          alert("Erro ao criar tipo de ambiente.");
                        }
                      }}
                    >
                      <div className="modal-body">
                        <label className="form-label">Nome do Tipo</label>
                        <input
                          type="text"
                          className="form-control"
                          value={novoTipo}
                          onChange={(e) => setNovoTipo(e.target.value)}
                          required
                        />
                      </div>
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setShowTipoModal(false)}
                        >
                          Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                          Criar Tipo
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* === CAMPO DE SELEÇÃO DE AMBIENTES COM GRUPOS === */}
            <div className="filter-section mb-4">
              <div className="row">
                <div className="col-md-12">
                  <div className="form-group">
                    <label htmlFor="ambienteFiltro" className="form-label">
                      Selecione o Ambiente:
                    </label>
                    <select
                        id="ambienteFiltro"
                        value={ambienteFiltro}
                        onChange={handleAmbienteFilterChange}
                        className="form-control"
                      >
                        <option value="">Selecione o ambiente</option>

                        {/* Normaliza o campo categoria para evitar problemas de nomeação */}
                        {(() => {
                          const normalize = (cat?: string) => cat?.toUpperCase().trim();

                          const privativas = ambientesLista.filter(
                            (a) => normalize(a.categoria || (a as any).Categoria) === "PRIVATIVA"
                          );
                          const comuns = ambientesLista.filter(
                            (a) => normalize(a.categoria || (a as any).Categoria) === "COMUM"
                          );
                          const externas = ambientesLista.filter(
                            (a) => normalize(a.categoria || (a as any).Categoria) === "EXTERNA"
                          );

                          return (
                            <>
                              {privativas.length > 0 && (
                                <optgroup label="Unidades Privativas">
                                  {privativas.map((a) => (
                                    <option key={a.id} value={a.id}>
                                      {a.nome_do_ambiente || a.nome}
                                    </option>
                                  ))}
                                </optgroup>
                              )}
                              {comuns.length > 0 && (
                                <optgroup label="Áreas Comuns">
                                  {comuns.map((a) => (
                                    <option key={a.id} value={a.id}>
                                      {a.nome_do_ambiente || a.nome}
                                    </option>
                                  ))}
                                </optgroup>
                              )}
                              {externas.length > 0 && (
                                <optgroup label="Áreas Externas">
                                  {externas.map((a) => (
                                    <option key={a.id} value={a.id}>
                                      {a.nome_do_ambiente || a.nome}
                                    </option>
                                  ))}
                                </optgroup>
                              )}
                            </>
                          );
                        })()}
                      </select>
                    <small className="form-text text-muted">
                      Filtre os materiais por ambiente específico do projeto
                    </small>
                  </div>
                </div>
              </div>
            </div>

            {materiaisAmbiente.length === 0 ? (
            <div className="alert alert-info">
              Nenhum material encontrado para o ambiente selecionado.
            </div>
          ) : (
            <div className="row">
              {materiaisAmbiente.map((material) => (
                <div key={material.id} className="col-md-6 mb-3">
                  <div className="form-group">
                    <label className="form-label">
                      {material.item_label || material.item}:
                    </label>
                    <select
                      className="form-control"
                      value={material.descricao || ""}
                      onChange={(e) =>
                        setMateriaisAmbiente((prev) =>
                          prev.map((m) =>
                            m.id === material.id ? { ...m, descricao: e.target.value } : m
                          )
                        )
                      }
                    >
                      <option value="">Selecione uma opção</option>

                      {/* Sugestões vindas do backend */}
                      {(sugestoesMateriais[material.item.toUpperCase()] || []).map((desc) => (
                        <option key={desc} value={desc}>
                          {desc}
                        </option>
                      ))}

                      {/* Opção manual */}
                      <option value="_outro">Outro (escrever manualmente)</option>
                    </select>

                    {/* Campo extra para caso o usuário selecione "Outro" */}
                    {material.descricao === "_outro" && (
                      <input
                        type="text"
                        className="form-control mt-2"
                        placeholder={`Descreva o tipo de ${material.item_label?.toLowerCase() || material.item.toLowerCase()}...`}
                        onChange={(e) =>
                          setMateriaisAmbiente((prev) =>
                            prev.map((m) =>
                              m.id === material.id ? { ...m, descricao: e.target.value } : m
                            )
                          )
                        }
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>

          <div className="d-flex justify-content-between mt-4">
            <button type="button" className="btn btn-secondary" onClick={() => window.history.back()}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Criar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CriarDocumentoView;