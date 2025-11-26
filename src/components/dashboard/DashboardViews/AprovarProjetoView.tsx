import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import {
  getProjetoDetalhes,
  aprovarMaterial,
  reprovarMaterial,
  apiFetch,
} from "../../../data/api";

interface AprovarProjetoViewProps {
  onBack: () => void;
}

interface Material {
  id: number;
  item: string;
  descricao: string;
  status: string;
  motivo?: string;
  aprovador_email?: string;
  data_aprovacao?: string;
}

interface Ambiente {
  id: number;
  nome_do_ambiente: string;
  materials: Material[];
}

interface ProjetoDetalhes {
  id: number;
  nome_do_projeto: string;
  responsavel_nome: string;
  data_criacao: string;
  status: string;
  ambientes: Ambiente[];
}

const AprovarProjetoView: React.FC<AprovarProjetoViewProps> = ({
  onBack,
}) => {
  const { projetoId } = useParams<{ projetoId: string }>();
  const [projetoData, setProjetoData] = useState<ProjetoDetalhes | null>(null);
  const [loading, setLoading] = useState(true);
  const [observacoesTemp, setObservacoesTemp] = useState<{ [key: string]: string }>({});
  const [ambientesContraidos, setAmbientesContraidos] = useState<{ [key: number]: boolean }>({});
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: 'sucesso' | 'erro' } | null>(null);
  const [carregandoAcao, setCarregandoAcao] = useState<{ materialId: number | null, tipo: 'aprovar' | 'reprovar' | null }>({ 
    materialId: null, 
    tipo: null 
  });

  // Sistema de mensagens
  const mostrarMensagem = (texto: string, tipo: 'sucesso' | 'erro') => {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem(null), 5000);
  };

  // 🔹 Buscar projeto do backend
  useEffect(() => {
    const carregarProjeto = async () => {
      if (!projetoId) return;
      
      try {
        const data = await getProjetoDetalhes(parseInt(projetoId));
        setProjetoData(data);
      } catch (e: any) {
        console.error("Erro ao buscar projeto:", e.message);
        mostrarMensagem("Erro ao carregar projeto", "erro");
      } finally {
        setLoading(false);
      }
    };
    carregarProjeto();
  }, [projetoId]);

  // 🔹 Função para verificar e atualizar status do projeto
  const verificarEAtualizarStatusProjeto = async (dadosAtuais: ProjetoDetalhes) => {
    const todosMateriais = dadosAtuais.ambientes.flatMap((a) => a.materials);
    const pendentes = todosMateriais.filter((m) => m.status === "PENDENTE").length;
    const reprovados = todosMateriais.filter((m) => m.status === "REPROVADO").length;

    console.log("🔍 Verificando status do projeto:", { 
      total: todosMateriais.length,
      pendentes, 
      reprovados,
      aprovados: todosMateriais.filter((m) => m.status === "APROVADO").length,
      statusAtual: dadosAtuais.status
    });

    // Se não há mais pendentes E o projeto ainda está como PENDENTE
    if (pendentes === 0 && dadosAtuais.status === "PENDENTE") {
      try {
        if (reprovados > 0) {
          console.log("🚨 REPROVANDO PROJETO - há itens reprovados");
          await apiFetch(`/api/projetos/${projetoId}/reprovar/`, { method: "POST" });
          setProjetoData(prev => prev ? { ...prev, status: "REPROVADO" } : prev);
          mostrarMensagem("❌ Projeto reprovado (há itens reprovados).", "sucesso");
        } else {
          console.log("🎉 APROVANDO PROJETO - todos os itens aprovados");
          await apiFetch(`/api/projetos/${projetoId}/aprovar/`, { method: "POST" });
          setProjetoData(prev => prev ? { ...prev, status: "APROVADO" } : prev);
          mostrarMensagem("✅ Projeto aprovado (todos os itens aprovados).", "sucesso");
        }
      } catch (err) {
        console.error("Erro ao atualizar status do projeto:", err);
        mostrarMensagem("Erro ao atualizar status do projeto", "erro");
      }
    } else {
      console.log("⏳ Ainda há itens pendentes ou projeto já foi processado");
    }
  };

  // ✅ Aprovar material individual
  const handleAprovarMaterial = async (ambienteId: number, materialId: number) => {
    setCarregandoAcao({ materialId, tipo: 'aprovar' });
    
    try {
      await aprovarMaterial(materialId);

      // Atualiza o estado local
      setProjetoData(prev => {
        if (!prev) return prev;
        
        const novoProjetoData = {
          ...prev,
          ambientes: prev.ambientes.map((ambiente) =>
            ambiente.id === ambienteId
              ? {
                  ...ambiente,
                  materials: ambiente.materials.map((m) =>
                    m.id === materialId
                      ? {
                          ...m,
                          status: "APROVADO",
                          data_aprovacao: new Date().toISOString(),
                        }
                      : m
                  ),
                }
              : ambiente
          ),
        };

        // 🔄 CHAMA A VERIFICAÇÃO DIRETAMENTE APÓS ATUALIZAR
        setTimeout(() => {
          verificarEAtualizarStatusProjeto(novoProjetoData);
        }, 100);

        return novoProjetoData;
      });

      setObservacoesTemp((prev) => {
        const novo = { ...prev };
        delete novo[materialId];
        return novo;
      });

      // ✅ MENSAGEM PARA APROVAÇÃO INDIVIDUAL
      mostrarMensagem("✅ Material aprovado com sucesso!", "sucesso");
      console.log("✅ Material aprovado:", { ambienteId, materialId });

    } catch (error: any) {
      console.error("Erro ao aprovar material:", error);
      mostrarMensagem("Erro ao aprovar material: " + error.message, "erro");
    } finally {
      setCarregandoAcao({ materialId: null, tipo: null });
    }
  };

  // ❌ Reprovar material individual
  const handleReprovarMaterial = async (ambienteId: number, materialId: number) => {
    setCarregandoAcao({ materialId, tipo: 'reprovar' });
    
    const motivo = observacoesTemp[materialId] || "Item reprovado sem observações específicas";

    try {
      await reprovarMaterial(materialId, motivo);

      // Atualiza o estado local
      setProjetoData(prev => {
        if (!prev) return prev;
        
        const novoProjetoData = {
          ...prev,
          ambientes: prev.ambientes.map((ambiente) =>
            ambiente.id === ambienteId
              ? {
                  ...ambiente,
                  materials: ambiente.materials.map((m) =>
                    m.id === materialId
                      ? {
                          ...m,
                          status: "REPROVADO",
                          motivo,
                          data_aprovacao: new Date().toISOString(),
                        }
                      : m
                  ),
                }
              : ambiente
          ),
        };

        // 🔄 CHAMA A VERIFICAÇÃO DIRETAMENTE APÓS ATUALIZAR
        setTimeout(() => {
          verificarEAtualizarStatusProjeto(novoProjetoData);
        }, 100);

        return novoProjetoData;
      });

      setObservacoesTemp((prev) => {
        const novo = { ...prev };
        delete novo[materialId];
        return novo;
      });

      // ❌ SEM MENSAGEM INDIVIDUAL DE REPROVAÇÃO
      console.log("❌ Material reprovado:", { ambienteId, materialId, motivo });

    } catch (error: any) {
      console.error("Erro ao reprovar material:", error);
      mostrarMensagem("Erro ao reprovar material: " + error.message, "erro");
    } finally {
      setCarregandoAcao({ materialId: null, tipo: null });
    }
  };

  if (loading) {
    return (
      <div className="content-header">
        <button className="btn btn-secondary me-3" onClick={onBack}>
          ← Voltar
        </button>
        <h1>Carregando projeto...</h1>
      </div>
    );
  }

  if (!projetoData) {
    return (
      <div>
        <div className="content-header">
          <button className="btn btn-secondary me-3" onClick={onBack}>
            ← Voltar
          </button>
          <h1>Projeto não encontrado</h1>
        </div>
      </div>
    );
  }

  const handleSalvarObservacao = (materialId: number, observacao: string) => {
    setObservacoesTemp((prev) => ({
      ...prev,
      [materialId]: observacao,
    }));
  };

  const toggleAmbiente = (ambienteId: number) => {
    setAmbientesContraidos((prev) => ({
      ...prev,
      [ambienteId]: !prev[ambienteId],
    }));
  };

  const contarMateriaisPorStatus = (status: string): number => {
    return projetoData.ambientes.reduce((total, ambiente) => {
      return total + ambiente.materials.filter((m) => m.status === status).length;
    }, 0);
  };

  const materiaisPendentes = projetoData.ambientes.reduce((total, ambiente) => {
    return total + ambiente.materials.filter((m) => m.status === "PENDENTE").length;
  }, 0);

  return (
    <div>
      {/* Header */}
      <div className="content-header">
        <div className="d-flex align-items-start">
          <button className="btn btn-secondary me-3" onClick={onBack}>
            ↩ Voltar
          </button>
          <div>
            <h1 className="mb-1">{projetoData.nome_do_projeto}</h1>
            <div className="text-muted">
              <div>Responsável: {projetoData.responsavel_nome}</div>
              <div>
                Data de Criação:{" "}
                {new Date(projetoData.data_criacao).toLocaleDateString("pt-BR")}
              </div>
              <div>
                <strong>Status atual:</strong>{" "}
                <span
                  className={`badge ${
                    projetoData.status === "APROVADO"
                      ? "bg-success"
                      : projetoData.status === "REPROVADO"
                      ? "bg-danger"
                      : "bg-secondary"
                  }`}
                >
                  {projetoData.status || "PENDENTE"}
                </span>
              </div>
            </div>
          </div>
        </div>
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

      {/* Resumo */}
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="project-summary p-3 bg-light rounded">
            <div className="row text-center">
              <div className="col-md-3">
                <div className="fs-4 fw-bold">{materiaisPendentes}</div>
                <div className="text-muted">Pendentes</div>
              </div>
              <div className="col-md-3">
                <div className="fs-4 fw-bold">
                  {contarMateriaisPorStatus("APROVADO")}
                </div>
                <div className="text-muted">Aprovados</div>
              </div>
              <div className="col-md-3">
                <div className="fs-4 fw-bold">
                  {contarMateriaisPorStatus("REPROVADO")}
                </div>
                <div className="text-muted">Reprovados</div>
              </div>
              <div className="col-md-3">
                <div className="fs-4 fw-bold">{projetoData.ambientes.length}</div>
                <div className="text-muted">Ambientes</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ambientes */}
      <div className="checklist-container">
        {projetoData.ambientes.map((ambiente) => {
          const pendentes = ambiente.materials.filter((m) => m.status === "PENDENTE");
          const processados = ambiente.materials.filter((m) => m.status !== "PENDENTE");
          const isContraido = ambientesContraidos[ambiente.id];

          return (
            <div key={ambiente.id} className="ambiente-card mb-4">
              <div className="card">
                <div className="card-header btn-secondary text-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    {ambiente.nome_do_ambiente}
                    <small className="ms-2 opacity-75">
                      ({pendentes.length} pendentes)
                    </small>
                  </h5>
                  <button
                    className="btn-toggle-ambiente"
                    onClick={() => toggleAmbiente(ambiente.id)}
                    title={isContraido ? "Expandir ambiente" : "Contrair ambiente"}
                  >
                    {isContraido ? "➝" : "⤵"}
                  </button>
                </div>

                {!isContraido && (
                  <div className="card-body">
                    {/* Materiais Pendentes */}
                    {pendentes.length > 0 && (
                      <div className="materiais-pendentes">
                        <h6 className="text-muted mb-3">
                          Itens Pendentes de Aprovação
                        </h6>
                        {pendentes.map((m) => (
                          <div
                            key={m.id}
                            className="material-item row align-items-center mb-3 p-3 border rounded"
                          >
                            <div className="col-md-2">
                              <strong>{m.item}</strong>
                            </div>
                            <div className="col-md-4">
                              <textarea
                                className="form-control form-control-sm"
                                placeholder="Digite observações (opcional)..."
                                value={observacoesTemp[m.id] || ""}
                                onChange={(e) =>
                                  handleSalvarObservacao(m.id, e.target.value)
                                }
                                rows={2}
                              />
                            </div>
                            <div className="col-md-3 d-flex gap-2 justify-content-end">
                              <button
                                className="btn btn-success"
                                onClick={() => handleAprovarMaterial(ambiente.id, m.id)}
                                disabled={carregandoAcao.materialId === m.id}
                              >
                                {carregandoAcao.materialId === m.id && carregandoAcao.tipo === 'aprovar' ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Aprovando...
                                  </>
                                ) : (
                                  'Aprovar'
                                )}
                              </button>
                              <button
                                className="btn btn-secondary"
                                onClick={() => handleReprovarMaterial(ambiente.id, m.id)}
                                disabled={carregandoAcao.materialId === m.id}
                              >
                                {carregandoAcao.materialId === m.id && carregandoAcao.tipo === 'reprovar' ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Reprovando...
                                  </>
                                ) : (
                                  'Reprovar'
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Materiais processados */}
                    {processados.length > 0 && (
                      <div className="materiais-processados mt-4">
                        <h6 className="text-success mb-3">Itens Já Processados</h6>
                        {processados.map((m) => (
                          <div key={m.id} className={`material-item row align-items-center mb-2 p-2 rounded ${
                              m.status === "APROVADO"
                                ? "bg-success bg-opacity-10"
                                : "bg-danger bg-opacity-10"
                            }`}
                          >
                            <div className="col-md-3">
                              <strong>{m.item}</strong>
                            </div>
                            <div className="col-md-6 small">
                              {m.motivo && m.status === "REPROVADO" && (
                                <div className="text-danger">
                                  <strong>Motivo:</strong> {m.motivo}
                                </div>
                              )}
                            </div>
                            <div className="col-md-3">
                              <span
                                className={`badge ${
                                  m.status === "APROVADO" ? "bg-success" : "bg-danger"
                                }`}
                              >
                                {m.status}
                              </span>
                              {m.data_aprovacao && (
                                <div className="small text-muted">
                                  {new Date(m.data_aprovacao).toLocaleDateString("pt-BR")}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="row mt-4">
        <div className="col-md-12">
          <div className="d-flex justify-content-end align-items-center p-3 bg-light rounded">
            <button className="btn btn-secondary" onClick={onBack}>
              Voltar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AprovarProjetoView;