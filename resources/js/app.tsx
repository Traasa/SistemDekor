import '../css/app.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { AdminLayout } from './layouts/AdminLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { InventoryItemsPage } from './pages/admin/InventoryItemsPage';
import { OrdersPage } from './pages/admin/OrdersPage';
import { UsersPage } from './pages/admin/UsersPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { HomePage } from './pages/HomePage';
import { TransactionDetailPage } from './pages/TransactionDetailPage';
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
                                    <AdminLayout>
                                        <Dashboard />
                                    </AdminLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/users"
                            element={
                                <ProtectedRoute requireAdmin={true}>
                                    <AdminLayout>
                                        <UsersPage />
                                    </AdminLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/orders"
                            element={
                                <ProtectedRoute requireAdmin={true}>
                                    <AdminLayout>
                                        <OrdersPage />
                                    </AdminLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/inventory/items"
                            element={
                                <ProtectedRoute requireAdmin={true}>
                                    <AdminLayout>
                                        <InventoryItemsPage />
                                    </AdminLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/*"
                            element={
                                <ProtectedRoute requireAdmin={true}>
                                    <AdminLayout>
                                        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
                                            <div className="mb-4 text-6xl">🚧</div>
                                            <h2 className="mb-2 text-2xl font-bold text-gray-900">Page Under Construction</h2>
                                            <p className="text-gray-600">This feature is currently being developed.</p>
                                        </div>
                                    </AdminLayout>
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
