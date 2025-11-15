<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryTransaction extends Model
{
    protected $fillable = [
        'inventory_item_id',
        'user_id',
        'order_id',
        'type',
        'quantity',
        'stock_before',
        'stock_after',
        'notes',
        'transaction_date',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'stock_before' => 'integer',
        'stock_after' => 'integer',
        'transaction_date' => 'date',
    ];

    /**
     * Get the inventory item
     */
    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
    }

    /**
     * Get the user who made the transaction
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the related order (if any)
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
