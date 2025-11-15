<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryCategory extends Model
{
    protected $fillable = [
        'name',
        'code',
        'description',
        'color',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get all items in this category
     */
    public function items(): HasMany
    {
        return $this->hasMany(InventoryItem::class, 'category_id');
    }

    /**
     * Get active items count
     */
    public function getActiveItemsCountAttribute(): int
    {
        return $this->items()->where('is_active', true)->count();
    }
}
