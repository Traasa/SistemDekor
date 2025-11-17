import React from 'react';
import UnderConstruction from '../../../components/UnderConstruction';
import { AdminLayout } from '../../../layouts/AdminLayout';

const CompanyProfilePage: React.FC = () => {
    return (
        <AdminLayout>
            <UnderConstruction
                title="Company Profile Management"
                description="Halaman untuk mengelola profil perusahaan sedang dalam pengembangan."
            />
        </AdminLayout>
    );
};

export default CompanyProfilePage;
