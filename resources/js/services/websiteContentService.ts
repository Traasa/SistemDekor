import api from './api';

export interface LandingServiceItem {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string | null;
    image: string | null;
    is_active: boolean;
}

export interface LandingGalleryItem {
    id: number;
    title: string;
    description: string | null;
    image_path: string;
    category: string | null;
    is_featured: boolean;
    sort_order?: number;
}

export interface LandingTestimonialItem {
    id: number;
    client_name: string;
    event_type: string | null;
    testimonial: string;
    rating: number;
    photo_url: string | null;
    is_featured: boolean;
    created_at: string;
}

export interface LandingPortfolioItem {
    id: number;
    title: string;
    description: string | null;
    image_url: string;
    category: string | null;
    is_featured: boolean;
}

export const websiteContentService = {
    async getServices(): Promise<LandingServiceItem[]> {
        const response = await api.get('/services', { params: { active_only: 1 } });
        return response.data?.data || [];
    },

    async getTestimonials(): Promise<LandingTestimonialItem[]> {
        const featuredResponse = await api.get('/testimonials', { params: { featured: 1 } });
        const featuredData = featuredResponse.data?.data || [];

        if (featuredData.length > 0) {
            return featuredData;
        }

        const response = await api.get('/testimonials');
        return response.data?.data || [];
    },

    async getGalleryItems(): Promise<LandingGalleryItem[]> {
        const featuredResponse = await api.get('/gallery', { params: { featured: 1 } });
        const featuredData = featuredResponse.data?.data || [];

        if (featuredData.length > 0) {
            return featuredData;
        }

        const response = await api.get('/gallery');
        return response.data?.data || [];
    },

    async getAllGalleryItems(): Promise<LandingGalleryItem[]> {
        const response = await api.get('/gallery');
        return response.data?.data || [];
    },

    async getPortfolios(): Promise<LandingPortfolioItem[]> {
        const featuredResponse = await api.get('/portfolios', { params: { featured: 1, per_page: 6 } });
        const featuredData = featuredResponse.data?.data?.data || [];

        if (featuredData.length > 0) {
            return featuredData;
        }

        const response = await api.get('/portfolios', { params: { per_page: 6 } });
        return response.data?.data?.data || [];
    },

    async getAllPortfolios(): Promise<LandingPortfolioItem[]> {
        const response = await api.get('/portfolios', { params: { per_page: 100 } });
        return response.data?.data?.data || [];
    },
};
