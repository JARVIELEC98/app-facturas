// src/components/PayphoneResponce.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PayphoneResponce = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (state && state.confirmationData) {
            const { amount, reference, transactionId } = state.confirmationData;
            const originalAmount = amount / 106;
            navigate('/pagofactura', {
              state: {
                amount: originalAmount,
                reference,
                transactionId,
                pasarela: "Payphone" // Se pasa el campo pasarela
              },
            });
          } else {
            navigate('/');
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, state]);

  if (!state || !state.confirmationData) {
    return (
      <div className="container mt-5 text-center">
        <h1>No hay datos de transacción</h1>
        <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>
          Volver al inicio
        </button>
      </div>
    );
  }

  const data = state.confirmationData;
  const originalAmount = data.amount / 106;

  return (
    <div className="container mt-5 text-center">
      <h1>Confirmación de Transacción</h1>
      <p>
        <strong>Estado de la Transacción:</strong> {data.transactionStatus}
      </p>
      <p>
        <strong>Cantidad:</strong> {originalAmount.toFixed(2)} {data.currency}
      </p>
      <p>
        <strong>ID Factura:</strong> {data.reference}
      </p>
      <p>
        <strong>Transaction ID:</strong> {data.transactionId}
      </p>
      <p>
        <strong>Pasarela:</strong> Payphone
      </p>
      <p className="mt-3">Los cargos por pagos con tarjeta son del 6%.</p>

      {/* Ícono de carga y cuenta regresiva */}
      <div className="mt-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Redireccionando en {countdown} segundos...</p>
      </div>

      <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>
        Volver al inicio
      </button>
    </div>
  );
};

export default PayphoneResponce;
