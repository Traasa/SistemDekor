import { Head } from '@inertiajs/react';
import { AlertCircle, Clock } from 'lucide-react';

interface Props {
    message: string;
}

export default function PaymentExpiredPage({ message }: Props) {
    return (
        <>
            <Head title="Payment Link Expired" />

            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">
                    <div className="rounded-2xl border border-purple-100 bg-white p-8 text-center shadow-xl">
                        <div className="mb-6">
                            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                                <Clock className="h-10 w-10 text-red-600" />
                            </div>
                            <h1 className="mb-2 text-3xl font-bold text-gray-900">Payment Link Expired</h1>
                        </div>

                        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                            <div className="flex items-start space-x-3">
                                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                                <p className="text-left text-red-800">{message}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-gray-600">Please contact our admin team to get a new payment link.</p>

                            <a
                                href="https://wa.me/6281234567890?text=Hello,%20I%20need%20a%20new%20payment%20link%20for%20my%20order"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-6 py-3 font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-lg"
                            >
                                <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                Contact Admin via WhatsApp
                            </a>

                            <a
                                href="/"
                                className="inline-block w-full rounded-xl bg-gray-100 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-200"
                            >
                                Back to Homepage
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
