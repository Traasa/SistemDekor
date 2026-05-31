import { router } from '@inertiajs/react';
import axios from 'axios';
import React, { useState } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';

interface VendorClient {
    id: number;
    name: string;
    company_name?: string | null;
    email?: string | null;
    phone: string;
    address?: string | null;
}

interface PaymentProof {
    id: number;
    amount: number;
    payment_type: string;
    proof_image_url: string | null;
    status: string;
    verified_by: string | null;
    verified_at: string | null;
    admin_notes: string | null;
    created_at: string;
}


interface Props {
    order: {
        id: number;
        order_number: string;
        order_code: string;
        vendor_client: VendorClient;
        event_name: string;
        event_type: string;
        event_date: string;
        event_date_formatted: string;
        event_address: string;
        event_location: string;
        total_price: number;
        discount: number;
        final_price: number;
        dp_amount: number;
        total_paid: number;
        remaining_amount: number;
        status: string;
        payment_status: string;
        notes: string | null;
        custom_items: Array<any>;
        additional_costs: number;
        negotiation_notes: string | null;
        is_negotiable: boolean;
        negotiated_at: string | null;
        payment_proofs: PaymentProof[];
        payment_link_active: boolean;
        payment_link_expires_at: string | null;
        images?: Array<{ id: number; image_url: string }>;
        created_at: string;
        updated_at: string;
    };
}

