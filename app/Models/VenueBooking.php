<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VenueBooking extends Model
{
    protected $fillable = [
        'venue_id',
        'order_id',
        'booking_number',
        'booking_date',
        'start_time',
        'end_time',
        'status',
        'client_name',
        'client_phone',
        'client_email',
        'event_type',
        'guest_count',
        'total_price',
        'special_requests',
        'notes',
        'confirmed_at',
        'cancelled_at',
        'cancelled_reason',
    ];

    protected $casts = [
        'booking_date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'total_price' => 'decimal:2',
        'confirmed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    /**
     * Get the venue for this booking
     */
    public function venue(): BelongsTo
    {
        return $this->belongsTo(Venue::class);
    }

    /**
     * Get the order for this booking
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Generate unique booking number
     */
    public static function generateBookingNumber()
    {
        $prefix = 'VB';
        $date = date('Ymd');
        $lastBooking = self::where('booking_number', 'like', $prefix . $date . '%')
            ->orderBy('booking_number', 'desc')
            ->first();

        if ($lastBooking) {
            $lastNumber = intval(substr($lastBooking->booking_number, -4));
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return $prefix . $date . $newNumber;
    }
}
