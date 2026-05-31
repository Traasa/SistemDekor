<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class PaymentProof extends Model
{
    const STATUS_PENDING = 'pending';
    const STATUS_VERIFIED = 'verified';
    const STATUS_REJECTED = 'rejected';

    const PAYMENT_TYPE_DP = 'dp';
    const PAYMENT_TYPE_BOOKING = 'booking';
    const PAYMENT_TYPE_INSTALLMENT = 'installment';
    const PAYMENT_TYPE_FULL = 'full';

    protected $fillable = [
        'order_id',
        'amount',
        'payment_type',
        'proof_image_path',
        'status',
        'verified_by',
        'verified_at',
        'admin_notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'verified_at' => 'datetime',
    ];

    /**
     * Get the order that owns the payment proof
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the admin who verified the payment
     */
    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Get the full URL for the proof image
     */
    public function getProofImageUrlAttribute(): ?string
    {
        if (!$this->proof_image_path || str_starts_with($this->proof_image_path, 'offline:')) {
            return null;
        }

        return Storage::url($this->proof_image_path);
    }

    /**
     * Check if payment is pending
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if payment is verified
     */
    public function isVerified(): bool
    {
        return $this->status === self::STATUS_VERIFIED;
    }

    /**
     * Check if payment is rejected
     */
    public function isRejected(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }
}
