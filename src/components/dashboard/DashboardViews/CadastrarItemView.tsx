import React, { useState, useEffect } from "react";
import { listarAmbientes, criarMaterial } from "../../../data/projects";

interface NovoItem {
  nome: string;
  descricao: string;
  ambientesSelecionados: number[];
}

const ItemView: React.FC = () => {
  const [ambientes, setAmbientes] = useState<any[]>([]);
  const [novoItem, setNovoItem] = useState<NovoItem>({ 
    nome: "", 
    descricao: "", 
    ambientesSelecionados: [] 
  });
  const [loading, setLoading] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: 'sucesso' | 'erro' } | null>(null);

  useEffect(() => {
    carregarAmbientes();
  }, []);

  const carregarAmbientes = async () => {
    try {
      const lista = await listarAmbientes();
      setAmbientes(lista);
    } catch (err) {
      console.error("Erro ao carregar ambientes:", err);
      mostrarMensagem("Erro ao carregar ambientes.", "erro");
    } finally {
      setCarregando(false);
    }
  };

  const mostrarMensagem = (texto: string, tipo: 'sucesso' | 'erro') => {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem(null), 5000);
  };

  const toggleAmbiente = (ambienteId: number) => {
    setNovoItem(prev => ({
      ...prev,
      ambientesSelecionados: prev.ambientesSelecionados.includes(ambienteId)
        ? prev.ambientesSelecionados.filter(id => id !== ambienteId)
        : [...prev.ambientesSelecionados, ambienteId]
    }));
  };

  const toggleTodosAmbientes = () => {
    if (novoItem.ambientesSelecionados.length === ambientes.length) {
      setNovoItem(prev => ({
        ...prev,
        ambientesSelecionados: []
      }));
    } else {
      setNovoItem(prev => ({
        ...prev,
        ambientesSelecionados: ambientes.map(amb => amb.id)
      }));
    }
  };

  const handleCriarItem = async () => {
    if (!novoItem.nome.trim() || !novoItem.descricao.trim()) {
      mostrarMensagem("Preencha o nome e a descrição do item!", "erro");
      return;
    }

    if (novoItem.ambientesSelecionados.length === 0) {
      mostrarMensagem("Selecione pelo menos um ambiente!", "erro");
      return;
    }

    setLoading(true);
    try {
      const promises = novoItem.ambientesSelecionados.map(ambienteId =>
        criarMaterial({
          ambiente: ambienteId,
          item: novoItem.nome.trim(),
          descricao: novoItem.descricao.trim(),
        })
      );

      await Promise.all(promises);
      
      setNovoItem({ 
        nome: "", 
        descricao: "", 
        ambientesSelecionados: [] 
      });
      
      mostrarMensagem("Item criado com sucesso para os ambientes selecionados! 🎉", "sucesso");

    } catch (err: any) {
      console.error("Erro ao criar item:", err);
      
      let errorMessage = "Erro ao criar item";
      
      if (err?.message?.includes("403") || err?.message?.includes("Forbidden")) {
        errorMessage = "Você não tem permissão para criar itens. Entre em contato com o administrador.";
      } else if (err?.message) {
        const shortMessage = err.message.length > 100 
          ? err.message.substring(0, 100) + "..." 
          : err.message;
        errorMessage = `Erro: ${shortMessage}`;
      }
      
      mostrarMensagem(errorMessage, "erro");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCriarItem();
    }
  };

  if (carregando) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
        <p className="mt-2 text-muted">Carregando ambientes...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="content-header mb-4">
        <h1 className="h4 fw-bold">Cadastrar Item</h1>
      </div>

      {/* Mensagens de feedback */}
      {mensagem && (
        <div className={`alert ${mensagem.tipo === 'sucesso' ? 'alert-success' : 'alert-danger'} alert-dismissible fade show mb-4`}>
          {mensagem.texto}
          <button type="button" className="btn-close" onClick={() => setMensagem(null)}></button>
        </div>
      )}

      {/* Formulário */}
      <div className="card border-0 shadow-sm">
        <div className="card-header">
          <h5 className="card-title mb-0">Novo Item</h5>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Nome do Item</label>
              <input
                type="text"
                placeholder="Ex: Piso, Parede, Teto, Porta..."
                className="form-control"
                value={novoItem.nome}
                onChange={(e) => setNovoItem({ ...novoItem, nome: e.target.value })}
                onKeyPress={handleKeyPress}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Descrição</label>
              <input
                type="text"
                placeholder="Descreva as especificações do item..."
                className="form-control"
                value={novoItem.descricao}
                onChange={(e) => setNovoItem({ ...novoItem, descricao: e.target.value })}
                onKeyPress={handleKeyPress}
              />
            </div>
          </div>

          {/* Seleção de ambientes */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <label className="form-label fw-bold mb-0">Ambientes</label>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={toggleTodosAmbientes}
              >
                {novoItem.ambientesSelecionados.length === ambientes.length 
                  ? "Desmarcar Todos" 
                  : "Selecionar Todos"}
              </button>
            </div>

            <div className="border rounded p-3 bg-light">
              <div className="row">
                {ambientes.map((ambiente) => (
                  <div key={ambiente.id} className="col-md-6 mb-2">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={`ambiente-${ambiente.id}`}
                        checked={novoItem.ambientesSelecionados.includes(ambiente.id)}
                        onChange={() => toggleAmbiente(ambiente.id)}
                      />
                      <label className="form-check-label" htmlFor={`ambiente-${ambiente.id}`}>
                        {ambiente.nome}
                        <span className="text-muted ms-2">
                          ({ambiente.tipo === 1 ? "Área Privativa" : "Área Comum"})
                        </span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              
              {ambientes.length === 0 && (
                <div className="text-center text-muted py-3">
                  Nenhum ambiente cadastrado. Cadastre ambientes primeiro.
                </div>
              )}
            </div>

            <div className="mt-2 text-muted small">
              {novoItem.ambientesSelecionados.length} ambiente(s) selecionado(s)
            </div>
          </div>

          <div className="d-flex justify-content-end">
            <button
              className="btn btn-primary px-4"
              onClick={handleCriarItem}
              disabled={loading || !novoItem.nome.trim() || !novoItem.descricao.trim() || novoItem.ambientesSelecionados.length === 0}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Salvando...
                </>
              ) : (
                "Criar Item"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemView;