<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\CompanyProfileController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\GalleryController;
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
});