// src/components/ConsultaCliente.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ConsultaCliente = () => {
  const [cedula, setCedula] = useState('');
  const [cliente, setCliente] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL_CLIENTE = process.env.REACT_APP_API_URL_CLIENTE;
  const API_TOKEN = process.env.REACT_APP_API_TOKEN;

  const navigate = useNavigate();

  const handleConsulta = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCliente(null);

    try {
      const body = JSON.stringify({
        token: API_TOKEN,
        cedula: cedula
      });

      const response = await fetch(API_URL_CLIENTE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`
        },
        body: body
      });

      if (!response.ok) {
        throw new Error('Error en la consulta');
      }

      const data = await response.json();
      if (data.estado !== 'exito' || !data.datos || data.datos.length === 0) {
        throw new Error('Cliente no encontrado');
      }
      setCliente(data.datos[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerFacturas = () => {
    // Redirige a la ruta "/facturas" pasando el objeto cliente por state
    navigate('/facturas', { state: { cliente } });
  };

  const handleNuevo = () => {
    setCedula('');
    setCliente(null);
    setError('');
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <h1>Consulta de Cliente</h1>
        <div className="mt-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Espere por favor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <h1>Consulta de Cliente</h1>
        <div className="alert alert-danger mt-3">
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={handleNuevo}>
            Regresar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h1>Consulta de Cliente</h1>
      {!cliente ? (
        <form onSubmit={handleConsulta}>
          <div className="mb-3">
            <label htmlFor="cedula" className="form-label">Número de Cédula</label>
            <input
              type="text"
              className="form-control"
              id="cedula"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Consultar
          </button>
        </form>
      ) : (
        <div className="mt-4">
          <h2>Datos del Cliente</h2>
          <p><strong>ID:</strong> {cliente.id}</p>
          <p><strong>Nombre Completo:</strong> {cliente.nombre}</p>
          <p>
            <strong>Perfiles:</strong>{' '}
            {cliente.servicios && cliente.servicios.length > 0
              ? cliente.servicios.map((servicio, index) => (
                  <span key={index}>
                    {servicio.perfil}{index < cliente.servicios.length - 1 ? ', ' : ''}
                  </span>
                ))
              : 'Sin perfiles asignados'}
          </p>
          <p><strong>Valor Total de Facturas:</strong> {cliente.facturacion && cliente.facturacion.total_facturas}</p>
          <p>
            <strong>Estado del Servicio:</strong> {cliente.estado === 'ACTIVO' ? 'Activo' : 'Suspendido'}
          </p>
          <div className="mt-3">
            <button onClick={handleVerFacturas} className="btn btn-info me-2">
              Ver Facturas
            </button>
            <button onClick={handleNuevo} className="btn btn-secondary">
              Consultar de nuevo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultaCliente;
