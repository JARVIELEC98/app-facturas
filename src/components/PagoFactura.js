// src/components/PagoFactura.js
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PagoFactura = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [paymentResult, setPaymentResult] = useState(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [errorPayment, setErrorPayment] = useState('');

  if (!state) {
    return (
      <div className="container mt-5 text-center">
        <h1>No hay datos de pago</h1>
        <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>
          Volver al inicio
        </button>
      </div>
    );
  }

  const { amount, reference, transactionId, pasarela, facturaData } = state;

  const handlePagarFactura = async () => {
    setLoadingPayment(true);
    setErrorPayment('');

    const body = {
      token: process.env.REACT_APP_API_TOKEN,
      idfactura: reference,
      pasarela: "Payphone",
      idtransaccion: transactionId || "10",
      cantidad: amount
    };

    try {
      const response = await fetch(process.env.REACT_APP_PAIDINVOICE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_API_TOKEN}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error('Error en la llamada a la API de pago');
      }

      const result = await response.json();
      setPaymentResult(result);
    } catch (error) {
      setErrorPayment(error.message);
    } finally {
      setLoadingPayment(false);
    }
  };

  return (
    <div className="container mt-5">
      <h1>Pago de Factura</h1>
      <p><strong>Cantidad:</strong> {amount.toFixed(2)}</p>
      <p><strong>ID Factura (reference):</strong> {reference}</p>
      <p><strong>Transaction ID:</strong> {transactionId}</p>
      <p><strong>Pasarela:</strong> {pasarela}</p>

      {facturaData && (
        <>
          <h2 className="mt-4">Detalle de la Factura</h2>
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
                <td>{facturaData.id}</td>
                <td>${facturaData.total}</td>
                <td>{facturaData.estado}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      <button
        className="btn btn-success mt-3"
        onClick={handlePagarFactura}
        disabled={loadingPayment}
      >
        {loadingPayment ? 'Procesando pago...' : 'Pagar Factura'}
      </button>

      {errorPayment && (
        <div className="alert alert-danger mt-3">
          <h4>Error:</h4>
          <p>{errorPayment}</p>
        </div>
      )}

      {/* Mensaje de confirmación de pago con estilo de tarjeta */}
      {paymentResult && paymentResult.estado === 'exito' && (
        <div className="card mt-3 border-success">
          <div className="card-header bg-success text-white">
            <strong>¡Pago Exitoso!</strong>
          </div>
          <div className="card-body">
            <h5 className="card-title">Estado: {paymentResult.estado}</h5>
            <p className="card-text">{paymentResult.salida}</p>
            <p>
              <strong>ID de Pago:</strong> {paymentResult.id}
            </p>
          </div>
        </div>
      )}

      {paymentResult && paymentResult.estado !== 'exito' && (
        <div className="card mt-3 border-warning">
          <div className="card-header bg-warning text-dark">
            <strong>Pago no exitoso</strong>
          </div>
          <div className="card-body">
            <h5 className="card-title">Estado: {paymentResult.estado}</h5>
            <p className="card-text">{paymentResult.salida}</p>
            <p>
              <strong>ID de Pago:</strong> {paymentResult.id}
            </p>
          </div>
        </div>
      )}

      <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>
        Volver al inicio
      </button>
    </div>
  );
};

export default PagoFactura;
