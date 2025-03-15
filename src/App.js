import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ConsultaCliente from './components/ConsultaCliente';
import Facturas from './components/Facturas';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ConsultaCliente />} />
        <Route path="/facturas" element={<Facturas />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
