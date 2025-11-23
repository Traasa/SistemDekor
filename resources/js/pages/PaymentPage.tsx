import { Head } from '@inertiajs/react';
import axios from 'axios';
import { AlertCircle, CheckCircle, DollarSign, FileImage, Upload } from 'lucide-react';
import React, { useState } from 'react';

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
}

interface Props {
    order: Order;
    token: string;
}

export default function PaymentPage({ order, token }: Props) {
    const [amount, setAmount] = useState<string>('');
    const [paymentType, setPaymentType] = useState<'dp' | 'full'>('dp');
    const [proofImage, setProofImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        // Validation
        if (!amount || parseFloat(amount) <= 0) {
            setErrorMessage('Please enter a valid payment amount');
            return;
        }

        if (!proofImage) {
            setErrorMessage('Please upload payment proof image');
            return;
        }

        // Validate amount based on payment type
        if (paymentType === 'full' && parseFloat(amount) !== order.final_price) {
            setErrorMessage(`Full payment must be exactly Rp ${order.final_price.toLocaleString('id-ID')}`);
            return;
        }

        if (paymentType === 'dp' && parseFloat(amount) > order.final_price) {
            setErrorMessage('DP amount cannot exceed total order amount');
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('amount', amount);
            formData.append('payment_type', paymentType);
            formData.append('proof_image', proofImage);

            const response = await axios.post(`/payment/${token}`, formData, {
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
        <>
            <Head title="Upload Payment Proof" />

            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 px-4 py-12 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-4xl font-bold text-transparent">
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
                            <div className="mb-6 rounded-2xl border border-purple-100 bg-white p-6 shadow-lg">
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
                                    <div className="-mx-6 mt-4 flex justify-between rounded-lg bg-purple-50 px-6 py-3">
                                        <span className="font-semibold text-gray-700">Total Amount</span>
                                        <span className="text-xl font-bold text-purple-600">Rp {order.final_price.toLocaleString('id-ID')}</span>
                                    </div>
                                    {order.dp_amount > 0 && (
                                        <div className="flex justify-between py-2">
                                            <span className="text-gray-600">Suggested DP (30%)</span>
                                            <span className="text-gray-900">Rp {order.dp_amount.toLocaleString('id-ID')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment Form */}
                            <form onSubmit={handleSubmit} className="rounded-2xl border border-purple-100 bg-white p-6 shadow-lg">
                                <h2 className="mb-6 text-xl font-bold text-gray-900">Payment Information</h2>

                                {/* Payment Type */}
                                <div className="mb-6">
                                    <label className="mb-3 block font-semibold text-gray-700">Payment Type</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPaymentType('dp');
                                                setAmount(order.dp_amount.toString());
                                            }}
                                            className={`rounded-xl border-2 p-4 transition-all ${
                                                paymentType === 'dp' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-center space-x-2">
                                                <DollarSign className="h-5 w-5" />
                                                <span className="font-semibold">DP (Down Payment)</span>
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPaymentType('full');
                                                setAmount(order.final_price.toString());
                                            }}
                                            className={`rounded-xl border-2 p-4 transition-all ${
                                                paymentType === 'full' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-center space-x-2">
                                                <CheckCircle className="h-5 w-5" />
                                                <span className="font-semibold">Full Payment</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Amount Input */}
                                <div className="mb-6">
                                    <label htmlFor="amount" className="mb-2 block font-semibold text-gray-700">
                                        Payment Amount (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        id="amount"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                                        placeholder="Enter payment amount"
                                        min="0"
                                        step="1000"
                                        required
                                    />
                                    {paymentType === 'dp' && order.dp_amount > 0 && (
                                        <p className="mt-2 text-sm text-gray-500">Suggested DP: Rp {order.dp_amount.toLocaleString('id-ID')}</p>
                                    )}
                                    {paymentType === 'full' && (
                                        <p className="mt-2 text-sm text-gray-500">Must be exactly: Rp {order.final_price.toLocaleString('id-ID')}</p>
                                    )}
                                </div>

                                {/* File Upload */}
                                <div className="mb-6">
                                    <label className="mb-2 block font-semibold text-gray-700">Upload Payment Proof</label>
                                    <div className="rounded-xl border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-purple-400">
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
                                    disabled={isSubmitting}
                                    className={`w-full rounded-xl py-4 font-semibold text-white transition-all ${
                                        isSubmitting
                                            ? 'cursor-not-allowed bg-gray-400'
                                            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-[1.02] hover:shadow-lg'
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
            </div>
        </>
    );
}
