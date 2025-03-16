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
  // Estado para controlar las facturas expandidas
  const [expandedInvoices, setExpandedInvoices] = useState({});

  const API_URL_FACTURAS = process.env.REACT_APP_API_URL_FACTURAS;
  const API_TOKEN = process.env.REACT_APP_API_TOKEN;
  // API para obtener detalles (asegúrate de agregarla al .env)
  const API_URL_DETALLE_FACTURA = process.env.REACT_APP_API_URL_DETALLE_FACTURA || 'https://sistema.sisnetel.com/api/v1/GetInvoice';

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

  // Función para alternar la visualización de detalles de una factura
  const toggleInvoice = async (factura) => {
    const invoiceId = factura.id;
    const current = expandedInvoices[invoiceId];
    // Si ya está expandida, colapsamos
    if (current && current.expanded) {
      setExpandedInvoices((prev) => ({
        ...prev,
        [invoiceId]: { ...prev[invoiceId], expanded: false },
      }));
      return;
    }

    // Si no se han cargado los ítems, los solicitamos
    if (!current || !current.items) {
      // Inicializamos el estado: expandido y cargando
      setExpandedInvoices((prev) => ({
        ...prev,
        [invoiceId]: { expanded: true, loading: true },
      }));
      try {
        const response = await fetch(API_URL_DETALLE_FACTURA, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer RkNPYUU2bUd0UUZyOVl5cGlnc3JVZz09'
          },
          body: JSON.stringify({
            token: "RkNPYUU2bUd0UUZyOVl5cGlnc3JVZz09",
            idfactura: invoiceId
          })
        });
        if (!response.ok) throw new Error('Error al obtener detalle de la factura');
        const data = await response.json();
        if (data.estado !== "exito") throw new Error('Error en la respuesta de la API');
        setExpandedInvoices((prev) => ({
          ...prev,
          [invoiceId]: { expanded: true, loading: false, items: data.items }
        }));
      } catch (error) {
        setExpandedInvoices((prev) => ({
          ...prev,
          [invoiceId]: { expanded: true, loading: false, error: error.message }
        }));
      }
    } else {
      // Si ya tenemos los ítems, simplemente expandimos
      setExpandedInvoices((prev) => ({
        ...prev,
        [invoiceId]: { ...prev[invoiceId], expanded: true }
      }));
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <h1>Facturas del Cliente</h1>
        <div className="mt-4 spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Espere por favor...</p>
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
          <p>
            <strong>Estado del Servicio:</strong> 
            <span className={cliente.estado === "ACTIVO" ? "text-success" : "text-danger"}>
              {cliente.estado === "ACTIVO" ? " Activo" : " Suspendido"}
            </span>
          </p>
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
              <React.Fragment key={factura.id}>
                <tr>
                  <td>
                    <button
                      className="btn btn-link p-0"
                      onClick={() => toggleInvoice(factura)}
                    >
                      {expandedInvoices[factura.id]?.expanded ? '-' : '+'}
                    </button>
                    &nbsp;{factura.id}&nbsp;
                    <button
                      className="btn btn-link p-0"
                      onClick={() => toggleInvoice(factura)}
                    >
                      {expandedInvoices[factura.id]?.expanded ? '-' : '+'}
                    </button>
                  </td>
                  <td>${factura.total}</td>
                  <td>{factura.estado}</td>
                  <td>
                    <button
                      className="btn btn-success me-2"
                      onClick={() => navigate('/payphone', { state: { facturaId: factura.id, total: factura.total, cliente } })}
                    >
                      PAYPHONE
                    </button>
                    <button
                      className="btn btn-primary me-2"
                      onClick={() => alert(`Pagando DE UNA la factura con ID: ${factura.id}`)}
                    >
                      DE UNA
                    </button>
                    <button
                      className="btn btn-warning me-2"
                      onClick={() => alert(`Pagando con DEPÓSITO la factura con ID: ${factura.id}`)}
                    >
                      DEPÓSITO
                    </button>
                    <button
                      className="btn btn-info"
                      onClick={() => navigate('/confirpayphone', { state: { factura, cliente } })}
                    >
                      Confirmación
                    </button>
                  </td>
                </tr>
                {/* Fila expandida para mostrar los ítems */}
                {expandedInvoices[factura.id]?.expanded && (
                  <tr>
                    <td colSpan="4">
                      {expandedInvoices[factura.id].loading ? (
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      ) : expandedInvoices[factura.id].error ? (
                        <div className="alert alert-danger">
                          {expandedInvoices[factura.id].error}
                        </div>
                      ) : expandedInvoices[factura.id].items ? (
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Descripción</th>
                              <th>Unidades</th>
                              <th>Precio</th>
                              <th>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {expandedInvoices[factura.id].items.map((item, index) => (
                              <tr key={index}>
                                <td>{item.descrp}</td>
                                <td>{item.unidades}</td>
                                <td>{item.precio}</td>
                                <td>{item.total}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : null}
                    </td>
                  </tr>
                )}
              </React.Fragment>
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
              <React.Fragment key={factura.id}>
                <tr>
                  <td>
                    <button
                      className="btn btn-link p-0"
                      onClick={() => toggleInvoice(factura)}
                    >
                      {expandedInvoices[factura.id]?.expanded ? '-' : '+'}
                    </button>
                    &nbsp;{factura.id}&nbsp;
                    <button
                      className="btn btn-link p-0"
                      onClick={() => toggleInvoice(factura)}
                    >
                      {expandedInvoices[factura.id]?.expanded ? '-' : '+'}
                    </button>
                  </td>
                  <td>${factura.total}</td>
                  <td>{factura.estado}</td>
                  <td>
                    <button
                      className="btn btn-info"
                      onClick={() => navigate('/detallefactura', { state: { facturaId: factura.id, cliente } })}
                    >
                      Ver Detalle
                    </button>
                  </td>
                </tr>
                {expandedInvoices[factura.id]?.expanded && (
                  <tr>
                    <td colSpan="4">
                      {expandedInvoices[factura.id].loading ? (
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      ) : expandedInvoices[factura.id].error ? (
                        <div className="alert alert-danger">
                          {expandedInvoices[factura.id].error}
                        </div>
                      ) : expandedInvoices[factura.id].items ? (
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Descripción</th>
                              <th>Unidades</th>
                              <th>Precio</th>
                              <th>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {expandedInvoices[factura.id].items.map((item, index) => (
                              <tr key={index}>
                                <td>{item.descrp}</td>
                                <td>{item.unidades}</td>
                                <td>{item.precio}</td>
                                <td>{item.total}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : null}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Facturas;
