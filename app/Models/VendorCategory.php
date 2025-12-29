<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($category) {
            if (!$category->slug) {
                $category->slug = \Illuminate\Support\Str::slug($category->name);
            }
        });
    }

    // Relationships
    public function vendors()
    {
        return $this->hasMany(Vendor::class, 'category_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Helpers
    public function getVendorCount()
    {
        return $this->vendors()->count();
    }

    public function getActiveVendorCount()
    {
        return $this->vendors()->active()->count();
    }
}
