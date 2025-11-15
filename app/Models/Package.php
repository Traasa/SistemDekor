<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Package extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'base_price',
        'image_url',
        'is_active',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
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
}
