<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeePayroll extends Model
{
    protected $fillable = [
        'employee_id',
        'payroll_code',
        'period_type',
        'period_start',
        'period_end',
        'base_amount',
        'bonuses',
        'deductions',
        'adjustments',
        'total_amount',
        'payment_date',
        'status',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
        'payment_date' => 'date',
        'base_amount' => 'decimal:2',
        'bonuses' => 'decimal:2',
        'deductions' => 'decimal:2',
        'adjustments' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public static function generateCode(): string
    {
        $latest = static::query()->latest('id')->first();
        $number = $latest ? ((int) substr($latest->payroll_code, 4) + 1) : 1;

        return 'PAY-' . str_pad((string) $number, 6, '0', STR_PAD_LEFT);
    }
}
