import { useForm } from '@inertiajs/react';
import React, { FormEventHandler } from 'react';

const Register: React.FC = () => {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post('/register', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#F5F1E8] via-white to-[#F5F1E8]">
            <div className="w-full max-w-md">
                <div className="rounded-2xl bg-white p-8 shadow-2xl">
                    {/* Logo */}
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] to-[#EC4899]">
                            <span className="font-serif text-3xl font-bold text-white">D</span>
                        </div>
                        <h1 className="font-serif text-3xl font-bold text-gray-900">Diamond Wedding</h1>
                        <p className="mt-2 text-sm text-gray-600">Daftar Akun Baru</p>
                    </div>

                    <form onSubmit={submit}>
                        {/* Name */}
                        <div className="mb-4">
                            <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                                Nama Lengkap
                            </label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={data.name}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                autoComplete="name"
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                        </div>

                        {/* Email */}
                        <div className="mb-4">
                            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                autoComplete="username"
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div className="mb-4">
                            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                autoComplete="new-password"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
                        </div>

                        {/* Password Confirmation */}
                        <div className="mb-6">
                            <label htmlFor="password_confirmation" className="mb-2 block text-sm font-medium text-gray-700">
                                Konfirmasi Password
                            </label>
                            <input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                autoComplete="new-password"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                            />
                            {errors.password_confirmation && <p className="mt-2 text-sm text-red-600">{errors.password_confirmation}</p>}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#EC4899] py-3 font-semibold text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? 'Mendaftar...' : 'Daftar'}
                        </button>

                        {/* Login Link */}
                        <div className="mt-4 text-center">
                            <span className="text-sm text-gray-600">Sudah punya akun? </span>
                            <a href="/login" className="text-sm font-semibold text-[#D4AF37] hover:underline">
                                Login
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
