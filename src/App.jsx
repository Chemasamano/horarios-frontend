import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import './App.css';

// Pages
import HomePage from './pages/HomePage';
import DocentesPage from './pages/DocentesPage';
import MateriasPage from './pages/MateriasPage';
import GruposPage from './pages/GruposPage';
import AulasPage from './pages/AulasPage';
import HorariosPage from './pages/HorariosPage';

// Components
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';

// Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000 // 5 minutos
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="app">
          <Header />
          <div className="app-container">
            <Sidebar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/docentes" element={<DocentesPage />} />
                <Route path="/materias" element={<MateriasPage />} />
                <Route path="/grupos" element={<GruposPage />} />
                <Route path="/aulas" element={<AulasPage />} />
                <Route path="/horarios" element={<HorariosPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              }
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;