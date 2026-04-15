import { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import { loginRequest } from './services/auth';

const SESSION_KEY = 'painel-bruno-auth';

function App() {
  const [session, setSession] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedSession = window.sessionStorage.getItem(SESSION_KEY);

    if (!savedSession) {
      return;
    }

    try {
      setSession(JSON.parse(savedSession));
    } catch {
      window.sessionStorage.removeItem(SESSION_KEY);
    }
  }, []);

  async function handleLogin(credentials) {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const authenticatedSession = await loginRequest(credentials);
      setSession(authenticatedSession);
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(authenticatedSession));
    } catch (error) {
      setErrorMessage(error.message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleLogout() {
    setSession(null);
    setErrorMessage('');
    window.sessionStorage.removeItem(SESSION_KEY);
  }

  if (!session) {
    return (
      <LoginPage
        onLogin={handleLogin}
        errorMessage={errorMessage}
        isSubmitting={isSubmitting}
      />
    );
  }

  return <Dashboard currentUser={session.user} onLogout={handleLogout} />;
}

export default App;
