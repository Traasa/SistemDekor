<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeAssignment extends Model
{
    protected $fillable = [
        'employee_id',
        'order_id',
        'role',
        'assignment_date',
        'start_time',
        'end_time',
        'status',
        'fee',
        'tasks',
        'notes'
    ];

    protected $casts = [
        'assignment_date' => 'date',
        'fee' => 'decimal:2'
    ];

    /**
     * Get the employee
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get the order
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Scope for upcoming assignments
     */
    public function scopeUpcoming($query)
    {
        return $query->where('assignment_date', '>=', now()->toDateString())
            ->whereIn('status', ['assigned', 'confirmed']);
    }

    /**
     * Scope for active assignments
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['assigned', 'confirmed', 'in_progress']);
    }
}
