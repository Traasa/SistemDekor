import React from 'react';
import UnderConstruction from '../../../components/UnderConstruction';
import { AdminLayout } from '../../../layouts/AdminLayout';

const PortfolioPage: React.FC = () => {
    return (
        <AdminLayout>
            <UnderConstruction title="Portfolio Management" description="Halaman untuk mengelola portfolio project sedang dalam pengembangan." />
        </AdminLayout>
    );
};

export default PortfolioPage;
