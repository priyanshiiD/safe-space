import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MonitorPage from './pages/MonitorPage';
import SosPage from './pages/SosPage';
import SafetyMapPage from './pages/SafetyMapPage';
import FeaturesPage from './pages/FeaturesPage';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sos" element={<SosPage />} />
          <Route path="/safety-map" element={<SafetyMapPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/monitor" element={<MonitorPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;