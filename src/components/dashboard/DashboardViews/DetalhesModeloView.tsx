import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { obterProjeto } from "../../../data/projects";

interface DetalhesModeloViewProps {
  onBack: () => void;
}

const DetalhesModeloView: React.FC<DetalhesModeloViewProps> = ({ onBack }) => {
  const { modeloId } = useParams<{ modeloId: string }>();
  const [modelo, setModelo] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const carregar = async () => {
      if (!modeloId) return;
      
      try {
        setCarregando(true);
        console.log('🔍 modeloId recebido:', modeloId);
        
        // 1. Buscar o modelo
        console.log('📦 Buscando modelo...');
        const response = await fetch(`http://127.0.0.1:8000/api/modelos-documento/${modeloId}/`, {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const modeloData = await response.json();
        console.log('✅ Modelo encontrado:', modeloData);
        console.log('🔑 projeto ID:', modeloData.projeto);
        
        // 2. Buscar o projeto ORIGINAL
        console.log('📦 Buscando projeto original...');
        const projetoOriginal = await obterProjeto(modeloData.projeto);
        console.log('✅ Projeto original:', projetoOriginal);
        
        setModelo(projetoOriginal);
        
      } catch (err) {
        console.error("❌ Erro ao carregar modelo:", err);
        if (err instanceof Error) {
          setErro(`Não foi possível carregar os detalhes do modelo: ${err.message}`);
        } else {
          setErro("Não foi possível carregar os detalhes do modelo.");
        }
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, [modeloId]);

  if (carregando) return <p>Carregando detalhes...</p>;
  if (erro) return <p className="text-danger">{erro}</p>;
  if (!modelo) return <p>Nenhum dado encontrado.</p>;

  return (
    <div className="container mt-4">
      <button className="btn btn-secondary mb-3" onClick={onBack}>
        ← Voltar
      </button>

      <h2>{modelo.nome || modelo.nome_do_projeto}</h2>

      <p><strong>Tipo:</strong> {modelo.tipoProjeto || modelo.tipo_do_projeto}</p>

      <p>
        <strong>Data de Entrega:</strong>{" "}
        {(() => {
          const data =
            modelo.data_entrega ||
            modelo.dataEntrega ||
            modelo.data_criacao ||
            modelo.dataCriacao;

          if (!data) return "Não informada";

          const parsed = new Date(data);
          return isNaN(parsed.getTime())
            ? "Não informada"
            : parsed.toLocaleDateString("pt-BR");
        })()}
      </p>

      <p><strong>Descrição:</strong> {modelo.descricao || "Sem descrição"}</p>
      <p><strong>Status:</strong> Aprovado</p>
      <p><strong>Responsável:</strong> {modelo.responsavel_nome || modelo.responsavel || "N/A"}</p>

      <hr />

      <h4>Ambientes</h4>
      {modelo.ambientes && modelo.ambientes.length > 0 ? (
        modelo.ambientes.map((amb: any) => (
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

export default DetalhesModeloView;