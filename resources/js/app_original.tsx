import '../css/app.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { HomePage } from './pages/HomePage';
import { TransactionDetailPage } from './pages/TransactionDetailPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { MyTransactionsPage } from './pages/user/MyTransactionsPage';

// Create a client
const queryClient = new QueryClient();

const App: React.FC = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/transaction/:id" element={<TransactionDetailPage />} />

                        {/* Protected Admin Routes */}
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute requireAdmin={true}>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />

                        {/* Protected User Routes */}
                        <Route
                            path="/my-transactions"
                            element={
                                <ProtectedRoute>
                                    <MyTransactionsPage />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </QueryClientProvider>
    );
};

const el = document.getElementById('app');
if (el) {
    const root = createRoot(el);
    root.render(<App />);
}
