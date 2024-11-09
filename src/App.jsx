import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './Login';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', identification: '', ticketType: 'A' });
  const [generateMultiple, setGenerateMultiple] = useState(false);
  const [numberOfTickets, setNumberOfTickets] = useState(1); // Por defecto, una boleta
  const [lastTicketNumber, setLastTicketNumber] = useState({
    A: { number: 'A000', name: 'Sin nombre' },
    B: { number: 'B000', name: 'Sin nombre' },
    C: { number: 'C000', name: 'Sin nombre' },
    D: { number: 'D---', name: 'Sin nombre' },
  });
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');

  // Verificar si hay un token guardado
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const fetchLastTicketNumbers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/tickets/get-last-tickets', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      setLastTicketNumber(response.data);
    } catch (error) {
      console.error('Error fetching ticket numbers:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLastTicketNumbers();
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage("Generando boleta...");
    setStatusType('');

    try {
      const response = await axios.post(
        'http://localhost:3000/api/tickets/generate-ticket',
        { ...formData, numberOfTickets: generateMultiple ? numberOfTickets : 1 },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        }
      );
      if (response.data.success) {
        const { ticketNumbers } = response.data;
        setStatusMessage(`Boleta(s) generada(s) exitosamente: ${ticketNumbers.join(', ')}`);
        setStatusType('success');

        // Actualizar los últimos números de boletas
        fetchLastTicketNumbers();

        // Ocultar el mensaje de éxito después de 5 segundos
        setTimeout(() => {
          setStatusMessage('');
        }, 5000);
      } else {
        setStatusMessage("Error al generar la(s) boleta(s)");
        setStatusType('error');
      }
    } catch (error) {
      setStatusMessage("Error en el servidor al generar la(s) boleta(s)");
      setStatusType('error');
    }

    setFormData({ name: '', email: '', phone: '', identification: '', ticketType: 'A' });
    setGenerateMultiple(false); // Reinicia la opción de generación múltiple
    setNumberOfTickets(1); // Reinicia el número de boletas
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login setIsAuthenticated={setIsAuthenticated} />;
  }

  return (
    <div className="app-container">
      <button className="logout-button" onClick={handleLogout}>Cerrar Sesión</button>
      <h1 className="form-title">Generador de Boletas</h1>
      <form onSubmit={handleSubmit}>
        <label className="form-label">Nombre:</label>
        <input
          type="text"
          className="form-input"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <label className="form-label">Email:</label>
        <input
          type="email"
          className="form-input"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <label className="form-label">Teléfono / Celular:</label>
        <input
          type="text"
          className="form-input"
          value={formData.phone}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d{0,10}$/.test(value)) {
              setFormData({ ...formData, phone: value });
            }
          }}
          pattern="\d{10}"
          title="El número debe tener exactamente 10 dígitos."
          required
        />

        <label className="form-label">Número de Identificación:</label>
        <input
          type="text"
          className="form-input"
          value={formData.identification}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d*$/.test(value) && value.length <= 15) {
              setFormData({ ...formData, identification: value });
            }
          }}
          maxLength="15"
          pattern="\d{1,15}"
          title="El número de identificación debe contener entre 1 y 15 dígitos."
          required
        />

        <div className="radio-group">
          <span className="form-label">Tipo de Boleta:</span>
          <label>
            <input
              type="radio"
              name="ticketType"
              value="A"
              checked={formData.ticketType === 'A'}
              onChange={() => setFormData({ ...formData, ticketType: 'A' })}
            />{' '}
            Boleta A (Pase un día. Público / Estudiantes)
          </label>
          <label>
            <input
              type="radio"
              name="ticketType"
              value="B"
              checked={formData.ticketType === 'B'}
              onChange={() => setFormData({ ...formData, ticketType: 'B' })}
            />{' '}
            Boleta B (Pase dos días. Público)
          </label>
          <label>
            <input
              type="radio"
              name="ticketType"
              value="C"
              checked={formData.ticketType === 'C'}
              onChange={() => setFormData({ ...formData, ticketType: 'C' })}
            />{' '}
            Boleta C (Pase especial dos días estudiantes)
          </label>
          <label className="boleta-disabled">
            <input type="radio" name="ticketType" value="D" disabled /> Boleta D
            (Actualmente no habilitada)
          </label>
        </div>

        <div className="multiple-tickets">
          <label>
            <input
              type="checkbox"
              checked={generateMultiple}
              onChange={(e) => setGenerateMultiple(e.target.checked)}
            />{' '}
            Generar múltiples boletas (máximo 5)
          </label>

          {generateMultiple && (
            <>
              <label className="form-label">Número de boletas:</label>
              <select
                className="form-select"
                value={numberOfTickets}
                onChange={(e) => setNumberOfTickets(Number(e.target.value))}
                required
              >
                {[2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>

        <button type="submit" className="form-button">
          Generar Boleta(s)
        </button>
      </form>

      {statusMessage && <div className={`message ${statusType}`}>{statusMessage}</div>}

      <div className="ticket-numbers">
        <h3 className="form-title">Últimas boletas generadas</h3>
        <p><strong>Boleta A:</strong> {lastTicketNumber.A.number} - {lastTicketNumber.A.name}</p>
        <p><strong>Boleta B:</strong> {lastTicketNumber.B.number} - {lastTicketNumber.B.name}</p>
        <p><strong>Boleta C:</strong> {lastTicketNumber.C.number} - {lastTicketNumber.C.name}</p>
        <p>Boleta D: {lastTicketNumber.D.number !== 'D---' ? `${lastTicketNumber.D.number} - ${lastTicketNumber.D.name}` : 'Sin generar'}</p>
      </div>
    </div>
  );
}

export default App;
