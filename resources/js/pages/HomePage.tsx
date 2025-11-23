import React, { useEffect, useState } from 'react';
import { AboutSection } from '../components/landing/AboutSection';
import { CTASection } from '../components/landing/CTASection';
import { ContactSection } from '../components/landing/ContactSection';
import { Footer } from '../components/landing/Footer';
import { Header } from '../components/landing/Header';
import { HeroSection } from '../components/landing/HeroSection';
import { ServicesSection } from '../components/landing/ServicesSection';
import { TestimonialsSection } from '../components/landing/TestimonialsSection';
import { CompanyProfile, companyProfileService } from '../services/companyProfileService';

const HomePage: React.FC = () => {
    const [profile, setProfile] = useState<CompanyProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeTestimonial, setActiveTestimonial] = useState(0);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await companyProfileService.getProfile();
                if (response.success) {
                    setProfile(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch company profile:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);

        // Auto-rotate testimonials
        const testimonialInterval = setInterval(() => {
            setActiveTestimonial((prev) => (prev + 1) % 3);
        }, 5000);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearInterval(testimonialInterval);
        };
    }, []);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#FFF8F0] via-[#F5F1E8] to-[#FFE4E6]">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 animate-spin rounded-full border-t-4 border-b-4 border-[#D4AF37]"></div>
                    <p className="mt-6 font-serif text-xl text-gray-600">Loading Your Perfect Day...</p>
                </div>
            </div>
        );
    }

    const testimonials = [
        {
            name: 'Sarah & Michael',
            text: 'Pernikahan kami sempurna! Tim Diamond Weddings sangat profesional dan detail. Terima kasih sudah mewujudkan impian kami!',
            rating: 5,
            date: 'Juni 2024',
        },
        {
            name: 'Dinda & Arya',
            text: 'Pelayanan yang luar biasa! Dari konsultasi hingga hari H, semuanya berjalan lancar. Highly recommended!',
            rating: 5,
            date: 'Agustus 2024',
        },
        {
            name: 'Lisa & Ryan',
            text: 'Dekorasi yang indah dan tim yang sangat membantu. Wedding kami jadi memorable banget!',
            rating: 5,
            date: 'Oktober 2024',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-[#F5F1E8] to-[#FFE4E6]">
            <Header isScrolled={isScrolled} companyName={profile?.company_name || 'Diamond Weddings'} />
            <HeroSection />
            <AboutSection />
            <ServicesSection />
            <TestimonialsSection activeTestimonial={activeTestimonial} testimonials={testimonials} setActiveTestimonial={setActiveTestimonial} />
            <CTASection />
            <ContactSection profile={profile} />
            <Footer />

            {/* CSS Animations */}
            <style>{`
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(40px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slide-down {
                    from {
                        opacity: 0;
                        transform: translateY(-40px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(40px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                .animate-fade-in-up {
                    animation: fade-in-up 1s ease-out forwards;
                }

                .animate-slide-down {
                    animation: slide-down 1s ease-out forwards;
                }

                .animate-slide-up {
                    animation: slide-up 1s ease-out forwards;
                }

                .animate-fade-in {
                    animation: fade-in 1s ease-out forwards;
                }

                .animation-delay-300 {
                    animation-delay: 300ms;
                }

                .animation-delay-600 {
                    animation-delay: 600ms;
                }

                .animation-delay-900 {
                    animation-delay: 900ms;
                }

                .animation-delay-1200 {
                    animation-delay: 1200ms;
                }

                .animation-delay-2000 {
                    animation-delay: 2s;
                }

                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
};

export default HomePage;
