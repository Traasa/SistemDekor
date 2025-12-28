<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Order extends Model
{
    // Order Status Constants
    const STATUS_PENDING = 'pending_confirmation';        // Baru dibuat, menunggu konfirmasi admin
    const STATUS_NEGOTIATION = 'negotiation';             // Dalam proses negosiasi
    const STATUS_AWAITING_DP = 'awaiting_dp_payment';     // Menunggu pembayaran DP
    const STATUS_DP_PAID = 'dp_paid';                     // DP sudah dibayar, menunggu pelunasan
    const STATUS_AWAITING_FULL = 'awaiting_full_payment'; // Menunggu pelunasan
    const STATUS_PAID = 'paid';                           // Sudah lunas
    const STATUS_CONFIRMED = 'confirmed';                 // Order dikonfirmasi, siap diproses
    const STATUS_PROCESSING = 'processing';               // Sedang diproses
    const STATUS_COMPLETED = 'completed';                 // Selesai
    const STATUS_CANCELLED = 'cancelled';                 // Dibatalkan

    // Payment Status Constants
    const PAYMENT_UNPAID = 'unpaid';                      // Belum bayar
    const PAYMENT_DP_PENDING = 'dp_pending';              // DP upload, menunggu verifikasi
    const PAYMENT_DP_PAID = 'dp_paid';                    // DP terverifikasi
    const PAYMENT_FULL_PENDING = 'full_pending';          // Pelunasan upload, menunggu verifikasi
    const PAYMENT_PAID = 'paid';                          // Lunas terverifikasi
    const PAYMENT_PARTIAL = 'partial';                    // Bayar sebagian

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
        'payment_link_token',
        'payment_link_type',
        'payment_link_expires_at',
        'payment_link_active',
        'notes',
        'special_requests',
        'package_details',
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
        'deposit_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
        'dp_amount' => 'decimal:2',
        'additional_costs' => 'decimal:2',
        'payment_link_expires_at' => 'datetime',
        'payment_link_active' => 'boolean',
        'is_negotiable' => 'boolean',
        'negotiated_at' => 'datetime',
        'package_details' => 'array',
        'custom_items' => 'array',
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
     * Get all payment proofs
     */
    public function paymentProofs(): HasMany
    {
        return $this->hasMany(PaymentProof::class);
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
     * Check if payment link is expired
     */
    public function isPaymentLinkExpired(): bool
    {
        if (!$this->payment_link_expires_at) {
            return false;
        }
        return now()->isAfter($this->payment_link_expires_at);
    }

    /**
     * Generate payment link token
     */
    public function generatePaymentLink(int $hoursValid = 48, string $paymentType = 'dp'): string
    {
        // Generate unique token for each payment type
        $this->payment_link_token = Str::random(64);
        $this->payment_link_type = $paymentType;
        $this->payment_link_expires_at = now()->addHours($hoursValid);
        $this->payment_link_active = true;
        $this->save();

        return route('payment.show', ['token' => $this->payment_link_token]);
    }

    /**
     * Check if fully paid
     */
    public function isFullyPaid()
    {
        return $this->remaining_payment <= 0;
    }
}
