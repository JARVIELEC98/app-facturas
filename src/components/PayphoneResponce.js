// PayphoneResponce.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PayphoneResponce = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  // Datos de la confirmación recibidos en state
  const { confirmationData } = state || {};
  
  const [invoiceData, setInvoiceData] = useState(null);
  const [countdown, setCountdown] = useState(3);
  const [error, setError] = useState('');
  
  // Variables de entorno para GetInvoice
  const API_URL_GETINVOICE = process.env.REACT_APP_GETINVOICE_API_URL;
  const API_TOKEN = process.env.REACT_APP_API_TOKEN;
  
  // useEffect para llamar a GetInvoice y obtener los datos de la factura
  useEffect(() => {
    if (confirmationData && confirmationData.reference) {
      fetch(API_URL_GETINVOICE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_TOKEN}`
        },
        body: JSON.stringify({
          token: API_TOKEN,
          idfactura: confirmationData.reference
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.estado === 'exito') {
            setInvoiceData(data.factura);
          } else {
            throw new Error('Error en GetInvoice: estado diferente de exito');
          }
        })
        .catch(err => {
          setError(err.message);
        });
    }
  }, [confirmationData, API_URL_GETINVOICE, API_TOKEN]);
  
  // useEffect para countdown y redirección a /pagofactura
  useEffect(() => {
    if (!confirmationData) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/pagofactura', {
            state: {
              amount: confirmationData.amount / 106,
              reference: confirmationData.reference,
              transactionId: confirmationData.transactionId,
              pasarela: 'Payphone'
            }
          });
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [confirmationData, navigate]);
  
  // Si no se recibe confirmationData, retornamos null
  if (!confirmationData) {
    return null;
  }
  
  // Render de error en caso de existir
  if (error) {
    return (
      <div className="container mt-5">
        <h1>Error en PayphoneResponce</h1>
        <p>{error}</p>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          Ir al inicio
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mt-5 text-center">
      <h1>Confirmación de Transacción</h1>
      <p><strong>Estado de la Transacción:</strong> {confirmationData.transactionStatus}</p>
      <p><strong>Cantidad:</strong> {(confirmationData.amount / 106).toFixed(2)} {confirmationData.currency}</p>
      <p><strong>ID Factura:</strong> {confirmationData.reference}</p>
      <p><strong>Transaction ID:</strong> {confirmationData.transactionId}</p>
      <p><strong>Pasarela:</strong> Payphone</p>
      
      {/* Mostrar datos de la factura obtenidos de GetInvoice */}
      {invoiceData && (
        <div className="mt-3">
          <h5>Datos de la Factura:</h5>
          <p><strong>ID Cliente:</strong> {invoiceData.idcliente}</p>
          <p><strong>Total:</strong> {invoiceData.total}</p>
          <p><strong>Estado Factura:</strong> {invoiceData.estado}</p>
        </div>
      )}
      
      <p className="mt-3">Redireccionando en {countdown} segundos...</p>
      <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>
        Volver al inicio
      </button>
    </div>
  );
};

export default PayphoneResponce;
