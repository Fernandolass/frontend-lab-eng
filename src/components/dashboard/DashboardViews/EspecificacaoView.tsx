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
  const [itensDisponiveis, setItensDisponiveis] = useState<Array<{ key: string; label: string }>>([]);

  // 🔹 Carrega projeto e monta dados locais
  useEffect(() => {
    const carregar = async () => {
      if (!projetoId) return;

      try {
        const proj = await obterProjeto(parseInt(projetoId));

        // 🔹 Garante que todos os ambientes tenham seus materiais carregados
        const materiais: Record<number, any[]> = {};
        proj.ambientes.forEach((amb: any) => {
          materiais[amb.id] = amb.materials || [];
        });

        // 🔹 Monta lista de itens e sugestões — agora por ambiente + item
        const agrupado: Record<string, Set<string>> = {};
        const itensUnicos: Record<string, string> = {};

        proj.ambientes.forEach((amb: any) => {
          (amb.materials || []).forEach((m: any) => {
            const itemKey = m.item?.toUpperCase()?.trim();
            if (!itemKey) return;

            // 🔑 chave única ambiente + item
            const chave = `${amb.nome_do_ambiente?.toUpperCase()}__${itemKey}`;

            itensUnicos[chave] = `${amb.nome_do_ambiente} - ${m.item_label || itemKey}`;
            if (!agrupado[chave]) agrupado[chave] = new Set();

            if (m.descricao) agrupado[chave].add(m.descricao.trim());
          });
        });

        // 🔹 Converte Set → Array
        const limpo: Record<string, string[]> = {};
        Object.keys(agrupado).forEach((key) => {
          limpo[key] = Array.from(agrupado[key]);
        });

        const itensArr = Object.keys(itensUnicos).map((k) => ({
          key: k,
          label: itensUnicos[k],
        }));

        // 🔹 Atualiza estados
        setProjeto(proj);
        setMateriaisPorAmbiente(materiais);
        setSugestoes(limpo);
        setItensDisponiveis(itensArr);

      } catch (err) {
        console.error("Erro ao carregar especificação:", err);
        alert("Erro ao carregar dados da especificação técnica.");
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, [projetoId]);

  // 🔹 Atualiza descrição existente (PATCH)
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

  // 🔹 Cria novo material se não existir
  const handleCriar = async (ambienteId: number, item: string, descricao: string) => {
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
    <div className="">
      <div className="content-header">
        <h1>Especificação Técnica</h1>
      </div>
      <h5 className="text-muted mb-5">{projeto.nome_do_projeto}</h5>

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
              {(materiaisPorAmbiente[amb.id] || []).map((m) => {
                const chave = `${amb.nome_do_ambiente?.toUpperCase()}__${m.item?.toUpperCase()}`;
                const opcoes = sugestoes[chave] || [];
                return (
                  <tr key={m.id}>
                    <td className="fw-semibold">{m.item_label}</td>
                    <td>
                      <select
                        className="form-select"
                        value={m.descricao || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "_outro") {
                            handleChange(amb.id, m.id, "");
                          } else {
                            handleChange(amb.id, m.id, val);
                          }
                        }}
                      >
                        {opcoes.map((desc) => (
                          <option key={desc} value={desc}>
                            {desc}
                          </option>
                        ))}
                      </select>

                      {m.descricao === "" && (
                        <input
                          type="text"
                          className="form-control mt-2"
                          placeholder={`Descreva o ${m.item_label.toLowerCase()}...`}
                          onBlur={(e) => handleChange(amb.id, m.id, e.target.value)}
                        />
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
            {projeto.materiais_com_marcas && projeto.materiais_com_marcas.length > 0 ? (
              projeto.materiais_com_marcas.map((m: any, index: number) => (
                <tr key={index}>
                  <td className="fw-semibold">{m.material}</td>
                  <td>{m.marcas}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="text-center text-muted">
                  Nenhuma marca encontrada nos itens descritos.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* <button 
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
        </button> */}
      </div>

      {/* ===================== OBSERVAÇÕES GERAIS ===================== */}
      {/* <div className="mt-5">
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
      </div> */}

      <div className="d-flex justify-content-start mt-4">
        <button className="btn btn-secondary" onClick={onBack}>
          Voltar
        </button>
      </div>
    </div>
  );
};

export default EspecificacaoView;