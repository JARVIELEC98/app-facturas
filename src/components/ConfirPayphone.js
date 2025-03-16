// src/components/ConfirPayphone.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ConfirPayphone = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const factura = state?.factura;
  const cliente = state?.cliente;

  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [errorItems, setErrorItems] = useState('');

  // Definimos el endpoint y token para los detalles de la factura.
  const API_URL_DETALLE_FACTURA = process.env.REACT_APP_API_URL_DETALLE_FACTURA || 'https://sistema.sisnetel.com/api/v1/GetInvoice';
  const API_TOKEN = process.env.REACT_APP_API_TOKEN;

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      setLoadingItems(true);
      try {
        const response = await fetch(API_URL_DETALLE_FACTURA, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_TOKEN}`
          },
          body: JSON.stringify({
            token: API_TOKEN,
            idfactura: factura.id
          })
        });
        if (!response.ok) {
          throw new Error('Error al obtener detalles de la factura');
        }
        const data = await response.json();
        if (data.estado !== 'exito') {
          throw new Error('Error en la respuesta de la API de detalles');
        }
        setItems(data.items);
      } catch (err) {
        setErrorItems(err.message);
      } finally {
        setLoadingItems(false);
      }
    };

    if (factura && factura.id) {
      fetchInvoiceDetails();
    }
  }, [factura, API_URL_DETALLE_FACTURA, API_TOKEN]);

  if (!factura || !cliente) {
    return (
      <div className="container mt-5">
        <h1>Error</h1>
        <p>No hay datos disponibles.</p>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          Volver a inicio
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h1>Confirmación de Pago</h1>
      
      {/* Datos del Cliente */}
      <div className="mb-4">
        <h3>Datos del Cliente</h3>
        <p><strong>ID Cliente:</strong> {cliente.id}</p>
        <p><strong>Nombre Completo:</strong> {cliente.nombre}</p>
        <p>
          <strong>Estado del Servicio:</strong>
          <span className={cliente.estado === "ACTIVO" ? "text-success" : "text-danger"}>
            {cliente.estado === "ACTIVO" ? " Activo" : " Suspendido"}
          </span>
        </p>
      </div>

      {/* Resumen de la Factura */}
      <h3>Detalle de la Factura</h3>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID Factura</th>
            <th>Total</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{factura.id}</td>
            <td>${factura.total}</td>
            <td>{factura.estado}</td>
          </tr>
        </tbody>
      </table>

      {/* Detalle de los Ítems de la Factura */}
      <h4>Ítems de la Factura</h4>
      {loadingItems ? (
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      ) : errorItems ? (
        <div className="alert alert-danger">
          {errorItems}
        </div>
      ) : items && items.length > 0 ? (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Unidades</th>
              <th>Precio</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>{item.descrp}</td>
                <td>{item.unidades}</td>
                <td>{item.precio}</td>
                <td>{item.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No se encontraron ítems para esta factura.</p>
      )}

      <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
        Volver
      </button>
    </div>
  );
};

export default ConfirPayphone;
