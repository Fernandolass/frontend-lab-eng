import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { apiFetch } from "../../../data/api";
import { obterProjeto, criarMaterial } from "../../../data/projects";

interface EspecificacaoViewProps {
  onBack: () => void;
}

const EspecificacaoView: React.FC<EspecificacaoViewProps> = ({
  onBack,
}) => {
  const { projetoId } = useParams<{ projetoId: string }>();
  const [projeto, setProjeto] = useState<any>(null);
  const [materiaisPorAmbiente, setMateriaisPorAmbiente] = useState<
    Record<number, any[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [sugestoes, setSugestoes] = useState<Record<string, string[]>>({});
  const [itensDisponiveis, setItensDisponiveis] = useState<
    Array<{ key: string; label: string }>
  >([]);

  // 🔹 Carrega projeto + ambientes + itens e sugestões do backend
  useEffect(() => {
    const carregar = async () => {
      if (!projetoId) return;
      
      try {
        const proj = await obterProjeto(parseInt(projetoId));
        const allMaterials = await apiFetch("/api/materiais/");

        // Agrupar sugestões por tipo de item
        const agrupado: Record<string, Set<string>> = {};
        const itensUnicos: Record<string, string> = {};

        allMaterials.forEach((m: any) => {
          if (m.item && m.descricao) {
            const tipo = m.item.toUpperCase().trim();
            itensUnicos[tipo] = m.item_label || tipo;
            if (!agrupado[tipo]) agrupado[tipo] = new Set();
            agrupado[tipo].add(m.descricao.trim());
          }
        });

        // Sugestões agrupadas
        const limpo: Record<string, string[]> = {};
        Object.keys(agrupado).forEach(
          (key) => (limpo[key] = Array.from(agrupado[key]))
        );

        // Itens dinâmicos (únicos)
        const itensArr = Object.keys(itensUnicos).map((k) => ({
          key: k,
          label: itensUnicos[k],
        }));

        // Carregar materiais de cada ambiente
        const materiais: Record<number, any[]> = {};
        for (const amb of proj.ambientes) {
          const data = await apiFetch(`/api/materiais/?ambiente=${amb.id}`);
          materiais[amb.id] = data;
        }

        setSugestoes(limpo);
        setItensDisponiveis(itensArr);
        setMateriaisPorAmbiente(materiais);
        setProjeto(proj);
      } catch (err) {
        console.error(err);
        alert("Erro ao carregar dados da especificação.");
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [projetoId]);

  // 🔹 Atualiza descrição existente (PATCH)
  const handleChange = async (
    ambienteId: number,
    materialId: number,
    value: string
  ) => {
    setMateriaisPorAmbiente((prev) => ({
      ...prev,
      [ambienteId]: prev[ambienteId].map((m) =>
        m.id === materialId ? { ...m, descricao: value } : m
      ),
    }));

    try {
      await apiFetch(`/api/materiais/${materialId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descricao: value }),
      });
    } catch (err) {
      console.error("Erro ao salvar material:", err);
    }
  };

  // 🔹 Cria novo material se não existir
  const handleCriar = async (
    ambienteId: number,
    item: string,
    descricao: string
  ) => {
    if (!descricao) return;
    try {
      const novo = await criarMaterial({
        ambiente: ambienteId,
        item,
        descricao,
        marca: null,
      });
      setMateriaisPorAmbiente((prev) => ({
        ...prev,
        [ambienteId]: [...(prev[ambienteId] || []), novo],
      }));
    } catch (err) {
      console.error("Erro ao criar material:", err);
    }
  };

  if (loading || !projeto) return <p>Carregando...</p>;

  return (
    <div className="container mt-4">
      <h2 className="text-center page-title mb-5">ESPECIFICAÇÃO TÉCNICA</h2>
      <h5 className="text-muted mb-4 text-center">{projeto.nome}</h5>

      {projeto.ambientes.map((amb: any) => (
        <div key={amb.id} className="mb-5">
          <h4 className="fw-bold text-uppercase mb-3 border-bottom pb-1">
            {amb.nome_do_ambiente || amb.nome}
          </h4>

          <table className="table table-bordered align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ width: "30%" }}>Item</th>
                <th>Descrição</th>
              </tr>
            </thead>
            <tbody>
              {itensDisponiveis.map((it) => {
                const existente =
                  (materiaisPorAmbiente[amb.id] || []).find(
                    (m) => m.item === it.key
                  ) || null;

                return (
                  <tr key={it.key}>
                    <td className="fw-semibold">{it.label}</td>
                    <td>
                      {existente ? (
                        <>
                          <select
                            className="form-select"
                            value={existente.descricao || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "_outro") {
                                handleChange(amb.id, existente.id, "");
                              } else {
                                handleChange(amb.id, existente.id, val);
                              }
                            }}
                          >
                            <option value="">Selecione...</option>
                            {(sugestoes[it.key] || []).map((desc) => (
                              <option key={desc} value={desc}>
                                {desc}
                              </option>
                            ))}
                            <option value="_outro">Outro (escrever manualmente)</option>
                          </select>

                          {existente.descricao === "" && (
                            <input
                              type="text"
                              className="form-control mt-2"
                              placeholder={`Descreva o ${it.label.toLowerCase()}...`}
                              onBlur={(e) =>
                                handleChange(
                                  amb.id,
                                  existente.id,
                                  e.target.value
                                )
                              }
                            />
                          )}
                        </>
                      ) : (
                        <select
                          className="form-select"
                          onChange={(e) =>
                            handleCriar(amb.id, it.key, e.target.value)
                          }
                        >
                          <option value="">Selecione...</option>
                          {(sugestoes[it.key] || []).map((desc) => (
                            <option key={desc} value={desc}>
                              {desc}
                            </option>
                          ))}
                          <option value="_outro">Outro (escrever manualmente)</option>
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
        {/* ===================== DESCRIÇÃO DAS MARCAS ===================== */}
        <div className="mt-5">
        <h4>Descrição das Marcas</h4>
        <table className="table table-bordered align-middle">
            <thead className="table-light">
            <tr>
                <th style={{ width: "30%" }}>Material</th>
                <th>Marcas</th>
            </tr>
            </thead>
            <tbody>
            {projeto.descricao_marcas && projeto.descricao_marcas.length > 0 ? (
                projeto.descricao_marcas.map((m: any) => (
                <tr key={m.id}>
                    <td>
                    <input
                        type="text"
                        className="form-control"
                        value={m.material}
                        onChange={async (e) => {
                        await apiFetch(`/api/marcas-descricao/${m.id}/`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ material: e.target.value }),
                        });
                        }}
                    />
                    </td>
                    <td>
                    <textarea
                        className="form-control"
                        rows={1}
                        value={m.marcas}
                        onChange={async (e) => {
                        await apiFetch(`/api/marcas-descricao/${m.id}/`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ marcas: e.target.value }),
                        });
                        }}
                    />
                    </td>
                </tr>
                ))
            ) : (
                <tr>
                <td colSpan={2} className="text-center text-muted">
                    Nenhuma marca cadastrada.
                </td>
                </tr>
            )}
            </tbody>
        </table>

        <button
            className="btn btn-outline-primary"
            onClick={async () => {
            await apiFetch("/api/marcas-descricao/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                material: "Novo Material",
                marcas: "",
                projeto: projeto.id,
                }),
            });
            window.location.reload();
            }}
        >
            + Adicionar Linha
        </button>
        </div>

        {/* ===================== OBSERVAÇÕES GERAIS ===================== */}
        <div className="mt-5">
        <h4>Observações Gerais</h4>
        <textarea
            className="form-control"
            rows={5}
            value={projeto.observacoes_gerais || ""}
            onChange={(e) =>
            apiFetch(`/api/projetos/${projeto.id}/`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ observacoes_gerais: e.target.value }),
            })
            }
            placeholder="Digite as observações gerais..."
        />
        </div>
      <div className="d-flex justify-content-start mt-4">
        <button className="btn btn-secondary" onClick={onBack}>
          Voltar
        </button>
      </div>
    </div>
  );
};

export default EspecificacaoView;