import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import { OrdersProvider } from './context/OrdersContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Dashboard from './components/dashboard/Dashboard';
import OrderDetail from './components/orders/OrderDetail';
import FormulasPanel from './components/formulas/FormulasPanel';
import SettingsPanel from './components/layout/SettingsPanel';
import ToastContainer from './components/layout/ToastContainer';
import NewOrderModal from './components/orders/NewOrderModal';

const AppContent = () => {
  const { isNewOrderModalOpen, setIsNewOrderModalOpen } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-900">
      <Navbar />
      
      <main className="flex-grow relative">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders/:id/*" element={<OrderDetail />} />
          <Route path="/formulas" element={<FormulasPanel />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <SettingsPanel />
      <ToastContainer />
      <NewOrderModal 
        isOpen={isNewOrderModalOpen} 
        onClose={() => setIsNewOrderModalOpen(false)} 
      />

      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <OrdersProvider>
          <AppContent />
        </OrdersProvider>
      </AppProvider>
    </ToastProvider>
  );
}
