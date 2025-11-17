import { router } from '@inertiajs/react';
import React from 'react';

interface Props {
    status?: string;
}

const VerifyEmail: React.FC<Props> = ({ status }) => {
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/email/verification-notification');
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#F5F1E8] via-white to-[#F5F1E8]">
            <div className="w-full max-w-md">
                <div className="rounded-2xl bg-white p-8 shadow-2xl">
                    {/* Logo */}
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] to-[#EC4899]">
                            <span className="text-4xl">✉️</span>
                        </div>
                        <h1 className="font-serif text-3xl font-bold text-gray-900">Verifikasi Email</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Terima kasih telah mendaftar! Sebelum memulai, silakan verifikasi alamat email Anda dengan mengklik link yang baru saja
                            kami kirimkan.
                        </p>
                    </div>

                    {status === 'verification-link-sent' && (
                        <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-600">
                            Link verifikasi baru telah dikirim ke email Anda!
                        </div>
                    )}

                    <form onSubmit={submit}>
                        <button
                            type="submit"
                            className="w-full rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#EC4899] py-3 font-semibold text-white transition-all hover:shadow-lg"
                        >
                            Kirim Ulang Email Verifikasi
                        </button>

                        <div className="mt-4 text-center">
                            <button type="button" onClick={() => router.post('/logout')} className="text-sm text-gray-600 hover:underline">
                                Logout
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
