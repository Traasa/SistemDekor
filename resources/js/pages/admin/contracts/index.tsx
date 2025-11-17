import React from 'react';
import UnderConstruction from '../../../components/UnderConstruction';
import { AdminLayout } from '../../../layouts/AdminLayout';

const ContractsPage: React.FC = () => {
    return (
        <AdminLayout>
            <UnderConstruction title="Contract Management" description="Halaman untuk mengelola kontrak vendor sedang dalam pengembangan." />
        </AdminLayout>
    );
};

export default ContractsPage;
