import React from 'react';
import UnderConstruction from '../../../components/UnderConstruction';
import { AdminLayout } from '../../../layouts/AdminLayout';

const ClientVerificationPage: React.FC = () => {
    return (
        <AdminLayout>
            <UnderConstruction title="Client Order Verification" description="Halaman untuk verifikasi order client sedang dalam pengembangan." />
        </AdminLayout>
    );
};

export default ClientVerificationPage;
