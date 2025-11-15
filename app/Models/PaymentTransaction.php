<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentTransaction extends Model
{
    protected $fillable = [
        'order_id',
        'amount',
        'payment_type',
        'payment_date',
        'status',
        'proof_url',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'date',
    ];

    /**
     * Get the order that owns the transaction
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
