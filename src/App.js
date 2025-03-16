import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ConsultaCliente from './components/ConsultaCliente';
import Facturas from './components/Facturas';
import Payphone from './components/Payphone';
import ConfirPayphone from './components/ConfirPayphone'; // ✅ Importamos la nueva página

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ConsultaCliente />} />
        <Route path="/facturas" element={<Facturas />} />
        <Route path="/payphone" element={<Payphone />} />
        <Route path="/confirpayphone" element={<ConfirPayphone />} /> {/* ✅ Nueva ruta */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
