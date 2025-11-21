<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes - Inertia
|--------------------------------------------------------------------------
*/

// Public routes
Route::get('/', function () {
    return Inertia::render('HomePage');
});

Route::get('/packages', function () {
    return Inertia::render('PackagesPage');
});

Route::get('/transaction/{id}', function ($id) {
    return Inertia::render('TransactionDetailPage', ['transactionId' => $id]);
});

// User routes (protected)
Route::middleware(['auth'])->group(function () {
    Route::get('/my-transactions', function () {
        return Inertia::render('user/MyTransactionsPage');
    });
    
    // Client orders page
    Route::get('/my-orders', [App\Http\Controllers\ClientOrderController::class, 'myOrders']);
});

// Admin routes (protected + admin role check)
Route::middleware(['auth'])->prefix('admin')->group(function () {
    Route::get('/', function () {
        return Inertia::render('admin/Dashboard');
    });
    
    // User Management
    Route::get('/users', function () {
        return Inertia::render('admin/UsersPage');
    });
    Route::get('/roles', function () {
        return Inertia::render('admin/roles/index');
    });
    Route::get('/user-activity', function () {
        return Inertia::render('admin/user-activity/index');
    });
    
    // Website Content
    Route::get('/company-profile', function () {
        return Inertia::render('admin/company-profile/index');
    });
    Route::get('/services', function () {
        return Inertia::render('admin/services/index');
    });
    Route::get('/gallery', function () {
        return Inertia::render('admin/gallery/index');
    });
    Route::get('/testimonials', function () {
        return Inertia::render('admin/testimonials/index');
    });
    Route::get('/packages', function () {
        return Inertia::render('admin/packages/index');
    });
    Route::get('/portfolio', function () {
        return Inertia::render('admin/portfolio/index');
    });
    
    // Inventory
    Route::get('/inventory/items', function () {
        return Inertia::render('admin/InventoryItemsPage');
    });
    Route::get('/inventory/categories', function () {
        return Inertia::render('admin/inventory/categories/index');
    });
    Route::get('/inventory/transactions', function () {
        return Inertia::render('admin/inventory/transactions/index');
    });
    Route::get('/inventory/alerts', function () {
        return Inertia::render('admin/inventory/alerts/index');
    });
    
    // Orders & Transactions
    Route::get('/orders', function () {
        return Inertia::render('admin/OrdersPage');
    });
    Route::get('/orders/create', function () {
        return Inertia::render('admin/orders/create');
    });
    
    // Payment routes
    Route::get('/payments', function () {
        return Inertia::render('admin/payments/index');
    });
    Route::get('/payments/{id}', function ($id) {
        return Inertia::render('admin/payments/detail', ['id' => $id]);
    });
    
    // Invoice routes
    Route::get('/invoices', function () {
        return Inertia::render('admin/invoices/index');
    });
    
    Route::get('/financial-reports', function () {
        return Inertia::render('admin/financial-reports/index');
    });
    
    // Events
    Route::get('/events', function () {
        return Inertia::render('admin/events/index');
    });
    Route::get('/rundowns', function () {
        return Inertia::render('admin/rundowns/index');
    });
    Route::get('/tasks', function () {
        return Inertia::render('admin/tasks/index');
    });
    Route::get('/calendar', function () {
        return Inertia::render('admin/calendar/index');
    });
    
    // Venue
    Route::get('/venues', function () {
        return Inertia::render('admin/venues/index');
    });
    Route::get('/venue-availability', function () {
        return Inertia::render('admin/venue-availability/index');
    });
    Route::get('/venue-pricing', function () {
        return Inertia::render('admin/venue-pricing/index');
    });
    
    // Employees
    Route::get('/employees', function () {
        return Inertia::render('admin/employees/index');
    });
    Route::get('/schedules', function () {
        return Inertia::render('admin/schedules/index');
    });
    Route::get('/assignments', function () {
        return Inertia::render('admin/assignments/index');
    });
    Route::get('/attendance', function () {
        return Inertia::render('admin/attendance/index');
    });
    
    // Vendors
    Route::get('/vendors', function () {
        return Inertia::render('admin/vendors/index');
    });
    Route::get('/vendor-categories', function () {
        return Inertia::render('admin/vendor-categories/index');
    });
    Route::get('/contracts', function () {
        return Inertia::render('admin/contracts/index');
    });
    Route::get('/vendor-ratings', function () {
        return Inertia::render('admin/vendor-ratings/index');
    });
    
    // Clients
    Route::get('/clients', function () {
        return Inertia::render('admin/clients/index');
    });
    Route::get('/client-verification', function () {
        return Inertia::render('admin/client-verification/index');
    });
    
    // Reports
    Route::get('/reports/sales', function () {
        return Inertia::render('admin/reports/sales/index');
    });
    Route::get('/reports/inventory', function () {
        return Inertia::render('admin/reports/inventory/index');
    });
    Route::get('/reports/performance', function () {
        return Inertia::render('admin/reports/performance/index');
    });
    Route::get('/reports/export', function () {
        return Inertia::render('admin/reports/export/index');
    });
    
    // Settings
    Route::get('/settings/general', function () {
        return Inertia::render('admin/settings/general/index');
    });
    Route::get('/settings/notifications', function () {
        return Inertia::render('admin/settings/notifications/index');
    });
    Route::get('/settings/email-templates', function () {
        return Inertia::render('admin/settings/email-templates/index');
    });
    Route::get('/settings/backup', function () {
        return Inertia::render('admin/settings/backup/index');
    });
});

require __DIR__.'/auth.php';
