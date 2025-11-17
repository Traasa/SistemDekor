import React from 'react';
import UnderConstruction from '../../../components/UnderConstruction';
import { AdminLayout } from '../../../layouts/AdminLayout';

const EmployeesPage: React.FC = () => {
    return (
        <AdminLayout>
            <UnderConstruction title="Employee Management" description="Halaman untuk mengelola data karyawan sedang dalam pengembangan." />
        </AdminLayout>
    );
};

export default EmployeesPage;
