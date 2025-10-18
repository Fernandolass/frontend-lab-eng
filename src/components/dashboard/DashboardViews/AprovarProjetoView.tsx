import React, { useState } from 'react';
import { projetosDetalhes, ProjetoDetalhes, Ambiente, Material } from '../../../data/mockData';

interface AprovarProjetoViewProps {
  projetoId: number;
  onBack: () => void;
}

const AprovarProjetoView: React.FC<AprovarProjetoViewProps> = ({ projetoId, onBack }) => {
  const [observacoesTemp, setObservacoesTemp] = useState<{[key: string]: string}>({});
  const [ambientesContraidos, setAmbientesContraidos] = useState<{[key: number]: boolean}>({});
  const [projetoData, setProjetoData] = useState<ProjetoDetalhes | undefined>(
    projetosDetalhes.find((p: ProjetoDetalhes) => p.id === projetoId)
  );

  if (!projetoData) {
    return (
      <div>
        <div className="content-header">
          <button className="btn btn-secondary me-3" onClick={onBack}>
            ← Voltar
          </button>
          <h1>Projeto não encontrado</h1>
        </div>
      </div>
    );
  }

  const toggleAmbiente = (ambienteId: number) => {
    setAmbientesContraidos(prev => ({
      ...prev,
      [ambienteId]: !prev[ambienteId]
    }));
  };

  const handleAprovarMaterial = (ambienteId: number, materialId: string) => {
    setProjetoData(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        ambientes: prev.ambientes.map(ambiente => 
          ambiente.id === ambienteId 
            ? {
                ...ambiente,
                materiais: ambiente.materiais.map(material =>
                  material.id === materialId
                    ? { 
                        ...material, 
                        status: 'aprovado',
                        dataAprovacao: new Date().toLocaleDateString('pt-BR'),
                        aprovador: 'Usuário Atual',
                        observacoes: observacoesTemp[materialId] || material.observacoes
                      }
                    : material
                )
              }
            : ambiente
        )
      };
    });

    setObservacoesTemp(prev => {
      const newObs = { ...prev };
      delete newObs[materialId];
      return newObs;
    });

    console.log('Material aprovado:', { ambienteId, materialId });
  };

  const handleReprovarMaterial = (ambienteId: number, materialId: string) => {
    const observacao = observacoesTemp[materialId] || 'Item reprovado sem observações específicas';
    
    setProjetoData(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        ambientes: prev.ambientes.map(ambiente => 
          ambiente.id === ambienteId 
            ? {
                ...ambiente,
                materiais: ambiente.materiais.map(material =>
                  material.id === materialId
                    ? { 
                        ...material, 
                        status: 'reprovado',
                        motivo: observacao,
                        dataAprovacao: new Date().toLocaleDateString('pt-BR'),
                        aprovador: 'Usuário Atual',
                        observacoes: observacao
                      }
                    : material
                )
              }
            : ambiente
        )
      };
    });

    setObservacoesTemp(prev => {
      const newObs = { ...prev };
      delete newObs[materialId];
      return newObs;
    });

    console.log('Material reprovado:', { ambienteId, materialId, observacao });
  };

  const handleSalvarObservacao = (materialId: string, observacao: string) => {
    setObservacoesTemp(prev => ({
      ...prev,
      [materialId]: observacao
    }));
  };

  const contarMateriaisPorStatus = (status: Material['status']): number => {
    return projetoData.ambientes.reduce((total, ambiente) => {
      return total + ambiente.materiais.filter(material => material.status === status).length;
    }, 0);
  };

  const materiaisPendentes = projetoData.ambientes.reduce((total, ambiente) => {
    return total + ambiente.materiais.filter(material => material.status === 'pendente').length;
  }, 0);


  const toggleTodosAmbientes = (expandir: boolean) => {
    const novoEstado: {[key: number]: boolean} = {};
    projetoData.ambientes.forEach(ambiente => {
      novoEstado[ambiente.id] = !expandir;
    });
    setAmbientesContraidos(novoEstado);
  };

  return (
    <div>
      {/* Header */}
      <div className="content-header">
        <div className="d-flex align-items-start">
          <button className="btn btn-secondary me-3" onClick={onBack}>
            ↩ Voltar
          </button>
          <div>
            <h1 className="mb-1">{projetoData.nome}</h1>
            <div className="text-muted">
              <div>Responsável: {projetoData.responsavel}</div>
              <div>Data: {projetoData.dataCriacao}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Resumo do Projeto */}
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="project-summary p-3 bg-light rounded">
            <div className="row text-center">
              <div className="col-md-3">
                <div className="fs-4 fw-bold text">{materiaisPendentes}</div>
                <div className="text-muted">Pendentes</div>
              </div>
              <div className="col-md-3">
                <div className="fs-4 fw-bold text">{contarMateriaisPorStatus('aprovado')}</div>
                <div className="text-muted">Aprovados</div>
              </div>
              <div className="col-md-3">
                <div className="fs-4 fw-bold text">{contarMateriaisPorStatus('reprovado')}</div>
                <div className="text-muted">Reprovados</div>
              </div>
              <div className="col-md-3">
                <div className="fs-4 fw-bold text">{projetoData.ambientes.length}</div>
                <div className="text-muted">Ambientes</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controles de Expansão/Contração */}
      <div className="row mb-3">
        <div className="col-md-12">
          <div className="d-flex justify-content-end gap-2">
            <button 
              className="btn btn-outline-secondary btn-sm"
              onClick={() => toggleTodosAmbientes(true)}
            >
              Expandir
            </button>
            <button 
              className="btn btn-outline-secondary btn-sm"
              onClick={() => toggleTodosAmbientes(false)}
            >
              Contrair
            </button>
          </div>
        </div>
      </div>

      {/* Checklist de Aprovação */}
      <div className="checklist-container">
        {projetoData.ambientes.map((ambiente: Ambiente) => {
          const materiaisPendentesAmbiente = ambiente.materiais.filter(m => m.status === 'pendente');
          const materiaisProcessados = ambiente.materiais.filter(m => m.status !== 'pendente');
          const isContraido = ambientesContraidos[ambiente.id];

          return (
            <div key={ambiente.id} className="ambiente-card mb-4">
              <div className="card">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    {ambiente.nome}
                    <small className="ms-2 opacity-75">
                      ({materiaisPendentesAmbiente.length} pendentes)
                    </small>
                  </h5>
                  <button
                    className="btn-toggle-ambiente"
                    onClick={() => toggleAmbiente(ambiente.id)}
                    title={isContraido ? "Expandir ambiente" : "Contrair ambiente"}
                  >
                    {isContraido ? '➝' : '⤵'}
                  </button>
                </div>
                
                {!isContraido && (
                  <div className="card-body">
                    {/* Materiais Pendentes */}
                    {materiaisPendentesAmbiente.length > 0 && (
                      <div className="materiais-pendentes">
                        <h6 className="text-muted mb-3">Itens Pendentes de Aprovação</h6>
                        {materiaisPendentesAmbiente.map((material: Material) => (
                          <div key={material.id} className="material-item row align-items-center mb-3 p-3 border rounded">
                            <div className="col-md-2">
                              <strong>{material.nome}</strong>
                            </div>
                            
                            <div className="col-md-3">
                              <span className="text-muted">{material.tipo}</span>
                            </div>
                            
                            <div className="col-md-4">
                              <textarea
                                className="form-control form-control-sm"
                                placeholder="Digite suas observações sobre este item..."
                                value={observacoesTemp[material.id] || ''}
                                onChange={(e) => handleSalvarObservacao(material.id, e.target.value)}
                                rows={2}
                              />
                              <small className="text-muted">
                                Observações são obrigatórias para aprovação/reprovação
                              </small>
                            </div>
                            
                            <div className="col-md-3">
                              <div className="d-flex gap-2 justify-content-end">
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => handleAprovarMaterial(ambiente.id, material.id)}
                                  disabled={!observacoesTemp[material.id] && !material.observacoes}
                                  title={!observacoesTemp[material.id] && !material.observacoes ? "Adicione uma observação antes de aprovar" : "Aprovar este item"}
                                >
                                  Aprovar
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleReprovarMaterial(ambiente.id, material.id)}
                                  disabled={!observacoesTemp[material.id]}
                                  title={!observacoesTemp[material.id] ? "Adicione uma observação antes de reprovar" : "Reprovar este item"}
                                >
                                  Reprovar
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Materiais Já Processados */}
                    {materiaisProcessados.length > 0 && (
                      <div className="materiais-processados mt-4">
                        <h6 className="text-success mb-3">Itens Já Processados</h6>
                        {materiaisProcessados.map((material: Material) => (
                          <div key={material.id} className={`material-item row align-items-center mb-2 p-2 rounded ${
                            material.status === 'aprovado' ? 'bg-success bg-opacity-10' : 'bg-danger bg-opacity-10'
                          }`}>
                            <div className="col-md-2">
                              <strong>{material.nome}</strong>
                            </div>
                            
                            <div className="col-md-3">
                              <span className="text-muted">{material.tipo}</span>
                            </div>
                            
                            <div className="col-md-4">
                              {material.observacoes && (
                                <div className="small">
                                  <strong>Observações:</strong> {material.observacoes}
                                </div>
                              )}
                              {material.motivo && material.status === 'reprovado' && (
                                <div className="small text-danger">
                                  <strong>Motivo:</strong> {material.motivo}
                                </div>
                              )}
                            </div>
                            
                            <div className="col-md-3">
                              <span className={`badge ${material.status === 'aprovado' ? 'bg-success' : 'bg-danger'}`}>
                                {material.status === 'aprovado' ? 'Aprovado' : 'Reprovado'}
                              </span>
                              {material.dataAprovacao && (
                                <div className="small text-muted">
                                  Em {material.dataAprovacao}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {materiaisPendentesAmbiente.length === 0 && materiaisProcessados.length === 0 && (
                      <div className="text-center text-muted py-3">
                        Nenhum material cadastrado para este ambiente.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="row mt-4">
        <div className="col-md-12">
          <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
            <div>
              {}
            </div>
            <div>
              <button 
                className="btn btn-primary me-2"
                onClick={onBack}
              >
                Finalizar
              </button>
              <button 
                className="btn btn-secondary"
                onClick={onBack}
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AprovarProjetoView;