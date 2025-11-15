<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'type',
        'start_date',
        'end_date',
        'data',
        'total_revenue',
        'total_transactions',
        'generated_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'data' => 'array',
        'total_revenue' => 'decimal:2',
        'total_transactions' => 'integer',
    ];

    /**
     * Relationship with User (who generated the report)
     */
    public function generatedBy()
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    /**
     * Scope for specific report type
     */
    public function scopeType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Generate report data based on transactions
     */
    public static function generateReportData($startDate, $endDate)
    {
        $transactions = Transaction::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', '!=', 'cancelled')
            ->get();

        $totalRevenue = $transactions->sum('total_amount');
        $totalTransactions = $transactions->count();

        $statusBreakdown = $transactions->groupBy('status')->map(function ($group) {
            return [
                'count' => $group->count(),
                'total_amount' => $group->sum('total_amount'),
            ];
        });

        return [
            'transactions' => $transactions->toArray(),
            'summary' => [
                'total_revenue' => $totalRevenue,
                'total_transactions' => $totalTransactions,
                'status_breakdown' => $statusBreakdown,
            ],
        ];
    }
}
