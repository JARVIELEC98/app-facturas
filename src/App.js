// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ConsultaCliente from './components/ConsultaCliente';
import Facturas from './components/Facturas';
import Payphone from './components/Payphone';
import ConfirPayphone from './components/ConfirPayphone';
import PayphoneResponce from './components/PayphoneResponce';

// Nuevo componente
import PagoFactura from './components/PagoFactura';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ConsultaCliente />} />
        <Route path="/facturas" element={<Facturas />} />
        <Route path="/payphone" element={<Payphone />} />
        <Route path="/confirpayphone" element={<ConfirPayphone />} />
        <Route path="/payphoneResponce" element={<PayphoneResponce />} />

        {/* Nueva ruta para mostrar el resultado final del pago */}
        <Route path="/pagofactura" element={<PagoFactura />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
