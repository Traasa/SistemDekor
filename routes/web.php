<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ClientOrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\UserActivityController;
use App\Http\Controllers\OrderNegotiationController;
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
        return Inertia::render('admin/NewAdminDashboard');
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
    
    // Notifications
    Route::get('/notifications', function () {
        return Inertia::render('admin/notifications/index');
    })->name('admin.notifications.index');
    
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
    Route::get('/orders/{id}', [ClientOrderController::class, 'detail'])->name('admin.orders.detail');
    Route::get('/orders/{id}/edit', [OrderNegotiationController::class, 'edit'])->name('admin.orders.edit');
    Route::put('/orders/{id}', [OrderNegotiationController::class, 'update'])->name('admin.orders.update');
    Route::post('/orders/{id}/recalculate', [OrderNegotiationController::class, 'recalculate'])->name('admin.orders.recalculate');
    Route::post('/orders/{id}/confirm', [ClientOrderController::class, 'confirmOrder'])->name('admin.orders.confirm');
    Route::post('/orders/{id}/update-status', [ClientOrderController::class, 'updateStatus'])->name('admin.orders.updateStatus');
    
    // Payment link generation and verification
    Route::post('/orders/{id}/generate-payment-link', [PaymentController::class, 'generateLink']);
    Route::get('/payment-proofs', [PaymentController::class, 'index']);
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
        return Inertia::render('admin/reports/index');
    });
    
    // Events
    Route::get('/events', function () {
        return Inertia::render('admin/events/index');
    });
    Route::get('/events/{eventId}/rundown', function ($eventId) {
        return Inertia::render('admin/events/RundownPage', ['eventId' => $eventId]);
    });
    Route::get('/rundowns', function () {
        return Inertia::render('admin/rundowns/index');
    });
    Route::get('/tasks', function () {
        return Inertia::render('admin/tasks/index');
    });
    Route::get('/calendar', function () {
        return Inertia::render('admin/calendar/index');
    })->name('admin.calendar.index');
    
    // Venue
    Route::get('/venues', function () {
        return Inertia::render('admin/venues/index');
    })->name('admin.venues.index');
    
    Route::get('/venues/availability', function () {
        return Inertia::render('admin/venues/availability/index');
    })->name('admin.venues.availability');
    
    Route::get('/venues/pricing', function () {
        return Inertia::render('admin/venues/pricing/index');
    })->name('admin.venues.pricing');
    
    // Employees
    Route::get('/employees', function () {
        return Inertia::render('admin/employees/index');
    })->name('admin.employees.index');
    
    Route::get('/employees/schedules', function () {
        return Inertia::render('admin/employees/schedules/index');
    })->name('admin.employees.schedules');
    
    Route::get('/employees/assignments', function () {
        return Inertia::render('admin/employees/assignments/index');
    })->name('admin.employees.assignments');
    
    Route::get('/employees/attendance', function () {
        return Inertia::render('admin/employees/attendance/index');
    })->name('admin.employees.attendance');
    
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
    Route::get('/clients', [App\Http\Controllers\ClientController::class, 'index'])->name('admin.clients.index');
    Route::get('/client-verification', [App\Http\Controllers\ClientVerificationController::class, 'index'])->name('admin.client-verification.index');
    
    // Reports - Financial Reports
    Route::get('/reports', function () {
        return Inertia::render('admin/reports/index');
    });
    Route::get('/reports/sales', [App\Http\Controllers\ReportController::class, 'salesReport'])->name('admin.reports.sales');
    Route::get('/reports/inventory', [App\Http\Controllers\ReportController::class, 'inventoryReport'])->name('admin.reports.inventory');
    Route::get('/reports/performance', [App\Http\Controllers\ReportController::class, 'performanceReport'])->name('admin.reports.performance');
    Route::get('/reports/export', [App\Http\Controllers\ReportController::class, 'exportData'])->name('admin.reports.export');
    
    // Settings
    Route::get('/settings/general', [App\Http\Controllers\SettingsController::class, 'generalSettings'])->name('admin.settings.general');
    Route::get('/settings/notifications', [App\Http\Controllers\SettingsController::class, 'notificationSettings'])->name('admin.settings.notifications');
    Route::get('/settings/email-templates', [App\Http\Controllers\SettingsController::class, 'emailTemplates'])->name('admin.settings.email-templates');
    Route::get('/settings/backup', [App\Http\Controllers\SettingsController::class, 'backupRestore'])->name('admin.settings.backup');
});

require __DIR__.'/auth.php';
