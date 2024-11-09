import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'

function Login({ setIsAuthenticated }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', credentials);
      const { token } = response.data;
      localStorage.setItem('authToken', token); // Guardar el token en localStorage
      setIsAuthenticated(true); // Cambiar el estado de autenticación
    } catch (err) {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h1>Login</h1>
        {error && <p className="error-message">{error}</p>}
        <label>
          Usuario:
          <input
            type="text"
            value={credentials.username}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
            required
          />
        </label>
        <label>
          Contraseña:
          <input
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            required
          />
        </label>
        <button type="submit">Iniciar Sesión</button>
      </form>
    </div>
  );
}

export default Login;
