import React from 'react';
import UnderConstruction from '../../../../components/UnderConstruction';
import { AdminLayout } from '../../../../layouts/AdminLayout';

const GeneralSettingsPage: React.FC = () => {
    return (
        <AdminLayout>
            <UnderConstruction title="General Settings" description="Halaman pengaturan umum sedang dalam pengembangan." />
        </AdminLayout>
    );
};

export default GeneralSettingsPage;
