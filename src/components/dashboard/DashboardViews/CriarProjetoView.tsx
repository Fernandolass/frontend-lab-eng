import React, { useState, useEffect } from "react";
import { listarAmbientes, criarProjeto, criarAmbiente } from "../../../data/projects";
import { apiFetch } from "../../../data/api";

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

  const [novoAmbiente, setNovoAmbiente] = useState({
    nome: "",
    tipo: "",
  });
  const [criandoAmbiente, setCriandoAmbiente] = useState(false);

  useEffect(() => {
    const carregarAmbientes = async () => {
      try {
        const ambientes = await listarAmbientes();
        // 🔹 Garante que todo ambiente sem tipo seja tratado como 1 (Área Privativa)
        const ambientesComTipo = ambientes.map((a: AmbienteInfo) => ({
          ...a,
          tipo: a.tipo ?? 1,
        }));
        setAmbientesLista(ambientesComTipo);
      } catch {
        alert("Erro ao carregar ambientes");
      }
    };
    carregarAmbientes();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
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
      const existentes = await apiFetch(`/api/projetos/?search=${formData.nomeProjeto}`);

      if (
        existentes.results &&
        existentes.results.some((p: any) => p.nome_do_projeto === formData.nomeProjeto)
      ) {
        alert("Já existe um projeto com esse nome!");
        setLoading(false);
        return;
      }

      const projeto = await criarProjeto({
        nome_do_projeto: formData.nomeProjeto,
        tipo_do_projeto: formData.tipoProjeto,
        data_entrega: formData.dataEntrega,
        descricao: formData.descricao,
        ambientes_ids: ambientesSelecionados,
      });

      alert("Projeto criado com sucesso!");
      onNext(projeto.id);
    } catch (err: any) {
      console.error("Erro ao criar projeto:", err);
      alert("Erro ao criar projeto.");
    } finally {
      setLoading(false);
    }
  };

  const handleCriarAmbiente = async () => {
    if (!novoAmbiente.nome || !novoAmbiente.tipo) {
      alert("Informe o nome e o tipo do ambiente!");
      return;
    }

    try {
      const ambienteCriado = await criarAmbiente({
        projeto: 0,
        nome_do_ambiente: novoAmbiente.nome,
        tipo: Number(novoAmbiente.tipo),
      });

      alert("Ambiente criado com sucesso!");
      setAmbientesLista((prev) => [...prev, ambienteCriado]);
      setNovoAmbiente({ nome: "", tipo: "" });
      setCriandoAmbiente(false);
    } catch (error) {
      console.error("Erro ao criar ambiente:", error);
      alert("Erro ao criar ambiente.");
    }
  };

  return (
    <div className="">
      <div className="content-header">
        <h1>Criar novo projeto</h1>
      </div>
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

          <div className="list-group mb-3">
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
                  (
                  {a.tipo === 1
                    ? "Área Privativa"
                    : a.tipo === 2
                    ? "Área Comum"
                    : "Área Privativa"}
                  )
                </span>
              </label>
            ))}
          </div>

          {criandoAmbiente ? (
            <div className="border p-3 rounded bg-light mb-3">
              <h6>Criar novo ambiente</h6>
              <div className="row mb-2">
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nome do ambiente"
                    value={novoAmbiente.nome}
                    onChange={(e) =>
                      setNovoAmbiente({ ...novoAmbiente, nome: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-md-6">
                  <select
                    className="form-control"
                    value={novoAmbiente.tipo}
                    onChange={(e) =>
                      setNovoAmbiente({ ...novoAmbiente, tipo: e.target.value })
                    }
                    required
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="1">Área Privativa</option>
                    <option value="2">Área Comum</option>
                  </select>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleCriarAmbiente}
                >
                  Salvar Ambiente
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setCriandoAmbiente(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-primary mb-3"
              onClick={() => setCriandoAmbiente(true)}
            >
              Criar novo ambiente
            </button>
          )}
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