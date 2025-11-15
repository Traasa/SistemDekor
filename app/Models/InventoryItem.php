<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryItem extends Model
{
    protected $fillable = [
        'category_id',
        'name',
        'code',
        'description',
        'unit',
        'quantity',
        'minimum_stock',
        'purchase_price',
        'selling_price',
        'location',
        'condition',
        'image_url',
        'is_active',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'minimum_stock' => 'integer',
        'purchase_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Get the category that owns the item
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(InventoryCategory::class, 'category_id');
    }

    /**
     * Get all transactions for this item
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(InventoryTransaction::class, 'inventory_item_id');
    }

    /**
     * Check if stock is low
     */
    public function isLowStock(): bool
    {
        return $this->quantity <= $this->minimum_stock;
    }

    /**
     * Check if out of stock
     */
    public function isOutOfStock(): bool
    {
        return $this->quantity <= 0;
    }

    /**
     * Get stock status
     */
    public function getStockStatusAttribute(): string
    {
        if ($this->isOutOfStock()) {
            return 'out_of_stock';
        } elseif ($this->isLowStock()) {
            return 'low_stock';
        }
        return 'in_stock';
    }
}
