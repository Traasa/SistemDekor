<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\CompanyProfileController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\GalleryController;
use App\Http\Controllers\Api\TestimonialController;
use App\Http\Controllers\Api\ReportController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/company-profile', [CompanyProfileController::class, 'index']);

// Public wedding organizer routes
Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/{service}', [ServiceController::class, 'show']);
Route::get('/gallery', [GalleryController::class, 'index']);
Route::get('/gallery/{gallery}', [GalleryController::class, 'show']);
Route::get('/testimonials', [TestimonialController::class, 'index']);

// New: Public packages and portfolios routes
Route::get('/packages', [App\Http\Controllers\Api\PackageController::class, 'index']);
Route::get('/packages/{slug}', [App\Http\Controllers\Api\PackageController::class, 'show']);
Route::get('/portfolios', [App\Http\Controllers\Api\PortfolioController::class, 'index']);

// Client verification (no auth required)
Route::get('/verify-order/{token}', [App\Http\Controllers\Api\ClientVerificationController::class, 'show']);

// Client order routes (accessible by authenticated users)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/client/orders', [App\Http\Controllers\ClientOrderController::class, 'store']);
    Route::get('/client/orders', [App\Http\Controllers\ClientOrderController::class, 'myOrders']);
    Route::get('/client/orders/{id}', [App\Http\Controllers\ClientOrderController::class, 'show']);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    
    // Orders and Payments (Admin & Sales)
    // Use OrderManagementController for creating orders (with payment integration)
    Route::post('/orders', [App\Http\Controllers\OrderManagementController::class, 'store']);
    Route::get('/orders/{id}', [App\Http\Controllers\OrderManagementController::class, 'show']);
    Route::put('/orders/{id}/status', [App\Http\Controllers\OrderManagementController::class, 'updateStatus']);
    
    // Other order routes (index, update, delete) use OrderController
    Route::get('/orders', [App\Http\Controllers\Api\OrderController::class, 'index']);
    Route::put('/orders/{order}', [App\Http\Controllers\Api\OrderController::class, 'update']);
    Route::delete('/orders/{order}', [App\Http\Controllers\Api\OrderController::class, 'destroy']);
    
    Route::patch('orders/{order}/status', [App\Http\Controllers\Api\OrderController::class, 'updateStatus']);
    Route::apiResource('payment-transactions', App\Http\Controllers\Api\PaymentTransactionController::class);
    
    // Dashboard & Notifications
    Route::get('/dashboard/statistics', [App\Http\Controllers\DashboardController::class, 'getStatistics']);
    Route::get('/notifications', [App\Http\Controllers\NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [App\Http\Controllers\NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [App\Http\Controllers\NotificationController::class, 'destroy']);
    
    // Client routes
    Route::get('/clients', [App\Http\Controllers\Api\ClientController::class, 'index']);
    Route::post('/clients', [App\Http\Controllers\Api\ClientController::class, 'store']);
    
    // Client Management API Routes
    Route::prefix('admin')->middleware('role:admin')->group(function () {
        Route::get('/clients-list', [App\Http\Controllers\ClientController::class, 'getClients']);
        Route::post('/clients', [App\Http\Controllers\ClientController::class, 'store']);
        Route::get('/clients/{id}', [App\Http\Controllers\ClientController::class, 'show']);
        Route::put('/clients/{id}', [App\Http\Controllers\ClientController::class, 'update']);
        Route::delete('/clients/{id}', [App\Http\Controllers\ClientController::class, 'destroy']);
        Route::get('/clients-stats', [App\Http\Controllers\ClientController::class, 'getStats']);
        
        // Client Verification Routes
        Route::get('/client-verification-list', [App\Http\Controllers\ClientVerificationController::class, 'getOrders']);
        Route::post('/orders/{id}/approve', [App\Http\Controllers\ClientVerificationController::class, 'approveOrder']);
        Route::post('/orders/{id}/reject', [App\Http\Controllers\ClientVerificationController::class, 'rejectOrder']);
        Route::post('/orders/{orderId}/payments/{paymentId}/approve', [App\Http\Controllers\ClientVerificationController::class, 'approvePayment']);
        Route::post('/orders/{orderId}/payments/{paymentId}/reject', [App\Http\Controllers\ClientVerificationController::class, 'rejectPayment']);
        Route::get('/verification-stats', [App\Http\Controllers\ClientVerificationController::class, 'getStats']);
    });
    
    // Package routes
    Route::get('/packages-list', [App\Http\Controllers\Api\PackageController::class, 'index']);
    
    // Transaction routes
    Route::apiResource('transactions', TransactionController::class);
    Route::get('/transactions/{transaction}/pdf', [TransactionController::class, 'exportPdf']);
    Route::get('/users', [TransactionController::class, 'getUsers']);
    
    // Admin only routes
    Route::middleware('role:admin')->group(function () {
        // User management
        Route::apiResource('users', App\Http\Controllers\Api\UserController::class);
        
        // Service management
        Route::post('/services', [ServiceController::class, 'store']);
        Route::put('/services/{service}', [ServiceController::class, 'update']);
        Route::delete('/services/{service}', [ServiceController::class, 'destroy']);
        
        // Gallery management
        Route::post('/gallery', [GalleryController::class, 'store']);
        Route::put('/gallery/{gallery}', [GalleryController::class, 'update']);
        Route::delete('/gallery/{gallery}', [GalleryController::class, 'destroy']);
        
        // Testimonial management
        Route::post('/testimonials', [TestimonialController::class, 'store']);
        Route::put('/testimonials/{testimonial}', [TestimonialController::class, 'update']);
        Route::delete('/testimonials/{testimonial}', [TestimonialController::class, 'destroy']);
        
        // Package management
        Route::apiResource('packages', App\Http\Controllers\Api\PackageController::class)->except(['index', 'show']);
        
        // Portfolio management
        Route::apiResource('portfolios', App\Http\Controllers\Api\PortfolioController::class)->except(['index']);
        
        // Client management
        Route::apiResource('clients', App\Http\Controllers\Api\ClientController::class);
        
        // Report management
        Route::apiResource('reports', ReportController::class);
        Route::get('/reports/generate/transactions', [ReportController::class, 'generateTransactionReport']);
        Route::get('/reports/generate/services', [ReportController::class, 'generateServiceReport']);
        Route::get('/reports/generate/revenue', [ReportController::class, 'generateRevenueReport']);
        
        // New Report Routes
        Route::get('/reports-sales-data', [App\Http\Controllers\ReportController::class, 'getSalesData']);
        Route::get('/reports-inventory-data', [App\Http\Controllers\ReportController::class, 'getInventoryData']);
        Route::get('/reports-performance-data', [App\Http\Controllers\ReportController::class, 'getPerformanceData']);
        Route::get('/reports-all-stats', [App\Http\Controllers\ReportController::class, 'getAllStats']);
        Route::post('/reports-export-csv', [App\Http\Controllers\ReportController::class, 'exportCSV']);
        
        // Company Profile management
        Route::apiResource('company-profiles', CompanyProfileController::class)->except(['index']);
    });
    
    // Orders and Payments (Admin & Sales)
    // Use OrderManagementController for creating orders (with payment integration)
    Route::post('/orders', [App\Http\Controllers\OrderManagementController::class, 'store']);
    Route::get('/orders/{id}', [App\Http\Controllers\OrderManagementController::class, 'show']);
    Route::put('/orders/{id}/status', [App\Http\Controllers\OrderManagementController::class, 'updateStatus']);
    
    // Other order routes (index, update, delete) use OrderController
    Route::get('/orders', [App\Http\Controllers\Api\OrderController::class, 'index']);
    Route::put('/orders/{order}', [App\Http\Controllers\Api\OrderController::class, 'update']);
    Route::delete('/orders/{order}', [App\Http\Controllers\Api\OrderController::class, 'destroy']);
    
    Route::patch('orders/{order}/status', [App\Http\Controllers\Api\OrderController::class, 'updateStatus']);
    Route::apiResource('payment-transactions', App\Http\Controllers\Api\PaymentTransactionController::class);
    Route::post('payment-transactions/{paymentTransaction}/verify', [App\Http\Controllers\Api\PaymentTransactionController::class, 'verify']);
    
    // Payment Proofs
    Route::get('payment-proofs', [App\Http\Controllers\PaymentController::class, 'index']);
    Route::post('payment-proofs/{id}/verify', [App\Http\Controllers\PaymentController::class, 'verify']);
    Route::post('payment-proofs/{id}/reject', [App\Http\Controllers\PaymentController::class, 'reject']);
    
    // Inventory Management (Admin & Sales)
    Route::apiResource('inventory-categories', App\Http\Controllers\Api\InventoryCategoryController::class);
    Route::apiResource('inventory-items', App\Http\Controllers\Api\InventoryItemController::class);
    Route::post('inventory-items/{inventoryItem}/add-stock', [App\Http\Controllers\Api\InventoryItemController::class, 'addStock']);
    Route::post('inventory-items/{inventoryItem}/remove-stock', [App\Http\Controllers\Api\InventoryItemController::class, 'removeStock']);
    Route::get('inventory-items-low-stock', [App\Http\Controllers\Api\InventoryItemController::class, 'lowStock']);
    Route::apiResource('inventory-transactions', App\Http\Controllers\Api\InventoryTransactionController::class)->only(['index', 'show']);
    
    // Event & Rundown Management
    Route::apiResource('events', App\Http\Controllers\EventController::class);
    Route::get('events-calendar', [App\Http\Controllers\EventController::class, 'calendar']);
    Route::get('events/{event}/rundown', [App\Http\Controllers\RundownController::class, 'index']);
    Route::post('events/{event}/rundown', [App\Http\Controllers\RundownController::class, 'store']);
    Route::put('events/{event}/rundown/{rundownItem}', [App\Http\Controllers\RundownController::class, 'update']);
    Route::delete('events/{event}/rundown/{rundownItem}', [App\Http\Controllers\RundownController::class, 'destroy']);
    Route::post('events/{event}/rundown/reorder', [App\Http\Controllers\RundownController::class, 'reorder']);
    
    // Task Assignment Management
    Route::get('events/{event}/tasks', [App\Http\Controllers\TaskAssignmentController::class, 'index']);
    Route::post('events/{event}/tasks', [App\Http\Controllers\TaskAssignmentController::class, 'store']);
    Route::put('events/{event}/tasks/{taskAssignment}', [App\Http\Controllers\TaskAssignmentController::class, 'update']);
    Route::delete('events/{event}/tasks/{taskAssignment}', [App\Http\Controllers\TaskAssignmentController::class, 'destroy']);
    Route::get('my-tasks', [App\Http\Controllers\TaskAssignmentController::class, 'myTasks']);
    
    // Financial Reports
    Route::get('reports/cash-flow', [App\Http\Controllers\Api\FinancialReportController::class, 'cashFlow']);
    Route::get('reports/events', [App\Http\Controllers\Api\FinancialReportController::class, 'eventReport']);
    Route::get('reports/inventory', [App\Http\Controllers\Api\FinancialReportController::class, 'inventoryReport']);
    Route::get('reports/income-statement', [App\Http\Controllers\Api\FinancialReportController::class, 'incomeStatement']);
    Route::get('reports/payments', [App\Http\Controllers\Api\FinancialReportController::class, 'paymentReport']);
    Route::get('reports/monthly-comparison', [App\Http\Controllers\Api\FinancialReportController::class, 'monthlyComparison']);
    
    // Venue Management
    Route::apiResource('venues', App\Http\Controllers\Api\VenueController::class);
    Route::apiResource('venue-pricing', App\Http\Controllers\Api\VenuePricingController::class);
    Route::get('venue-availability', [App\Http\Controllers\Api\VenueAvailabilityController::class, 'index']);
    Route::post('venue-availability', [App\Http\Controllers\Api\VenueAvailabilityController::class, 'store']);
    Route::post('venue-availability/bulk', [App\Http\Controllers\Api\VenueAvailabilityController::class, 'bulkUpdate']);
    Route::post('venue-availability/check', [App\Http\Controllers\Api\VenueAvailabilityController::class, 'check']);
    
    // Employee Management
    Route::apiResource('employees', App\Http\Controllers\Api\EmployeeController::class);
    Route::post('employees/check-availability', [App\Http\Controllers\Api\EmployeeController::class, 'checkAvailability']);
    
    // Employee Schedules
    Route::apiResource('employee-schedules', App\Http\Controllers\Api\EmployeeScheduleController::class);
    Route::get('employee-schedules-calendar', [App\Http\Controllers\Api\EmployeeScheduleController::class, 'calendar']);
    Route::post('employee-schedules/bulk', [App\Http\Controllers\Api\EmployeeScheduleController::class, 'bulkStore']);
    
    // Employee Assignments
    Route::apiResource('employee-assignments', App\Http\Controllers\Api\EmployeeAssignmentController::class);
    Route::get('employee-assignments/order/{orderId}', [App\Http\Controllers\Api\EmployeeAssignmentController::class, 'byOrder']);
    Route::get('employee-assignments-upcoming', [App\Http\Controllers\Api\EmployeeAssignmentController::class, 'upcoming']);
    
    // Employee Attendance
    Route::get('employee-attendances/summary/{employee_id}/{year}/{month}', [App\Http\Controllers\Api\EmployeeAttendanceController::class, 'summary']);
    Route::get('employee-attendances-pending', [App\Http\Controllers\Api\EmployeeAttendanceController::class, 'pendingApprovals']);
    Route::post('employee-attendances/check-in', [App\Http\Controllers\Api\EmployeeAttendanceController::class, 'checkIn']);
    Route::post('employee-attendances/check-out', [App\Http\Controllers\Api\EmployeeAttendanceController::class, 'checkOut']);
    Route::post('employee-attendances/{id}/approve', [App\Http\Controllers\Api\EmployeeAttendanceController::class, 'approve']);
    Route::apiResource('employee-attendances', App\Http\Controllers\Api\EmployeeAttendanceController::class);
    
    // Vendor Management
    Route::apiResource('vendor-categories', App\Http\Controllers\VendorCategoryController::class);
    Route::get('vendor-categories-active', [App\Http\Controllers\VendorCategoryController::class, 'activeCategories']);
    
    Route::apiResource('vendors', App\Http\Controllers\VendorController::class);
    Route::get('vendors-active', [App\Http\Controllers\VendorController::class, 'activeVendors']);
    Route::get('vendors/{id}/statistics', [App\Http\Controllers\VendorController::class, 'statistics']);
    
    Route::apiResource('vendor-contracts', App\Http\Controllers\VendorContractController::class);
    Route::get('vendor-contracts-active', [App\Http\Controllers\VendorContractController::class, 'activeContracts']);
    Route::get('vendor-contracts-expiring', [App\Http\Controllers\VendorContractController::class, 'expiringContracts']);
    Route::get('vendor-contracts-expired', [App\Http\Controllers\VendorContractController::class, 'expiredContracts']);
    Route::get('vendor-contracts/vendor/{vendorId}', [App\Http\Controllers\VendorContractController::class, 'byVendor']);
    Route::post('vendor-contracts/{id}/renew', [App\Http\Controllers\VendorContractController::class, 'renewContract']);
    
    Route::apiResource('vendor-ratings', App\Http\Controllers\VendorRatingController::class);
    Route::get('vendor-ratings/vendor/{vendorId}', [App\Http\Controllers\VendorRatingController::class, 'byVendor']);
    Route::post('vendor-ratings/{id}/response', [App\Http\Controllers\VendorRatingController::class, 'addResponse']);
    Route::get('vendor-ratings-pending', [App\Http\Controllers\VendorRatingController::class, 'pendingReviews']);
    
    // Settings
    Route::get('settings-general', [App\Http\Controllers\SettingsController::class, 'getGeneralSettings']);
    Route::post('settings-general', [App\Http\Controllers\SettingsController::class, 'updateGeneralSettings']);
    Route::get('settings-notifications', [App\Http\Controllers\SettingsController::class, 'getNotificationSettings']);
    Route::post('settings-notifications', [App\Http\Controllers\SettingsController::class, 'updateNotificationSettings']);
    Route::get('settings-email-templates', [App\Http\Controllers\SettingsController::class, 'getEmailTemplates']);
    Route::post('settings-email-templates', [App\Http\Controllers\SettingsController::class, 'updateEmailTemplate']);
    Route::get('settings-backups', [App\Http\Controllers\SettingsController::class, 'getBackupList']);
    Route::post('settings-backup-create', [App\Http\Controllers\SettingsController::class, 'createBackup']);
    Route::get('settings-backup-download/{filename}', [App\Http\Controllers\SettingsController::class, 'downloadBackup']);
    Route::delete('settings-backup-delete/{filename}', [App\Http\Controllers\SettingsController::class, 'deleteBackup']);
    Route::post('settings-backup-restore/{filename}', [App\Http\Controllers\SettingsController::class, 'restoreBackup']);
    Route::get('settings-system-info', [App\Http\Controllers\SettingsController::class, 'getSystemInfo']);
    Route::post('settings-clear-cache', [App\Http\Controllers\SettingsController::class, 'clearCache']);
});