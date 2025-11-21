import React, { useEffect, useState, useCallback } from "react";
import { apiFetch } from "../../../data/api";

interface Log {
  id: number;
  usuario_email: string;
  acao: string;
  projeto_nome: string;
  motivo?: string;
  data_hora: string;
}

interface PaginatedLogs {
  results: Log[];
  next: string | null;
  previous: string | null;
  count: number;
}

const LogsView: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);
  const [count, setCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);

  const carregarLogs = useCallback(async (pageNum: number = 1) => {
    setCarregando(true);
    setErro(null);
    try {
      const data = (await apiFetch(`/api/logs/?page=${pageNum}`)) as PaginatedLogs;

      if (Array.isArray(data)) {
        setLogs(data);
        setNext(null);
        setPrevious(null);
        setCount(data.length);
        setTotalPages(1);
      } else {
        setLogs(data.results || []);
        setNext(data.next);
        setPrevious(data.previous);
        setCount(data.count);
        setTotalPages(Math.ceil(data.count / 10));
      }

      setPage(pageNum);
    } catch (e: any) {
      setErro(e.message || "Erro ao buscar logs");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarLogs(1);
  }, [carregarLogs]);

  const handleExportarLogs = useCallback(() => {
    const csv =
      "ID,Usuário,Ação,Projeto,Motivo,Data e Hora\n" +
      logs
        .map(
          (l) =>
            `${l.id},"${l.usuario_email}","${l.acao}","${
              l.projeto_nome || "-"
            }","${l.motivo || "-"}","${new Date(
              l.data_hora
            ).toLocaleString()}"`
        )
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `logs_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  }, [logs]);

  if (carregando) return <p>Carregando logs...</p>;
  if (erro) return <p style={{ color: "red" }}>Erro: {erro}</p>;

  return (
    <div>
      <div className="content-header">
        <h1>Logs do Sistema</h1>
        <div className="header-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleExportarLogs}
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

            {/* Paginação estilo Bootstrap */}
      {count > 0 && totalPages > 1 && (
        <nav className="mt-3">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
              <button
                type="button"
                className="page-link"
                onClick={() => carregarLogs(page - 1)}
                disabled={page === 1}
              >
                Anterior
              </button>
            </li>
            <li className="page-item disabled">
              <span className="page-link">
                Página {page} de {totalPages}
              </span>
            </li>
            <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
              <button
                type="button"
                className="page-link"
                onClick={() => carregarLogs(page + 1)}
                disabled={page === totalPages}
              >
                Próxima
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default LogsView;