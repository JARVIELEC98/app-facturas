// src/components/Facturas.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Facturas = () => {
  const { state } = useLocation();
  const cliente = state?.cliente;
  const navigate = useNavigate();

  const [facturasNoPagadas, setFacturasNoPagadas] = useState([]);
  const [facturasPagadas, setFacturasPagadas] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL_FACTURAS = process.env.REACT_APP_API_URL_FACTURAS;
  const API_TOKEN = process.env.REACT_APP_API_TOKEN;

  useEffect(() => {
    if (!cliente) return;
    const fetchFacturas = async () => {
      setLoading(true);
      setError('');
      try {
        // Facturas NO PAGADAS
        const bodyNoPagadas = JSON.stringify({
          token: API_TOKEN,
          limit: 25,
          estado: '1',
          idcliente: cliente.id
        });
        const respNoPagadas = await fetch(API_URL_FACTURAS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_TOKEN}`
          },
          body: bodyNoPagadas
        });
        if (!respNoPagadas.ok) {
          throw new Error('Error al obtener facturas no pagadas');
        }
        const dataNoPagadas = await respNoPagadas.json();
        if (dataNoPagadas.estado === 'exito') {
          setFacturasNoPagadas(dataNoPagadas.facturas || []);
        }

        // Facturas PAGADAS
        const bodyPagadas = JSON.stringify({
          token: API_TOKEN,
          limit: 25,
          estado: '0',
          idcliente: cliente.id
        });
        const respPagadas = await fetch(API_URL_FACTURAS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_TOKEN}`
          },
          body: bodyPagadas
        });
        if (!respPagadas.ok) {
          throw new Error('Error al obtener facturas pagadas');
        }
        const dataPagadas = await respPagadas.json();
        if (dataPagadas.estado === 'exito') {
          setFacturasPagadas(dataPagadas.facturas || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFacturas();
  }, [cliente, API_TOKEN, API_URL_FACTURAS]);

  const handleVerFactura = (facturaId) => {
    alert(`Viendo detalle de la factura con ID: ${facturaId}`);
  };

  const handlePayPhone = (facturaId, total) => {
    // Redirige a la ruta /payphone pasando facturaId y total en el state
    navigate('/payphone', { state: { facturaId, total } });
  };

  const handleDeUna = (facturaId) => {
    alert(`Pagando DE UNA la factura con ID: ${facturaId}`);
  };

  const handleDeposito = (facturaId) => {
    alert(`Pagando con DEPÓSITO la factura con ID: ${facturaId}`);
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <h1>Facturas del Cliente</h1>
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
        <h1>Facturas del Cliente</h1>
        <div className="alert alert-danger mt-3">
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Regresar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <button onClick={() => navigate(-1)} className="btn btn-secondary">
        Regresar
      </button>
      <h1 className="mt-3">Facturas del Cliente</h1>
      {cliente && (
        <div className="mb-4">
          <p><strong>ID Cliente:</strong> {cliente.id}</p>
          <p><strong>Nombre Completo:</strong> {cliente.nombre}</p>
          <p><strong>Valor Total de Facturas:</strong> {cliente.facturacion && cliente.facturacion.total_facturas}</p>
        </div>
      )}
      <h3>Facturas No Pagadas</h3>
      {facturasNoPagadas.length === 0 ? (
        <p>No hay facturas no pagadas.</p>
      ) : (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>ID</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Pagar</th>
            </tr>
          </thead>
          <tbody>
            {facturasNoPagadas.map((factura) => (
              <tr key={factura.id}>
                <td>{factura.id}</td>
                <td>{factura.total}</td>
                <td>{factura.estado}</td>
                <td>
                  <button
                    className="btn btn-success me-2"
                    onClick={() => handlePayPhone(factura.id, factura.total)}
                  >
                    PAYPHONE
                  </button>
                  <button
                    className="btn btn-primary me-2"
                    onClick={() => handleDeUna(factura.id)}
                  >
                    DE UNA
                  </button>
                  <button
                    className="btn btn-warning"
                    onClick={() => handleDeposito(factura.id)}
                  >
                    DEPÓSITO
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <h3>Facturas Pagadas</h3>
      {facturasPagadas.length === 0 ? (
        <p>No hay facturas pagadas.</p>
      ) : (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>ID</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {facturasPagadas.map((factura) => (
              <tr key={factura.id}>
                <td>{factura.id}</td>
                <td>{factura.total}</td>
                <td>{factura.estado}</td>
                <td>
                  <button
                    className="btn btn-info"
                    onClick={() => handleVerFactura(factura.id)}
                  >
                    Ver Factura
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Facturas;
