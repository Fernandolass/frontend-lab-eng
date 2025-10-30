import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';

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
        // Simulação de carregamento - substitua pela sua API
        setTimeout(() => {
          setModelo({
            id: modeloId,
            nome: 'Prédio 14 Andares',
            tipoModelo: 'Residencial',
            dataCriacao: '04/11/2023',
            responsavel: 'Kleberson Costa',
            descricao: 'Modelo padrão para contratos comerciais da empresa',
            secoes: [
              {
                id: 1,
                nome: 'Quarto/Suite',
                itens: [
                  { id: 1, item: 'Ar Condicionado', descricao: 'Infraestrutura para high wall com condensadora axial.' },
                  { id: 2, item: 'Esquadria', descricao: 'Alumínio pintado de branco.' },
                  { id: 3, item: 'Ferragem', descricao: 'Acabamento cromado.' },
                  { id: 4, item: 'Inst. Comunicação', descricao: 'Pontos secos de comunicação e de antena de TV.' },
                  { id: 5, item: 'Inst. Elétrica', descricao: 'Pontos de luz no teto, tomadas de corrente e interruptores.' },
                  { id: 6, item: 'Parede', descricao: 'Pintura PVA látex branco sobre gesso ou massa de regularização PVA.' },
                  { id: 7, item: 'Peitoril', descricao: 'Metálico.' },
                  { id: 8, item: 'Piso', descricao: 'Porcelanato ou laminado.' },
                  { id: 9, item: 'Porta', descricao: 'Porta semi-óca comum pintada / esmalte sintético.' },
                  { id: 10, item: 'Rodapé', descricao: 'Porcelanato ou laminado, h=5cm.' },
                  { id: 11, item: 'Soleira', descricao: 'Mármore ou granito.' },
                  { id: 12, item: 'Teto', descricao: 'Pintura PVA látex branco sobre gesso ou massa de regularização PVA.' },
                  { id: 13, item: 'Vidro', descricao: 'Liso incolor.' }
                ]
              }
            ]
          });
          setCarregando(false);
        }, 1000);
      } catch (err) {
        console.error("Erro ao carregar modelo:", err);
        setErro("Não foi possível carregar os detalhes do modelo.");
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

      <h2>{modelo.nome}</h2>

      <p><strong>Tipo:</strong> {modelo.tipoModelo}</p>

      <p><strong>Data de Criação:</strong> {modelo.dataCriacao}</p>

      <p><strong>Descrição:</strong> {modelo.descricao}</p>

      <p><strong>Responsável:</strong> {modelo.responsavel}</p>

      <hr />

      <h4>Seções do Modelo</h4>
      {modelo.secoes && modelo.secoes.length > 0 ? (
        modelo.secoes.map((secao: any) => (
          <div key={secao.id} className="card mb-3">
            <div className="card-header fw-bold">
              {secao.nome}
            </div>
            <div className="card-body">
              {secao.itens && secao.itens.length > 0 ? (
                <table className="table table-sm table-bordered">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Descrição</th>
                    </tr>
                  </thead>
                  <tbody>
                    {secao.itens.map((item: any) => (
                      <tr key={item.id}>
                        <td>{item.item}</td>
                        <td>{item.descricao || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-muted">Nenhum item cadastrado.</p>
              )}
            </div>
          </div>
        ))
      ) : (
        <p className="text-muted">Nenhuma seção cadastrada no modelo.</p>
      )}
    </div>
  );
};

export default DetalhesModeloView;