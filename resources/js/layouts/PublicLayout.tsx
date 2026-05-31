import { Head } from '@inertiajs/react';
import React, { useEffect, useMemo, useState } from 'react';
import { SiteFooter } from '../components/site/SiteFooter';
import { SiteHeader } from '../components/site/SiteHeader';
import { CompanyProfile, companyProfileService } from '../services/companyProfileService';

type MenuKey = 'home' | 'about' | 'packages' | 'gallery' | 'contact' | 'orders';

interface PublicLayoutProps {
    active?: MenuKey;
    children: React.ReactNode;
    showFooter?: boolean;
    wrapperClassName?: string;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
    active = 'home',
    children,
    showFooter = true,
    wrapperClassName,
}) => {
    const [profile, setProfile] = useState<CompanyProfile | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profileResponse = await companyProfileService.getProfile();
                if (profileResponse.success) setProfile(profileResponse.data);
            } catch (error) {
                console.error('Failed to fetch company profile:', error);
            }
        };

        fetchProfile();
    }, []);

    const branding = useMemo(() => {
        const brandName = profile?.company_name || 'SistemDekor';
        const brandDescription =
            profile?.description ||
            profile?.about ||
            'Perencana dan dekorator pernikahan yang fokus pada detail, estetika, dan pengalaman tamu.';
        const logoUrl = profile?.logo ? `/storage/${profile.logo}` : undefined;
        const faviconVersion = profile?.updated_at ? `?v=${encodeURIComponent(profile.updated_at)}` : '';
        const faviconUrl = profile?.favicon ? `/storage/${profile.favicon}${faviconVersion}` : undefined;

        return { brandName, brandDescription, logoUrl, faviconUrl };
    }, [profile]);

    useEffect(() => {
        if (!branding.faviconUrl) return;

        const setIcon = (rel: string) => {
            let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
            if (!link) {
                link = document.createElement('link');
                link.rel = rel;
                document.head.appendChild(link);
            }
            link.href = branding.faviconUrl as string;
        };

        setIcon('icon');
        setIcon('shortcut icon');
        setIcon('apple-touch-icon');
    }, [branding.faviconUrl]);

    return (
        <>
            {branding.faviconUrl && (
                <Head>
                    <link rel="icon" href={branding.faviconUrl} sizes="any" />
                    <link rel="apple-touch-icon" href={branding.faviconUrl} />
                </Head>
            )}

            <div className={wrapperClassName}>
                <SiteHeader active={active} companyName={branding.brandName} logoUrl={branding.logoUrl} />
                {children}
                {showFooter && (
                    <SiteFooter
                        companyName={branding.brandName}
                        description={branding.brandDescription}
                        phone={profile?.phone}
                        email={profile?.email}
                        address={profile?.address}
                        whatsapp={profile?.social_media?.whatsapp}
                    />
                )}
            </div>
        </>
    );
};
