import { Head, Link, useForm } from '@inertiajs/react';
import React, { FormEventHandler } from 'react';
import { AuthShell } from '../../components/site/AuthShell';

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
        <>
            <Head title="Register" />
            <AuthShell title="Buat Akun" subtitle="Daftar untuk memesan paket dan memantau status order.">
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="mb-1 block text-sm font-semibold text-slate-700">
                            Nama Lengkap
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full rounded-xl border border-slate-300 px-4 py-3"
                            required
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div>
                        <label htmlFor="email" className="mb-1 block text-sm font-semibold text-slate-700">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full rounded-xl border border-slate-300 px-4 py-3"
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
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full rounded-xl border border-slate-300 px-4 py-3"
                            required
                        />
                        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                    </div>

                    <div>
                        <label htmlFor="password_confirmation" className="mb-1 block text-sm font-semibold text-slate-700">
                            Konfirmasi Password
                        </label>
                        <input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            className="w-full rounded-xl border border-slate-300 px-4 py-3"
                            required
                        />
                        {errors.password_confirmation && <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#8A6A4F] py-3 font-semibold text-white disabled:opacity-60"
                    >
                        {processing ? 'Memproses...' : 'Daftar'}
                    </button>
                </form>

                <p className="mt-5 text-sm text-slate-600">
                    Sudah punya akun?{' '}
                    <Link href="/login" className="font-semibold text-[#B88321] hover:underline">
                        Login di sini
                    </Link>
                </p>
            </AuthShell>
        </>
    );
};

export default Register;
