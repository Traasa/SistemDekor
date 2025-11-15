<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderDetail extends Model
{
    protected $fillable = [
        'order_id',
        'item_name',
        'item_description',
        'cost',
        'quantity',
    ];

    protected $casts = [
        'cost' => 'decimal:2',
        'quantity' => 'integer',
    ];

    /**
     * Get the order that owns the detail
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get subtotal for this detail
     */
    public function getSubtotalAttribute()
    {
        return $this->cost * $this->quantity;
    }
}
