# Landing Page Components Documentation

## 📁 Struktur Komponen

Halaman HomePage telah di-refactor menjadi komponen-komponen modular yang reusable:

```
resources/js/
├── pages/
│   └── HomePage.tsx (Main page - 223 lines)
└── components/
    └── landing/
        ├── Header.tsx (Navigation bar with auth)
        ├── HeroSection.tsx (Hero with animated background)
        ├── AboutSection.tsx (About company section)
        ├── ServicesSection.tsx (6 service cards)
        ├── TestimonialsSection.tsx (Testimonial carousel)
        ├── CTASection.tsx (Call to action)
        ├── ContactSection.tsx (Contact cards)
        └── Footer.tsx (Footer with links)
```

## 🧩 Komponen Detail

### 1. **Header.tsx** (119 lines)

**Props:**

- `isScrolled: boolean` - State untuk transparansi/backdrop
- `companyName: string` - Nama perusahaan

**Features:**

- Sticky navigation dengan backdrop blur
- Auth detection (admin/user/guest)
- Responsive navigation
- Login/Register buttons
- Admin Panel & My Orders links

---

### 2. **HeroSection.tsx** (93 lines)

**Props:** None (standalone)

**Features:**

- Animated background dengan particles
- Gradient text animations
- CTA buttons (Packages & About)
- Stats section (500+ clients, 10+ years, 100% satisfaction)
- Scroll indicator

---

### 3. **AboutSection.tsx** (106 lines)

**Props:** None

**Features:**

- Image grid dengan hover effects
- Company description
- 3 feature cards dengan icons
- CTA button ke packages

---

### 4. **ServicesSection.tsx** (81 lines)

**Props:** None

**Features:**

- 6 service cards dengan unique gradients
- Hover effects (scale, rotate, translate)
- Icon animations
- Responsive grid (1 → 2 → 3 columns)

**Services Array:**

```typescript
const services = [{ icon, title, description, gradient, iconGradient, color }];
```

---

### 5. **TestimonialsSection.tsx** (66 lines)

**Props:**

- `activeTestimonial: number` - Current slide index
- `testimonials: Testimonial[]` - Array of testimonials
- `setActiveTestimonial: (index: number) => void` - Slide changer

**Features:**

- Carousel dengan auto-rotate
- Navigation dots
- Smooth transitions
- Dark background dengan blur effects

---

### 6. **CTASection.tsx** (47 lines)

**Props:** None

**Features:**

- Full-width gradient background
- 2 CTA buttons
- Animated pattern overlay
- Responsive layout

---

### 7. **ContactSection.tsx** (68 lines)

**Props:**

- `profile: CompanyProfile | null` - Company data

**Features:**

- 4 contact cards (Phone, Email, WhatsApp, Location)
- Dynamic data from company profile
- Hover animations
- Icon gradients

---

### 8. **Footer.tsx** (115 lines)

**Props:** None

**Features:**

- 4-column grid (Brand, Links, Services, Contact)
- Social media links
- Logo dengan gradient
- Copyright section

---

## 🎨 Styling Convention

**Gradients Used:**

- Gold: `from-[#D4AF37] to-[#F4D03F]`
- Pink: `from-[#EC4899] to-[#F472B6]`
- Purple: `from-[#8B5CF6] to-[#A78BFA]`
- Orange: `from-[#F59E0B] to-[#FBBF24]`
- Green: `from-[#10B981] to-[#34D399]`
- Blue: `from-[#3B82F6] to-[#60A5FA]`

**Animation Classes:**

```css
.animate-fade-in-up
.animate-slide-down
.animate-slide-up
.animate-fade-in
.animation-delay-{300,600,900,1200}
```

---

## 📊 Benefits Refactoring

### Before:

- **HomePage.tsx**: 923 lines ❌
- Single monolithic file
- Hard to maintain
- Difficult to reuse

### After:

- **HomePage.tsx**: 223 lines ✅
- **8 Modular Components**: Average 80 lines each
- Easy to maintain
- Reusable components
- Better code organization

### Size Comparison:

```
Before: HomePage-rwiokuhX.js - 41.12 kB (6.68 kB gzip)
After:  HomePage-qjBfwyiV.js - 35.10 kB (6.68 kB gzip) ⬇️ 6KB smaller!
```

---

## 🚀 Usage Example

```tsx
import { Header } from '../components/landing/Header';
import { HeroSection } from '../components/landing/HeroSection';
// ... import other components

const HomePage = () => {
    return (
        <div>
            <Header isScrolled={isScrolled} companyName="Diamond Weddings" />
            <HeroSection />
            <AboutSection />
            <ServicesSection />
            {/* ... other sections */}
        </div>
    );
};
```

---

## 🔧 Maintenance Tips

1. **Adding New Service:**
    - Edit `ServicesSection.tsx`
    - Add object to `services` array

2. **Changing Navigation:**
    - Edit `Header.tsx`
    - Update `<nav>` links

3. **Update Footer:**
    - Edit `Footer.tsx`
    - Modify grid columns

4. **Add Testimonial:**
    - Edit `HomePage.tsx`
    - Add to `testimonials` array

---

## ✅ Testing Checklist

- [x] Build successful (6.34s)
- [x] All components render correctly
- [x] Navigation links work
- [x] Animations smooth
- [x] Responsive on mobile/tablet/desktop
- [x] Auth detection works
- [x] Gallery link added

---

## 📝 Notes

- All components use TypeScript with proper typing
- Tailwind CSS for styling
- Inertia.js for navigation
- Company profile loaded dynamically
- Auto-rotating testimonials (5s interval)
