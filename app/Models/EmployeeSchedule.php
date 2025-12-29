<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeSchedule extends Model
{
    protected $fillable = [
        'employee_id',
        'date',
        'shift_start',
        'shift_end',
        'shift_type',
        'status',
        'location',
        'notes'
    ];

    protected $casts = [
        'date' => 'date'
    ];

    /**
     * Get the employee
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Check if schedule conflicts with another
     */
    public function hasConflict($employeeId, $date, $startTime, $endTime, $excludeId = null)
    {
        $query = static::where('employee_id', $employeeId)
            ->where('date', $date)
            ->whereIn('status', ['scheduled', 'confirmed'])
            ->where(function ($q) use ($startTime, $endTime) {
                $q->whereBetween('shift_start', [$startTime, $endTime])
                    ->orWhereBetween('shift_end', [$startTime, $endTime])
                    ->orWhere(function ($q2) use ($startTime, $endTime) {
                        $q2->where('shift_start', '<=', $startTime)
                            ->where('shift_end', '>=', $endTime);
                    });
            });

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }
}
