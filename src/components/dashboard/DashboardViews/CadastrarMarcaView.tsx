import React, { useState, useEffect } from "react";
import { getMarcasDescricao, salvarMarcaDescricao, MaterialMarca } from "../../../data/api";

const CadastrarMarcaView: React.FC = () => {
  const [materiais, setMateriais] = useState<MaterialMarca[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<string>("");
  const [novaMarca, setNovaMarca] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [carregandoMateriais, setCarregandoMateriais] = useState(false);
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: 'sucesso' | 'erro' } | null>(null);

  useEffect(() => {
    carregarMateriais();
  }, []);

  const carregarMateriais = async () => {
    try {
      setCarregandoMateriais(true);
      const response = await getMarcasDescricao();
      setMateriais(response.results);
    } catch (error) {
      console.error("Erro ao carregar materiais:", error);
      mostrarMensagem("Erro ao carregar materiais", "erro");
    } finally {
      setCarregandoMateriais(false);
    }
  };

  const mostrarMensagem = (texto: string, tipo: 'sucesso' | 'erro') => {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem(null), 5000);
  };

  const handleCriarMarca = async () => {
    if (!selectedMaterial) {
      mostrarMensagem("Selecione um material!", "erro");
      return;
    }

    if (!novaMarca.trim()) {
      mostrarMensagem("Digite o nome da marca!", "erro");
      return;
    }

    setLoading(true);
    try {
      await salvarMarcaDescricao({
        material: selectedMaterial,
        marcas: novaMarca.trim()
      });
      
      mostrarMensagem("Marca salva com sucesso!", "sucesso");
      setNovaMarca("");
      setSelectedMaterial("");
      
      await carregarMateriais();
    } catch (error: any) {
      console.error("Erro ao salvar marca:", error);
      
      if (error.message.includes('400')) {
        mostrarMensagem("Erro: Formato de dados inválido. Verifique se a marca foi digitada corretamente.", "erro");
      } else {
        mostrarMensagem("Erro ao salvar marca", "erro");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCriarMarca();
    }
  };

  return (
    <div>
      <div className="content-header mb-4">
        <h1 className="h4 fw-bold">Cadastrar Marca</h1>
      </div>

      {/* Mensagens de feedback */}
      {mensagem && (
        <div className={`alert ${mensagem.tipo === 'sucesso' ? 'alert-success' : 'alert-danger'} alert-dismissible fade show mb-4`}>
          {mensagem.texto}
          <button type="button" className="btn-close" onClick={() => setMensagem(null)}></button>
        </div>
      )}

      {/* Formulário */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header">
          <h5 className="card-title mb-0">Nova Marca</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Material</label>
                <select
                  className="form-select"
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  disabled={carregandoMateriais}
                >
                  <option value="">Selecione um material</option>
                  {materiais.map((material) => (
                    <option key={material.id} value={material.material}>
                      {material.material}
                    </option>
                  ))}
                </select>
                {carregandoMateriais && (
                  <small className="text-muted">Carregando materiais...</small>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Nome da Marca</label>
                <input
                  type="text"
                  placeholder="Digite o nome da marca"
                  className="form-control"
                  value={novaMarca}
                  onChange={(e) => setNovaMarca(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end">
            <button
              className="btn btn-primary px-4"
              onClick={handleCriarMarca}
              disabled={loading || !selectedMaterial || !novaMarca.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Salvando...
                </>
              ) : (
                "Salvar Marca"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Lista de materiais e marcas existentes */}
      <div className="card  border-0 shadow-sm">
        <div className="card-header">
          <h5 className="card-title mb-0">Materiais e Marcas Cadastradas</h5>
        </div>
        <div className="card-body">
          {carregandoMateriais ? (
            <div className="text-center p-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
              <p className="mt-2 text-muted">Carregando materiais...</p>
            </div>
          ) : materiais.length === 0 ? (
            <div className="alert alert-info mb-0">
              <i className="bi bi-info-circle me-2"></i>
              Nenhum material cadastrado.
            </div>
          ) : (
            <div className="row">
              {materiais.map((material) => (
                <div key={material.id} className="col-md-6 col-lg-4 mb-3">
                  <div className="card h-100">
                    <div className="card-body ">
                      <h6 className="card-title text-primary">{material.material}</h6>
                      <p className="card-text small text-muted mb-0">
                        <strong>Marcas:</strong> {material.marcas}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CadastrarMarcaView;