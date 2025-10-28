import React, { useState } from "react";
import "./Login.css";
import { login as apiLogin } from "../../data/api"; // ajuste o caminho conforme sua estrutura

interface LoginProps {
  onLogin: (email: string, password: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!email || !password) {
        throw new Error("Por favor, preencha todos os campos");
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
        throw new Error("Por favor, insira um email válido");
      }

      // 🔹 Chama a função de login do api.ts
      const data = await apiLogin(email, password);

      // Salva token no localStorage (já salvo em api.ts, mas deixei userEmail aqui)
      localStorage.setItem("userEmail", email);

      // Chama o callback do App.tsx
      onLogin(email, password);

    } catch (err: any) {
      setError(err.message || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <div className="text-center mb-4">
          <img
            className="login-logo"
            src="/logo_jnunes_normal.png"
            alt="Logo JNunes"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <h3 className="login-title">Sistema de Especificações</h3>
          <p className="login-subtitle">Faça login para acessar o sistema</p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-floating mb-3">
            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
            <label htmlFor="email">Email</label>
          </div>

          <div className="form-floating mb-4 position-relative password-field">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control password-input"
              id="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <label htmlFor="password">Senha</label>
            <button
              type="button"
              className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-secondary password-toggle"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? "ocultar" : "mostrar"}
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                ></span>
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </button>

          <p className="text-center mt-4">
            <a href="#forgot" className="forgot-link">
              Esqueceu a senha?
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;