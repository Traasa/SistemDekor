import { useForm } from '@inertiajs/react';
import React, { FormEventHandler } from 'react';

const ConfirmPassword: React.FC = () => {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post('/confirm-password', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#F5F1E8] via-white to-[#F5F1E8]">
            <div className="w-full max-w-md">
                <div className="rounded-2xl bg-white p-8 shadow-2xl">
                    {/* Logo */}
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] to-[#EC4899]">
                            <span className="text-4xl">🔒</span>
                        </div>
                        <h1 className="font-serif text-3xl font-bold text-gray-900">Konfirmasi Password</h1>
                        <p className="mt-2 text-sm text-gray-600">Ini adalah area yang aman. Silakan konfirmasi password Anda sebelum melanjutkan.</p>
                    </div>

                    <form onSubmit={submit}>
                        {/* Password */}
                        <div className="mb-6">
                            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#EC4899] py-3 font-semibold text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? 'Memverifikasi...' : 'Konfirmasi'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ConfirmPassword;
