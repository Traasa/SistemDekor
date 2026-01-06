<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Transaction;
use App\Models\InventoryTransaction;
use App\Models\InventoryItem;
use App\Models\PaymentProof;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class FinancialReportController extends Controller
{
    /**
     * Get cash flow report (income vs expenses)
     */
    public function cashFlow(Request $request): JsonResponse
    {
        try {
            $startDate = $request->input('start_date', Carbon::now()->startOfMonth());
            $endDate = $request->input('end_date', Carbon::now()->endOfDay());
            
            // Ensure end date includes full day
            $endDate = Carbon::parse($endDate)->endOfDay();

            // Income from actual verified payment proofs
            $income = PaymentProof::where('status', 'verified')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->sum('amount');

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
            $endDate = $request->input('end_date', Carbon::now()->endOfDay());
            
            // Ensure end date includes full day
            $endDate = Carbon::parse($endDate)->endOfDay();
            $status = $request->input('status');

            // Get all orders (or filter by created_at if you want to show orders created in period)
            $query = Order::with(['client', 'orderDetails']);

            if ($status) {
                $query->where('status', $status);
            }

            $orders = $query->get();

            // Calculate revenue from actual verified payments
            $orderIds = $orders->pluck('id');
            $totalRevenue = PaymentProof::where('status', 'verified')
                ->whereIn('order_id', $orderIds)
                ->sum('amount');
            $totalDownPayment = PaymentProof::where('status', 'verified')
                ->where('payment_type', 'DP')
                ->whereIn('order_id', $orderIds)
                ->sum('amount');
            $totalRemaining = $orders->sum('final_price') - $totalRevenue;

            $summary = [
                'total_events' => $orders->count(),
                'total_revenue' => $totalRevenue,
                'total_down_payment' => $totalDownPayment,
                'total_remaining' => $totalRemaining,
                'by_status' => $orders->groupBy('status')->map(function ($group) {
                    $groupOrderIds = $group->pluck('id');
                    $revenue = PaymentProof::where('status', 'verified')
                        ->whereIn('order_id', $groupOrderIds)
                        ->sum('amount');
                    return [
                        'count' => $group->count(),
                        'revenue' => $revenue,
                    ];
                }),
                'by_month' => $orders->groupBy(function ($order) {
                    return Carbon::parse($order->event_date)->format('Y-m');
                })->map(function ($group) {
                    $groupOrderIds = $group->pluck('id');
                    $revenue = PaymentProof::where('status', 'verified')
                        ->whereIn('order_id', $groupOrderIds)
                        ->sum('amount');
                    return [
                        'count' => $group->count(),
                        'revenue' => $revenue,
                    ];
                }),
            ];

            $details = $orders->map(function ($order) {
                $totalPaid = PaymentProof::where('status', 'verified')
                    ->where('order_id', $order->id)
                    ->sum('amount');
                $downPayment = PaymentProof::where('status', 'verified')
                    ->where('payment_type', 'DP')
                    ->where('order_id', $order->id)
                    ->sum('amount');
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'client_name' => $order->client->name ?? 'N/A',
                    'event_date' => $order->event_date,
                    'event_type' => $order->event_type,
                    'status' => $order->status,
                    'total_price' => $order->final_price,
                    'down_payment' => $downPayment,
                    'total_paid' => $totalPaid,
                    'remaining' => $order->final_price - $totalPaid,
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
            $endDate = $request->input('end_date', Carbon::now()->endOfDay());
            
            // Ensure end date includes full day
            $endDate = Carbon::parse($endDate)->endOfDay();
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
            $endDate = $request->input('end_date', Carbon::now()->endOfDay());
            
            // Ensure end date includes full day
            $endDate = Carbon::parse($endDate)->endOfDay();

            // Revenue from actual verified payments
            $orderRevenue = PaymentProof::where('status', 'verified')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->sum('amount');

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
            $endDate = $request->input('end_date', Carbon::now()->endOfDay());
            
            // Ensure end date includes full day
            $endDate = Carbon::parse($endDate)->endOfDay();

            // Get all orders (not filtered by event_date, because we want all orders with payments)
            $orders = Order::with('client')->get();

            // Calculate totals from actual verified payments within date range
            $totalReceived = PaymentProof::where('status', 'verified')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->sum('amount');
            
            $totalReceivable = $orders->sum('final_price');
            $allVerifiedPayments = PaymentProof::where('status', 'verified')
                ->sum('amount');

            $summary = [
                'total_receivable' => $totalReceivable,
                'total_received' => $totalReceived, // Payments in date range
                'total_outstanding' => $totalReceivable - $allVerifiedPayments, // Overall outstanding
                'fully_paid_count' => $orders->filter(function($o) {
                    $paid = PaymentProof::where('status', 'verified')->where('order_id', $o->id)->sum('amount');
                    return $paid >= $o->final_price;
                })->count(),
                'partial_paid_count' => $orders->filter(function($o) {
                    $paid = PaymentProof::where('status', 'verified')->where('order_id', $o->id)->sum('amount');
                    return $paid > 0 && $paid < $o->final_price;
                })->count(),
                'unpaid_count' => $orders->filter(function($o) {
                    $paid = PaymentProof::where('status', 'verified')->where('order_id', $o->id)->sum('amount');
                    return $paid == 0;
                })->count(),
            ];

            $details = $orders->map(function ($order) {
                $paid = PaymentProof::where('status', 'verified')
                    ->where('order_id', $order->id)
                    ->sum('amount');
                $total = $order->final_price;
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

                $revenue = PaymentProof::where('status', 'verified')
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->sum('amount');

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

    /**
     * Generate PDF for financial reports
     */
    public function generatePdf(Request $request)
    {
        try {
            $reportType = $request->input('type', 'cashflow');
            $startDate = $request->input('start_date', Carbon::now()->startOfMonth());
            $endDate = $request->input('end_date', Carbon::now()->endOfDay());
            $year = $request->input('year', Carbon::now()->year);

            // Get data based on report type
            $data = [];
            $title = '';
            $view = '';

            switch ($reportType) {
                case 'cashflow':
                    $title = 'Laporan Cash Flow';
                    $view = 'reports.pdf.cashflow';
                    $data = $this->getCashFlowData($startDate, $endDate);
                    break;
                case 'events':
                    $title = 'Laporan Event';
                    $view = 'reports.pdf.events';
                    $data = $this->getEventReportData($startDate, $endDate);
                    break;
                case 'inventory':
                    $title = 'Laporan Inventaris';
                    $view = 'reports.pdf.inventory';
                    $data = $this->getInventoryReportData($startDate, $endDate);
                    break;
                case 'income':
                    $title = 'Laporan Laba Rugi';
                    $view = 'reports.pdf.income';
                    $data = $this->getIncomeStatementData($startDate, $endDate);
                    break;
                case 'payments':
                    $title = 'Laporan Pembayaran';
                    $view = 'reports.pdf.payments';
                    $data = $this->getPaymentReportData($startDate, $endDate);
                    break;
                case 'comparison':
                    $title = 'Laporan Perbandingan Bulanan';
                    $view = 'reports.pdf.comparison';
                    $data = $this->getMonthlyComparisonData($year);
                    break;
            }

            $pdf = Pdf::loadView($view, [
                'title' => $title,
                'data' => $data,
                'startDate' => $startDate,
                'endDate' => $endDate,
                'year' => $year,
                'generatedAt' => Carbon::now()->format('d M Y H:i'),
            ]);

            $filename = strtolower(str_replace(' ', '_', $title)) . '_' . date('Y-m-d') . '.pdf';

            return $pdf->download($filename);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate PDF: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function getCashFlowData($startDate, $endDate)
    {
        $endDate = Carbon::parse($endDate)->endOfDay();

        $income = PaymentProof::where('status', 'verified')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('amount');

        $inventoryExpenses = InventoryTransaction::whereBetween('transaction_date', [$startDate, $endDate])
            ->where('type', 'in')
            ->with('item')
            ->get()
            ->sum(function ($transaction) {
                return $transaction->quantity * ($transaction->item->purchase_price ?? 0);
            });

        $otherExpenses = 0;
        $totalExpenses = $inventoryExpenses + $otherExpenses;
        $netProfit = $income - $totalExpenses;

        return [
            'period' => ['start' => $startDate, 'end' => $endDate],
            'income' => $income,
            'expenses' => [
                'inventory' => $inventoryExpenses,
                'other' => $otherExpenses,
                'total' => $totalExpenses,
            ],
            'net_profit' => $netProfit,
            'profit_margin' => $income > 0 ? ($netProfit / $income) * 100 : 0,
        ];
    }

    private function getEventReportData($startDate, $endDate)
    {
        $endDate = Carbon::parse($endDate)->endOfDay();
        $orders = Order::with(['client', 'orderDetails'])->get();
        $orderIds = $orders->pluck('id');

        $totalRevenue = PaymentProof::where('status', 'verified')
            ->whereIn('order_id', $orderIds)
            ->sum('amount');

        $details = $orders->map(function ($order) {
            $totalPaid = PaymentProof::where('status', 'verified')
                ->where('order_id', $order->id)
                ->sum('amount');
            return [
                'order_number' => $order->order_number,
                'client_name' => $order->client->name ?? 'N/A',
                'event_date' => $order->event_date,
                'event_type' => $order->event_type,
                'total_price' => $order->final_price,
                'total_paid' => $totalPaid,
            ];
        });

        return [
            'total_events' => $orders->count(),
            'total_revenue' => $totalRevenue,
            'details' => $details,
        ];
    }

    private function getInventoryReportData($startDate, $endDate)
    {
        $endDate = Carbon::parse($endDate)->endOfDay();
        $items = InventoryItem::with('category')->get();

        $itemsDetail = $items->map(function ($item) {
            return [
                'name' => $item->name,
                'code' => $item->code,
                'category' => $item->category->name ?? 'N/A',
                'current_stock' => $item->quantity,
                'unit' => $item->unit,
                'purchase_price' => $item->purchase_price,
                'selling_price' => $item->selling_price,
                'stock_value' => $item->quantity * $item->selling_price,
            ];
        });

        return [
            'total_items' => $items->count(),
            'items' => $itemsDetail,
        ];
    }

    private function getIncomeStatementData($startDate, $endDate)
    {
        $endDate = Carbon::parse($endDate)->endOfDay();

        $orderRevenue = PaymentProof::where('status', 'verified')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('amount');

        $cogs = InventoryTransaction::whereBetween('transaction_date', [$startDate, $endDate])
            ->where('type', 'out')
            ->with('item')
            ->get()
            ->sum(function ($transaction) {
                return abs($transaction->quantity) * ($transaction->item->purchase_price ?? 0);
            });

        $grossProfit = $orderRevenue - $cogs;

        return [
            'period' => ['start' => $startDate, 'end' => $endDate],
            'revenue' => $orderRevenue,
            'cost_of_goods_sold' => $cogs,
            'gross_profit' => $grossProfit,
            'gross_margin_percentage' => $orderRevenue > 0 ? ($grossProfit / $orderRevenue) * 100 : 0,
        ];
    }

    private function getPaymentReportData($startDate, $endDate)
    {
        $endDate = Carbon::parse($endDate)->endOfDay();
        $orders = Order::with('client')->get();

        $details = $orders->map(function ($order) {
            $paid = PaymentProof::where('status', 'verified')
                ->where('order_id', $order->id)
                ->sum('amount');
            return [
                'order_number' => $order->order_number,
                'client_name' => $order->client->name ?? 'N/A',
                'event_date' => $order->event_date,
                'total_amount' => $order->final_price,
                'paid_amount' => $paid,
                'outstanding_amount' => $order->final_price - $paid,
            ];
        });

        return [
            'total_receivable' => $orders->sum('final_price'),
            'total_received' => PaymentProof::where('status', 'verified')->sum('amount'),
            'details' => $details,
        ];
    }

    private function getMonthlyComparisonData($year)
    {
        $monthlyData = [];

        for ($month = 1; $month <= 12; $month++) {
            $startDate = Carbon::create($year, $month, 1)->startOfMonth();
            $endDate = Carbon::create($year, $month, 1)->endOfMonth();

            $revenue = PaymentProof::where('status', 'verified')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->sum('amount');

            $expenses = InventoryTransaction::whereBetween('transaction_date', [$startDate, $endDate])
                ->where('type', 'in')
                ->with('item')
                ->get()
                ->sum(function ($transaction) {
                    return $transaction->quantity * ($transaction->item->purchase_price ?? 0);
                });

            $monthlyData[] = [
                'month_name' => $startDate->format('F'),
                'revenue' => $revenue,
                'expenses' => $expenses,
                'profit' => $revenue - $expenses,
            ];
        }

        return [
            'year' => $year,
            'monthly_data' => $monthlyData,
        ];
    }
}
