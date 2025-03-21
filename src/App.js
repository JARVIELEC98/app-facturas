// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importa tu nuevo componente de inicio
import Home from './components/Home';

// Componentes de facturación
import ConsultaCliente from './components/facturacion/ConsultaCliente';
import Facturas from './components/facturacion/Facturas';
import Payphone from './components/facturacion/Payphone';
import PayphoneResponce from './components/facturacion/PayphoneResponce';
import PagoFactura from './components/facturacion/PagoFactura';

// Componentes de administración
import Admin from './components/admin/Admin';
import PromesaPago from './components/admin/PromesaPago';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página de inicio con el ícono y botones */}
        <Route path="/" element={<Home />} />

        {/* Rutas de facturación */}
        <Route path="/clientes" element={<ConsultaCliente />} />
        <Route path="/clientes/facturas" element={<Facturas />} />
        <Route path="/clientes/payphone" element={<Payphone />} />
        <Route path="/clientes/payphoneResponce" element={<PayphoneResponce />} />
        <Route path="/clientes/pagofactura" element={<PagoFactura />} />

        {/* Rutas de administración */}
        <Route path="/admin" element={<Admin />}>
          <Route path="promesa" element={<PromesaPago />} />
        </Route>

        {/* Redirección comodín: cualquier otra ruta va a "/" */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
