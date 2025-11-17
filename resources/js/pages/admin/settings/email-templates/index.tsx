import React from 'react';
import UnderConstruction from '../../../../components/UnderConstruction';
import { AdminLayout } from '../../../../layouts/AdminLayout';

const EmailTemplatesPage: React.FC = () => {
    return (
        <AdminLayout>
            <UnderConstruction title="Email Templates" description="Halaman pengelolaan template email sedang dalam pengembangan." />
        </AdminLayout>
    );
};

export default EmailTemplatesPage;
