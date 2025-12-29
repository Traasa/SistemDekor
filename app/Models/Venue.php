<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Venue extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'description',
        'address',
        'city',
        'province',
        'postal_code',
        'latitude',
        'longitude',
        'capacity',
        'min_capacity',
        'venue_type',
        'facilities',
        'images',
        'contact_person',
        'contact_phone',
        'contact_email',
        'is_active',
        'terms_conditions',
        'notes',
    ];

    protected $casts = [
        'facilities' => 'array',
        'images' => 'array',
        'is_active' => 'boolean',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    /**
     * Get all pricing for this venue
     */
    public function pricing(): HasMany
    {
        return $this->hasMany(VenuePricing::class);
    }

    /**
     * Get all bookings for this venue
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(VenueBooking::class);
    }

    /**
     * Get availability records for this venue
     */
    public function availability(): HasMany
    {
        return $this->hasMany(VenueAvailability::class);
    }

    /**
     * Scope active venues
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Check if venue is available on a specific date
     */
    public function isAvailableOn($date)
    {
        // Check if there's a specific availability record
        $availability = $this->availability()->where('date', $date)->first();
        
        if ($availability) {
            return $availability->is_available;
        }

        // Check if there's a booking on this date
        $booking = $this->bookings()
            ->where('booking_date', $date)
            ->whereIn('status', ['confirmed', 'pending'])
            ->exists();

        return !$booking;
    }
}
