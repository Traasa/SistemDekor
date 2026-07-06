import { Head } from '@inertiajs/react';
import axios from 'axios';
import { Building2, Upload, FileImage, Receipt, DollarSign, CheckCircle, AlertCircle, Copy, Check, Info } from 'lucide-react';
import { formatRupiah } from '../utils/formatRupiah';
import React, { useEffect, useMemo, useState } from 'react';
import { PublicLayout } from '../layouts/PublicLayout';

interface Order {
    id: number;
    order_number: string;
    client_name: string;
    client_email: string;
    event_name: string;
    event_date: string;
    package_name: string;
    total_price: number;
    final_price: number;
    dp_amount: number;
    remaining_amount?: number;
    payment_link_type?: 'dp' | 'installment' | 'full';
    payment_link_amount?: number;
}

interface Props {
    order: Order;
    token: string;
    upload_url: string;
}

export default function PaymentPage({ order, token, upload_url }: Props) {
    const [amount, setAmount] = useState<string>('');
    const paymentType = (order.payment_link_type || 'dp') as 'dp' | 'installment' | 'full';
    const [proofImage, setProofImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    const handleCopyRekening = () => {
        navigator.clipboard.writeText('7180191890');
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrorMessage('File size must be less than 5MB');
                return;
            }

            // Validate file type
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
            if (!validTypes.includes(file.type)) {
                setErrorMessage('Only JPG, PNG, and PDF files are allowed');
                return;
            }

            setProofImage(file);
            setErrorMessage('');

            // Create preview for images
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewUrl(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                setPreviewUrl('');
            }
        }
    };

    const remaining = order.remaining_amount ?? order.final_price;
    const expectedAmount = useMemo(() => {
        if (paymentType === 'dp') return order.dp_amount || 0;
        if (paymentType === 'full') return remaining;
        if (paymentType === 'installment') return order.payment_link_amount || remaining;
        return 0;
    }, [paymentType, order.dp_amount, order.payment_link_amount, remaining]);
    const isFixedAmount = (paymentType !== 'installment' && expectedAmount > 0) || (paymentType === 'installment' && (order.payment_link_amount || 0) > 0);
    const isAmountMissing = (paymentType !== 'installment' && expectedAmount <= 0) || (paymentType === 'installment' && (order.payment_link_amount || 0) <= 0);

    const paymentTypeLabel = useMemo(() => {
        if (paymentType === 'dp') return 'DP (Down Payment)';
        if (paymentType === 'installment') return 'Cicilan';
        return 'Pelunasan';
    }, [paymentType]);

    useEffect(() => {
        if (paymentType === 'dp' && order.dp_amount > 0) {
            setAmount(order.dp_amount.toString());
            return;
        }
        if (paymentType === 'installment' && (order.payment_link_amount || 0) > 0) {
            setAmount(String(order.payment_link_amount));
            return;
        }
        if (paymentType === 'full') {
            setAmount(remaining.toString());
        }
    }, [paymentType, order.dp_amount, order.payment_link_amount, remaining]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        // Validation
        if (isAmountMissing) {
            setErrorMessage('Nominal pembayaran belum ditentukan admin. Silakan hubungi admin.');
            return;
        }

        if (!amount || parseFloat(amount) <= 0) {
            setErrorMessage('Please enter a valid payment amount');
            return;
        }

        if (!proofImage) {
            setErrorMessage('Please upload payment proof image');
            return;
        }

        // Validate amount based on payment type
        if (paymentType === 'full' && Math.abs(parseFloat(amount) - remaining) > 0.01) {
            setErrorMessage(`Full payment must be exactly ${formatRupiah(remaining)}`);
            return;
        }

        if (paymentType === 'dp' && expectedAmount > 0 && Math.abs(parseFloat(amount) - expectedAmount) > 0.01) {
            setErrorMessage(`DP harus sesuai nominal ${formatRupiah(expectedAmount)}`);
            return;
        }

        if ((paymentType === 'dp' || paymentType === 'installment') && parseFloat(amount) > remaining) {
            setErrorMessage('Nominal pembayaran tidak boleh melebihi sisa tagihan');
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('amount', amount);
            formData.append('payment_type', paymentType);
            formData.append('proof_image', proofImage);

            const response = await axios.post(upload_url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setSuccessMessage(response.data.message);

            // Clear form
            setAmount('');
            setProofImage(null);
            setPreviewUrl('');
        } catch (error: any) {
            setErrorMessage(error.response?.data?.message || 'Failed to upload payment proof');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PublicLayout wrapperClassName="min-h-screen bg-[#F6F1EA] text-[#2A2420]">
            <Head title="Upload Payment Proof" />

            <main className="w-full px-4 py-12 font-sans sm:px-8 2xl:px-16">
                <div className="mx-auto max-w-3xl">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="mb-2 text-4xl font-bold text-[#8A4E3A]">
                            Upload Payment Proof
                        </h1>
                        <p className="text-gray-600">Complete your order payment</p>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                        <div className="mb-6 flex items-start space-x-3 rounded-lg border border-green-200 bg-green-50 p-4">
                            <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
                            <div>
                                <h3 className="mb-1 font-semibold text-green-900">Payment Uploaded Successfully!</h3>
                                <p className="text-green-700">{successMessage}</p>
                                <p className="mt-2 text-sm text-green-600">You can close this page now.</p>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {errorMessage && (
                        <div className="mb-6 flex items-start space-x-3 rounded-lg border border-red-200 bg-red-50 p-4">
                            <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                            <div>
                                <h3 className="mb-1 font-semibold text-red-900">Error</h3>
                                <p className="text-red-700">{errorMessage}</p>
                            </div>
                        </div>
                    )}

                    {!successMessage && (
                        <>
                            {/* Order Details Card */}
                            <div className="mb-6 rounded-2xl border border-[#E8EEF5] bg-white p-6 shadow-sm">
                                <h2 className="mb-4 text-xl font-bold text-gray-900">Order Details</h2>

                                <div className="space-y-3">
                                    <div className="flex justify-between border-b border-gray-100 py-2">
                                        <span className="text-gray-600">Order Number</span>
                                        <span className="font-semibold text-gray-900">{order.order_number}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-100 py-2">
                                        <span className="text-gray-600">Client Name</span>
                                        <span className="font-semibold text-gray-900">{order.client_name}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-100 py-2">
                                        <span className="text-gray-600">Event Name</span>
                                        <span className="font-semibold text-gray-900">{order.event_name}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-100 py-2">
                                        <span className="text-gray-600">Event Date</span>
                                        <span className="font-semibold text-gray-900">{order.event_date}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-100 py-2">
                                        <span className="text-gray-600">Package</span>
                                        <span className="font-semibold text-gray-900">{order.package_name}</span>
                                    </div>
                                    <div className="-mx-6 mt-4 flex justify-between rounded-lg px-6 py-3">
                                        <span className="font-semibold text-[#2A2420]">Total Amount</span>
                                        <span className="text-xl font-bold text-[#8A4E3A]">{formatRupiah(order.final_price)}</span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="text-gray-600">Payment Type</span>
                                        <span className="text-gray-900">{paymentTypeLabel}</span>
                                    </div>
                                    {(paymentType === 'dp' || paymentType === 'full' || paymentType === 'installment') && (
                                        <div className="flex justify-between py-2">
                                            <span className="text-gray-600">
                                                {paymentType === 'dp'
                                                    ? 'DP Disepakati'
                                                    : paymentType === 'full'
                                                        ? 'Nominal Pelunasan'
                                                        : 'Sisa Tagihan'}
                                            </span>
                                            <span className="text-xl font-bold text-[#8A4E3A]">
                                                {expectedAmount > 0 ? formatRupiah(expectedAmount) : 'Menunggu admin'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment Instructions & Bank Details */}
                            <div className="mb-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-lg">
                                <div className="flex items-center space-x-2 mb-4">
                                    <Receipt className="h-6 w-6 text-blue-600" />
                                    <h2 className="text-xl font-bold text-gray-900">Tata Cara Pembayaran</h2>
                                </div>

                                <div className="rounded-xl bg-blue-50 p-5 mb-5 border border-blue-100">
                                    <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                                        <Building2 className="w-4 h-4 mr-2" /> Transfer Bank
                                    </h3>
                                    <div className="space-y-2 text-gray-700 ml-6">
                                        <div className="grid grid-cols-[100px_10px_1fr]">
                                            <span className="font-medium">Bank</span>
                                            <span>:</span>
                                            <span className="font-bold text-gray-900">BCA</span>
                                        </div>
                                        <div className="grid grid-cols-[100px_10px_1fr] items-center">
                                            <span className="font-medium">No. Rekening</span>
                                            <span>:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-900 text-lg">7180 1918 90</span>
                                                <button
                                                    type="button"
                                                    onClick={handleCopyRekening}
                                                    className="inline-flex items-center rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8A4E3A] transition-colors"
                                                    title="Salin No. Rekening"
                                                >
                                                    {isCopied ? (
                                                        <Check className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <Copy className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-[100px_10px_1fr]">
                                            <span className="font-medium">Atas Nama</span>
                                            <span>:</span>
                                            <span className="font-bold text-gray-900">SUSILOWATI</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="font-semibold text-gray-800">Langkah-langkah:</h3>
                                    <ol className="list-decimal list-inside text-gray-600 space-y-2 ml-2">
                                        <li>Lakukan transfer sesuai dengan nominal yang tertera pada <span className="font-semibold text-gray-800">Payment Amount</span> ke rekening di atas.</li>
                                        <li>Pastikan nominal transfer sesuai atau pas.</li>
                                        <li>Simpan bukti transfer / struk pembayaran.</li>
                                        <li>Unggah (upload) bukti pembayaran pada form di bawah ini.</li>
                                        <li>Tunggu konfirmasi dari admin (proses verifikasi maksimal 1x24 jam).</li>
                                    </ol>
                                </div>

                                <div className="mt-4 flex items-start space-x-2 rounded-lg bg-amber-50 p-3 border border-amber-100 text-amber-800 text-sm">
                                    <Info className="h-5 w-5 mt-0.5 flex-shrink-0 text-amber-600" />
                                    <p>Mohon untuk tidak melakukan transfer selain ke nomor rekening di atas. Kami tidak bertanggung jawab atas kesalahan transfer.</p>
                                </div>
                            </div>

                            {/* Payment Form */}
                            <form onSubmit={handleSubmit} className="rounded-2xl border border-[#E8EEF5] bg-white p-6 shadow-sm">
                                <h2 className="mb-6 text-xl font-bold text-gray-900">Payment Information</h2>

                                {/* Payment Type */}
                                <div className="mb-6">
                                    <label className="mb-3 block font-semibold text-gray-700">Payment Type</label>
                                    <div className="rounded-xl border border-[#8A4E3A] bg-[#F6F1EA] p-4">
                                        <div className="flex items-center justify-center space-x-2 text-gray-900">
                                            <DollarSign className="h-5 w-5" />
                                            <span className="font-semibold">{paymentTypeLabel}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Amount Input */}
                                <div className="mb-6">
                                    <label htmlFor="amount" className="mb-2 block font-semibold text-gray-700">
                                        Payment Amount (Rp)
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        id="amount"
                                        value={amount ? Number(amount).toLocaleString('id-ID') : ''}
                                        onChange={(e) => {
                                            const rawValue = e.target.value.replace(/\D/g, '');
                                            setAmount(rawValue);
                                        }}
                                        readOnly={isFixedAmount}
                                        disabled={isFixedAmount}
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-[#8A4E3A]"
                                        placeholder="Enter payment amount"
                                        required
                                    />
                                    {paymentType === 'dp' && order.dp_amount > 0 && (
                                        <p className="mt-2 text-sm text-gray-500">Nominal DP: {formatRupiah(order.dp_amount)}</p>
                                    )}
                                    {paymentType === 'installment' && (
                                        <p className="mt-2 text-sm text-gray-500">
                                            Nominal cicilan: {formatRupiah(expectedAmount)}
                                        </p>
                                    )}
                                    {paymentType === 'full' && (
                                        <p className="mt-2 text-sm text-gray-500">Wajib sama dengan: {formatRupiah(remaining)}</p>
                                    )}
                                </div>

                                {/* File Upload */}
                                <div className="mb-6">
                                    <label className="mb-2 block font-semibold text-gray-700">Upload Payment Proof</label>
                                    <div className="rounded-xl border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-[#8A4E3A]">
                                        <input
                                            type="file"
                                            id="proof_image"
                                            onChange={handleImageChange}
                                            className="hidden"
                                            accept="image/jpeg,image/png,image/jpg,application/pdf"
                                        />
                                        <label htmlFor="proof_image" className="cursor-pointer">
                                            {previewUrl ? (
                                                <div>
                                                    <img src={previewUrl} alt="Preview" className="mx-auto mb-3 max-h-64 rounded-lg" />
                                                    <p className="text-sm text-gray-600">Click to change image</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <Upload className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                                                    <p className="mb-1 text-gray-600">Click to upload or drag and drop</p>
                                                    <p className="text-sm text-gray-500">JPG, PNG or PDF (max 5MB)</p>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                    {proofImage && (
                                        <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600">
                                            <FileImage className="h-4 w-4" />
                                            <span>{proofImage.name}</span>
                                            <span className="text-gray-400">({(proofImage.size / 1024 / 1024).toFixed(2)} MB)</span>
                                        </div>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting || isAmountMissing}
                                    className={`w-full rounded-xl py-4 font-semibold transition-all ${isSubmitting || isAmountMissing
                                        ? 'cursor-not-allowed bg-gray-400 text-gray-700'
                                        : 'bg-[#8A4E3A] text-white hover:bg-[#6C3C2B] hover:shadow-lg'
                                        }`}
                                >
                                    {isSubmitting ? 'Uploading...' : 'Upload Payment Proof'}
                                </button>
                            </form>

                            {/* Info Card */}
                            <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
                                <div className="flex items-start space-x-3">
                                    <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600" />
                                    <div className="text-sm text-blue-800">
                                        <p className="mb-1 font-semibold">Important Notes:</p>
                                        <ul className="list-inside list-disc space-y-1">
                                            <li>Make sure the payment proof is clear and readable</li>
                                            <li>Admin will verify your payment within 1-2 business days</li>
                                            <li>You will receive a confirmation once payment is verified</li>
                                            <li>This payment link will expire after successful upload</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </PublicLayout>
    );
}
