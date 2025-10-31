import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../../data/api';

interface InicioViewProps {
  onViewDetails?: (id: number) => void;
}

interface Metrics {
  aprovados: number;
  reprovados: number;
  pendentes: number;
  total: number;
}

interface Log {
  id: number;
  usuario_email: string;
  acao: string;
  projeto_nome: string;
  motivo?: string;
  data_hora: string;
}

const InicioView: React.FC<InicioViewProps> = ({ onViewDetails }) => {
  const [metricsData, setMetricsData] = useState<Metrics>({
    aprovados: 0,
    reprovados: 0,
    pendentes: 0,
    total: 0,
  });
  const [monthlyData, setMonthlyData] = useState<{ mes: string; qtd: number }[]>([]);
  const [recentLogs, setRecentLogs] = useState<Log[]>([]);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Totais
        const stats = await apiFetch('/api/stats/dashboard/');
        setMetricsData({
          aprovados: stats.projetos_aprovados,
          reprovados: stats.projetos_reprovados,
          pendentes: stats.projetos_pendentes,
          total: stats.total_projetos,
        });

        // Mensais
        const mensais = await apiFetch('/api/stats/mensais/');
        const monthlyArr = Object.entries(mensais).map(([mes, valores]: any) => ({
          mes,
          qtd: (valores.APROVADO || 0) + (valores.REPROVADO || 0) + (valores.PENDENTE || 0),
        }));
        setMonthlyData(monthlyArr.slice(-9)); // pega últimos 9 meses

        // Logs recentes
        const logs = await apiFetch('/api/logs/');
        setRecentLogs(Array.isArray(logs) ? logs.slice(0, 5) : []);
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
      }
    };
    carregarDados();
  }, []);

  return (
    <div className="inicio-container">
      <div className="content-header">
        <h1 className="page-title">Dashboard Inicial</h1>
        <p className="page-subtitle">Visão geral dos projetos e atividades</p>
      </div>

      {/* Métricas principais */}
      <div className="row mb-5">
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card stat-card approved-card">
            <div className="card-body d-flex align-items-center">
              <i className="fas fa-check-circle"></i>
              <div className="ms-3">
                <h3 className="stat-number">{metricsData.aprovados}</h3>
                <p className="stat-label">Projetos Aprovados</p>
                <span className="stat-trend text-success">
                  <i className="fas fa-arrow-up me-1"></i> 
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card stat-card rejected-card">
            <div className="card-body d-flex align-items-center">
              <i className="fas fa-times-circle"></i>
              <div className="ms-3">
                <h3 className="stat-number">{metricsData.reprovados}</h3>
                <p className="stat-label">Projetos Reprovados</p>
                <span className="stat-trend text-danger">
                  <i className="fas fa-arrow-down me-1"></i>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card stat-card pending-card">
            <div className="card-body d-flex align-items-center">
              <i className="fas fa-clock"></i>
              <div className="ms-3">
                <h3 className="stat-number">{metricsData.pendentes}</h3>
                <p className="stat-label">Projetos Pendentes</p>
                <span className="stat-trend text-warning">
                  <i className="fas fa-arrow-up me-1"></i>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card stat-card total-card">
            <div className="card-body d-flex align-items-center">
              <i className="fas fa-folder"></i>
              <div className="ms-3">
                <h3 className="stat-number">{metricsData.total}</h3>
                <p className="stat-label">Total de Projetos</p>
                <span className="stat-trend text-total-card">
                  <i className="fas fa-chart-line me-1"></i>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de projetos mensais */}
      <div className="row mb-5">
        <div className="col-lg-12 mb-4">
          <div className="card chart-card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-chart-bar me-2 text-primary"></i>
                Projetos por Mês
              </h5>
            </div>
            <div className="card-body">
              <div className="chart-container">
                <div className="bars-container">
                  {monthlyData.map((m, index) => (
                    <div key={index} className="bar-item">
                      <div className="bar-wrapper">
                        <div
                          className="bar-fill"
                          style={{ height: `${(m.qtd / 20) * 100}%` }}
                        ></div>
                      </div>
                      <span className="bar-label">{m.mes}</span>
                      <span className="bar-value">{m.qtd}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logs recentes */}
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
                {recentLogs.map((log) => (
                  <div key={log.id} className="activity-item">
                    <div
                      className={`activity-icon ${
                        log.acao === 'APROVACAO'
                          ? 'bg-success'
                          : log.acao === 'REPROVACAO'
                          ? 'bg-danger'
                          : 'bg-info'
                      }`}
                    >
                      <i
                        className={
                          log.acao === 'APROVACAO'
                            ? 'fas fa-check'
                            : log.acao === 'REPROVACAO'
                            ? 'fas fa-times'
                            : 'fas fa-plus'
                        }
                      ></i>
                    </div>
                    <div className="activity-content">
                      <h6>
                        {log.projeto_nome
                          ? `Projeto "${log.projeto_nome}" - ${log.acao}`
                          : log.acao}
                      </h6>
                      <p className="text-muted">
                        {log.usuario_email} •{' '}
                        {new Date(log.data_hora).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}

                {recentLogs.length === 0 && (
                  <p className="text-muted">Nenhuma atividade recente.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InicioView;  