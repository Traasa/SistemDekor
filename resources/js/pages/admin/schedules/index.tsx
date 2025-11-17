import React from 'react';
import UnderConstruction from '../../../components/UnderConstruction';
import { AdminLayout } from '../../../layouts/AdminLayout';

const SchedulesPage: React.FC = () => {
    return (
        <AdminLayout>
            <UnderConstruction
                title="Work Schedule Management"
                description="Halaman untuk mengelola jadwal kerja karyawan sedang dalam pengembangan."
            />
        </AdminLayout>
    );
};

export default SchedulesPage;
