import React from 'react';
import UnderConstruction from '../../../../components/UnderConstruction';
import { AdminLayout } from '../../../../layouts/AdminLayout';

const SalesReportPage: React.FC = () => {
    return (
        <AdminLayout>
            <UnderConstruction title="Sales Report" description="Halaman laporan penjualan sedang dalam pengembangan." />
        </AdminLayout>
    );
};

export default SalesReportPage;
