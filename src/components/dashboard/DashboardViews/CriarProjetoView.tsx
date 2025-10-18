import React, { useState, useEffect } from "react";
import { listarAmbientes, criarProjeto, criarAmbiente } from "../../../data/projects";

interface CriarProjetoViewProps {
  onNext: (projetoId: number) => void;
}

interface AmbienteInfo {
  id: number;
  nome: string;
  categoria?: string;
  tipo?: number | null;
}

const CriarProjetoView: React.FC<CriarProjetoViewProps> = ({ onNext }) => {
  const [formData, setFormData] = useState({
    nomeProjeto: "",
    tipoProjeto: "",
    descricao: "",
    dataEntrega: "",
  });
  const [ambientesLista, setAmbientesLista] = useState<AmbienteInfo[]>([]);
  const [ambientesSelecionados, setAmbientesSelecionados] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const carregarAmbientes = async () => {
      try {
        const ambientes = await listarAmbientes();
        // mostra apenas ambientes "genéricos" (sem projeto)
        setAmbientesLista(ambientes.filter((a: any) => !a.projeto));
      } catch {
        alert("Erro ao carregar ambientes");
      }
    };
    carregarAmbientes();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    setLoading(true);
    try {
      const projeto = await criarProjeto({
        nome_do_projeto: formData.nomeProjeto,
        tipo_do_projeto: formData.tipoProjeto,
        data_entrega: formData.dataEntrega,
        descricao: formData.descricao,
      });

      for (const ambienteId of ambientesSelecionados) {
        const original = ambientesLista.find((a) => a.id === ambienteId);
        if (!original) continue;
        await criarAmbiente({
          projeto: projeto.id,
          nome_do_ambiente: original.nome,
          tipo: original.tipo || null,
          categoria: original.categoria || "PRIVATIVA",
        });
      }

      alert("Projeto criado com sucesso!");
      onNext(projeto.id);
    } catch (err: any) {
      console.error("Erro ao criar projeto:", err);
      alert("Erro ao criar projeto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Criar Novo Projeto</h2>
      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Nome do Projeto</label>
            <input
              type="text"
              name="nomeProjeto"
              className="form-control"
              value={formData.nomeProjeto}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Tipo do Projeto</label>
            <select
              name="tipoProjeto"
              className="form-control"
              value={formData.tipoProjeto}
              onChange={handleInputChange}
              required
            >
              <option value="">Selecione</option>
              <option value="RESIDENCIAL">Residencial</option>
              <option value="COMERCIAL">Comercial</option>
              <option value="INDUSTRIAL">Industrial</option>
            </select>
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
            className="form-control"
            rows={3}
            value={formData.descricao}
            onChange={handleInputChange}
          />
        </div>

        <div className="mb-3">
          <h5>Selecione os Ambientes para este Projeto:</h5>
          <div className="list-group">
            {ambientesLista.map((a) => (
              <label key={a.id} className="list-group-item">
                <input
                  type="checkbox"
                  checked={ambientesSelecionados.includes(a.id)}
                  onChange={() => toggleAmbiente(a.id)}
                  className="form-check-input me-2"
                />
                {a.nome}{" "}
                <span className="text-muted">
                  ({a.categoria || "Sem categoria"})
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="d-flex justify-content-end">
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Criando..." : "Criar Projeto"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CriarProjetoView;