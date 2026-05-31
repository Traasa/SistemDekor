<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MiniOrderDetail extends Model
{
    protected $fillable = [
        'mini_order_id',
        'item_name',
        'item_description',
        'cost',
        'quantity',
    ];

    protected $casts = [
        'cost' => 'decimal:2',
        'quantity' => 'integer',
    ];

    public function miniOrder(): BelongsTo
    {
        return $this->belongsTo(MiniOrder::class);
    }

    public function getSubtotalAttribute()
    {
        return (float) $this->cost * (int) $this->quantity;
    }
}
