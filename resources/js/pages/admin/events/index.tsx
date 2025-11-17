import React from 'react';
import UnderConstruction from '../../../components/UnderConstruction';
import { AdminLayout } from '../../../layouts/AdminLayout';

const EventsPage: React.FC = () => {
    return (
        <AdminLayout>
            <UnderConstruction title="Event Management" description="Halaman untuk mengelola event sedang dalam pengembangan." />
        </AdminLayout>
    );
};

export default EventsPage;
