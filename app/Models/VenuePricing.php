<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VenuePricing extends Model
{
    protected $table = 'venue_pricing';

    protected $fillable = [
        'venue_id',
        'day_type',
        'session_type',
        'base_price',
        'additional_hour_price',
        'min_hours',
        'max_hours',
        'overtime_price',
        'cleaning_fee',
        'security_deposit',
        'is_active',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'additional_hour_price' => 'decimal:2',
        'overtime_price' => 'decimal:2',
        'cleaning_fee' => 'decimal:2',
        'security_deposit' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Get the venue that owns this pricing
     */
    public function venue(): BelongsTo
    {
        return $this->belongsTo(Venue::class);
    }
}
