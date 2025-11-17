import React from 'react';
import UnderConstruction from '../../../components/UnderConstruction';
import { AdminLayout } from '../../../layouts/AdminLayout';

const TasksPage: React.FC = () => {
    return (
        <AdminLayout>
            <UnderConstruction title="Task Assignment" description="Halaman untuk penugasan task sedang dalam pengembangan." />
        </AdminLayout>
    );
};

export default TasksPage;
