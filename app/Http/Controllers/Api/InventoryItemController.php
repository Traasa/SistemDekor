<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\InventoryTransaction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class InventoryItemController extends Controller
{
    /**
     * Display a listing of the resource with filters.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = InventoryItem::with('category');

            // Filter by category
            if ($request->has('category_id')) {
                $query->where('category_id', $request->category_id);
            }

            // Filter by status (is_active)
            if ($request->has('status')) {
                $query->where('is_active', $request->status);
            }

            // Search by name or code
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                });
            }

            $items = $query->orderBy('name')->get();

            return response()->json([
                'success' => true,
                'message' => 'Items retrieved successfully',
                'data' => $items
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve items: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'required|exists:inventory_categories,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:100|unique:inventory_items,code',
            'description' => 'nullable|string',
            'unit' => 'required|string|max:50',
            'quantity' => 'required|integer|min:0',
            'minimum_stock' => 'required|integer|min:0',
            'purchase_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'location' => 'nullable|string|max:255',
            'condition' => 'nullable|string|max:100',
            'image_url' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $item = InventoryItem::create($request->all());
            $item->load('category');

            return response()->json([
                'success' => true,
                'message' => 'Item created successfully',
                'data' => $item
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create item: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Display the specified resource with category and transactions.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $item = InventoryItem::with(['category', 'transactions.user'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'message' => 'Item retrieved successfully',
                'data' => $item
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Item not found',
                'data' => null
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'sometimes|required|exists:inventory_categories,id',
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:100|unique:inventory_items,code,' . $id,
            'description' => 'nullable|string',
            'unit' => 'sometimes|required|string|max:50',
            'quantity' => 'sometimes|required|integer|min:0',
            'minimum_stock' => 'sometimes|required|integer|min:0',
            'purchase_price' => 'sometimes|required|numeric|min:0',
            'selling_price' => 'sometimes|required|numeric|min:0',
            'location' => 'nullable|string|max:255',
            'condition' => 'nullable|string|max:100',
            'image_url' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $item = InventoryItem::findOrFail($id);
            $item->update($request->all());
            $item->load('category');

            return response()->json([
                'success' => true,
                'message' => 'Item updated successfully',
                'data' => $item
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update item: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $item = InventoryItem::findOrFail($id);
            $item->delete();

            return response()->json([
                'success' => true,
                'message' => 'Item deleted successfully',
                'data' => null
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete item: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Add stock to inventory item.
     */
    public function addStock(Request $request, string $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $item = InventoryItem::findOrFail($id);
            $stockBefore = $item->quantity;
            $quantity = $request->quantity;
            $stockAfter = $stockBefore + $quantity;

            // Update item quantity
            $item->quantity = $stockAfter;
            $item->save();

            // Create IN transaction
            $transaction = InventoryTransaction::create([
                'inventory_item_id' => $item->id,
                'user_id' => auth()->id(),
                'type' => 'IN',
                'quantity' => $quantity,
                'stock_before' => $stockBefore,
                'stock_after' => $stockAfter,
                'notes' => $request->notes,
                'transaction_date' => now(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Stock added successfully',
                'data' => [
                    'item' => $item,
                    'transaction' => $transaction
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to add stock: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Remove stock from inventory item.
     */
    public function removeStock(Request $request, string $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $item = InventoryItem::findOrFail($id);
            $stockBefore = $item->quantity;
            $quantity = $request->quantity;
            $stockAfter = $stockBefore - $quantity;

            // Check if sufficient stock
            if ($stockAfter < 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient stock',
                    'data' => null
                ], 400);
            }

            // Update item quantity
            $item->quantity = $stockAfter;
            $item->save();

            // Create OUT transaction
            $transaction = InventoryTransaction::create([
                'inventory_item_id' => $item->id,
                'user_id' => auth()->id(),
                'type' => 'OUT',
                'quantity' => $quantity,
                'stock_before' => $stockBefore,
                'stock_after' => $stockAfter,
                'notes' => $request->notes,
                'transaction_date' => now(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Stock removed successfully',
                'data' => [
                    'item' => $item,
                    'transaction' => $transaction
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove stock: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get items with low stock.
     */
    public function lowStock(): JsonResponse
    {
        try {
            $items = InventoryItem::with('category')
                ->whereColumn('quantity', '<=', 'minimum_stock')
                ->where('is_active', true)
                ->orderBy('quantity')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Low stock items retrieved successfully',
                'data' => $items
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve low stock items: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }
}
