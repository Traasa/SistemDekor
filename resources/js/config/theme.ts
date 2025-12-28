// Theme Configuration for Diamond Weddings
export const theme = {
    colors: {
        primary: {
            gold: '#D4AF37',
            lightGold: '#F4D03F',
            darkGold: '#B8941F',
        },
        secondary: {
            pink: '#EC4899',
            lightPink: '#F9A8D4',
            darkPink: '#BE185D',
        },
        neutral: {
            cream: '#FFF8F0',
            lightCream: '#FFFBF5',
            beige: '#F5F1E8',
            warmGray: '#E5E1DA',
        },
        dark: {
            primary: '#1A1A1A',
            secondary: '#2D2D2D',
            text: '#374151',
        },
        accent: {
            rose: '#FFE4E6',
            lavender: '#F3E8FF',
            mint: '#D1FAE5',
        },
    },
    gradients: {
        primary: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
        secondary: 'linear-gradient(135deg, #EC4899 0%, #D4AF37 100%)',
        hero: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 50%, #1A1A1A 100%)',
        background: 'linear-gradient(135deg, #FFF8F0 0%, #F5F1E8 50%, #FFE4E6 100%)',
        card: 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,248,240,0.8) 100%)',
    },
    shadows: {
        small: '0 2px 8px rgba(212, 175, 55, 0.1)',
        medium: '0 4px 16px rgba(212, 175, 55, 0.15)',
        large: '0 8px 32px rgba(212, 175, 55, 0.2)',
        glow: '0 0 20px rgba(212, 175, 55, 0.3)',
    },
    spacing: {
        section: '5rem',
        container: '1280px',
    },
};

// Free stock images from Unsplash (curated wedding images)
export const images = {
    hero: {
        main: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80',
        couple: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1920&q=80',
        ceremony: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1920&q=80',
    },
    services: {
        decoration: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80',
        catering: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80',
        photography: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&q=80',
        venue: '/1.mp4',
        planning: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80',
        entertainment: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    },
    gallery: {
        wedding1: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
        wedding2: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&q=80',
        wedding3: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80',
        wedding4: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80',
        wedding5: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80',
        wedding6: 'https://images.unsplash.com/photo-1519167758481-83f29da8dffe?w=800&q=80',
        wedding7: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80',
        wedding8: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80',
    },
    packages: {
        silver: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80',
        gold: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
        platinum: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80',
        diamond: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&q=80',
    },
    testimonials: {
        couple1: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&q=80',
        couple2: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400&q=80',
        couple3: 'https://images.unsplash.com/photo-1519167758481-83f29da8dffe?w=400&q=80',
    },
    placeholders: {
        profile: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
        venue: 'https://images.unsplash.com/photo-1519167758481-83f29da8dffe?w=800&q=80',
        flowers: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80',
    },
};

// Video backgrounds (free from Pexels)
export const videos = {
    hero: '/public/1.mp4',
    about: '/public/1.mp4',
};

// Animation configurations
export const animations = {
    fadeInUp: 'animate-[fadeInUp_0.6s_ease-out_forwards]',
    fadeIn: 'animate-[fadeIn_0.8s_ease-out_forwards]',
    slideInLeft: 'animate-[slideInLeft_0.6s_ease-out_forwards]',
    slideInRight: 'animate-[slideInRight_0.6s_ease-out_forwards]',
    scaleIn: 'animate-[scaleIn_0.5s_ease-out_forwards]',
    bounce: 'animate-bounce',
    pulse: 'animate-pulse',
};

export default theme;
