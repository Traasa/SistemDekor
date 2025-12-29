<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Employee extends Model
{
    protected $fillable = [
        'employee_code',
        'name',
        'email',
        'phone',
        'position',
        'department',
        'join_date',
        'employment_type',
        'status',
        'address',
        'city',
        'emergency_contact_name',
        'emergency_contact_phone',
        'salary',
        'skills',
        'notes',
        'photo'
    ];

    protected $casts = [
        'join_date' => 'date',
        'salary' => 'decimal:2',
        'skills' => 'array'
    ];

    /**
     * Get employee schedules
     */
    public function schedules(): HasMany
    {
        return $this->hasMany(EmployeeSchedule::class);
    }

    /**
     * Get employee assignments
     */
    public function assignments(): HasMany
    {
        return $this->hasMany(EmployeeAssignment::class);
    }

    /**
     * Get employee attendances
     */
    public function attendances(): HasMany
    {
        return $this->hasMany(EmployeeAttendance::class);
    }

    /**
     * Scope for active employees
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope by position
     */
    public function scopeByPosition($query, $position)
    {
        return $query->where('position', $position);
    }

    /**
     * Check if employee is available on a specific date
     */
    public function isAvailableOn($date)
    {
        // Check if employee has schedule on this date
        $hasSchedule = $this->schedules()
            ->where('date', $date)
            ->whereIn('status', ['scheduled', 'confirmed'])
            ->exists();

        // Check if employee has assignment on this date
        $hasAssignment = $this->assignments()
            ->where('assignment_date', $date)
            ->whereIn('status', ['assigned', 'confirmed', 'in_progress'])
            ->exists();

        // Check if employee is on leave
        $onLeave = $this->attendances()
            ->where('date', $date)
            ->whereIn('status', ['on_leave', 'sick'])
            ->exists();

        return !$hasSchedule && !$hasAssignment && !$onLeave && $this->status === 'active';
    }

    /**
     * Generate employee code
     */
    public static function generateCode()
    {
        $latest = static::orderBy('id', 'desc')->first();
        $number = $latest ? (int) substr($latest->employee_code, 4) + 1 : 1;
        return 'EMP-' . str_pad($number, 6, '0', STR_PAD_LEFT);
    }
}
