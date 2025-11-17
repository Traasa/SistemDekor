import React from 'react';
import UnderConstruction from '../../../components/UnderConstruction';
import { AdminLayout } from '../../../layouts/AdminLayout';

const CalendarPage: React.FC = () => {
    return (
        <AdminLayout>
            <UnderConstruction title="Event Calendar" description="Halaman kalender event sedang dalam pengembangan." />
        </AdminLayout>
    );
};

export default CalendarPage;
