import React from 'react';
import UnderConstruction from '../../../components/UnderConstruction';
import { AdminLayout } from '../../../layouts/AdminLayout';

const PackagesPage: React.FC = () => {
    return (
        <AdminLayout>
            <UnderConstruction title="Packages Management" description="Halaman untuk mengelola paket layanan sedang dalam pengembangan." />
        </AdminLayout>
    );
};

export default PackagesPage;
