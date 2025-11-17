import React from 'react';
import UnderConstruction from '../../../../components/UnderConstruction';
import { AdminLayout } from '../../../../layouts/AdminLayout';

const AlertsPage: React.FC = () => {
    return (
        <AdminLayout>
            <UnderConstruction title="Low Stock Alerts" description="Halaman untuk monitoring barang stok rendah sedang dalam pengembangan." />
        </AdminLayout>
    );
};

export default AlertsPage;
