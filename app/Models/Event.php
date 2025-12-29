<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'client_id',
        'event_code',
        'event_name',
        'event_type',
        'event_date',
        'start_time',
        'end_time',
        'venue_name',
        'venue_address',
        'guest_count',
        'status',
        'notes',
        'special_requests',
        'contact_persons',
    ];

    protected $casts = [
        'event_date' => 'datetime',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'contact_persons' => 'array',
    ];

    protected $appends = ['event_type_label', 'status_label'];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function rundownItems(): HasMany
    {
        return $this->hasMany(RundownItem::class)->orderBy('order');
    }

    public function taskAssignments(): HasMany
    {
        return $this->hasMany(TaskAssignment::class);
    }

    public function getEventTypeLabelAttribute(): string
    {
        return match ($this->event_type) {
            'wedding' => 'Pernikahan',
            'birthday' => 'Ulang Tahun',
            'corporate' => 'Corporate Event',
            'engagement' => 'Lamaran',
            'anniversary' => 'Anniversary',
            'graduation' => 'Wisuda',
            'other' => 'Lainnya',
            default => $this->event_type,
        };
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'planning' => 'Perencanaan',
            'confirmed' => 'Terkonfirmasi',
            'preparation' => 'Persiapan',
            'ongoing' => 'Sedang Berlangsung',
            'completed' => 'Selesai',
            'cancelled' => 'Dibatalkan',
            default => $this->status,
        };
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($event) {
            if (empty($event->event_code)) {
                $event->event_code = 'EVT-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));
            }
        });
    }
}
