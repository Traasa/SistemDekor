<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Package extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'base_price',
        'includes_venue',
        'venue_id',
        'venue_price',
        'image_url',
        'is_active',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'venue_price' => 'decimal:2',
        'includes_venue' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Generate slug automatically when creating
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($package) {
            if (empty($package->slug)) {
                $package->slug = Str::slug($package->name);
            }
        });
    }

    /**
     * Get all orders using this package
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function venue(): BelongsTo
    {
        return $this->belongsTo(Venue::class);
    }

    public function packageInventoryItems(): HasMany
    {
        return $this->hasMany(PackageInventoryItem::class);
    }

    public function inventoryItems(): BelongsToMany
    {
        return $this->belongsToMany(InventoryItem::class, 'package_inventory_items')
            ->withPivot(['quantity', 'notes'])
            ->withTimestamps();
    }

    /**
     * Backward-compatible alias used by older controller/view code.
     */
    public function getPriceAttribute(): float
    {
        return (float) $this->base_price;
    }
}
