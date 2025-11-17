import React from 'react';
import UnderConstruction from '../../../components/UnderConstruction';
import { AdminLayout } from '../../../layouts/AdminLayout';

const ClientsPage: React.FC = () => {
    return (
        <AdminLayout>
            <UnderConstruction title="Client Management" description="Halaman untuk mengelola data client sedang dalam pengembangan." />
        </AdminLayout>
    );
};

export default ClientsPage;
