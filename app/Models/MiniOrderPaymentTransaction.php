<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MiniOrderPaymentTransaction extends Model
{
    protected $fillable = [
        'mini_order_id',
        'amount',
        'payment_type',
        'payment_method',
        'payment_date',
        'status',
        'proof_url',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'date',
    ];

    public function miniOrder(): BelongsTo
    {
        return $this->belongsTo(MiniOrder::class);
    }
}
