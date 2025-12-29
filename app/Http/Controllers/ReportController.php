<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\InventoryItem;
use App\Models\InventoryTransaction;
use App\Models\Employee;
use App\Models\EmployeeAssignment;
use App\Models\PaymentTransaction;
use App\Models\Vendor;
use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * SALES REPORT
     */
    public function salesReport(Request $request)
    {
        return Inertia::render('admin/reports/sales/index', [
            'filters' => $request->only(['start_date', 'end_date', 'status']),
        ]);
    }

    public function getSalesData(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth());
        $status = $request->input('status');

        $query = Order::with(['client', 'package'])
            ->whereBetween('created_at', [$startDate, $endDate]);

        if ($status) {
            $query->where('status', $status);
        }

        $orders = $query->get();

        // Summary Statistics
        $totalOrders = $orders->count();
        $totalRevenue = $orders->where('status', Order::STATUS_PAID)
            ->sum('final_price');
        $pendingOrders = $orders->whereIn('status', [
            Order::STATUS_PENDING,
            Order::STATUS_NEGOTIATION,
        ])->count();
        $completedOrders = $orders->where('status', Order::STATUS_COMPLETED)->count();

        // Revenue by Package
        $revenueByPackage = $orders->where('status', Order::STATUS_PAID)
            ->groupBy('package_id')
            ->map(function ($group) {
                return [
                    'package_name' => $group->first()->package->name ?? 'N/A',
                    'total_orders' => $group->count(),
                    'total_revenue' => $group->sum('final_price'),
                ];
            })->values();

        // Daily Revenue (for chart)
        $dailyRevenue = $orders->where('status', Order::STATUS_PAID)
            ->groupBy(function ($order) {
                return Carbon::parse($order->created_at)->format('Y-m-d');
            })
            ->map(function ($group, $date) {
                return [
                    'date' => $date,
                    'revenue' => $group->sum('final_price'),
                    'orders' => $group->count(),
                ];
            })->values();

        // Monthly Comparison (current vs previous month)
        $currentMonth = Carbon::now()->startOfMonth();
        $previousMonth = Carbon::now()->subMonth()->startOfMonth();
        
        $currentMonthRevenue = Order::where('status', Order::STATUS_PAID)
            ->whereBetween('created_at', [$currentMonth, Carbon::now()])
            ->sum('final_price');
        
        $previousMonthRevenue = Order::where('status', Order::STATUS_PAID)
            ->whereBetween('created_at', [$previousMonth, $previousMonth->copy()->endOfMonth()])
            ->sum('final_price');

        $revenueGrowth = $previousMonthRevenue > 0 
            ? (($currentMonthRevenue - $previousMonthRevenue) / $previousMonthRevenue) * 100 
            : 0;

        // Payment Status Summary
        $paymentSummary = [
            'total_paid' => PaymentTransaction::where('status', 'verified')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->sum('amount'),
            'pending_payments' => PaymentTransaction::where('status', 'pending')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->sum('amount'),
            'dp_payments' => PaymentTransaction::where('payment_type', 'DP')
                ->where('status', 'verified')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->sum('amount'),
        ];

        return response()->json([
            'summary' => [
                'total_orders' => $totalOrders,
                'total_revenue' => $totalRevenue,
                'pending_orders' => $pendingOrders,
                'completed_orders' => $completedOrders,
                'revenue_growth' => round($revenueGrowth, 2),
            ],
            'revenue_by_package' => $revenueByPackage,
            'daily_revenue' => $dailyRevenue,
            'payment_summary' => $paymentSummary,
            'orders' => $orders,
        ]);
    }

    /**
     * INVENTORY REPORT
     */
    public function inventoryReport(Request $request)
    {
        return Inertia::render('admin/reports/inventory/index', [
            'filters' => $request->only(['category', 'status']),
        ]);
    }

    public function getInventoryData(Request $request)
    {
        $category = $request->input('category');
        $status = $request->input('status');

        $query = InventoryItem::with('category');

        if ($category) {
            $query->where('category_id', $category);
        }

        if ($status === 'low_stock') {
            $query->whereColumn('current_stock', '<=', 'minimum_stock');
        } elseif ($status === 'out_of_stock') {
            $query->where('current_stock', 0);
        }

        $items = $query->get();

        // Summary Statistics
        $totalItems = InventoryItem::count();
        $totalValue = InventoryItem::sum(DB::raw('current_stock * unit_price'));
        $lowStockItems = InventoryItem::whereColumn('current_stock', '<=', 'minimum_stock')->count();
        $outOfStockItems = InventoryItem::where('current_stock', 0)->count();

        // Stock by Category
        $stockByCategory = InventoryItem::with('category')
            ->select('category_id', 
                DB::raw('COUNT(*) as total_items'),
                DB::raw('SUM(current_stock) as total_stock'),
                DB::raw('SUM(current_stock * unit_price) as total_value')
            )
            ->groupBy('category_id')
            ->get()
            ->map(function ($item) {
                return [
                    'category_name' => $item->category->name ?? 'Uncategorized',
                    'total_items' => $item->total_items,
                    'total_stock' => $item->total_stock,
                    'total_value' => $item->total_value,
                ];
            });

        // Recent Transactions
        $recentTransactions = InventoryTransaction::with(['item', 'user'])
            ->latest()
            ->take(20)
            ->get();

        // Stock Movement (Last 30 days)
        $stockMovement = InventoryTransaction::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(CASE WHEN type = "in" THEN quantity ELSE 0 END) as stock_in'),
                DB::raw('SUM(CASE WHEN type = "out" THEN quantity ELSE 0 END) as stock_out')
            )
            ->where('created_at', '>=', Carbon::now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'summary' => [
                'total_items' => $totalItems,
                'total_value' => $totalValue,
                'low_stock_items' => $lowStockItems,
                'out_of_stock_items' => $outOfStockItems,
            ],
            'stock_by_category' => $stockByCategory,
            'recent_transactions' => $recentTransactions,
            'stock_movement' => $stockMovement,
            'items' => $items,
        ]);
    }

    /**
     * PERFORMANCE REPORT
     */
    public function performanceReport(Request $request)
    {
        return Inertia::render('admin/reports/performance/index', [
            'filters' => $request->only(['start_date', 'end_date', 'employee_id']),
        ]);
    }

    public function getPerformanceData(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth());
        $employeeId = $request->input('employee_id');

        // Employee Performance
        $employeeQuery = Employee::with(['assignments' => function ($query) use ($startDate, $endDate) {
            $query->whereBetween('assignment_date', [$startDate, $endDate]);
        }]);

        if ($employeeId) {
            $employeeQuery->where('id', $employeeId);
        }

        $employees = $employeeQuery->get()->map(function ($employee) {
            return [
                'id' => $employee->id,
                'name' => $employee->name,
                'position' => $employee->position,
                'total_assignments' => $employee->assignments->count(),
                'completed_assignments' => $employee->assignments->where('status', 'completed')->count(),
                'completion_rate' => $employee->assignments->count() > 0 
                    ? round(($employee->assignments->where('status', 'completed')->count() / $employee->assignments->count()) * 100, 2)
                    : 0,
            ];
        });

        // Event Statistics
        $totalEvents = Event::whereBetween('event_date', [$startDate, $endDate])->count();
        $completedEvents = Event::where('status', 'completed')
            ->whereBetween('event_date', [$startDate, $endDate])
            ->count();
        $upcomingEvents = Event::where('status', 'scheduled')
            ->where('event_date', '>=', Carbon::now())
            ->whereBetween('event_date', [$startDate, $endDate])
            ->count();

        // Vendor Performance
        $vendorPerformance = Vendor::with(['ratings' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate]);
            }])
            ->get()
            ->map(function ($vendor) {
                $ratings = $vendor->ratings;
                return [
                    'vendor_name' => $vendor->company_name,
                    'total_ratings' => $ratings->count(),
                    'average_rating' => $ratings->count() > 0 
                        ? round($ratings->avg('overall_rating'), 2) 
                        : 0,
                    'rating_level' => $vendor->rating_level,
                ];
            })
            ->where('total_ratings', '>', 0)
            ->sortByDesc('average_rating')
            ->values();

        // Assignment Distribution
        $assignmentsByPosition = EmployeeAssignment::with('employee')
            ->whereBetween('assignment_date', [$startDate, $endDate])
            ->get()
            ->groupBy(function ($assignment) {
                return $assignment->employee->position ?? 'Unknown';
            })
            ->map(function ($group, $position) {
                return [
                    'position' => $position,
                    'total_assignments' => $group->count(),
                    'employees' => $group->pluck('employee.name')->unique()->count(),
                ];
            })
            ->values();

        // Monthly Performance Trend
        $monthlyTrend = Event::select(
                DB::raw('MONTH(event_date) as month'),
                DB::raw('COUNT(*) as total_events'),
                DB::raw('SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed_events')
            )
            ->whereBetween('event_date', [$startDate, $endDate])
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'summary' => [
                'total_events' => $totalEvents,
                'completed_events' => $completedEvents,
                'upcoming_events' => $upcomingEvents,
                'completion_rate' => $totalEvents > 0 
                    ? round(($completedEvents / $totalEvents) * 100, 2) 
                    : 0,
            ],
            'employee_performance' => $employees,
            'vendor_performance' => $vendorPerformance,
            'assignments_by_position' => $assignmentsByPosition,
            'monthly_trend' => $monthlyTrend,
        ]);
    }

    /**
     * EXPORT DATA
     */
    public function exportData(Request $request)
    {
        return Inertia::render('admin/reports/export/index');
    }

    /**
     * Export to CSV
     */
    public function exportCSV(Request $request)
    {
        $type = $request->input('type'); // sales, inventory, performance
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth());

        switch ($type) {
            case 'sales':
                return $this->exportSalesCSV($startDate, $endDate);
            case 'inventory':
                return $this->exportInventoryCSV();
            case 'performance':
                return $this->exportPerformanceCSV($startDate, $endDate);
            default:
                return response()->json(['error' => 'Invalid export type'], 400);
        }
    }

    private function exportSalesCSV($startDate, $endDate)
    {
        $orders = Order::with(['client', 'package'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get();

        $filename = 'sales_report_' . date('Y-m-d') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function() use ($orders) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Order Number', 'Client Name', 'Package', 'Event Name', 'Event Date', 'Total Price', 'Status', 'Payment Status', 'Order Date']);

            foreach ($orders as $order) {
                fputcsv($file, [
                    $order->order_number,
                    $order->client->name ?? 'N/A',
                    $order->package->name ?? 'N/A',
                    $order->event_name,
                    $order->event_date,
                    $order->final_price,
                    $order->status,
                    $order->payment_status,
                    $order->created_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function exportInventoryCSV()
    {
        $items = InventoryItem::with('category')->get();

        $filename = 'inventory_report_' . date('Y-m-d') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function() use ($items) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Item Code', 'Item Name', 'Category', 'Current Stock', 'Minimum Stock', 'Unit', 'Unit Price', 'Total Value', 'Status']);

            foreach ($items as $item) {
                $status = $item->current_stock == 0 ? 'Out of Stock' : 
                         ($item->current_stock <= $item->minimum_stock ? 'Low Stock' : 'In Stock');
                
                fputcsv($file, [
                    $item->item_code,
                    $item->item_name,
                    $item->category->name ?? 'N/A',
                    $item->current_stock,
                    $item->minimum_stock,
                    $item->unit,
                    $item->unit_price,
                    $item->current_stock * $item->unit_price,
                    $status,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function exportPerformanceCSV($startDate, $endDate)
    {
        $employees = Employee::with(['assignments' => function ($query) use ($startDate, $endDate) {
            $query->whereBetween('assignment_date', [$startDate, $endDate]);
        }])->get();

        $filename = 'performance_report_' . date('Y-m-d') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function() use ($employees) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Employee Name', 'Position', 'Department', 'Total Assignments', 'Completed Assignments', 'Completion Rate (%)', 'Status']);

            foreach ($employees as $employee) {
                $totalAssignments = $employee->assignments->count();
                $completedAssignments = $employee->assignments->where('status', 'completed')->count();
                $completionRate = $totalAssignments > 0 
                    ? round(($completedAssignments / $totalAssignments) * 100, 2) 
                    : 0;

                fputcsv($file, [
                    $employee->name,
                    $employee->position,
                    $employee->department,
                    $totalAssignments,
                    $completedAssignments,
                    $completionRate,
                    $employee->status,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Get all report statistics for dashboard
     */
    public function getAllStats()
    {
        $currentMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        return response()->json([
            'sales' => [
                'total_revenue' => Order::where('status', Order::STATUS_PAID)
                    ->whereBetween('created_at', [$currentMonth, $endOfMonth])
                    ->sum('final_price'),
                'total_orders' => Order::whereBetween('created_at', [$currentMonth, $endOfMonth])->count(),
            ],
            'inventory' => [
                'total_items' => InventoryItem::count(),
                'low_stock' => InventoryItem::whereColumn('current_stock', '<=', 'minimum_stock')->count(),
            ],
            'performance' => [
                'total_events' => Event::whereBetween('event_date', [$currentMonth, $endOfMonth])->count(),
                'completed_events' => Event::where('status', 'completed')
                    ->whereBetween('event_date', [$currentMonth, $endOfMonth])->count(),
            ],
        ]);
    }
}
