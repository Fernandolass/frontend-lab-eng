import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../../../data/api";
import { obterProjeto, criarMaterial } from "../../../data/projects";

interface EspecificacaoViewProps {
  onBack: () => void;
}

const EspecificacaoView: React.FC<EspecificacaoViewProps> = ({ onBack }) => {
  const { projetoId } = useParams<{ projetoId: string }>();
  const [projeto, setProjeto] = useState<any>(null);
  const [materiaisPorAmbiente, setMateriaisPorAmbiente] = useState<Record<number, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [sugestoes, setSugestoes] = useState<Record<string, string[]>>({});
  const [mostrarOutro, setMostrarOutro] = useState<Record<number, boolean>>({});

  // Carrega dados do projeto
  useEffect(() => {
    const carregar = async () => {
      if (!projetoId) return;

      try {
        const proj = await obterProjeto(parseInt(projetoId));
        const materiais: Record<number, any[]> = {};
        proj.ambientes.forEach((amb: any) => {
          materiais[amb.id] = amb.materials || [];
        });

        // Monta as sugestões por ambiente + item
        const agrupado: Record<string, Set<string>> = {};
        proj.ambientes.forEach((amb: any) => {
          (amb.materials || []).forEach((m: any) => {
            const itemKey = m.item?.toUpperCase()?.trim();
            if (!itemKey) return;
            const chave = `${amb.nome_do_ambiente?.toUpperCase()}__${itemKey}`;
            if (!agrupado[chave]) agrupado[chave] = new Set();
            if (m.descricao) agrupado[chave].add(m.descricao.trim());
          });
        });

        const limpo: Record<string, string[]> = {};
        Object.keys(agrupado).forEach((key) => {
          limpo[key] = Array.from(agrupado[key]);
        });

        setProjeto(proj);
        setSugestoes(limpo);
        setMateriaisPorAmbiente(materiais);
      } catch (err) {
        console.error("Erro ao carregar especificação:", err);
        alert("Erro ao carregar dados da especificação técnica.");
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, [projetoId]);

  // Atualiza um material existente
  const handleChange = async (ambienteId: number, materialId: number, value: string) => {
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

  if (loading || !projeto) return <p>Carregando...</p>;
    return (
    <div className="container mt-4">
      <h2 className="text-center page-title mb-5">ESPECIFICAÇÃO TÉCNICA</h2>
      <h5 className="text-muted mb-4 text-center">{projeto.nome_do_projeto}</h5>

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
              {[
                ...new Map(
                  (materiaisPorAmbiente[amb.id] || []).map((m: any) => [m.item, m])
                ).values()
              ].map((m: any) => {
                const chave = `${amb.nome_do_ambiente?.toUpperCase()}__${m.item?.toUpperCase()}`;
                const opcoes = sugestoes[chave] || [];

                const mostrandoOutro = m.descricao === "" || m.descricao === undefined;

                return (
                  <tr key={m.id}>
                    <td className="fw-semibold">{m.item_label || m.item}</td>
                <td>
                  <select
                    className="form-select"
                    value={m.descricao || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "_outro") {
                        // Ativa o campo manual sem apagar nada
                        setMostrarOutro((prev) => ({ ...prev, [m.id]: true }));
                        setMateriaisPorAmbiente((prev) => ({
                          ...prev,
                          [amb.id]: prev[amb.id].map((item) =>
                            item.id === m.id ? { ...item, descricao: "" } : item
                          ),
                        }));
                      } else {
                        setMostrarOutro((prev) => ({ ...prev, [m.id]: false }));
                        handleChange(amb.id, m.id, val); // Salva normalmente
                      }
                    }}
                  >
                    <option value="">Selecione...</option>
                    {opcoes.map((desc) => (
                      <option key={desc} value={desc}>
                        {desc}
                      </option>
                    ))}
                    <option value="_outro">Outro (escrever manualmente)</option>
                  </select>

                  {/* ✅ Campo aparece SE o usuário escolheu "Outro" */}
                  {mostrarOutro[m.id] && (
                    <div className="mt-2 d-flex gap-2">
                      <input
                        type="text"
                        placeholder="Digite a nova descrição..."
                        className="form-control"
                        value={m.descricao || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMateriaisPorAmbiente((prev) => ({
                            ...prev,
                            [amb.id]: prev[amb.id].map((item) =>
                              item.id === m.id ? { ...item, descricao: val } : item
                            ),
                          }));
                        }}
                      />
                      <button
                        className="btn btn-success"
                        onClick={async () => {
                          const valor = materiaisPorAmbiente[amb.id].find(
                            (item) => item.id === m.id
                          )?.descricao;

                          if (!valor) {
                            alert("Digite uma descrição antes de salvar!");
                            return;
                          }
                          await handleChange(amb.id, m.id, valor);
                          setMostrarOutro((prev) => ({ ...prev, [m.id]: false }));
                          alert("Descrição salva com sucesso!");
                        }}
                      >
                        Salvar
                      </button>
                    </div>
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