// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Componentes de facturación
import ConsultaCliente from './components/facturacion/ConsultaCliente';
import Facturas from './components/facturacion/Facturas';
import Payphone from './components/facturacion/Payphone';
import PayphoneResponce from './components/facturacion/PayphoneResponce';
import PagoFactura from './components/facturacion/PagoFactura';

// Componentes de administración
import Admin from './components/admin/Admin';
import PromesaPago from './components/admin/PromesaPago'; // <-- nuevo

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas de la aplicación principal */}
         <Route path="/" element={<ConsultaCliente />} />
        <Route path="/facturas" element={<Facturas />} />
        <Route path="/payphone" element={<Payphone />} />
        <Route path="/payphoneResponce" element={<PayphoneResponce />} />
        <Route path="/pagofactura" element={<PagoFactura />} />
        {/* Otras rutas */}
        <Route path="/admin" element={<Admin />}>
          {/* Otras rutas hijas */}
          <Route path="promesa" element={<PromesaPago />} />
        </Route>

        {/* Ruta comodín */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
