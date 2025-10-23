import React, { useEffect, useState } from "react";
import { apiFetch } from "../../../data/api";

interface Log {
  id: number;
  usuario_email: string;
  acao: string;
  projeto_nome: string;
  motivo?: string;
  data_hora: string;
}

const LogsView: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);

  useEffect(() => {
    const carregarLogs = async () => {
      try {
        const data = await apiFetch("/api/logs/");
        setLogs(data);
      } catch (e: any) {
        setErro(e.message || "Erro ao buscar logs");
      } finally {
        setCarregando(false);
      }
    };
    carregarLogs();
  }, []);

  if (carregando) return <p>Carregando logs...</p>;
  if (erro) return <p style={{ color: "red" }}>Erro: {erro}</p>;

  return (
    <div>
      <div className="content-header">
        <h1>Logs do Sistema</h1>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              const csv =
                "ID,Usuário,Ação,Projeto,Motivo,Data e Hora\n" +
                logs
                  .map(
                    (l) =>
                      `${l.id},"${l.usuario_email}","${l.acao}","${l.projeto_nome || "-"}","${
                        l.motivo || "-"
                      }","${new Date(l.data_hora).toLocaleString()}"`
                  )
                  .join("\n");
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const link = document.createElement("a");
              link.href = URL.createObjectURL(blob);
              link.download = `logs_${new Date().toISOString().split("T")[0]}.csv`;
              link.click();
            }}
          >
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
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{log.usuario_email}</td>
                <td>
                  <span className={`status-badge ${log.acao.toLowerCase()}`}>
                    {log.acao}
                  </span>
                </td>
                <td>{log.projeto_nome || "-"}</td>
                <td>{log.motivo || "-"}</td>
                <td>{new Date(log.data_hora).toLocaleString("pt-BR")}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs.length === 0 && (
          <div className="no-projects-message">
            <p>Nenhum registro de log encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogsView;