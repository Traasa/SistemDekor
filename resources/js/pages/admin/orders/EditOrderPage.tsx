import { AdminLayout } from '@/layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface CustomItem {
    name: string;
    price: string;
    quantity: string;
    subtotal: number;
}

interface Package {
    id: number;
    name: string;
    description: string;
    price: number;
}

interface Order {
    id: number;
    order_number: string;
    client_name?: string;
    event_name: string;
    event_type: string;
    event_date: string;
    event_location: string;
    event_address?: string;
    event_theme?: string;
    guest_count?: number;
    package_id?: number;
    custom_items: CustomItem[];
    additional_costs: number;
    discount: number;
    total_price: number;
    final_price: number;
    dp_amount: number;
    remaining_amount: number;
    negotiation_notes?: string;
    is_negotiable: boolean;
}

interface Props {
    order: Order;
    packages: Package[];
}

interface PriceCalculation {
    total_price: number;
    discount: number;
    final_price: number;
    dp_amount: number;
    remaining_amount: number;
}

export default function EditOrderPage({ order, packages }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        event_name: order.event_name || '',
        event_type: order.event_type || '',
        event_date: order.event_date || '',
        event_location: order.event_location || '',
        event_theme: order.event_theme || '',
        guest_count: order.guest_count?.toString() || '0',
        package_id: order.package_id?.toString() || '',
        custom_items: order.custom_items || [],
        additional_costs: order.additional_costs?.toString() || '0',
        discount: order.discount?.toString() || '0',
        negotiation_notes: order.negotiation_notes || '',
    });

    const [customItems, setCustomItems] = useState<CustomItem[]>(order.custom_items || []);
    const [calculation, setCalculation] = useState<PriceCalculation>({
        total_price: order.total_price || 0,
        discount: order.discount || 0,
        final_price: order.final_price || 0,
        dp_amount: order.dp_amount || 0,
        remaining_amount: order.remaining_amount || 0,
    });
    const [isCalculating, setIsCalculating] = useState(false);

    // Recalculate prices whenever relevant data changes
    useEffect(() => {
        const timer = setTimeout(() => {
            recalculatePrices();
        }, 500); // Debounce 500ms

        return () => clearTimeout(timer);
    }, [data.package_id, customItems, data.additional_costs, data.discount]);

    const recalculatePrices = async () => {
        setIsCalculating(true);
        try {
            const response = await axios.post(`/admin/orders/${order.id}/recalculate`, {
                package_id: data.package_id ? parseInt(data.package_id) : null,
                custom_items: customItems,
                additional_costs: parseFloat(data.additional_costs) || 0,
                discount: parseFloat(data.discount) || 0,
            });

            if (response.data) {
                setCalculation(response.data);
            }
        } catch (error) {
            console.error('Failed to recalculate prices:', error);
        } finally {
            setIsCalculating(false);
        }
    };

    const addCustomItem = () => {
        const newItem: CustomItem = {
            name: '',
            price: '0',
            quantity: '1',
            subtotal: 0,
        };
        const updatedItems = [...customItems, newItem];
        setCustomItems(updatedItems);
        setData('custom_items', updatedItems);
    };

    const updateCustomItem = (index: number, field: keyof CustomItem, value: string) => {
        const updatedItems = [...customItems];
        updatedItems[index] = { ...updatedItems[index], [field]: value };

        // Calculate subtotal
        const price = parseFloat(updatedItems[index].price) || 0;
        const quantity = parseFloat(updatedItems[index].quantity) || 0;
        updatedItems[index].subtotal = price * quantity;

        setCustomItems(updatedItems);
        setData('custom_items', updatedItems);
    };

    const removeCustomItem = (index: number) => {
        const updatedItems = customItems.filter((_, i) => i !== index);
        setCustomItems(updatedItems);
        setData('custom_items', updatedItems);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Filter out empty custom items
        const validCustomItems = customItems.filter((item) => item.name && item.price && item.quantity);

        // Update data with valid items before submit
        data.custom_items = validCustomItems;

        put(`/admin/orders/${order.id}`, {
            onSuccess: () => {
                router.visit(`/admin/orders/${order.id}`);
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                alert('Gagal menyimpan order. Periksa input Anda.');
            },
        });
    };

    const selectedPackage = packages.find((pkg) => pkg.id === parseInt(data.package_id || '0'));

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <AdminLayout>
            <Head title={`Edit Order - ${order.order_number}`} />

            <div className="mx-auto max-w-7xl space-y-6 p-6 text-black">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Edit Order</h1>
                        <p className="mt-1 text-gray-600">
                            Order #{order.order_number} - {order.client_name}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.visit(`/admin/orders/${order.id}`)}
                        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 hover:bg-gray-50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Detail
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Event Details Card */}
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-bold">Event Details</h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium">Event Name *</label>
                                <input
                                    type="text"
                                    value={data.event_name}
                                    onChange={(e) => setData('event_name', e.target.value)}
                                    placeholder="e.g., Sarah & John's Wedding"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                                />
                                {errors.event_name && <p className="mt-1 text-sm text-red-600">{errors.event_name}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Event Type *</label>
                                <select
                                    value={data.event_type}
                                    onChange={(e) => setData('event_type', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                                >
                                    <option value="">Select event type</option>
                                    <option value="wedding">Wedding</option>
                                    <option value="birthday">Birthday</option>
                                    <option value="corporate">Corporate Event</option>
                                    <option value="engagement">Engagement</option>
                                    <option value="other">Other</option>
                                </select>
                                {errors.event_type && <p className="mt-1 text-sm text-red-600">{errors.event_type}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Event Date *</label>
                                <input
                                    type="date"
                                    value={data.event_date}
                                    onChange={(e) => setData('event_date', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                                />
                                {errors.event_date && <p className="mt-1 text-sm text-red-600">{errors.event_date}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Location *</label>
                                <input
                                    type="text"
                                    value={data.event_location}
                                    onChange={(e) => setData('event_location', e.target.value)}
                                    placeholder="Event location"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                                />
                                {errors.event_location && <p className="mt-1 text-sm text-red-600">{errors.event_location}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Theme</label>
                                <input
                                    type="text"
                                    value={data.event_theme}
                                    onChange={(e) => setData('event_theme', e.target.value)}
                                    placeholder="e.g., Rustic Garden"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Guest Count</label>
                                <input
                                    type="number"
                                    value={data.guest_count}
                                    onChange={(e) => setData('guest_count', e.target.value)}
                                    placeholder="Number of guests"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Package Selection Card */}
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-bold">Package Selection</h2>
                        <label className="mb-1 block text-sm font-medium">Select Package</label>
                        <select
                            value={data.package_id}
                            onChange={(e) => setData('package_id', e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2"
                        >
                            <option value="">No Package</option>
                            {packages.map((pkg) => (
                                <option key={pkg.id} value={pkg.id.toString()}>
                                    {pkg.name} - {formatCurrency(pkg.price)}
                                </option>
                            ))}
                        </select>
                        {selectedPackage && (
                            <div className="mt-3 rounded-md bg-gray-50 p-3">
                                <p className="text-sm text-gray-600">{selectedPackage.description}</p>
                                <p className="mt-2 text-sm font-semibold">Price: {formatCurrency(selectedPackage.price)}</p>
                            </div>
                        )}
                    </div>

                    {/* Custom Items Card */}
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold">Custom Items</h2>
                            <button
                                type="button"
                                onClick={addCustomItem}
                                className="flex items-center gap-2 rounded-lg bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
                            >
                                <Plus className="h-4 w-4" />
                                Add Item
                            </button>
                        </div>
                        {customItems.length === 0 ? (
                            <p className="py-4 text-center text-gray-500">No custom items. Click "Add Item" to add custom items.</p>
                        ) : (
                            <div className="space-y-3">
                                {customItems.map((item, index) => (
                                    <div key={index} className="flex items-start gap-3 rounded-md bg-gray-50 p-3">
                                        <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-4">
                                            <div>
                                                <label className="mb-1 block text-xs font-medium">Item Name</label>
                                                <input
                                                    type="text"
                                                    value={item.name}
                                                    onChange={(e) => updateCustomItem(index, 'name', e.target.value)}
                                                    placeholder="Item name"
                                                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs font-medium">Price</label>
                                                <input
                                                    type="number"
                                                    value={item.price}
                                                    onChange={(e) => updateCustomItem(index, 'price', e.target.value)}
                                                    placeholder="0"
                                                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs font-medium">Quantity</label>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => updateCustomItem(index, 'quantity', e.target.value)}
                                                    placeholder="1"
                                                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs font-medium">Subtotal</label>
                                                <input
                                                    type="text"
                                                    value={formatCurrency(item.subtotal)}
                                                    disabled
                                                    className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeCustomItem(index)}
                                            className="mt-6 rounded bg-red-500 p-2 text-white hover:bg-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pricing & Negotiation Card */}
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-bold">Pricing & Negotiation</h2>
                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium">Additional Costs</label>
                                <input
                                    type="number"
                                    value={data.additional_costs}
                                    onChange={(e) => setData('additional_costs', e.target.value)}
                                    placeholder="0"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                                />
                                <p className="mt-1 text-xs text-gray-500">Extra charges (transportation, overtime, etc.)</p>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Discount</label>
                                <input
                                    type="number"
                                    value={data.discount}
                                    onChange={(e) => setData('discount', e.target.value)}
                                    placeholder="0"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                                />
                                <p className="mt-1 text-xs text-gray-500">Discount amount in IDR</p>
                            </div>
                        </div>

                        {/* Price Summary */}
                        <div className="space-y-2 rounded-lg bg-blue-50 p-4">
                            <h4 className="mb-3 font-semibold text-blue-900">Price Summary {isCalculating && '(Calculating...)'}</h4>
                            <div className="flex justify-between text-sm">
                                <span>Total Price:</span>
                                <span className="font-medium">{formatCurrency(calculation.total_price)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-red-600">
                                <span>Discount:</span>
                                <span className="font-medium">- {formatCurrency(calculation.discount)}</span>
                            </div>
                            <div className="flex justify-between border-t border-blue-200 pt-2 text-lg font-bold text-blue-900">
                                <span>Final Price:</span>
                                <span>{formatCurrency(calculation.final_price)}</span>
                            </div>
                            <div className="flex justify-between pt-2 text-sm text-gray-700">
                                <span>Down Payment (30%):</span>
                                <span className="font-medium">{formatCurrency(calculation.dp_amount)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-700">
                                <span>Remaining Amount:</span>
                                <span className="font-medium">{formatCurrency(calculation.remaining_amount)}</span>
                            </div>
                        </div>

                        {/* Negotiation Notes */}
                        <div className="mt-4">
                            <label className="mb-1 block text-sm font-medium">Negotiation Notes</label>
                            <textarea
                                value={data.negotiation_notes}
                                onChange={(e) => setData('negotiation_notes', e.target.value)}
                                placeholder="Add notes about price changes, custom requests, agreements, etc."
                                rows={4}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2"
                            />
                            <p className="mt-1 text-xs text-gray-500">Document all agreements and changes made during negotiation</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => router.visit(`/admin/orders/${order.id}`)}
                            disabled={processing}
                            className="rounded-lg border border-gray-300 bg-white px-6 py-2 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing || isCalculating}
                            className="rounded-lg bg-purple-500 px-6 py-2 text-white hover:bg-purple-600 disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : 'Save & Finalize Order'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
