import { useState } from 'react';

function LoginPage({ onLogin, errorMessage, isSubmitting }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      setLocalError('Informe login e senha.');
      return;
    }

    setLocalError('');

    try {
      await onLogin({
        username,
        password,
      });
    } catch {
      // O erro principal ja chega pela prop errorMessage.
    }
  }

  return (
    <main className="login-shell">
      <section className="login-card">
        <div className="login-copy">
          <span className="eyebrow">Acesso ao painel</span>
          <h1>Painel de ordens de producao</h1>
          <p>Entre com suas credenciais para acessar o quadro Kanban e o cadastro de ordens.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Login</span>
            <input value={username} onChange={(event) => setUsername(event.target.value)} />
          </label>

          <label className="field">
            <span>Senha</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <button type="submit" className="entry-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>

          {localError ? <p className="login-error">{localError}</p> : null}
          {errorMessage ? <p className="login-error">{errorMessage}</p> : null}
        </form>
      </section>
    </main>
  );
}

export default LoginPage;
