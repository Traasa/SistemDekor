<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorContract extends Model
{
    use HasFactory;

    protected $fillable = [
        'contract_number',
        'vendor_id',
        'title',
        'description',
        'start_date',
        'end_date',
        'contract_value',
        'payment_schedule',
        'status',
        'terms_conditions',
        'deliverables',
        'signed_by_vendor',
        'signed_by_company',
        'signed_date',
        'contract_file',
        'notes',
        'created_by'
    ];

    protected $casts = [
        'deliverables' => 'array',
        'contract_value' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'signed_date' => 'date'
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($contract) {
            if (!$contract->contract_number) {
                $contract->contract_number = static::generateContractNumber();
            }
        });
    }

    public static function generateContractNumber()
    {
        $year = date('Y');
        $lastContract = static::whereYear('created_at', $year)->latest('id')->first();
        $number = $lastContract ? ((int) substr($lastContract->contract_number, -4)) + 1 : 1;
        return 'CON-' . $year . '-' . str_pad($number, 4, '0', STR_PAD_LEFT);
    }

    // Relationships
    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now());
    }

    public function scopeExpiring($query, $days = 30)
    {
        return $query->where('status', 'active')
            ->where('end_date', '<=', now()->addDays($days))
            ->where('end_date', '>=', now());
    }

    public function scopeExpired($query)
    {
        return $query->where('end_date', '<', now());
    }

    // Helpers
    public function isActive()
    {
        return $this->status === 'active' 
            && $this->start_date <= now() 
            && $this->end_date >= now();
    }

    public function isExpired()
    {
        return $this->end_date < now();
    }

    public function daysUntilExpiry()
    {
        if ($this->isExpired()) {
            return 0;
        }
        return now()->diffInDays($this->end_date);
    }

    public function getRemainingValue()
    {
        // Calculate based on payment schedule
        // This is a simple implementation, can be more complex
        return $this->contract_value;
    }
}
