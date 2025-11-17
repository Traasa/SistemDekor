import { useForm } from '@inertiajs/react';
import React, { FormEventHandler } from 'react';

interface Props {
    status?: string;
}

const ForgotPassword: React.FC<Props> = ({ status }) => {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post('/forgot-password');
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
                        <h1 className="font-serif text-3xl font-bold text-gray-900">Reset Password</h1>
                        <p className="mt-2 text-sm text-gray-600">Masukkan email Anda dan kami akan mengirimkan link reset password</p>
                    </div>

                    {status && <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-600">{status}</div>}

                    <form onSubmit={submit}>
                        {/* Email */}
                        <div className="mb-6">
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

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#EC4899] py-3 font-semibold text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? 'Mengirim...' : 'Kirim Link Reset Password'}
                        </button>

                        {/* Back to Login */}
                        <div className="mt-4 text-center">
                            <a href="/login" className="text-sm text-[#D4AF37] hover:underline">
                                Kembali ke Login
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
