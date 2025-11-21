<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Order extends Model
{
    protected $fillable = [
        'order_number',
        'client_id',
        'package_id',
        'user_id',
        'event_name',
        'event_type',
        'event_date',
        'event_address',
        'event_location',
        'event_theme',
        'guest_count',
        'total_price',
        'discount',
        'final_price',
        'deposit_amount',
        'remaining_amount',
        'dp_amount',
        'status',
        'payment_status',
        'verification_token',
        'notes',
        'special_requests',
    ];

    protected $casts = [
        'event_date' => 'date',
        'total_price' => 'decimal:2',
        'discount' => 'decimal:2',
        'final_price' => 'decimal:2',
        'deposit_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
        'dp_amount' => 'decimal:2',
    ];

    /**
     * Generate verification token and order number automatically when creating
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            if (empty($order->verification_token)) {
                $order->verification_token = Str::random(64);
            }
            if (empty($order->order_number)) {
                $order->order_number = 'ORD-' . date('Ymd') . '-' . strtoupper(Str::random(6));
            }
        });
    }

    /**
     * Get the client that owns the order
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Get the package associated with the order
     */
    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    /**
     * Get the user (sales/admin) who created the order
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all order details
     */
    public function orderDetails(): HasMany
    {
        return $this->hasMany(OrderDetail::class);
    }

    /**
     * Get all payment transactions
     */
    public function paymentTransactions(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    /**
     * Get total paid amount
     */
    public function getTotalPaidAttribute()
    {
        return $this->paymentTransactions()
            ->where('status', 'verified')
            ->sum('amount');
    }

    /**
     * Get remaining payment
     */
    public function getRemainingPaymentAttribute()
    {
        return $this->total_price - $this->total_paid;
    }

    /**
     * Check if DP is paid
     */
    public function hasDpPaid()
    {
        return $this->paymentTransactions()
            ->where('payment_type', 'DP')
            ->where('status', 'verified')
            ->exists();
    }

    /**
     * Check if fully paid
     */
    public function isFullyPaid()
    {
        return $this->remaining_payment <= 0;
    }
}
