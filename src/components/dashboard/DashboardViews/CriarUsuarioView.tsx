import React, { useState, useEffect } from "react";
import { criarUsuario, listarUsuarios, atualizarUsuario, deletarUsuario } from "../../../data/projects";

interface CriarUsuarioViewProps {
  onBack: () => void;
}

const CriarUsuarioView: React.FC<CriarUsuarioViewProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    id: 0,
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    tipoUsuario: "",
  });
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Mensagem de feedback
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: "sucesso" | "erro" } | null>(null);

  const mostrarMensagem = (texto: string, tipo: "sucesso" | "erro") => {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem(null), 5000);
  };

  // Carregar usuários da página atual
  useEffect(() => {
    async function carregarUsuarios() {
      const data = await listarUsuarios(currentPage);
      setUsuarios(data.results || []);

      if (data.count && data.results) {
        const pageSize = data.results.length;
        setTotalPages(Math.ceil(data.count / pageSize));
      }
    }
    carregarUsuarios();
  }, [currentPage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (erro) setErro(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    try {
      const [firstName, ...resto] = formData.nome.trim().split(" ");
      const lastName = resto.join(" ");

      if (editando) {
        await atualizarUsuario(formData.id, {
          email: formData.email,
          username: formData.email,
          first_name: firstName,
          last_name: lastName,
          cargo: formData.tipoUsuario as "atendente" | "gerente" | "superadmin",
        });
        mostrarMensagem("Usuário atualizado com sucesso!", "sucesso");
      } else {
        await criarUsuario({
          email: formData.email,
          username: formData.email,
          password: formData.senha,
          first_name: firstName,
          last_name: lastName,
          cargo: formData.tipoUsuario as "atendente" | "gerente" | "superadmin",
        });
        mostrarMensagem("Usuário criado com sucesso!", "sucesso");
      }

      setFormData({
        id: 0,
        nome: "",
        email: "",
        senha: "",
        confirmarSenha: "",
        tipoUsuario: "",
      });
      setEditando(false);

      const data = await listarUsuarios(currentPage);
      setUsuarios(data.results || []);
    } catch (err: any) {
      console.error("Erro:", err);
      mostrarMensagem("Erro ao salvar usuário.", "erro");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (usuario: any) => {
    setFormData({
      id: usuario.id,
      nome: `${usuario.first_name} ${usuario.last_name}`,
      email: usuario.email,
      senha: "",
      confirmarSenha: "",
      tipoUsuario: usuario.cargo,
    });
    setEditando(true);
  };

  const handleCancelEdit = () => {
    setFormData({
      id: 0,
      nome: "",
      email: "",
      senha: "",
      confirmarSenha: "",
      tipoUsuario: "",
    });
    setEditando(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
      await deletarUsuario(id);
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
      mostrarMensagem("Usuário excluído com sucesso!", "sucesso");
    }
  };

  return (
    <div className="">
      <div className="content-header">
        <h1>{editando ? "Editar Usuário" : "Criar novo usuário"}</h1>
      </div>

      {/* Mensagens de feedback */}
      {mensagem && (
        <div
          className={`alert ${
            mensagem.tipo === "sucesso" ? "alert-success" : "alert-danger"
          } alert-dismissible fade show mb-4`}
        >
          {mensagem.texto}
          <button
            type="button"
            className="btn-close"
            onClick={() => setMensagem(null)}
          ></button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Nome Completo</label>
            <input
              type="text"
              name="nome"
              className="form-control"
              value={formData.nome}
              onChange={handleInputChange}
              required
              placeholder="Digite o nome completo"
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="exemplo@empresa.com"
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Senha</label>
            <input
              type="password"
              name="senha"
              className="form-control"
              value={formData.senha}
              onChange={handleInputChange}
              required={!editando}
              placeholder="Mínimo 8 caracteres"
              minLength={6}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Confirmar Senha</label>
            <input
              type="password"
              name="confirmarSenha"
              className="form-control"
              value={formData.confirmarSenha}
              onChange={handleInputChange}
              required={!editando}
              placeholder="Digite a senha novamente"
              minLength={6}
            />
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-6">
            <label className="form-label">Tipo de Usuário</label>
            <select
              name="tipoUsuario"
              className="form-control"
              value={formData.tipoUsuario}
              onChange={handleInputChange}
              required
            >
              <option value="">Selecione o tipo</option>
              <option value="superadmin">Super Administrador</option>
              <option value="gerente">Gerente</option>
              <option value="atendente">Atendente</option>
            </select>
            <div className="form-text">
              <small>
                <strong>Super Admin:</strong> Acesso total ao sistema<br/>
                <strong>Gerente:</strong> Gerencia projetos e aprovações<br/>
                <strong>Atendente:</strong> Cria e visualiza projetos
              </small>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end">
          {editando && (
            <button
              type="button"
              className="btn btn-secondary me-2 px-4"
              onClick={handleCancelEdit}
              disabled={loading}
            >
              Cancelar Edição
            </button>
          )}
          <button 
            className="btn btn-primary px-4" 
            type="submit" 
            disabled={loading}
          >
            {loading 
              ? (editando ? "Salvando..." : "Criando...") 
              : (editando ? "Editar Usuário" : "Criar Usuário")}
          </button>
        </div>
      </form>
      <h2 className="content-header bold">Lista de usuários</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Cargo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id}>
              <td>{u.first_name} {u.last_name}</td>
              <td>{u.email}</td>
              <td>{u.cargo}</td>
              <td>
                <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(u)}>Editar</button>
                <button className="btn btn-sm btn-secondary" onClick={() => handleDelete(u.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginação */}
      {totalPages > 1 && (
        <nav>
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => setCurrentPage(prev => prev - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </button>
            </li>
            <li className="page-item disabled">
              <span className="page-link">
                Página {currentPage} de {totalPages}
              </span>
            </li>
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => {
                  if (currentPage < totalPages) {
                    setCurrentPage(prev => prev + 1);
                  }
                }}
                disabled={currentPage === totalPages}
              >
                Próxima
              </button>
            </li>
          </ul>
        </nav>
      )}

      <button 
        type="button" 
        className="btn btn-secondary px-4" 
        onClick={onBack}
        disabled={loading}
      >
        Voltar
      </button>
    </div>
  );
};

export default CriarUsuarioView;

