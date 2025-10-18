// src/components/dashboard/DashboardViews/LogsView.tsx
import React from 'react';

const LogsView: React.FC = () => {
  const logsData = [
    {
    id: 1,
    usuario: 'Fernando Nascimento - Gerente',
    acao: 'Aprovado',
    projeto: 'Condomínio A - Torre A',
    motivo: '',
    dataHora: '15/03/2024 14:30'
  },
  {
    id: 2,
    usuario: 'Kayky Lima - Atendente',
    acao: 'Aprovado',
    projeto: 'Condomínio A - Área Comum',
    motivo: '',
    dataHora: '20/03/2024 16:20'
  },
  {
    id: 3,
    usuario: 'Carlos Diego - Atendente',
    acao: 'Reprovado',
    projeto: 'Residencial B',
    motivo: 'Mármore importado não aprovado',
    dataHora: '14/03/2024 11:20'
  },
  {
    id: 4,
    usuario: 'Carlos Diego - Atendente',
    acao: 'Pendente',
    projeto: 'Edifício Commercial',
    motivo: 'Aguardando aprovação dos materiais',
    dataHora: '26/03/2024 10:15'
  },
  {
    id: 5,
    usuario: 'Fabiano Vidal - Super Admin',
    acao: 'Pendente',
    projeto: 'Condomínio Residencial Premium',
    motivo: 'Aguardando aprovação do piso laminado',
    dataHora: '29/03/2024 16:45'
  }
  ];

  return (
    <div>
      <div className="content-header">
        <h1>Logs do Sistema</h1>
        <div className="header-actions">
          <button className="btn btn-primary">
            Exportar Logs
          </button>
        </div>
      </div>

      <div className="projects-table-container">
        <table className="projects-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuário</th>
              <th>Ação</th>
              <th>Projeto</th>
              <th>Motivo</th>
              <th>Data e Hora</th>
            </tr>
          </thead>
          <tbody>
            {logsData.map(log => (
              <tr key={log.id} className="project-row">
                <td>{log.id}</td>
                <td>{log.usuario}</td>
                <td>
                  <span className={`status-badge ${log.acao.toLowerCase()}`}>
                    {log.acao}
                  </span>
                </td>
                <td className="project-name">{log.projeto}</td>
                <td>{log.motivo}</td>
                <td>{log.dataHora}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {logsData.length === 0 && (
          <div className="no-projects-message">
            <p>Nenhum registro de log encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogsView;