import { Head, Link, useForm } from '@inertiajs/react';
import React, { FormEventHandler } from 'react';
import { AuthShell } from '../../components/site/AuthShell';

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
        <>
            <Head title="Lupa Password" />
            <AuthShell title="Reset Password" subtitle="Masukkan email untuk menerima tautan reset password.">
                {status && <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{status}</div>}

                <form onSubmit={submit} className="space-y-4">
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

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#EC4899] py-3 font-semibold text-white disabled:opacity-60"
                    >
                        {processing ? 'Mengirim...' : 'Kirim Link Reset'}
                    </button>
                </form>

                <p className="mt-5 text-sm text-slate-600">
                    <Link href="/login" className="font-semibold text-[#B88321] hover:underline">
                        Kembali ke halaman login
                    </Link>
                </p>
            </AuthShell>
        </>
    );
};

export default ForgotPassword;
