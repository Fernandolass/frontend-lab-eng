import React, { useEffect, useState } from "react";
import { obterProjeto } from "../../../data/projects";

interface DetalhesProjetoViewProps {
  projetoId: number;
  onBack: () => void;
}

const DetalhesProjetoView: React.FC<DetalhesProjetoViewProps> = ({ projetoId, onBack }) => {
  const [projeto, setProjeto] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const carregar = async () => {
      try {
        setCarregando(true);
        const data = await obterProjeto(projetoId);
        setProjeto(data);
      } catch (err) {
        console.error("Erro ao carregar projeto:", err);
        setErro("Não foi possível carregar os detalhes do projeto.");
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, [projetoId]);

  if (carregando) return <p>Carregando detalhes...</p>;
  if (erro) return <p className="text-danger">{erro}</p>;
  if (!projeto) return <p>Nenhum dado encontrado.</p>;

  return (
    <div className="container mt-4">
      <button className="btn btn-secondary mb-3" onClick={onBack}>
        ← Voltar
      </button>

      <h2>{projeto.nome || projeto.nome_do_projeto}</h2>

      <p><strong>Tipo:</strong> {projeto.tipoProjeto || projeto.tipo_do_projeto}</p>

      <p>
        <strong>Data de Entrega:</strong>{" "}
        {(() => {
          const data =
            projeto.data_entrega ||
            projeto.dataEntrega ||
            projeto.data_criacao ||
            projeto.dataCriacao;

          if (!data) return "Não informada";

          const parsed = new Date(data);
          return isNaN(parsed.getTime())
            ? "Não informada"
            : parsed.toLocaleDateString("pt-BR");
        })()}
      </p>

      <p><strong>Descrição:</strong> {projeto.descricao || "Sem descrição"}</p>
      <p><strong>Status:</strong> {projeto.status || "Pendente"}</p>
      <p><strong>Responsável:</strong> {projeto.responsavel_nome || projeto.responsavel || "N/A"}</p>

      <hr />

      <h4>Ambientes</h4>
      {projeto.ambientes && projeto.ambientes.length > 0 ? (
        projeto.ambientes.map((amb: any) => (
          <div key={amb.id} className="card mb-3">
            <div className="card-header fw-bold">
              {amb.nome_do_ambiente || amb.nome}
            </div>
            <div className="card-body">
              {amb.materials && amb.materials.length > 0 ? (
                <table className="table table-sm table-bordered">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Descrição</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {amb.materials.map((mat: any) => (
                      <tr key={mat.id}>
                        <td>{mat.item_label || mat.item}</td>
                        <td>{mat.descricao || "—"}</td>
                        <td>{mat.status || "PENDENTE"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-muted">Nenhum material cadastrado.</p>
              )}
            </div>
          </div>
        ))
      ) : (
        <p className="text-muted">Nenhum ambiente cadastrado.</p>
      )}
    </div>
  );
};

export default DetalhesProjetoView;