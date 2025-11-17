import React from 'react';
import UnderConstruction from '../../../../components/UnderConstruction';
import { AdminLayout } from '../../../../layouts/AdminLayout';

const InventoryReportPage: React.FC = () => {
    return (
        <AdminLayout>
            <UnderConstruction title="Inventory Report" description="Halaman laporan inventaris sedang dalam pengembangan." />
        </AdminLayout>
    );
};

export default InventoryReportPage;
