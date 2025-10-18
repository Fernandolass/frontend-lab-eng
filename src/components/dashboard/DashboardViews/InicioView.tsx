import React from 'react';

interface InicioViewProps {
  onViewDetails: () => void;
}

const InicioView: React.FC<InicioViewProps> = ({ onViewDetails }) => {
  const metricsData = {
    aprovados: 20,
    reprovados: 15,
    pendentes: 30,
    total: 12
  };

  const monthlyData = [10, 8, 9, 12, 14, 12];

  return (
    <div className="inicio-container">
      <div className="content-header">
        <h1 className="page-title">Dashboard Inicial</h1>
        <p className="page-subtitle">Visão geral dos projetos e atividades</p>
      </div>

      <div className="row mb-5">
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card stat-card approved-card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="ms-3">
                  <h3 className="stat-number">{metricsData.aprovados}</h3>
                  <p className="stat-label">Projetos Aprovados</p>
                  <span className="stat-trend text-success">
                    <i className="fas fa-arrow-up me-1"></i>
                    15% este mês
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card stat-card rejected-card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="">
                  <i className="fas fa-times-circle"></i>
                </div>
                <div className="ms-3">
                  <h3 className="stat-number">{metricsData.reprovados}</h3>
                  <p className="stat-label">Projetos Reprovados</p>
                  <span className="stat-trend text-danger">
                    <i className="fas fa-arrow-down me-1"></i>
                    5% este mês
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card stat-card pending-card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="ms-3">
                  <h3 className="stat-number">{metricsData.pendentes}</h3>
                  <p className="stat-label">Projetos Pendentes</p>
                  <span className="stat-trend text-warning">
                    <i className="fas fa-arrow-up me-1"></i>
                    8% este mês
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card stat-card total-card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="">
                  <i className="fas fa-folder"></i>
                </div>
                <div className="ms-3">
                  <h3 className="stat-number">{metricsData.total}</h3>
                  <p className="stat-label">Total de Projetos</p>
                  <span className="stat-trend text-total-card ">
                    <i className="fas fa-chart-line me-1"></i>
                    12% crescimento
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico e Ações Rápidas */}
      <div className="row mb-5">
        <div className="col-lg-8 mb-4">
          <div className="card chart-card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-chart-bar me-2 text-primary"></i>
                Projetos por Mês (Últimos 6 meses)
              </h5>
            </div>
            <div className="card-body">
              <div className="chart-container">
                <div className="bars-container">
                  {monthlyData.map((value, index) => (
                    <div key={index} className="bar-item">
                      <div className="bar-wrapper">
                        <div 
                          className="bar-fill" 
                          style={{ height: `${(value / 20) * 100}%` }}
                        ></div>
                      </div>
                      <span className="bar-label">{['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'][index]}</span>
                      <span className="bar-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status de Atividades Recentes */}
      <div className="row">
        <div className="col-12">
          <div className="card activity-card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-history me-2 text-info"></i>
                Atividades Recentes
              </h5>
            </div>
            <div className="card-body">
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon bg-success">
                    <i className="fas fa-check"></i>
                  </div>
                  <div className="activity-content">
                    <h6>Projeto "Condomínio A" foi aprovado</h6>
                    <p className="text-muted">Por João Silva • Hoje às 14:30</p>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon bg-warning">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="activity-content">
                    <h6>Novo projeto pendente de revisão</h6>
                    <p className="text-muted">"Edifício Commercial" • Hoje às 11:15</p>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon bg-danger">
                    <i className="fas fa-times"></i>
                  </div>
                  <div className="activity-content">
                    <h6>Projeto "Residencial B" foi reprovado</h6>
                    <p className="text-muted">Por Maria Santos • Ontem às 16:45</p>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon bg-info">
                    <i className="fas fa-plus"></i>
                  </div>
                  <div className="activity-content">
                    <h6>Novo projeto criado</h6>
                    <p className="text-muted">"Condomínio Premium" • Ontem às 09:20</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InicioView;