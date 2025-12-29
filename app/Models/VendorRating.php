<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorRating extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'order_id',
        'reviewed_by',
        'rating',
        'quality_rating',
        'timeliness_rating',
        'professionalism_rating',
        'value_rating',
        'review',
        'pros',
        'cons',
        'would_recommend',
        'vendor_response',
        'responded_at',
        'is_verified'
    ];

    protected $casts = [
        'would_recommend' => 'boolean',
        'is_verified' => 'boolean',
        'responded_at' => 'datetime'
    ];

    protected static function boot()
    {
        parent::boot();

        static::created(function ($rating) {
            $rating->vendor->updateAverageRating();
        });

        static::updated(function ($rating) {
            $rating->vendor->updateAverageRating();
        });

        static::deleted(function ($rating) {
            $rating->vendor->updateAverageRating();
        });
    }

    // Relationships
    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    // Scopes
    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public function scopeWithResponse($query)
    {
        return $query->whereNotNull('vendor_response');
    }

    public function scopeMinRating($query, $rating)
    {
        return $query->where('rating', '>=', $rating);
    }

    // Helpers
    public function getOverallRatingAttribute()
    {
        $ratings = array_filter([
            $this->quality_rating,
            $this->timeliness_rating,
            $this->professionalism_rating,
            $this->value_rating
        ]);

        return count($ratings) > 0 ? round(array_sum($ratings) / count($ratings), 2) : $this->rating;
    }

    public function hasResponse()
    {
        return !empty($this->vendor_response);
    }
}
