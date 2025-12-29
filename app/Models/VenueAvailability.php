<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VenueAvailability extends Model
{
    protected $table = 'venue_availability';

    protected $fillable = [
        'venue_id',
        'date',
        'is_available',
        'unavailable_reason',
        'available_from',
        'available_until',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'is_available' => 'boolean',
        'available_from' => 'datetime:H:i',
        'available_until' => 'datetime:H:i',
    ];

    /**
     * Get the venue for this availability
     */
    public function venue(): BelongsTo
    {
        return $this->belongsTo(Venue::class);
    }
}
