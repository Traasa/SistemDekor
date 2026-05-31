import React from 'react';
import { LandingTestimonialItem } from '../../services/websiteContentService';

interface TestimonialsSectionProps {
    activeTestimonial: number;
    testimonials: LandingTestimonialItem[];
    setActiveTestimonial: (index: number) => void;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ activeTestimonial, testimonials, setActiveTestimonial }) => {
    const activeItem = testimonials[activeTestimonial];

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] py-24">
            <div className="absolute inset-0">
                <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-[#D4AF37]/10 blur-3xl"></div>
                <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-[#EC4899]/10 blur-3xl"></div>
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-16 text-center">
                    <span className="inline-block rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] px-4 py-2 text-sm font-bold text-white">
                        TESTIMONI
                    </span>
                    <h2 className="mt-4 font-serif text-4xl font-bold text-white md:text-5xl lg:text-6xl">
                        Kata <span className="bg-gradient-to-r from-[#D4AF37] to-[#EC4899] bg-clip-text text-transparent">Mereka</span>
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
                        Dengarkan cerita dari pasangan yang telah mempercayakan hari istimewa mereka kepada kami
                    </p>
                </div>

                <div className="relative">
                    <div className="overflow-hidden rounded-3xl bg-white/5 p-12 backdrop-blur-sm">
                        {!activeItem ? (
                            <div className="text-center text-white/70">Belum ada testimonial featured dari admin.</div>
                        ) : (
                            <div className="transition-all duration-500">
                                <div className="mb-8 flex justify-center">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] text-4xl text-white shadow-xl">
                                        ❝
                                    </div>
                                </div>
                                <p className="mb-8 text-center font-serif text-2xl leading-relaxed text-white md:text-3xl">{activeItem.testimonial}</p>
                                <div className="text-center">
                                    <p className="text-xl font-bold text-[#D4AF37]">{activeItem.client_name}</p>
                                    <p className="mt-1 text-white/60">{activeItem.event_type || 'Pelanggan Wedding Organizer'}</p>
                                    <p className="mt-3 text-sm text-white/70">Rating: {activeItem.rating}/5</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation Dots */}
                    {testimonials.length > 0 && (
                        <div className="mt-8 flex justify-center gap-3">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveTestimonial(index)}
                                    className={`h-3 rounded-full transition-all duration-300 ${
                                        index === activeTestimonial
                                            ? 'w-12 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F]'
                                            : 'w-3 bg-white/30 hover:bg-white/50'
                                    }`}
                                    aria-label={`Go to testimonial ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};
