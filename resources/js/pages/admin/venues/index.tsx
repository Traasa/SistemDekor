import React from 'react';
import UnderConstruction from '../../../components/UnderConstruction';
import { AdminLayout } from '../../../layouts/AdminLayout';

const VenuesPage: React.FC = () => {
    return (
        <AdminLayout>
            <UnderConstruction title="Venue Management" description="Halaman untuk mengelola venue sedang dalam pengembangan." />
        </AdminLayout>
    );
};

export default VenuesPage;
