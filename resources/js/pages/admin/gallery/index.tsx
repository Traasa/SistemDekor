import React from 'react';
import UnderConstruction from '../../../components/UnderConstruction';
import { AdminLayout } from '../../../layouts/AdminLayout';

const GalleryPage: React.FC = () => {
    return (
        <AdminLayout>
            <UnderConstruction title="Gallery Management" description="Halaman untuk mengelola galeri foto sedang dalam pengembangan." />
        </AdminLayout>
    );
};

export default GalleryPage;
