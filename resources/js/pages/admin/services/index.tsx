import React from 'react';
import UnderConstruction from '../../../components/UnderConstruction';
import { AdminLayout } from '../../../layouts/AdminLayout';

const ServicesPage: React.FC = () => {
    return (
        <AdminLayout>
            <UnderConstruction title="Services Management" description="Halaman untuk mengelola layanan perusahaan sedang dalam pengembangan." />
        </AdminLayout>
    );
};

export default ServicesPage;
