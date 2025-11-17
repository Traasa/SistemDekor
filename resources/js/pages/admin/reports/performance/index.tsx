import React from 'react';
import UnderConstruction from '../../../../components/UnderConstruction';
import { AdminLayout } from '../../../../layouts/AdminLayout';

const PerformanceReportPage: React.FC = () => {
    return (
        <AdminLayout>
            <UnderConstruction title="Performance Report" description="Halaman laporan kinerja sedang dalam pengembangan." />
        </AdminLayout>
    );
};

export default PerformanceReportPage;
