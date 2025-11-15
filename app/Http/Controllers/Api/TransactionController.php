<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Barryvdh\DomPDF\Facade\Pdf;

class TransactionController extends Controller
{
    /**
     * Display a listing of transactions
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Transaction::with('user');

        // If user is not admin, only show their transactions
        if (!$user->isAdmin()) {
            $query->forUser($user->id);
        }

        // Filter by status if provided
        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('transaction_number', 'like', "%{$search}%")
                  ->orWhere('client_name', 'like', "%{$search}%")
                  ->orWhere('service_detail', 'like', "%{$search}%");
            });
        }

        $transactions = $query->orderBy('created_at', 'desc')
                             ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $transactions,
        ]);
    }

    /**
     * Store a newly created transaction (Admin only)
     */
    public function store(Request $request): JsonResponse
    {
        // Only admin can create transactions
        if (!$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admin can create transactions.'
            ], 403);
        }

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'client_name' => 'required|string|max:255',
            'service_detail' => 'required|string',
            'transaction_date' => 'required|date',
            'total_price' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $transaction = Transaction::create([
            'transaction_number' => Transaction::generateTransactionNumber(),
            'user_id' => $request->user_id,
            'client_name' => $request->client_name,
            'service_detail' => $request->service_detail,
            'transaction_date' => $request->transaction_date,
            'status' => 'pending',
            'total_price' => $request->total_price,
            'notes' => $request->notes,
        ]);

        $transaction->load('user');

        return response()->json([
            'success' => true,
            'data' => $transaction,
            'message' => 'Transaction created successfully'
        ], 201);
    }

    /**
     * Display the specified transaction
     */
    public function show(Request $request, Transaction $transaction): JsonResponse
    {
        $user = $request->user();

        // Check if user can view this transaction
        if (!$user->isAdmin() && $transaction->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to view this transaction'
            ], 403);
        }

        $transaction->load('user');

        return response()->json([
            'success' => true,
            'data' => $transaction,
        ]);
    }

    /**
     * Update the specified transaction (Admin only)
     */
    public function update(Request $request, Transaction $transaction): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admin can update transactions.'
            ], 403);
        }

        $request->validate([
            'user_id' => 'sometimes|exists:users,id',
            'client_name' => 'sometimes|string|max:255',
            'service_detail' => 'sometimes|string',
            'transaction_date' => 'sometimes|date',
            'status' => 'sometimes|in:pending,selesai,dibatalkan',
            'total_price' => 'sometimes|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $transaction->update($request->only([
            'user_id', 'client_name', 'service_detail', 
            'transaction_date', 'status', 'total_price', 'notes'
        ]));

        $transaction->load('user');

        return response()->json([
            'success' => true,
            'data' => $transaction,
            'message' => 'Transaction updated successfully'
        ]);
    }

    /**
     * Remove the specified transaction (Admin only)
     */
    public function destroy(Request $request, Transaction $transaction): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admin can delete transactions.'
            ], 403);
        }

        $transaction->delete();

        return response()->json([
            'success' => true,
            'message' => 'Transaction deleted successfully'
        ]);
    }

    /**
     * Get users for transaction assignment (Admin only)
     */
    public function getUsers(Request $request): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $users = User::where('role', 'user')
                    ->select('id', 'name', 'email')
                    ->get();

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    /**
     * Export transaction to PDF
     */
    public function exportPdf(Request $request, Transaction $transaction)
    {
        $user = $request->user();

        // Check if user can view this transaction
        if (!$user->isAdmin() && $transaction->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to export this transaction'
            ], 403);
        }

        $transaction->load('user');
        
        $pdf = Pdf::loadView('pdf.transaction', compact('transaction'));
        
        return $pdf->download('transaction-' . $transaction->transaction_number . '.pdf');
    }
}
