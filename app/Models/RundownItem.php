<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RundownItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'order',
        'time',
        'duration',
        'activity',
        'description',
        'pic',
        'notes',
        'equipment_needed',
        'is_critical',
        'status',
    ];

    protected $casts = [
        'time' => 'datetime',
        'equipment_needed' => 'array',
        'is_critical' => 'boolean',
    ];

    protected $appends = ['status_label', 'end_time'];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function taskAssignments(): HasMany
    {
        return $this->hasMany(TaskAssignment::class);
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'pending' => 'Menunggu',
            'in_progress' => 'Sedang Berlangsung',
            'completed' => 'Selesai',
            'skipped' => 'Dilewati',
            default => $this->status,
        };
    }

    public function getEndTimeAttribute()
    {
        if ($this->time) {
            return $this->time->copy()->addMinutes($this->duration);
        }
        return null;
    }
}
