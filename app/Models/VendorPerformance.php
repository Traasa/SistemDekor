<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorPerformance extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'year',
        'month',
        'total_orders',
        'completed_orders',
        'cancelled_orders',
        'total_revenue',
        'average_delivery_time',
        'on_time_deliveries',
        'late_deliveries',
        'average_rating'
    ];

    protected $casts = [
        'total_revenue' => 'decimal:2',
        'average_delivery_time' => 'decimal:2',
        'average_rating' => 'decimal:2'
    ];

    // Relationships
    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    // Helpers
    public function getCompletionRate()
    {
        if ($this->total_orders == 0) return 0;
        return round(($this->completed_orders / $this->total_orders) * 100, 2);
    }

    public function getOnTimeRate()
    {
        $totalDeliveries = $this->on_time_deliveries + $this->late_deliveries;
        if ($totalDeliveries == 0) return 0;
        return round(($this->on_time_deliveries / $totalDeliveries) * 100, 2);
    }
}
