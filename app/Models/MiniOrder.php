<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class MiniOrder extends Model
{
    protected $fillable = [
        'order_number',
        'vendor_client_id',
        'event_name',
        'event_type',
        'event_date',
        'event_address',
        'event_location',
        'total_price',
        'discount',
        'final_price',
        'dp_amount',
        'booking_amount',
        'initial_payment_type',
        'deposit_amount',
        'remaining_amount',
        'status',
        'payment_status',
        'payment_link_token',
        'payment_link_type',
        'payment_link_amount',
        'payment_link_expires_at',
        'payment_link_active',
        'notes',
        'special_requests',
        'custom_items',
        'additional_costs',
        'negotiation_notes',
        'is_negotiable',
        'negotiated_at',
    ];

    protected $casts = [
        'event_date' => 'date',
        'total_price' => 'decimal:2',
        'discount' => 'decimal:2',
        'final_price' => 'decimal:2',
        'dp_amount' => 'decimal:2',
        'booking_amount' => 'decimal:2',
        'deposit_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
        'payment_link_expires_at' => 'datetime',
        'payment_link_active' => 'boolean',
        'payment_link_amount' => 'decimal:2',
        'custom_items' => 'array',
        'additional_costs' => 'decimal:2',
        'is_negotiable' => 'boolean',
        'negotiated_at' => 'datetime',
    ];

    protected $appends = [
        'total_paid',
        'remaining_payment',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            if (empty($order->order_number)) {
                $order->order_number = 'MINI-' . date('Ymd') . '-' . strtoupper(Str::random(6));
            }
        });
    }

    public function vendorClient(): BelongsTo
    {
        return $this->belongsTo(VendorClient::class);
    }

    public function orderDetails(): HasMany
    {
        return $this->hasMany(MiniOrderDetail::class);
    }

    public function paymentProofs(): HasMany
    {
        return $this->hasMany(MiniOrderPaymentProof::class);
    }

    public function paymentTransactions(): HasMany
    {
        return $this->hasMany(MiniOrderPaymentTransaction::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(MiniOrderImage::class);
    }

    public function getTotalPaidAttribute()
    {
        return $this->paymentProofs()
            ->where('status', 'verified')
            ->sum('amount');
    }

    public function getRemainingPaymentAttribute()
    {
        return (float) $this->final_price - (float) $this->total_paid;
    }

    public function isPaymentLinkExpired(): bool
    {
        if (!$this->payment_link_expires_at) {
            return false;
        }

        return now()->isAfter($this->payment_link_expires_at);
    }

    public function generatePaymentLink(int $hoursValid = 48, string $paymentType = 'dp'): string
    {
        $this->payment_link_token = Str::random(64);
        $this->payment_link_type = $paymentType;
        $this->payment_link_expires_at = now()->addHours($hoursValid);
        $this->payment_link_active = true;
        $this->save();

        return route('mini-payment.show', ['token' => $this->payment_link_token]);
    }
}
