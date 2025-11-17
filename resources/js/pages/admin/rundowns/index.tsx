import React from 'react';
import UnderConstruction from '../../../components/UnderConstruction';
import { AdminLayout } from '../../../layouts/AdminLayout';

const RundownsPage: React.FC = () => {
    return (
        <AdminLayout>
            <UnderConstruction title="Event Rundown Management" description="Halaman untuk mengelola rundown acara sedang dalam pengembangan." />
        </AdminLayout>
    );
};

export default RundownsPage;