const MiniOrderDetailPage: React.FC<Props> = ({ order }) => {
    const [generatingLink, setGeneratingLink] = useState(false);
    const [dpAmount, setDpAmount] = useState('');
    const [currentLink, setCurrentLink] = useState<string | null>(null);
    const [linkExpiresAt, setLinkExpiresAt] = useState<string | null>(null);
    const [linkPaymentType, setLinkPaymentType] = useState<string | null>(null);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [verifyingProof, setVerifyingProof] = useState<number | null>(null);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);

    const generatePaymentLink = async (paymentType: 'dp' | 'full', amount?: number) => {
        setGeneratingLink(true);
        try {
            const payload: any = { payment_type: paymentType };
            if (paymentType === 'dp' && amount) {
                payload.payment_amount = amount;
            }
            const response = await axios.post(`/admin/mini-orders/${order.id}/generate-payment-link`, payload);
            if (response.data.success) {
                const link = response.data.link;
                setCurrentLink(link);
                setLinkExpiresAt(response.data.expires_at || null);
                setLinkPaymentType(response.data.payment_type || paymentType);
                setShowLinkModal(true);
                // keep the page state; user can view persistent link below
            }
        } catch (error: any) {
            alert('Gagal generate payment link: ' + (error.response?.data?.message || error.message));
        } finally {
            setGeneratingLink(false);
        }
    };

    const verifyPaymentProof = async (proofId: number) => {
        if (!confirm('Verifikasi bukti pembayaran ini?')) return;
        setVerifyingProof(proofId);
        try {
            await axios.post(`/api/mini-payment-proofs/${proofId}/verify`);
            router.reload();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Gagal verifikasi pembayaran');
        } finally {
            setVerifyingProof(null);
        }
    };

    const rejectPaymentProof = async (proofId: number) => {
        const reason = prompt('Alasan penolakan:');
        if (!reason) return;
        setVerifyingProof(proofId);
        try {
            await axios.post(`/api/mini-payment-proofs/${proofId}/reject`, { admin_notes: reason });
            router.reload();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Gagal menolak pembayaran');
        } finally {
            setVerifyingProof(null);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <button onClick={() => router.visit('/admin/mini-orders')} className="mb-2 flex items-center text-gray-600 hover:text-gray-900">
                            ← Kembali ke Mini Order
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">Detail Mini Order: {order.order_code}</h1>
                        <p className="mt-1 text-sm text-gray-600">Dibuat: {order.created_at}</p>
                    </div>
                    <div className="flex gap-3">
                        {order.is_negotiable && (
                            <button
                                onClick={() => router.visit(`/admin/mini-orders/${order.id}/edit`)}
                                className="flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-600"
                            >
                                <span>✏️</span>
                                <span>Edit Mini Order</span>
                            </button>
                        )}
                        <button
                            onClick={() => window.open(`/admin/mini-orders/${order.id}/invoice`, '_blank')}
                            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                        >
                            <span>⬇️</span>
                            <span>Invoice</span>
                        </button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-bold text-gray-900">Vendor Client</h2>
                            <div className="space-y-2 text-sm text-gray-700">
                                <div><span className="font-semibold">Nama:</span> {order.vendor_client.name}</div>
                                {order.vendor_client.company_name && (
                                    <div><span className="font-semibold">Perusahaan:</span> {order.vendor_client.company_name}</div>
                                )}
                                <div><span className="font-semibold">Telepon:</span> {order.vendor_client.phone}</div>
                                {order.vendor_client.email && (
                                    <div><span className="font-semibold">Email:</span> {order.vendor_client.email}</div>
                                )}
                                <div><span className="font-semibold">Alamat:</span> {order.vendor_client.address || '-'}</div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-bold text-gray-900">Detail Layanan</h2>
                            <div className="grid gap-3 text-sm text-gray-700">
                                <div><span className="font-semibold">Nama:</span> {order.event_name}</div>
                                <div><span className="font-semibold">Tipe:</span> {order.event_type}</div>
                                <div><span className="font-semibold">Tanggal:</span> {order.event_date_formatted}</div>
                                <div><span className="font-semibold">Lokasi:</span> {order.event_location}</div>
                                <div><span className="font-semibold">Alamat:</span> {order.event_address}</div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-bold text-gray-900">Rincian Item</h2>
                            {order.custom_items.length === 0 ? (
                                <div className="text-sm text-gray-500">Belum ada item detail.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="pb-2 text-left text-sm font-semibold text-gray-700">Item</th>
                                                <th className="pb-2 text-center text-sm font-semibold text-gray-700">Qty</th>
                                                <th className="pb-2 text-right text-sm font-semibold text-gray-700">Harga</th>
                                                <th className="pb-2 text-right text-sm font-semibold text-gray-700">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.custom_items.map((item, index) => (
                                                <tr key={index} className="border-b">
                                                    <td className="py-3 text-gray-900">{item.item_name || item.name}</td>
                                                    <td className="py-3 text-center text-gray-900">{item.quantity}</td>
                                                    <td className="py-3 text-right text-gray-900">{formatCurrency(Number(item.cost || item.price || 0))}</td>
                                                    <td className="py-3 text-right font-semibold text-gray-900">{formatCurrency(Number(item.subtotal || 0))}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-bold text-gray-900">Referensi Gambar</h2>
                            {order.images && order.images.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                    {order.images.map((image) => (
                                        <a key={image.id} href={image.image_url} target="_blank" rel="noreferrer" className="overflow-hidden rounded-lg border">
                                            <img src={image.image_url} alt="Referensi" className="h-32 w-full object-cover" />
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500">Belum ada gambar referensi.</div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-bold text-gray-900">Ringkasan Pembayaran</h2>
                            <div className="space-y-2 text-sm text-gray-700">
                                <div className="flex items-center justify-between">
                                    <span>Total Harga</span>
                                    <span className="font-semibold">{formatCurrency(order.total_price)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Diskon</span>
                                    <span className="font-semibold text-red-600">-{formatCurrency(order.discount)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Total Final</span>
                                    <span className="font-semibold">{formatCurrency(order.final_price)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Sudah Dibayar</span>
                                    <span className="font-semibold text-green-600">{formatCurrency(order.total_paid)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Sisa Tagihan</span>
                                    <span className="font-semibold text-orange-600">{formatCurrency(order.remaining_amount)}</span>
                                </div>
                            </div>
                        </div>

                        {!order.is_negotiable && !order.payment_link_active && (
                            <div className="rounded-xl bg-white p-6 shadow-sm">
                                <h2 className="mb-4 text-lg font-bold text-gray-900">Generate Payment Link</h2>
                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <input
                                            type="number"
                                            min="0"
                                            value={dpAmount}
                                            onChange={(e) => setDpAmount(e.target.value)}
                                            placeholder="Nominal DP (opsional)"
                                            className="w-full rounded-lg border border-indigo-200 px-3 py-2 text-sm"
                                        />
                                        <button
                                            onClick={() => generatePaymentLink('dp', Number(dpAmount || 0))}
                                            disabled={generatingLink}
                                            className="w-full rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600 disabled:bg-gray-400"
                                        >
                                            {generatingLink ? 'Generating...' : '🔗 Generate DP Link'}
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => generatePaymentLink('full')}
                                        disabled={generatingLink}
                                        className="w-full rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:bg-gray-400"
                                    >
                                        {generatingLink ? 'Generating...' : '🔗 Generate Pelunasan Link'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Persistent payment link display */}
                        {(order.payment_link_active || currentLink) && (
                            <div className="rounded-xl bg-white p-6 shadow-sm">
                                <h2 className="mb-4 text-lg font-bold text-gray-900">Payment Link</h2>
                                <div className="space-y-2 text-sm">
                                    <div className="break-words text-blue-600">{currentLink || (order.payment_link_active ? `${window.location.origin}/mini-payment/${(order as any).payment_link_token}` : '')}</div>
                                    {linkExpiresAt || order.payment_link_expires_at ? (
                                        <div className="text-xs text-gray-500">Expires: {linkExpiresAt || order.payment_link_expires_at}</div>
                                    ) : null}
                                    <div className="flex gap-2">
                                        <a href={currentLink || (order.payment_link_active ? `${window.location.origin}/mini-payment/${(order as any).payment_link_token}` : '#')} target="_blank" rel="noreferrer" className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white">Open Link</a>
                                        <button
                                            onClick={() => {
                                                const linkText = currentLink || (order.payment_link_active ? `${window.location.origin}/mini-payment/${(order as any).payment_link_token}` : '');
                                                navigator.clipboard.writeText(linkText);
                                                alert('Link copied to clipboard');
                                            }}
                                            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold"
                                        >
                                            Copy Link
                                        </button>
                                        <button onClick={() => setShowLinkModal(true)} className="rounded-lg bg-white border px-4 py-2 text-sm">View</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-bold text-gray-900">Riwayat Pembayaran</h2>
                            {order.payment_proofs.length === 0 ? (
                                <div className="text-sm text-gray-500">Belum ada pembayaran tercatat.</div>
                            ) : (
                                <div className="space-y-3">
                                    {order.payment_proofs.map((proof) => (
                                        <div key={proof.id} className="rounded-lg border border-gray-200 p-3 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold">{proof.payment_type.toUpperCase()}</span>
                                                <span className={proof.status === 'verified' ? 'text-green-600' : proof.status === 'rejected' ? 'text-red-600' : 'text-orange-600'}>
                                                    {proof.status}
                                                </span>
                                            </div>
                                            <div className="text-gray-600">{formatCurrency(Number(proof.amount))}</div>
                                            {proof.proof_image_url && (
                                                <a className="text-blue-600" href={proof.proof_image_url} target="_blank" rel="noreferrer">
                                                    Lihat Bukti
                                                </a>
                                            )}
                                            {proof.status === 'pending' && (
                                                <div className="mt-3 flex gap-2">
                                                    <button
                                                        onClick={() => verifyPaymentProof(proof.id)}
                                                        disabled={verifyingProof === proof.id}
                                                        className="flex-1 rounded-lg bg-green-500 px-3 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:bg-gray-400"
                                                    >
                                                        Verifikasi
                                                    </button>
                                                    <button
                                                        onClick={() => rejectPaymentProof(proof.id)}
                                                        disabled={verifyingProof === proof.id}
                                                        className="flex-1 rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:bg-gray-400"
                                                    >
                                                        Tolak
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* Link modal */}
                {showLinkModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <div className="w-full max-w-lg rounded-lg bg-white p-6">
                            <h3 className="mb-2 text-lg font-bold">Payment Link</h3>
                            <p className="mb-4 text-sm text-gray-700">{linkPaymentType ? `Type: ${linkPaymentType.toUpperCase()}` : ''}</p>
                            <div className="mb-4 break-words text-blue-600">{currentLink || (order.payment_link_active ? `${window.location.origin}/mini-payment/${(order as any).payment_link_token}` : '')}</div>
                            {linkExpiresAt || order.payment_link_expires_at ? (
                                <div className="mb-4 text-xs text-gray-500">Expires: {linkExpiresAt || order.payment_link_expires_at}</div>
                            ) : null}
                            <div className="flex justify-end gap-2">
                                <button onClick={() => { navigator.clipboard.writeText(currentLink || (order.payment_link_active ? `${window.location.origin}/mini-payment/${(order as any).payment_link_token}` : '')); alert('Link copied'); }} className="rounded-lg bg-gray-200 px-4 py-2 text-sm">Copy</button>
                                <a href={currentLink || (order.payment_link_active ? `${window.location.origin}/mini-payment/${(order as any).payment_link_token}` : '#')} target="_blank" rel="noreferrer" className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white">Open</a>
                                <button onClick={() => setShowLinkModal(false)} className="rounded-lg bg-white border px-4 py-2 text-sm">Close</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default MiniOrderDetailPage;
