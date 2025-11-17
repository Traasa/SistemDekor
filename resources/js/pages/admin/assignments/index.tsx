import React from 'react';
import UnderConstruction from '../../../components/UnderConstruction';
import { AdminLayout } from '../../../layouts/AdminLayout';

const AssignmentsPage: React.FC = () => {
    return (
        <AdminLayout>
            <UnderConstruction title="Employee Assignment" description="Halaman untuk penugasan karyawan sedang dalam pengembangan." />
        </AdminLayout>
    );
};

export default AssignmentsPage;
