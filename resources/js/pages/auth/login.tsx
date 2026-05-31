import { Head, Link, useForm } from '@inertiajs/react';
import React, { FormEventHandler } from 'react';
import { AuthShell } from '../../components/site/AuthShell';

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
        <>
            <Head title="Login" />
            <AuthShell title="Masuk Akun" subtitle="Lanjutkan untuk melihat dashboard dan status order.">
                {status && <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{status}</div>}

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="mb-1 block text-sm font-semibold text-slate-700">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="w-full rounded-xl border border-slate-300 px-4 py-3"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>

                    <div>
                        <label htmlFor="password" className="mb-1 block text-sm font-semibold text-slate-700">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="w-full rounded-xl border border-slate-300 px-4 py-3"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                    </div>

                    <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input
                            id="remember"
                            type="checkbox"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300"
                        />
                        Ingat saya
                    </label>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#8A6A4F] py-3 font-semibold text-white disabled:opacity-60"
                    >
                        {processing ? 'Memproses...' : 'Login'}
                    </button>
                </form>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <Link href="/register" className="font-semibold text-[#B88321] hover:underline">
                        Belum punya akun?
                    </Link>
                    {canResetPassword && (
                        <Link href="/forgot-password" className="font-semibold text-slate-600 hover:text-slate-900 hover:underline">
                            Lupa password?
                        </Link>
                    )}
                </div>
            </AuthShell>
        </>
    );
};

export default Login;
