<?php

namespace App\Http\Controllers;

use App\Models\PaymentTransaction;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentTransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = PaymentTransaction::with(['order.client'])
            ->latest();

        if ($request->has('status') && $request->status != '') {
            $query->where('status', $request->status);
        }

        if ($request->has('payment_type') && $request->payment_type != '') {
            $query->where('payment_type', $request->payment_type);
        }

        $transactions = $query->paginate(15);

        return Inertia::render('Dashboard/PaymentTransactions/Index', [
            'transactions' => $transactions,
            'filters' => $request->only(['status', 'payment_type']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $orderId = $request->query('order_id');
        $order = null;

        if ($orderId) {
            $order = Order::with('client')->findOrFail($orderId);
        }

        return Inertia::render('Dashboard/PaymentTransactions/Create', [
            'order' => $order,
            'orders' => Order::with('client')->latest()->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'amount' => 'required|numeric|min:0',
            'payment_type' => 'required|in:DP,Pelunasan',
            'payment_date' => 'required|date',
            'status' => 'required|in:pending,verified',
            'proof_url' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $transaction = PaymentTransaction::create($validated);

        return redirect()->route('orders.show', $transaction->order_id)
            ->with('success', 'Transaksi pembayaran berhasil ditambahkan!');
    }

    /**
     * Display the specified resource.
     */
    public function show(PaymentTransaction $paymentTransaction)
    {
        $paymentTransaction->load(['order.client']);

        return Inertia::render('Dashboard/PaymentTransactions/Show', [
            'transaction' => $paymentTransaction,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PaymentTransaction $paymentTransaction)
    {
        $paymentTransaction->load('order.client');

        return Inertia::render('Dashboard/PaymentTransactions/Edit', [
            'transaction' => $paymentTransaction,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PaymentTransaction $paymentTransaction)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_type' => 'required|in:DP,Pelunasan',
            'payment_date' => 'required|date',
            'status' => 'required|in:pending,verified',
            'proof_url' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $paymentTransaction->update($validated);

        return redirect()->route('orders.show', $paymentTransaction->order_id)
            ->with('success', 'Transaksi pembayaran berhasil diupdate!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PaymentTransaction $paymentTransaction)
    {
        $orderId = $paymentTransaction->order_id;
        $paymentTransaction->delete();

        return redirect()->route('orders.show', $orderId)
            ->with('success', 'Transaksi pembayaran berhasil dihapus!');
    }
}
