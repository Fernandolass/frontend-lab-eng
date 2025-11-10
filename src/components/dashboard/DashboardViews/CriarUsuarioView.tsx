import React, { useState } from "react";
import { apiFetch } from "../../../data/api";

interface CriarUsuarioViewProps {
  onBack: () => void;
}

const CriarUsuarioView: React.FC<CriarUsuarioViewProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    tipoUsuario: "",
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (erro) setErro(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    // Validações do frontend
    if (formData.senha !== formData.confirmarSenha) {
      setErro("As senhas não coincidem!");
      setLoading(false);
      return;
    }

    if (formData.senha.length < 8) {
      setErro("A senha deve ter pelo menos 8 caracteres!");
      setLoading(false);
      return;
    }

    try {
      // Backend fará a verificação real de permissões
      await apiFetch("/api/usuarios/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha,
          tipo_usuario: formData.tipoUsuario,
          ativo: true,
        }),
      });

      alert("Usuário criado com sucesso!");
      
      // Limpa o formulário
      setFormData({
        nome: "",
        email: "",
        senha: "",
        confirmarSenha: "",
        tipoUsuario: "",
      });

    } catch (err: any) {
      console.error("Erro ao criar usuário:", err);
      // O backend retornará erro se o usuário não tiver permissão
      setErro(err.message || "Erro ao criar usuário. Verifique suas permissões.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <div className="content-header">
        <h1>Criar Novo Usuário</h1>
      </div>

      {erro && (
        <div className="alert alert-danger" role="alert">
          {erro}
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
              required
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
              required
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

        <div className="d-flex justify-content-between">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onBack}
            disabled={loading}
          >
            Voltar
          </button>
          <button 
            className="btn btn-primary" 
            type="submit" 
            disabled={loading}
          >
            {loading ? "Criando..." : "Criar Usuário"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CriarUsuarioView;