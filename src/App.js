// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ConsultaCliente from './components/ConsultaCliente';
import Facturas from './components/Facturas';
import Payphone from './components/Payphone';
import PayphoneResponce from './components/PayphoneResponce';
import PagoFactura from './components/PagoFactura';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ConsultaCliente />} />
        <Route path="/facturas" element={<Facturas />} />
        <Route path="/payphone" element={<Payphone />} />
        <Route path="/payphoneResponce" element={<PayphoneResponce />} />
        <Route path="/pagofactura" element={<PagoFactura />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
