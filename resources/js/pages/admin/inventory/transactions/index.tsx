import React from 'react';
import UnderConstruction from '../../../../components/UnderConstruction';
import { AdminLayout } from '../../../../layouts/AdminLayout';

const TransactionsPage: React.FC = () => {
    return (
        <AdminLayout>
            <UnderConstruction title="Stock In/Out Management" description="Halaman untuk transaksi stock in/out sedang dalam pengembangan." />
        </AdminLayout>
    );
};

export default TransactionsPage;
