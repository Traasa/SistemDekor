<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Transaction;
use App\Models\InventoryTransaction;
use App\Models\InventoryItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class FinancialReportController extends Controller
{
    /**
     * Get cash flow report (income vs expenses)
     */
    public function cashFlow(Request $request): JsonResponse
    {
        try {
            $startDate = $request->input('start_date', Carbon::now()->startOfMonth());
            $endDate = $request->input('end_date', Carbon::now()->endOfMonth());

            // Income from orders
            $income = Order::whereBetween('event_date', [$startDate, $endDate])
                ->where('status', 'completed')
                ->sum('total_price');

            // Expenses from inventory transactions
            $inventoryExpenses = InventoryTransaction::whereBetween('transaction_date', [$startDate, $endDate])
                ->where('type', 'in')
                ->with('item')
                ->get()
                ->sum(function ($transaction) {
                    return $transaction->quantity * ($transaction->item->purchase_price ?? 0);
                });

            // Other expenses (can be extended)
            $otherExpenses = 0; // Placeholder for other expense types

            $totalExpenses = $inventoryExpenses + $otherExpenses;
            $netProfit = $income - $totalExpenses;

            return response()->json([
                'success' => true,
                'data' => [
                    'period' => [
                        'start' => $startDate,
                        'end' => $endDate,
                    ],
                    'income' => $income,
                    'expenses' => [
                        'inventory' => $inventoryExpenses,
                        'other' => $otherExpenses,
                        'total' => $totalExpenses,
                    ],
                    'net_profit' => $netProfit,
                    'profit_margin' => $income > 0 ? ($netProfit / $income) * 100 : 0,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate cash flow report: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get event financial report
     */
    public function eventReport(Request $request): JsonResponse
    {
        try {
            $startDate = $request->input('start_date', Carbon::now()->startOfMonth());
            $endDate = $request->input('end_date', Carbon::now()->endOfMonth());
            $status = $request->input('status');

            $query = Order::with(['client', 'orderDetails'])
                ->whereBetween('event_date', [$startDate, $endDate]);

            if ($status) {
                $query->where('status', $status);
            }

            $orders = $query->get();

            $summary = [
                'total_events' => $orders->count(),
                'total_revenue' => $orders->sum('total_price'),
                'total_down_payment' => $orders->sum('down_payment'),
                'total_remaining' => $orders->sum(fn($o) => $o->total_price - $o->down_payment),
                'by_status' => $orders->groupBy('status')->map(function ($group) {
                    return [
                        'count' => $group->count(),
                        'revenue' => $group->sum('total_price'),
                    ];
                }),
                'by_month' => $orders->groupBy(function ($order) {
                    return Carbon::parse($order->event_date)->format('Y-m');
                })->map(function ($group) {
                    return [
                        'count' => $group->count(),
                        'revenue' => $group->sum('total_price'),
                    ];
                }),
            ];

            $details = $orders->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'client_name' => $order->client->name ?? 'N/A',
                    'event_date' => $order->event_date,
                    'event_type' => $order->event_type,
                    'status' => $order->status,
                    'total_price' => $order->total_price,
                    'down_payment' => $order->down_payment,
                    'remaining' => $order->total_price - $order->down_payment,
                    'payment_status' => $order->payment_status,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'summary' => $summary,
                    'details' => $details,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate event report: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get inventory financial report
     */
    public function inventoryReport(Request $request): JsonResponse
    {
        try {
            $startDate = $request->input('start_date', Carbon::now()->startOfMonth());
            $endDate = $request->input('end_date', Carbon::now()->endOfMonth());
            $categoryId = $request->input('category_id');

            // Get all items with their financial data
            $itemsQuery = InventoryItem::with('category');
            
            if ($categoryId) {
                $itemsQuery->where('category_id', $categoryId);
            }

            $items = $itemsQuery->get();

            // Get transactions in date range
            $transactions = InventoryTransaction::with('item')
                ->whereBetween('transaction_date', [$startDate, $endDate])
                ->get();

            // Calculate purchase value (stock in)
            $purchaseValue = $transactions
                ->where('type', 'in')
                ->sum(function ($trans) {
                    return $trans->quantity * ($trans->item->purchase_price ?? 0);
                });

            // Calculate usage value (stock out)
            $usageValue = $transactions
                ->where('type', 'out')
                ->sum(function ($trans) {
                    return abs($trans->quantity) * ($trans->item->purchase_price ?? 0);
                });

            // Current inventory value
            $currentValue = $items->sum(function ($item) {
                return $item->quantity * $item->selling_price;
            });

            $summary = [
                'total_items' => $items->count(),
                'current_stock_value' => $currentValue,
                'period_purchases' => $purchaseValue,
                'period_usage' => $usageValue,
                'net_inventory_change' => $purchaseValue - $usageValue,
            ];

            // Items detail
            $itemsDetail = $items->map(function ($item) use ($startDate, $endDate) {
                $itemTransactions = InventoryTransaction::where('item_id', $item->id)
                    ->whereBetween('transaction_date', [$startDate, $endDate])
                    ->get();

                $stockIn = $itemTransactions->where('type', 'in')->sum('quantity');
                $stockOut = $itemTransactions->where('type', 'out')->sum(fn($t) => abs($t->quantity));

                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'code' => $item->code,
                    'category' => $item->category->name ?? 'N/A',
                    'current_stock' => $item->quantity,
                    'unit' => $item->unit,
                    'purchase_price' => $item->purchase_price,
                    'selling_price' => $item->selling_price,
                    'stock_value' => $item->quantity * $item->selling_price,
                    'period_stock_in' => $stockIn,
                    'period_stock_out' => $stockOut,
                    'period_purchase_value' => $stockIn * $item->purchase_price,
                    'period_usage_value' => $stockOut * $item->purchase_price,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'summary' => $summary,
                    'items' => $itemsDetail,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate inventory report: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get income statement (profit & loss)
     */
    public function incomeStatement(Request $request): JsonResponse
    {
        try {
            $startDate = $request->input('start_date', Carbon::now()->startOfMonth());
            $endDate = $request->input('end_date', Carbon::now()->endOfMonth());

            // Revenue
            $orderRevenue = Order::whereBetween('event_date', [$startDate, $endDate])
                ->where('status', 'completed')
                ->sum('total_price');

            // Cost of Goods Sold (COGS) - inventory used
            $cogs = InventoryTransaction::whereBetween('transaction_date', [$startDate, $endDate])
                ->where('type', 'out')
                ->with('item')
                ->get()
                ->sum(function ($transaction) {
                    return abs($transaction->quantity) * ($transaction->item->purchase_price ?? 0);
                });

            $grossProfit = $orderRevenue - $cogs;
            $grossMargin = $orderRevenue > 0 ? ($grossProfit / $orderRevenue) * 100 : 0;

            // Operating Expenses (placeholder - can be extended)
            $operatingExpenses = 0;

            $operatingIncome = $grossProfit - $operatingExpenses;
            $netIncome = $operatingIncome; // Simplified, can add other income/expenses

            return response()->json([
                'success' => true,
                'data' => [
                    'period' => [
                        'start' => $startDate,
                        'end' => $endDate,
                    ],
                    'revenue' => [
                        'orders' => $orderRevenue,
                        'total' => $orderRevenue,
                    ],
                    'cost_of_goods_sold' => $cogs,
                    'gross_profit' => $grossProfit,
                    'gross_margin_percentage' => $grossMargin,
                    'operating_expenses' => $operatingExpenses,
                    'operating_income' => $operatingIncome,
                    'net_income' => $netIncome,
                    'net_margin_percentage' => $orderRevenue > 0 ? ($netIncome / $orderRevenue) * 100 : 0,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate income statement: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get payment report
     */
    public function paymentReport(Request $request): JsonResponse
    {
        try {
            $startDate = $request->input('start_date', Carbon::now()->startOfMonth());
            $endDate = $request->input('end_date', Carbon::now()->endOfMonth());

            $orders = Order::with('client')
                ->whereBetween('event_date', [$startDate, $endDate])
                ->get();

            $summary = [
                'total_receivable' => $orders->sum('total_price'),
                'total_received' => $orders->sum('down_payment'),
                'total_outstanding' => $orders->sum(fn($o) => $o->total_price - $o->down_payment),
                'fully_paid_count' => $orders->where('payment_status', 'paid')->count(),
                'partial_paid_count' => $orders->where('payment_status', 'partial')->count(),
                'unpaid_count' => $orders->where('payment_status', 'unpaid')->count(),
            ];

            $details = $orders->map(function ($order) {
                $paid = $order->down_payment;
                $total = $order->total_price;
                $outstanding = $total - $paid;

                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'client_name' => $order->client->name ?? 'N/A',
                    'event_date' => $order->event_date,
                    'total_amount' => $total,
                    'paid_amount' => $paid,
                    'outstanding_amount' => $outstanding,
                    'payment_status' => $order->payment_status,
                    'payment_percentage' => $total > 0 ? ($paid / $total) * 100 : 0,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'summary' => $summary,
                    'details' => $details,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate payment report: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get monthly comparison report
     */
    public function monthlyComparison(Request $request): JsonResponse
    {
        try {
            $year = $request->input('year', Carbon::now()->year);

            $monthlyData = [];

            for ($month = 1; $month <= 12; $month++) {
                $startDate = Carbon::create($year, $month, 1)->startOfMonth();
                $endDate = Carbon::create($year, $month, 1)->endOfMonth();

                $revenue = Order::whereBetween('event_date', [$startDate, $endDate])
                    ->where('status', 'completed')
                    ->sum('total_price');

                $expenses = InventoryTransaction::whereBetween('transaction_date', [$startDate, $endDate])
                    ->where('type', 'in')
                    ->with('item')
                    ->get()
                    ->sum(function ($transaction) {
                        return $transaction->quantity * ($transaction->item->purchase_price ?? 0);
                    });

                $orderCount = Order::whereBetween('event_date', [$startDate, $endDate])->count();

                $monthlyData[] = [
                    'month' => $month,
                    'month_name' => $startDate->format('F'),
                    'revenue' => $revenue,
                    'expenses' => $expenses,
                    'profit' => $revenue - $expenses,
                    'order_count' => $orderCount,
                ];
            }

            $totalRevenue = collect($monthlyData)->sum('revenue');
            $totalExpenses = collect($monthlyData)->sum('expenses');
            $totalProfit = $totalRevenue - $totalExpenses;

            return response()->json([
                'success' => true,
                'data' => [
                    'year' => $year,
                    'monthly_data' => $monthlyData,
                    'annual_summary' => [
                        'total_revenue' => $totalRevenue,
                        'total_expenses' => $totalExpenses,
                        'total_profit' => $totalProfit,
                        'average_monthly_revenue' => $totalRevenue / 12,
                        'average_monthly_profit' => $totalProfit / 12,
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate monthly comparison: ' . $e->getMessage(),
            ], 500);
        }
    }
}
