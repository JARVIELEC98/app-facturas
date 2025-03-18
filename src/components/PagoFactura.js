import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PagoFactura = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [invoiceData, setInvoiceData] = useState(null);
  const [items, setItems] = useState([]);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [errorInvoice, setErrorInvoice] = useState('');
  const [paidInvoiceCalled, setPaidInvoiceCalled] = useState(false); 
  const [paidInvoiceResponse, setPaidInvoiceResponse] = useState(null); 

  // Desestructuramos lo que llega por state
  let amount = 0;
  let reference = '';
  let transactionId = '';
  let pasarela = 'Payphone';

  if (state) {
    amount = state.amount;
    reference = state.reference;
    transactionId = state.transactionId || '';
    pasarela = state.pasarela || 'Payphone';
  }

  // 1) Obtener los datos de la factura (GetInvoice)
  useEffect(() => {
    if (!reference) return;

    const fetchInvoice = async () => {
      setLoadingInvoice(true);
      setErrorInvoice('');

      try {
        const resp = await fetch(process.env.REACT_APP_GETINVOICE_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.REACT_APP_API_TOKEN}`
          },
          body: JSON.stringify({
            token: process.env.REACT_APP_API_TOKEN,
            idfactura: reference
          })
        });

        if (!resp.ok) {
          throw new Error('Error al llamar a la API GetInvoice');
        }

        const data = await resp.json();
        if (data.estado !== 'exito') {
          throw new Error('La API de GetInvoice devolvió un estado diferente de exito');
        }

        setInvoiceData(data.factura);
        setItems(data.items || []);
      } catch (error) {
        setErrorInvoice(error.message);
      } finally {
        setLoadingInvoice(false);
      }
    };

    fetchInvoice();
  }, [reference]);

  // 2) Marcar la factura como pagada (PaidInvoice)
  useEffect(() => {
    // Ejecutar solo si no se ha llamado previamente y tenemos la referencia
    if (!paidInvoiceCalled && reference) {
      setPaidInvoiceCalled(true);

      fetch(process.env.REACT_APP_PAIDINVOICE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.REACT_APP_API_TOKEN}`
        },
        body: JSON.stringify({
          token: process.env.REACT_APP_API_TOKEN,
          idfactura: reference,
          pasarela: pasarela,
          idtransaccion: transactionId || Date.now().toString(),
          cantidad: 1
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.estado === 'exito') {
            // Guardamos la respuesta para mostrarla en pantalla
            setPaidInvoiceResponse(data);
          } else {
            console.error('Error al registrar el pago:', data);
          }
        })
        .catch(err => {
          console.error('Error en la llamada a PaidInvoice:', err);
        });
    }
  }, [paidInvoiceCalled, reference, pasarela, transactionId]);

  // 3) Renderizados condicionales
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

  return (
    <div className="container mt-5">
      <h1>Pago de Factura</h1>

      {/* Mensaje de éxito si se registró el pago */}
      {paidInvoiceResponse && (
        <div 
          className="alert alert-success mt-4" 
          role="alert" 
          style={{ border: '2px solid #28a745' }}
        >
          <h4 className="alert-heading">¡Pago Exitoso!</h4>
          <hr />
          <p>
            <strong>Estado:</strong> {paidInvoiceResponse.estado}
          </p>
          <p>{paidInvoiceResponse.salida}</p>
          <p>
            <strong>ID de Pago:</strong> {paidInvoiceResponse.id}
          </p>
        </div>
      )}

      {loadingInvoice && (
        <div className="mt-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Obteniendo datos de la factura...</p>
        </div>
      )}
      {errorInvoice && (
        <div className="alert alert-danger mt-3">
          <h4>Error al obtener la factura:</h4>
          <p>{errorInvoice}</p>
        </div>
      )}

      {invoiceData && (
        <div className="card mt-4">
          <div className="card-header">
            <h4>Datos de la Factura</h4>
          </div>
          <div className="card-body">
            <p><strong>ID Cliente:</strong> {invoiceData.idcliente}</p>
            <p><strong>Fecha de Emisión:</strong> {invoiceData.emitido}</p>
            <p><strong>Total:</strong> {invoiceData.total2 || invoiceData.total}</p>
            <p><strong>Estado:</strong> {invoiceData.estado}</p>
            {invoiceData.urlpdf && (
              <p>
                <strong>Ver PDF:</strong>{' '}
                <a
                  href={invoiceData.urlpdf}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir Factura PDF
                </a>
              </p>
            )}
            <p><strong>Subtotal:</strong> {invoiceData.subtotal2 || invoiceData.subtotal}</p>
            <p><strong>Impuestos:</strong> {invoiceData.impuesto2}</p>
            <p><strong>Forma de Pago:</strong> {invoiceData.formapago || 'N/A'}</p>
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="card mt-4">
          <div className="card-header">
            <h4>Ítems de la Factura</h4>
          </div>
          <div className="card-body">
            {items.map((item, index) => (
              <div key={index} className="mb-3">
                <p><strong>Descripción:</strong> {item.descrp}</p>
                <p><strong>Unidades:</strong> {item.unidades}</p>
                <p><strong>Precio:</strong> {item.precio2 || item.precio}</p>
                <p><strong>Total:</strong> {item.total2 || item.total}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <button className="btn btn-primary mt-4" onClick={() => navigate('/')}>
        Volver al inicio
      </button>
    </div>
  );
};

export default PagoFactura;
