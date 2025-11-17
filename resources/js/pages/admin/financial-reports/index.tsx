import React from 'react';
import UnderConstruction from '../../../components/UnderConstruction';
import { AdminLayout } from '../../../layouts/AdminLayout';

const FinancialReportsPage: React.FC = () => {
    return (
        <AdminLayout>
            <UnderConstruction title="Financial Reports" description="Halaman untuk laporan keuangan sedang dalam pengembangan." />
        </AdminLayout>
    );
};

export default FinancialReportsPage;
