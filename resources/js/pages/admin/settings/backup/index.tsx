import React from 'react';
import UnderConstruction from '../../../../components/UnderConstruction';
import { AdminLayout } from '../../../../layouts/AdminLayout';

const BackupPage: React.FC = () => {
    return (
        <AdminLayout>
            <UnderConstruction title="Backup & Restore" description="Halaman untuk backup dan restore data sedang dalam pengembangan." />
        </AdminLayout>
    );
};

export default BackupPage;
