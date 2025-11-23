<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ClientOrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\UserActivityController;
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

Route::get('/gallery', function () {
    return Inertia::render('GalleryPage');
});

// Payment upload page (public with token)
Route::get('/payment/{token}', [PaymentController::class, 'show'])->name('payment.show');
Route::post('/payment/{token}', [PaymentController::class, 'upload'])->name('payment.upload');

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
    Route::get('/users', [UserManagementController::class, 'index'])->name('admin.users.index');
    Route::get('/users/create', [UserManagementController::class, 'create'])->name('admin.users.create');
    Route::post('/users', [UserManagementController::class, 'store'])->name('admin.users.store');
    Route::get('/users/{id}/edit', [UserManagementController::class, 'edit'])->name('admin.users.edit');
    Route::put('/users/{id}', [UserManagementController::class, 'update'])->name('admin.users.update');
    Route::delete('/users/{id}', [UserManagementController::class, 'destroy'])->name('admin.users.destroy');
    Route::post('/users/{id}/toggle-status', [UserManagementController::class, 'toggleStatus'])->name('admin.users.toggle-status');
    
    // Role Management
    Route::get('/roles', [RoleController::class, 'index'])->name('admin.roles.index');
    Route::get('/roles/create', [RoleController::class, 'create'])->name('admin.roles.create');
    Route::post('/roles', [RoleController::class, 'store'])->name('admin.roles.store');
    Route::get('/roles/{id}/edit', [RoleController::class, 'edit'])->name('admin.roles.edit');
    Route::put('/roles/{id}', [RoleController::class, 'update'])->name('admin.roles.update');
    Route::delete('/roles/{id}', [RoleController::class, 'destroy'])->name('admin.roles.destroy');
    
    // User Activity
    Route::get('/user-activity', [UserActivityController::class, 'index'])->name('admin.user-activity.index');
    Route::get('/user-activity/{id}', [UserActivityController::class, 'show'])->name('admin.user-activity.show');
    Route::delete('/user-activity/{id}', [UserActivityController::class, 'destroy'])->name('admin.user-activity.destroy');
    Route::post('/user-activity/clear', [UserActivityController::class, 'clear'])->name('admin.user-activity.clear');
    
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
    Route::get('/orders/{id}', [ClientOrderController::class, 'detail']);
    
    // Payment link generation and verification
    Route::post('/orders/{id}/generate-payment-link', [PaymentController::class, 'generateLink']);
    Route::post('/payment-proofs/{id}/verify', [PaymentController::class, 'verify']);
    Route::post('/payment-proofs/{id}/reject', [PaymentController::class, 'reject']);
    
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
