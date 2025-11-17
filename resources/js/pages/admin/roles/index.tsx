import React from 'react';
import UnderConstruction from '../../../components/UnderConstruction';
import { AdminLayout } from '../../../layouts/AdminLayout';

const RolesPage: React.FC = () => {
    return (
        <AdminLayout>
            <UnderConstruction
                title="Role & Permission Management"
                description="Halaman untuk mengelola role dan permission user sedang dalam pengembangan."
            />
        </AdminLayout>
    );
};

export default RolesPage;
