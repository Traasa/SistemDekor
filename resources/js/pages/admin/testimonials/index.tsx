import React from 'react';
import UnderConstruction from '../../../components/UnderConstruction';
import { AdminLayout } from '../../../layouts/AdminLayout';

const TestimonialsPage: React.FC = () => {
    return (
        <AdminLayout>
            <UnderConstruction title="Testimonials Management" description="Halaman untuk mengelola testimoni pelanggan sedang dalam pengembangan." />
        </AdminLayout>
    );
};

export default TestimonialsPage;
