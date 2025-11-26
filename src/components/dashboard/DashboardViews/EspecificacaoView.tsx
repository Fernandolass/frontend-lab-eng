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
  const [descricoesPorItem, setDescricoesPorItem] = useState<Record<string, string[]>>({});

  //  Função para carregar TODAS as descrições agrupadas por ITEM
  const carregarDescricoesPorItem = async () => {
    try {
      let todosMateriaisAPI: any[] = [];
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
        } else {
          console.warn("⚠️ Formato de resposta inesperado:", response);
          break;
        }
        
        todosMateriaisAPI = [...todosMateriaisAPI, ...materiaisDaPagina];
        nextUrl = nextPageUrl;
        
        if (todosMateriaisAPI.length >= 2000) {
          console.warn("⚠️ Limite de 2000 materiais atingido");
          break;
        }
      }

      const agrupado: Record<string, Set<string>> = {};
      
      todosMateriaisAPI.forEach(material => {
        const item = material.item?.trim();
        const descricao = material.descricao?.trim();
        
        if (item && descricao) {
          const itemKey = item.toUpperCase();
          
          if (!agrupado[itemKey]) {
            agrupado[itemKey] = new Set();
          }
          
          agrupado[itemKey].add(descricao);
        }
      });

      const resultado: Record<string, string[]> = {};
      Object.keys(agrupado).forEach(item => {
        resultado[item] = Array.from(agrupado[item]).sort();
      });

      console.log(" Descrições agrupadas por item:", resultado);
      return resultado;
    } catch (error) {
      console.error(" Erro ao carregar descrições:", error);
      return {};
    }
  };

  //  Nova função para carregar o projeto
  const carregarProjeto = async () => {
    if (!projetoId) return;
    
    try {
      const proj = await obterProjeto(parseInt(projetoId));
      
      const materiais: Record<number, any[]> = {};
      proj.ambientes.forEach((amb: any) => {
        materiais[amb.id] = amb.materials || [];
      });

      setProjeto(proj);
      setMateriaisPorAmbiente(materiais);
      return proj;
    } catch (err) {
      console.error("Erro ao carregar projeto:", err);
      throw err;
    }
  };

  //  Carrega projeto e descrições disponíveis
  useEffect(() => {
    const carregar = async () => {
      if (!projetoId) return;

      try {
        setLoading(true);
        // Carregar projeto e descrições em paralelo
        const [descricoesPorItem] = await Promise.all([
          carregarDescricoesPorItem(),
          carregarProjeto()
        ]);

        setDescricoesPorItem(descricoesPorItem);

      } catch (err) {
        console.error("Erro ao carregar especificação:", err);
        alert("Erro ao carregar dados da especificação técnica.");
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, [projetoId]);

  //  Atualiza descrição existente (PATCH) E RECARREGA O PROJETO
  const handleChange = async (ambienteId: number, materialId: number, value: string) => {
    // Atualização otimista local
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

      //  RECARREGA O PROJETO PARA ATUALIZAR A LISTA DE MARCAS
      await carregarProjeto();
      
    } catch (err) {
      console.error("Erro ao salvar material:", err);
      // Reverte a atualização otimista em caso de erro
      await carregarProjeto();
    }
  };

  if (loading || !projeto) return <p>Carregando...</p>;

  return (
    <div className="">
      <div className="content-header">
        <h1>Especificação Técnica</h1>
      </div>
      <h5 className="text-muted mb-4">{projeto.nome_do_projeto}</h5>
      {/* AMBIENTES E MATERIAIS */}
      {projeto.ambientes.map((amb: any) => (
        <div key={amb.id} className="projects-table-container mb-4">
          <div className="mb-3 fw-bold fs-5">
            {amb.nome_do_ambiente || amb.nome}
          </div>
          <div className="card-body p-0">
            {(materiaisPorAmbiente[amb.id] || []).length > 0 ? (
              <table className="projects-table table table-sm">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "30%" }}>Item</th>
                    <th>Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  {(materiaisPorAmbiente[amb.id] || []).map((m) => {
                    const itemKey = m.item?.toUpperCase()?.trim();
                    const descricoesDoItem = itemKey ? (descricoesPorItem[itemKey] || []) : [];
                    
                    return (
                      <tr key={m.id}>
                        <td className="fw-semibold">{m.item}</td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={m.descricao || ""}
                            onChange={(e) => handleChange(amb.id, m.id, e.target.value)}
                          >
                            <option value="">Selecione uma descrição...</option>
                            {descricoesDoItem.length === 0 ? (
                              <option value="" disabled>
                                Nenhuma descrição disponível para este item
                              </option>
                            ) : (
                              descricoesDoItem.map((desc, index) => (
                                <option key={index} value={desc}>
                                  {desc}
                                </option>
                              ))
                            )}
                          </select>
                          {descricoesDoItem.length > 0 && (
                            <small className="text-muted">
                              {descricoesDoItem.length} opção(ões) disponível(is) para {m.item}
                            </small>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="text-muted p-3">Nenhum material cadastrado neste ambiente.</p>
            )}
          </div>
        </div>
      ))}

      {/* DESCRIÇÃO DAS MARCAS */}
      <div className="projects-table-container mt-4">
        <div className="mb-3 fw-bold fs-5">
          Descrição das Marcas
        </div>
        <div className="card-body p-0">
          {projeto.materiais_com_marcas && projeto.materiais_com_marcas.length > 0 ? (
            <table className="projects-table table table-sm">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "30%" }}>Material</th>
                  <th>Marcas</th>
                </tr>
              </thead>
              <tbody>
                {projeto.materiais_com_marcas.map((m: any, index: number) => (
                  <tr key={index}>
                    <td className="fw-semibold">{m.material}</td>
                    <td>{m.marcas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-muted p-3">
              Nenhuma marca encontrada nos itens descritos.
            </p>
          )}
        </div>
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