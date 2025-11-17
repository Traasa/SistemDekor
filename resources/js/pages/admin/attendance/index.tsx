import React from 'react';
import UnderConstruction from '../../../components/UnderConstruction';
import { AdminLayout } from '../../../layouts/AdminLayout';

const AttendancePage: React.FC = () => {
    return (
        <AdminLayout>
            <UnderConstruction title="Attendance Management" description="Halaman untuk mengelola absensi karyawan sedang dalam pengembangan." />
        </AdminLayout>
    );
};

export default AttendancePage;
