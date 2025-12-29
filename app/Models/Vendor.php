<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vendor extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'vendor_code',
        'category_id',
        'company_name',
        'contact_person',
        'email',
        'phone',
        'alternative_phone',
        'address',
        'city',
        'province',
        'postal_code',
        'status',
        'rating_level',
        'average_rating',
        'total_reviews',
        'services_offered',
        'minimum_order',
        'payment_terms_days',
        'bank_name',
        'bank_account_number',
        'bank_account_holder',
        'tax_id',
        'business_license',
        'notes'
    ];

    protected $casts = [
        'services_offered' => 'array',
        'average_rating' => 'float',
        'minimum_order' => 'float',
        'total_reviews' => 'integer'
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($vendor) {
            if (!$vendor->vendor_code) {
                $vendor->vendor_code = static::generateVendorCode();
            }
        });
    }

    public static function generateVendorCode()
    {
        $lastVendor = static::withTrashed()->latest('id')->first();
        $number = $lastVendor ? ((int) substr($lastVendor->vendor_code, 4)) + 1 : 1;
        return 'VEN-' . str_pad($number, 6, '0', STR_PAD_LEFT);
    }

    // Relationships
    public function category()
    {
        return $this->belongsTo(VendorCategory::class, 'category_id');
    }

    public function contracts()
    {
        return $this->hasMany(VendorContract::class);
    }

    public function ratings()
    {
        return $this->hasMany(VendorRating::class);
    }

    public function performance()
    {
        return $this->hasMany(VendorPerformance::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    public function scopeByRatingLevel($query, $level)
    {
        return $query->where('rating_level', $level);
    }

    public function scopeMinRating($query, $rating)
    {
        return $query->where('average_rating', '>=', $rating);
    }

    // Helpers
    public function updateAverageRating()
    {
        $this->average_rating = $this->ratings()->avg('rating') ?? 0;
        $this->total_reviews = $this->ratings()->count();
        $this->save();
    }

    public function hasActiveContract()
    {
        return $this->contracts()
            ->where('status', 'active')
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->exists();
    }

    public function getActiveContract()
    {
        return $this->contracts()
            ->where('status', 'active')
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->first();
    }
}
