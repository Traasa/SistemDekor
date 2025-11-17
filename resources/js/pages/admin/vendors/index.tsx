import React from 'react';
import UnderConstruction from '../../../components/UnderConstruction';
import { AdminLayout } from '../../../layouts/AdminLayout';

const VendorsPage: React.FC = () => {
    return (
        <AdminLayout>
            <UnderConstruction title="Vendor Management" description="Halaman untuk mengelola vendor sedang dalam pengembangan." />
        </AdminLayout>
    );
};

export default VendorsPage;
