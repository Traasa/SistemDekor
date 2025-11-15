<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_code',
        'user_id',
        'client_name',
        'client_phone',
        'client_email',
        'client_address',
        'event_date',
        'event_location',
        'services',
        'total_amount',
        'down_payment',
        'remaining_payment',
        'status',
        'notes'
    ];

    protected $casts = [
        'event_date' => 'date',
        'services' => 'array',
        'total_amount' => 'decimal:2',
        'down_payment' => 'decimal:2',
        'remaining_payment' => 'decimal:2',
    ];

    /**
     * Generate unique transaction code
     */
    public static function generateTransactionCode(): string
    {
        $prefix = 'WO';
        $date = now()->format('Ymd');
        $lastTransaction = self::whereDate('created_at', today())
            ->orderBy('id', 'desc')
            ->first();
        
        $sequence = $lastTransaction ? 
            intval(substr($lastTransaction->transaction_code, -3)) + 1 : 1;
        
        return $prefix . $date . str_pad($sequence, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Relationship with User
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to filter by user
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Calculate remaining payment
     */
    public function calculateRemainingPayment()
    {
        $this->remaining_payment = $this->total_amount - $this->down_payment;
        return $this->remaining_payment;
    }
}
