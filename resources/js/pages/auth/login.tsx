import { useForm } from '@inertiajs/react';
import React, { FormEventHandler } from 'react';

interface Props {
    canResetPassword: boolean;
    status?: string;
}

const Login: React.FC<Props> = ({ canResetPassword, status }) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#F5F1E8] via-white to-[#F5F1E8] text-black">
            <div className="w-full max-w-md">
                <div className="rounded-2xl bg-white p-8 shadow-2xl">
                    {/* Logo */}
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] to-[#EC4899]">
                            <span className="font-serif text-3xl font-bold text-white">D</span>
                        </div>
                        <h1 className="font-serif text-3xl font-bold text-gray-900">Diamond Wedding</h1>
                        <p className="mt-2 text-sm text-gray-600">Masuk ke Dashboard Admin</p>
                    </div>

                    {status && <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-600">{status}</div>}

                    <form onSubmit={submit}>
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
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
                        </div>

                        {/* Remember Me */}
                        <div className="mb-6 flex items-center">
                            <input
                                id="remember"
                                type="checkbox"
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                            />
                            <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                                Remember me
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#EC4899] py-3 font-semibold text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? 'Logging in...' : 'Login'}
                        </button>

                        {/* Forgot Password */}
                        {canResetPassword && (
                            <div className="mt-4 text-center">
                                <a href="/forgot-password" className="text-sm text-[#D4AF37] hover:underline">
                                    Forgot your password?
                                </a>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
