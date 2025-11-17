import React from 'react';
import UnderConstruction from '../../../components/UnderConstruction';
import { AdminLayout } from '../../../layouts/AdminLayout';

const UserActivityPage: React.FC = () => {
    return (
        <AdminLayout>
            <UnderConstruction title="User Activity Logs" description="Halaman untuk monitoring aktivitas user sedang dalam pengembangan." />
        </AdminLayout>
    );
};

export default UserActivityPage;
