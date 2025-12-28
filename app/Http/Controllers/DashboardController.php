<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Models\User;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function getStatistics(Request $request)
    {
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;
        $lastMonth = Carbon::now()->subMonth()->month;
        $lastYear = Carbon::now()->subMonth()->year;

        // Total Orders
        $totalOrders = Order::count();
        $ordersThisMonth = Order::whereMonth('created_at', $currentMonth)
            ->whereYear('created_at', $currentYear)
            ->count();
        $ordersLastMonth = Order::whereMonth('created_at', $lastMonth)
            ->whereYear('created_at', $lastYear)
            ->count();
        $ordersTrend = $ordersLastMonth > 0 
            ? round((($ordersThisMonth - $ordersLastMonth) / $ordersLastMonth) * 100, 1)
            : 0;

        // Total Revenue
        $totalRevenue = PaymentTransaction::where('status', 'verified')->sum('amount');
        $revenueThisMonth = PaymentTransaction::where('status', 'verified')
            ->whereMonth('created_at', $currentMonth)
            ->whereYear('created_at', $currentYear)
            ->sum('amount');
        $revenueLastMonth = PaymentTransaction::where('status', 'verified')
            ->whereMonth('created_at', $lastMonth)
            ->whereYear('created_at', $lastYear)
            ->sum('amount');
        $revenueTrend = $revenueLastMonth > 0 
            ? round((($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100, 1)
            : 0;

        // Pending Orders
        $pendingOrders = Order::whereIn('status', [
            Order::STATUS_PENDING,
            Order::STATUS_NEGOTIATION,
            Order::STATUS_AWAITING_DP,
        ])->count();

        // Active Orders
        $activeOrders = Order::whereIn('status', [
            Order::STATUS_DP_PAID,
            Order::STATUS_AWAITING_FULL,
            Order::STATUS_PAID,
            Order::STATUS_CONFIRMED,
            Order::STATUS_PROCESSING,
        ])->count();

        // Pending Payments
        $pendingPayments = DB::table('payment_transactions')
            ->where('status', 'pending')
            ->count();

        // Total Clients
        $totalClients = Client::count();
        $clientsThisMonth = Client::whereMonth('created_at', $currentMonth)
            ->whereYear('created_at', $currentYear)
            ->count();
        $clientsLastMonth = Client::whereMonth('created_at', $lastMonth)
            ->whereYear('created_at', $lastYear)
            ->count();
        $clientsTrend = $clientsLastMonth > 0 
            ? round((($clientsThisMonth - $clientsLastMonth) / $clientsLastMonth) * 100, 1)
            : 0;

        // Recent Orders
        $recentOrders = Order::with(['client', 'package'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'client_name' => $order->client->name ?? 'N/A',
                    'event_name' => $order->event_name,
                    'event_date' => $order->event_date,
                    'final_price' => $order->final_price,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'created_at' => $order->created_at->format('Y-m-d H:i:s'),
                ];
            });

        // Payment Status Distribution
        $paymentStatusDistribution = Order::select('payment_status', DB::raw('count(*) as count'))
            ->groupBy('payment_status')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->payment_status => $item->count];
            });

        // Order Status Distribution
        $orderStatusDistribution = Order::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->status => $item->count];
            });

        // Monthly Revenue Chart (Last 6 months)
        $monthlyRevenue = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $revenue = PaymentTransaction::where('status', 'verified')
                ->whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->sum('amount');
            
            $monthlyRevenue[] = [
                'month' => $date->format('M Y'),
                'revenue' => $revenue,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => [
                    'total_orders' => [
                        'value' => $totalOrders,
                        'trend' => $ordersTrend,
                    ],
                    'total_revenue' => [
                        'value' => $totalRevenue,
                        'trend' => $revenueTrend,
                    ],
                    'pending_orders' => $pendingOrders,
                    'active_orders' => $activeOrders,
                    'pending_payments' => $pendingPayments,
                    'total_clients' => [
                        'value' => $totalClients,
                        'trend' => $clientsTrend,
                    ],
                ],
                'recent_orders' => $recentOrders,
                'payment_status_distribution' => $paymentStatusDistribution,
                'order_status_distribution' => $orderStatusDistribution,
                'monthly_revenue' => $monthlyRevenue,
            ],
        ]);
    }
}
