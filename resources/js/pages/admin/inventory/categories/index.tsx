import React from 'react';
import UnderConstruction from '../../../../components/UnderConstruction';
import { AdminLayout } from '../../../../layouts/AdminLayout';

const CategoriesPage: React.FC = () => {
    return (
        <AdminLayout>
            <UnderConstruction title="Inventory Categories" description="Halaman untuk mengelola kategori inventaris sedang dalam pengembangan." />
        </AdminLayout>
    );
};

export default CategoriesPage;
